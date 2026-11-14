// Shared hopping engine for races, cup rounds and adventures.
//
// Races:
//   - Fart (stat 0) widens the green jump window.
//   - Hopp (stat 1) makes every successful hop carry further.
//   - Uthållighet (stat 2) keeps more speed after a miss.
//   - The rhythm varies hop to hop and speeds up in the final stretch.
//   - Each track has its own twist (drifting lily pads, golden mushrooms, fluttering firefly).
//   - Rivals have personalities, take small spurts and are visible on the track.
// Adventures keep a steady rhythm, no rivals and no time pressure.

const trackWorlds=[
{className:'pond',icon:'❀',obstacle:'näckroskanten',label:'Hoppa till nästa näckros',hint:'Du står på den vänstra näckrosen. Hoppa när nästa näckros lyser grönt – då landar du på den.',twist:'Näckrosorna driver – det gröna fältet flyttar sig varje hopp',period:3.1,bonus:3.8},
{className:'forest',icon:'🍄',obstacle:'roten',label:'Över roten, upp på studssvampen',hint:'Vänta tills svampen lyser grönt. Hoppa över roten och landa på hatten för extra studs!',twist:'Var fjärde svamp är gyllene – smalare fält men dubbelt skutt',period:2.8,bonus:4.5},
{className:'marsh',icon:'✧',obstacle:'gyttjan',label:'Följ eldflugan till nästa tuva',hint:'Eldflugan visar landningen. När den lyser starkt hoppar du över gyttjan till nästa tuva.',twist:'Eldflugan fladdrar – visaren byter takt hela tiden',period:3.4,bonus:4}
];

// Rival personalities: speed multiplier as a function of their own progress (0–100).
const rivals=[
{name:'Klöver',color:'#7fb069',style:'Snabb start',pace:p=>1.1-.2*p/100},
{name:'Mossa',color:'#5f9ea0',style:'Jämn och stadig',pace:()=>1},
{name:'Pärla',color:'#c49bd6',style:'Stark slutspurt',pace:p=>.9+.22*p/100}
];
const RIVAL_BASE=4.0;

// Exposed for tests and balancing: lets a bot read the meter and press jump.
let raceProbe=null;

function raceTuning(st){return{window:.17+st[0]*.0011,hopMult:.75+st[1]*.006,missSlow:Math.min(.85,.45+st[2]*.004)}}

function jumpVerdict(phase,zone={c:.82,w:.24}){const d=Math.abs(phase-zone.c);return d<=zone.w*.19?'perfect':d<=zone.w/2?'good':'miss'}

function miniFrog(color){return `<svg viewBox="0 0 60 44" aria-hidden="true"><ellipse cx="30" cy="30" rx="24" ry="13" fill="${color}"/><circle cx="19" cy="15" r="8" fill="${color}"/><circle cx="41" cy="15" r="8" fill="${color}"/><circle cx="19" cy="14" r="4.5" fill="#fbf6d8"/><circle cx="41" cy="14" r="4.5" fill="#fbf6d8"/><circle cx="20" cy="14" r="2.2" fill="#263d32"/><circle cx="42" cy="14" r="2.2" fill="#263d32"/><path d="M21 31Q30 37 39 31" fill="none" stroke="#263d32" stroke-width="2" stroke-linecap="round"/></svg>`}

function platformScene(route){const type=['lilyPad','mushroomPad','marshPad'][route];return `<div class="landingPlatform ${type}" id="currentPad"></div><div class="landingPlatform ${type}" id="nextPad"></div><span id="landingCue">${['Nästa näckros','Nästa studssvamp','Nästa tuva'][route]}</span>${route===1?'<svg id="rootObstacle" viewBox="0 0 100 60" aria-hidden="true"><path d="M5 52Q25 51 30 30Q35 4 50 12Q65 20 60 38Q70 49 95 52" fill="none" stroke="#6f5139" stroke-width="13" stroke-linecap="round"/><path d="M31 28L19 18M60 37L80 26" stroke="#6f5139" stroke-width="7" stroke-linecap="round"/></svg>':route===2?'<div id="guideFly" aria-hidden="true">✦</div>':''}`}

