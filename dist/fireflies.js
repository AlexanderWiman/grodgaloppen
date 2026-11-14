// Fånga eldflugor (survey 3, step 3): a small game in the glade at dusk. It unlocks after the
// adventure "Den vilsekomna eldflugan". Tap the fireflies for 20 seconds; golden ones count three.
// A round pays one dewdrop per point, at most 40 dewdrops a day, and after 30 fireflies in all you
// get a firefly jar for the glade.

const FIREFLY_SECONDS=20,FIREFLY_DAY_CAP=40,FIREFLY_JAR_AT=30;
decorations.push({id:'fireflyjar',name:'Eldflugeburk',icon:'✨',from:'Fånga 30 eldflugor'});
Object.assign(extraGardenArt,{fireflyjar:'<ellipse cx="60" cy="100" rx="30" ry="6" fill="#7d9a6a"/><rect x="36" y="30" width="48" height="66" rx="14" fill="#dff3ee" stroke="#9fc4bc" stroke-width="3" opacity=".9"/><rect x="40" y="20" width="40" height="12" rx="4" fill="#a37a4c"/><g fill="#fff3a0"><circle cx="50" cy="56" r="4"/><circle cx="68" cy="48" r="3.5"/><circle cx="60" cy="74" r="4.5"/><circle cx="72" cy="80" r="3"/></g><g fill="#fff3a0" opacity=".35"><circle cx="50" cy="56" r="10"/><circle cx="60" cy="74" r="11"/></g>'});

function ensureFireflies(){if(!state.fireflies)state.fireflies={best:0,total:0,day:null,earned:0};return state.fireflies}
// Called when a round ends; returns what it gave.
function fireflyFinish(score,day=typeof todayKey==='function'?todayKey():new Date().toDateString()){
 const f=ensureFireflies();if(f.day!==day){f.day=day;f.earned=0}
 const coins=Math.max(0,Math.min(score,FIREFLY_DAY_CAP-f.earned));f.earned+=coins;state.coins+=coins;
 const best=score>f.best;if(best)f.best=score;f.total+=score;
 let jar=false;if(f.total>=FIREFLY_JAR_AT&&!state.decorOwned.includes('fireflyjar')){state.decorOwned.push('fireflyjar');jar=true}
 save();return{coins,best,jar,score};
}

let fireflyRun=null;
function renderFireflies(){
 fireflyRun=null;const f=ensureFireflies();
 if(typeof unlocked==='function'&&!unlocked('fireflies')){$('#content').innerHTML=`<div class="sectionHead"><div><div class="eyebrow">GLÄNTAN I SKYMNINGEN</div><h2>Fånga eldflugor</h2></div></div>${typeof lockedHint==='function'?lockedHint('fireflies'):''}`;return}
 $('#content').innerHTML=`<div class="sectionHead"><div><div class="eyebrow">GLÄNTAN I SKYMNINGEN</div><h2>Fånga eldflugor</h2></div><span class="pill">Rekord ${f.best}</span></div><section id="fireflyField" class="fireflyField" aria-label="Eldflugor i skymningen"><div class="fireflyHud"><span id="fireflyScore">0 eldflugor</span><span id="fireflyTime">${FIREFLY_SECONDS} s</span></div><div class="fireflyStart" id="fireflyStart"><p>Tryck på eldflugorna innan de slocknar. Gyllene eldflugor räknas tre gånger.</p><button class="primary" id="fireflyGo">Börja fånga</button></div></section><div class="jumpControls"><p id="fireflyStatus" role="status">${f.total>=FIREFLY_JAR_AT?'Ni har fångat '+f.total+' eldflugor i allt.':'Ni har fångat '+f.total+' av '+FIREFLY_JAR_AT+' eldflugor till en eldflugeburk.'}</p><p>Varje eldfluga ger en daggdroppe, högst ${FIREFLY_DAY_CAP} om dagen. I dag: ${f.day===(typeof todayKey==='function'?todayKey():'')?f.earned:0} av ${FIREFLY_DAY_CAP}.</p></div>`;
 $('#fireflyGo').onclick=startFireflies;
}
function startFireflies(){
 const field=$('#fireflyField');if(!field)return;$('#fireflyStart').hidden=true;
 const run={t:0,last:null,next:.3,score:0,flies:[],id:0};fireflyRun=run;sfx('go');
 const spawn=()=>{const gold=Math.random()<.09,el=document.createElement('button');el.className='firefly'+(gold?' gold':'');el.setAttribute('aria-label',gold?'Gyllene eldfluga':'Eldfluga');const fly={el,gold,born:run.t,life:2.6+Math.random()*.8,x:8+Math.random()*84,y:16+Math.random()*70,dx:(Math.random()-.5)*14,dy:(Math.random()-.5)*10};el.onpointerdown=el.onclick=e=>{e.preventDefault?.();if(fly.caught)return;fly.caught=true;run.score+=gold?3:1;sfx(gold?'golden':'tick');el.classList.add('caught');$('#fireflyScore').textContent=run.score+' eldflugor';setTimeout(()=>el.remove(),300)};field.appendChild(el);run.flies.push(fly)};
 requestAnimationFrame(function step(now){
  if(fireflyRun!==run||!$('#fireflyField'))return;
  const dt=run.last===null?0:Math.min(.1,(now-run.last)/1000);run.last=now;run.t+=dt;
  if(run.t>=run.next){spawn();run.next=run.t+.45+Math.random()*.3}
  for(const fly of run.flies){if(fly.caught||fly.gone)continue;const age=run.t-fly.born;if(age>fly.life){fly.gone=true;fly.el.classList.add('out');setTimeout(()=>fly.el.remove(),300);continue}fly.el.style.left=(fly.x+fly.dx*age/fly.life+2*Math.sin(age*3+fly.born))+'%';fly.el.style.top=(fly.y+fly.dy*age/fly.life+3*Math.sin(age*2.3+fly.born*2))+'%';fly.el.style.opacity=age<.3?age/.3:age>fly.life-.5?(fly.life-age)/.5:1}
  $('#fireflyTime').textContent=Math.max(0,Math.ceil(FIREFLY_SECONDS-run.t))+' s';
  if(run.t>=FIREFLY_SECONDS){fireflyRun=null;run.flies.forEach(f=>f.el.remove());const r=fireflyFinish(run.score);sfx(r.best?'win':'finish');sidebar();
   $('#fireflyField').insertAdjacentHTML('beforeend',`<div class="fireflyStart"><h3>${r.score} eldflugor!</h3><p>${r.best?'Nytt rekord! ':''}+${r.coins} daggdroppar${r.jar?' · Ni fick en eldflugeburk till gläntan!':''}</p><button class="primary" id="fireflyAgain">Spela igen</button></div>`);$('#fireflyAgain').onclick=renderFireflies;return}
  requestAnimationFrame(step);
 });
}