// Small synthesized sound effects. Silent where Web Audio is missing or sound is off.
let audioCtx=null;
function sfx(name){
 if(state.sound===false||typeof AudioContext==='undefined')return;
 try{
  audioCtx=audioCtx||new AudioContext();if(audioCtx.state==='suspended')audioCtx.resume();
  const t=audioCtx.currentTime;
  const tone=(freq,start,dur,type='sine',vol=.15,slide)=>{const o=audioCtx.createOscillator(),g=audioCtx.createGain();o.type=type;o.frequency.setValueAtTime(freq,t+start);if(slide)o.frequency.exponentialRampToValueAtTime(slide,t+start+dur);g.gain.setValueAtTime(.0001,t+start);g.gain.exponentialRampToValueAtTime(vol,t+start+.015);g.gain.exponentialRampToValueAtTime(.0001,t+start+dur);o.connect(g);g.connect(audioCtx.destination);o.start(t+start);o.stop(t+start+dur+.05)};
  const notes=(list,gap,dur,type,vol)=>list.forEach((f,i)=>tone(f,i*gap,i===list.length-1?dur*2:dur,type,vol));
  ({
   jump:()=>tone(240,0,.2,'sine',.13,560),
   land:()=>tone(170,0,.13,'triangle',.18,85),
   perfect:()=>{tone(880,0,.12,'sine',.1);tone(1320,.08,.22,'sine',.1)},
   golden:()=>notes([784,988,1175,1568],.05,.1,'triangle',.09),
   combo:()=>notes([660,880,1100],.06,.1,'triangle',.08),
   miss:()=>tone(320,0,.32,'triangle',.11,150),
   overtake:()=>{tone(520,0,.09,'square',.05);tone(780,.08,.14,'square',.05)},
   tick:()=>tone(440,0,.12,'sine',.14),
   go:()=>tone(880,0,.4,'sine',.16),
   sprint:()=>notes([523,659,784],.08,.1,'square',.05),
   win:()=>notes([523,659,784,1047],.13,.18,'triangle',.15),
   finish:()=>notes([523,659,784],.12,.18,'sine',.12)
  })[name]?.()
 }catch{}
}

// On small screens, bring the play area into view so track and jump button fit together.
function scrollToPlay(el){if(el?.scrollIntoView&&typeof innerWidth!=='undefined'&&innerWidth<=700)el.scrollIntoView({block:'start',behavior:'smooth'})}
function scrollToContent(){const c=$('#content');if(c?.getBoundingClientRect&&c.getBoundingClientRect().top<0)c.scrollIntoView({block:'start'})}

function startRace(){
 if(!state.hatched)return;running=true;
 const run=activeRun,adventure=run?.kind==='adventure'?storyQuests.find(q=>q.id===run.id):null;
 const route=chosen,r=races[route],world=trackWorlds[route],st=stats(),strength=st[r.stat],tune=raceTuning(st);
 const names=['Ditt team',...rivals.map(x=>x.name)],colors=[state.frog,...rivals.map(x=>x.color)];
 let progress=[0,0,0,0],finished=[],last=performance.now(),elapsed=0,phaseTime=0,period=world.period,zone={c:.82,w:tune.window},cycle=0,golden=false,attempted=false,slowUntil=0,good=0,perfect=0,misses=0,drops=0,streak=0,bestStreak=0,ended=false,platformFlight=null,sprint=false,place=1,finishTime=null;
 const speeds=[2.8+strength*.009,...rivals.map(()=>RIVAL_BASE*(.97+Math.random()*.06))];
 const rivalMult=[1,1,1,1],spurts=[0,0,0,0],nextSpurt=[0,...rivals.map(()=>3+Math.random()*5)];
 $('#content').innerHTML=`${adventure?`<div class="storyStage"><strong>${adventure.title}</strong><p id="storyStep">${adventure.steps[Math.min(5,storyProgress(adventure.id).steps)]}</p><span id="storyCount">${storyProgress(adventure.id).steps} / 6 etapper</span><button class="outline" id="pauseStory">Pausa äventyret</button></div>`:''}<div class="sectionHead"><h2>${r.name}</h2><span class="pill">${r.type} ger fördel</span></div><section class="jumpWorld ${world.className}" aria-label="${r.name}, tävlingsbana"><div class="worldCaption">${world.label}</div>${adventure?'':`<div class="twistBadge">✦ ${world.twist}</div><div id="placeChip" class="placeChip">Plats 1 av 4</div><div id="streakChip" class="streakChip"></div>`}<div class="worldDecor">${route===1?'♣　🍄　♣　🍄':route===2?'✧　　　✧　　　✧':'❀　　　❀　　　❀'}</div>${adventure?'':rivals.map((x,i)=>`<div class="rival" id="rival${i+1}" aria-hidden="true">${miniFrog(x.color)}</div>`).join('')}${platformScene(route)}${adventure?`<div id="storyToken" class="storyToken" aria-label="${adventure.id==='firefly'?'Den lilla eldflugan':'Kronjuvelen'}">${adventure.icon}</div>`:''}<div id="jumpRider">${frog()}</div><div id="jumpObstacle" aria-hidden="true">${world.icon}</div><div class="ground"></div></section><div class="jumpControls"><p>${world.hint}</p><div class="timingLabel"><span id="timingState">Vänta…</span><strong>HOPPA I DET GRÖNA FÄLTET</strong></div><div class="timingMeter" aria-hidden="true"><div class="timingTarget" id="timingTarget"></div><div id="timingPointer"></div></div><div class="jumpAction"><button class="primary" id="jumpButton">Hoppa!<span class="kbdHint"> · Mellanslag</span></button><span id="jumpScore">✦ 0 daggdroppar</span></div><p id="jumpFeedback" role="status">Tryck en gång per hinder. Missar kostar lite fart – du fortsätter direkt.</p></div><div class="raceLane">${names.map((n,i)=>`<div class="laneRow ${i?'':'me'}"><span>${n}${i?`<small>${rivals[i-1].style}</small>`:''}</span><div class="laneWater"><i class="laneFinish">⚑</i><b id="runner${i}">${miniFrog(colors[i])}</b></div></div>`).join('')}</div><div class="raceInfo"><h2 id="raceTitle">Astrid: Låt racet börja!</h2></div>`;
 const button=$('#jumpButton'),rider=$('#jumpRider'),pointer=$('#timingPointer'),target=$('#timingTarget'),feedback=$('#jumpFeedback');
 const flutterSeed=Math.random()*6;
 function drawZone(){target.style.left=(zone.c-zone.w/2)*100+'%';target.style.width=zone.w*100+'%';$('#nextPad').classList.toggle('golden',golden);target.classList.toggle('golden',golden)}
 function nextCycle(){
  phaseTime=0;attempted=false;button.disabled=false;
  if(adventure){period=world.period;zone={c:.82,w:tune.window};golden=false;drawZone();return}
  cycle++;
  period=world.period*(.82+Math.random()*.36)*(sprint?.85:1);
  let w=tune.window,c=.82;
  if(route===0)c=.6+Math.random()*.26;
  golden=route===1&&cycle%4===0;
  if(golden)w*=.65;
  zone={c:Math.min(c,.97-w/2),w};
  drawZone();
  if(golden)$('#landingCue').textContent='Gyllene svamp!';
 }
 function setStreak(){const chip=$('#streakChip');if(!chip)return;chip.textContent=streak>=2?'✦ '+streak+' i rad'+(streak>=3?' · Grodflow!':''):'';chip.classList.toggle('hot',streak>=3)}
 function miss(pressed){misses++;streak=0;setStreak();slowUntil=elapsed+1.1;if(pressed)sfx('miss');feedback.textContent=adventure?'Ingen fara! Vänta på grönt och försök igen – du förlorar inga framsteg.':'Lite för tidigt eller sent – bara ett litet farttapp. Försök vid nästa hinder!'}
 function hop(){
  if(ended||attempted||platformFlight||!adventure&&finished.includes(0))return;
  attempted=true;button.disabled=true;sfx('jump');
  const verdict=jumpVerdict(phaseTime/period,zone);
  platformFlight={start:elapsed,success:verdict!=='miss',golden,landed:false};
  if(verdict==='miss'){miss(true);return}
  good++;streak++;bestStreak=Math.max(bestStreak,streak);setStreak();
  const isPerfect=verdict==='perfect';if(isPerfect){perfect++;sfx('perfect')}
  let gain=world.bonus*tune.hopMult+(isPerfect?1.2:0),earned=isPerfect?3:1;
  if(golden){gain*=2;earned+=2;sfx('golden')}
  if(streak>=3){gain+=.5*Math.min(streak-2,4);earned+=1;if(streak===3)sfx('combo')}
  drops+=earned;progress[0]+=gain;
  if(adventure){feedback.textContent='Fint hopp! Du är på rätt väg.';return}
  feedback.textContent=golden?'Gyllene superstuds! Dubbelt skutt · +'+earned+' daggdroppar':isPerfect?'Perfekt språng! +'+earned+' daggdroppar ✦':route===1?'Studssvampen ger extra fart! +'+earned+' daggdroppar':'Fint hopp! +'+earned+' daggdroppar';
  if(streak>=3)feedback.textContent+=' · '+streak+' i rad!';
  $('#jumpScore').textContent='✦ '+drops+' daggdroppar';
 }
 raceProbe={phase:()=>phaseTime/period,zone:()=>zone,ready:()=>!ended&&!attempted&&!platformFlight,hop,result:()=>({place:finished.indexOf(0)+1,time:finishTime,good,perfect,misses,bestStreak})};
 function keydown(e){if(e.code==='Space'&&!e.repeat){e.preventDefault();hop()}else if(e.code==='Space')e.preventDefault()}
 function stop(){ended=true;running=false;document.removeEventListener('keydown',keydown)}
 button.onclick=hop;document.addEventListener('keydown',keydown);
 // Tapping anywhere on the track also jumps – easier with a thumb on a phone.
 const track=$('.jumpWorld');track.onpointerdown=e=>{if(e.button>0)return;e.preventDefault?.();hop()};
 scrollToPlay(track);
 if(adventure){feedback.textContent='Hoppa när nästa landningsplats lyser. Missar går bra – försök bara igen.';$('#storyToken').classList.toggle('carried',storyProgress(adventure.id).steps>=3);$('.raceLane').style.display='none';$('#raceTitle').textContent='Ta den tid du behöver';$('#jumpScore').textContent='Sex lyckade hopp – ingen tidspress';$('#pauseStory').onclick=()=>{stop();activeRun=null;tab='adventure';render()}}
 nextCycle();
 function finish(){
  if(adventure){stop();activeRun=null;adventureEnding(adventure.id);scrollToContent();return}
  stop();button.disabled=true;
  const rank=finished.indexOf(0)+1,reward=Math.round(r.reward*[1,.65,.4,.25][rank-1]);
  state.coins+=reward+drops;if(rank===1)state.wins++;
  state.bestTimes=state.bestTimes||{};const prev=state.bestTimes[route],record=finishTime!==null&&(prev===undefined||finishTime<prev);if(record)state.bestTimes[route]=+finishTime.toFixed(1);
  const trust=recordRoyalRace(rank,route);if(run?.kind==='cup')recordCupRound(finished);activeRun=null;save();sidebar();sfx(rank===1?'win':'finish');
  $('#content').innerHTML=`<div class="jumpSummary"><strong>Plats ${rank} av 4 · ${finishTime.toFixed(1)} s${record?' · ✦ Nytt banrekord!':prev!==undefined?' · Banrekord '+prev.toFixed(1)+' s':''}</strong><p>${good} lyckade hopp · ${perfect} perfekta · ${misses} missar · bästa serie ${bestStreak} i rad<br>Du samlade ${drops} extra daggdroppar under racet.</p></div><div class="raceInfo">${coronation(rank,reward+drops,trust,finished[0])}</div>`;
  scrollToContent();
  if(run?.kind==='cup'){$('#again').textContent='Visa mästerskapet →';$('#again').onclick=()=>{tab='cup';render()}}else $('#again').onclick=render;
 }
 function resetScene(){rider.style.left='20%';rider.style.transform='translateX(-50%)';$('#currentPad').style.left='20%';$('#nextPad').style.left='70%';$('#landingCue').textContent=['Nästa näckros','Nästa studssvamp','Nästa tuva'][route];if(route===1)$('#rootObstacle').style.left='45%';if(route===2)$('#guideFly').style.left='70%'}
 function moveRivals(){
  for(let i=1;i<4;i++){
   const rv=rivals[i-1];
   if(elapsed>=nextSpurt[i]){spurts[i]=elapsed+1.2;nextSpurt[i]=elapsed+4+Math.random()*5}
   // Gentle rubber band keeps the pack together without deciding the race.
   const band=1-Math.max(-20,Math.min(20,progress[i]-progress[0]))*.006;
   const el=$('#rival'+i),rel=progress[i]-progress[0];
   el.style.opacity=Math.abs(rel)<=16&&progress[i]<100?'.9':'0';
   el.style.left=(20+rel*3.2)+'%';
   el.style.transform=`translate(-50%, ${-Math.abs(Math.sin(elapsed*3+i*1.7))*16}px)`;
   rivalMult[i]=band*rv.pace(progress[i])*(elapsed<spurts[i]?1.3:1);
  }
 }
 function frame(now){
  if(ended)return;const dt=Math.min((now-last)/1000,.08);last=now;if(document.hidden){requestAnimationFrame(frame);return}elapsed+=dt;
  if(platformFlight){
   const age=elapsed-platformFlight.start,success=platformFlight.success,flight=.8,bounce=route===1&&success?(platformFlight.golden?.45:.28):0,pan=.55,height=platformFlight.golden?110:80;
   const t=Math.min(age/flight,1);
   const x=success?20+50*t:20+8*Math.sin(Math.PI*t),y=-Math.sin(Math.PI*t)*height;
   rider.style.left=x+'%';rider.style.transform=`translate(-50%, ${y}px)`;
   if(age>=flight&&!platformFlight.landed){platformFlight.landed=true;if(success)sfx('land')}
   if(age>=flight&&age<flight+bounce){rider.style.transform=`translate(-50%, ${-Math.sin((age-flight)/bounce*Math.PI)*(platformFlight.golden?40:22)}px)`;$('#landingCue').textContent=platformFlight.golden?'Superstuds!':'Studs! Extra fart!'}
   if(age>=flight+bounce&&success){const camera=Math.min((age-flight-bounce)/pan,1)*50;rider.style.left=(70-camera)+'%';$('#currentPad').style.left=(20-camera)+'%';$('#nextPad').style.left=(70-camera)+'%';$('#landingCue').textContent='Landat!';if(route===1)$('#rootObstacle').style.left=(45-camera)+'%';if(route===2)$('#guideFly').style.left=(70-camera)+'%'}
   if(age>=flight+(success?bounce+pan:.25)){
    if(adventure&&success){advanceAdventure(adventure.id);const step=storyProgress(adventure.id).steps;$('#storyStep').textContent=adventure.steps[step-1];$('#storyCount').textContent=step+' / 6 etapper';$('#storyToken').classList.toggle('carried',step>=3)}
    platformFlight=null;resetScene();nextCycle();
   }
  }else{
   // The marsh firefly flutters: the pointer speeds up and slows down unpredictably.
   const rate=!adventure&&route===2?1+.3*Math.sin(elapsed*3.7+flutterSeed)+.2*Math.sin(elapsed*6.1+flutterSeed*2):1;
   phaseTime+=dt*rate;
   if(phaseTime>=period){if(!attempted)miss(false);nextCycle()}
   const phase=phaseTime/period,ready=Math.abs(phase-zone.c)<=zone.w/2;
   pointer.style.left=(phase*100)+'%';
   $('#nextPad').classList.toggle('ready',ready);$('#timingState').textContent=ready?'Nu!':'Vänta…';
   if(!golden||ready)$('#landingCue').textContent=ready?(golden?'Gyllene – hoppa nu!':'Hoppa hit nu!'):route===2?'Följ eldflugan…':'Vänta på grönt…';
   rider.style.left='20%';rider.style.transform='translateX(-50%)';
   if(route===2){$('#guideFly').style.left=(20+50*Math.min(phase/Math.max(.05,zone.c-zone.w/2),1))+'%';$('#guideFly').classList.toggle('ready',ready)}
  }
  if(adventure){if(storyProgress(adventure.id).steps>=6&&!platformFlight){finish();return}requestAnimationFrame(frame);return}
  moveRivals();
  progress=progress.map((p,i)=>p>=100?p:p+dt*speeds[i]*(i===0?(elapsed<slowUntil?tune.missSlow:1):rivalMult[i]));
  progress.map((p,i)=>({p,i})).filter(x=>x.p>=100&&!finished.includes(x.i)).sort((a,b)=>b.p-a.p).forEach(x=>{finished.push(x.i);if(x.i===0)finishTime=elapsed});
  progress.forEach((p,i)=>$('#runner'+i).style.left=Math.min(p,100)+'%');
  if(!sprint&&progress[0]>=70){sprint=true;sfx('sprint');$('#raceTitle').textContent='Slutspurt! Takten ökar…'}
  if(!finished.includes(0)){
   const now=1+progress.slice(1).filter(p=>p>progress[0]).length;
   if(now<place&&elapsed>2){const passed=[1,2,3].filter(i=>progress[i]<progress[0]&&progress[i]>progress[0]-6).map(i=>rivals[i-1].name)[0];$('#raceTitle').textContent=passed?'Du gick om '+passed+'!':'Du klättrar uppåt!';sfx('overtake')}
   else if(now>place&&elapsed>2)$('#raceTitle').textContent='Kämpa på – du är strax bakom!';
   place=now;$('#placeChip').textContent='Plats '+place+' av 4';
  }
  if(finished.includes(0)&&!platformFlight){button.disabled=true;if(run?.kind!=='cup'||finished.length===4){finish();return}$('#raceTitle').textContent='Du är i mål! De andra lagen är på väg…'}
  requestAnimationFrame(frame);
 }
 requestAnimationFrame(frame)
}
