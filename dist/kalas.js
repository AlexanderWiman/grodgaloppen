// Survey 5: berry picking on time, birthdays in the glade and New Year fireworks.
//
// Berry picking (Bärbacken) opens after 5 won races (milestone "berries"). Berries pop up on nine
// bushes for 30 seconds. Blue berries give 1 point, rare golden berries 3, and green berries are not
// ripe yet. Points become dewdrops (at most 30 a round and 40 a day) and the berries go to the
// garden pantry, where they can be baked into a blueberry pie.
//
// Birthdays: the family adds names and dates in the glade. On the day the glade has a party with
// bunting, balloons, a cake and the neighbours. Singing for the birthday child gives 50 dewdrops
// once a year each; the first party ever also gives the frog a party hat and a cake for the glade.
//
// New Year (31 December and 1 January): tap the sky in the glade to shoot fireworks. Twelve rockets
// give 50 dewdrops and a star fountain for the glade, once a year. This sits on top of Christmas,
// which lasts until 6 January.

// ---------- Berry picking ----------
const BERRY_SECONDS=30,BERRY_SPOTS=9,BERRY_ROUND_CAP=30,BERRY_DAY_CAP=40;
const berryKinds={blue:{name:'Blåbär',points:1,life:1400},gold:{name:'Guldbär',points:3,life:900},green:{name:'Kart',points:0,life:1600}};
function ensureBerryPick(){state.berryPick??={best:0,rounds:0,day:null,earned:0,total:0};return state.berryPick}
// Which berry pops up: mostly blue, some green, a few golden.
function berrySpawn(rnd=Math.random){const r=rnd();return r<.08?'gold':r<.36?'green':'blue'}
function berryNewRun(){return {score:0,picked:0,spots:Array(BERRY_SPOTS).fill(null),over:false,n:0,spawned:0}}
function berryPut(run,i,kind,now){if(run.over||run.spots[i])return false;run.spots[i]={kind,until:now+berryKinds[kind].life,id:++run.n};run.spawned++;return true}
function berryExpire(run,now){const gone=[];run.spots.forEach((b,i)=>{if(b&&b.until<=now){run.spots[i]=null;gone.push(i)}});return gone}
// Tapping a bush: ripe berries are picked; green ones stay on the bush.
function berryTap(run,i){const b=run.spots[i];if(!b||run.over)return null;if(b.kind==='green')return {kind:'green',points:0};run.spots[i]=null;const points=berryKinds[b.kind].points;run.score+=points;run.picked+=b.kind==='gold'?2:1;return {kind:b.kind,points}}
function berryCoins(score){return Math.max(0,Math.min(BERRY_ROUND_CAP,score))}
function berryFinish(score,picked,day=typeof todayKey==='function'?todayKey():new Date().toDateString()){
 const b=ensureBerryPick();if(b.day!==day){b.day=day;b.earned=0}
 const coins=Math.max(0,Math.min(berryCoins(score),BERRY_DAY_CAP-b.earned));b.earned+=coins;state.coins+=coins;
 const best=score>b.best;if(best)b.best=score;b.rounds++;b.total+=picked;
 if(picked>0&&typeof pantryAdd==='function')pantryAdd('blueberry',picked);
 save();return {coins,best,score,picked};
}
function bushArt(){return '<svg viewBox="0 0 100 80" aria-hidden="true"><ellipse cx="50" cy="74" rx="40" ry="5" fill="#000" opacity=".1"/><g fill="#5f8f4e"><circle cx="30" cy="48" r="22"/><circle cx="70" cy="48" r="22"/><circle cx="50" cy="34" r="24"/><circle cx="50" cy="56" r="20"/></g><g fill="#7aa95d"><circle cx="38" cy="32" r="9"/><circle cx="64" cy="38" r="7"/></g></svg>'}
function berryArt(kind){const c={blue:['#4b5da8','#7f90d6'],gold:['#e2b94b','#fff1a8'],green:['#9cc46a','#d4ecb0']}[kind];return `<svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="22" r="13" fill="${c[0]}"/><circle cx="15" cy="17" r="4" fill="${c[1]}" opacity=".8"/><path d="M16 9l4 4 4-4" stroke="#3f6b35" stroke-width="2.4" fill="none" stroke-linecap="round"/>${kind==='gold'?'<path d="M33 6l1.5 3.5L38 11l-3.5 1.5L33 16l-1.5-3.5L28 11l3.5-1.5Z" fill="#fff6c8"/>':''}</svg>`}

let berryRun=null;
function renderBerries(){
 berryRun=null;const b=ensureBerryPick();
 const head=`<div class="sectionHead"><div><div class="eyebrow">BÄRBACKEN BAKOM GLÄNTAN</div><h2>Bärplockning</h2></div>${typeof unlocked!=='function'||unlocked('berries')?`<span class="pill">Rekord ${b.best} poäng</span>`:''}</div>`;
 if(typeof unlocked==='function'&&!unlocked('berries')){$('#content').innerHTML=head+(typeof lockedHint==='function'?lockedHint('berries'):'');return}
 const today=b.day===(typeof todayKey==='function'?todayKey():'')?b.earned:0;
 $('#content').innerHTML=`${head}<section class="berryStart"><div class="berryStartArt">${bushArt()}<span>${berryArt('blue')}</span></div><p>Plocka så många blåbär ni hinner på ${BERRY_SECONDS} sekunder. Tryck på bären när de dyker upp.</p><ul class="berryRules"><li>${berryArt('blue')} Blåbär · 1 poäng</li><li>${berryArt('gold')} Guldbär · 3 poäng</li><li>${berryArt('green')} Gröna bär är inte mogna än</li></ul><button class="primary" id="berryGo">Börja plocka</button><p class="memoryNote">Poängen blir daggdroppar, högst ${BERRY_DAY_CAP} om dagen. I dag: ${today} av ${BERRY_DAY_CAP}. Bären hamnar i skafferiet och kan bli blåbärspaj.</p></section>`;
 $('#berryGo').onclick=startBerries;
}
function startBerries(){
 const run=berryNewRun();berryRun=run;sfx('go');
 $('#content').innerHTML=`<div class="sectionHead"><div><div class="eyebrow">BÄRBACKEN</div><h2>Plocka!</h2></div><span class="pill"><span id="berryScore">0</span> poäng · <span id="berryTime">${BERRY_SECONDS}</span> s</span></div><div class="berryClock"><i id="berryBar"></i></div><section class="berryBoard" id="berryBoard" aria-label="Blåbärsbuskar">${run.spots.map((_,i)=>`<button class="berryBush" data-bush="${i}" aria-label="Buske ${i+1}">${bushArt()}<span class="berrySlot" aria-hidden="true"></span></button>`).join('')}</section><p id="berryStatus" class="memoryStatus" role="status"></p><button class="outline" id="berryQuit">Sluta plocka</button>`;
 $('#berryQuit').onclick=renderBerries;
 document.querySelectorAll('[data-bush]').forEach(el=>el.onclick=()=>{const i=+el.dataset.bush,r=berryTap(run,i);if(!r)return;if(r.kind==='green'){el.classList.remove('nope');void el.offsetWidth;el.classList.add('nope');$('#berryStatus').textContent='Det bäret är inte moget än!';return}sfx(r.kind==='gold'?'chime':'tick');drawBush(i,null);el.classList.add('picked');setTimeout(()=>el.classList.remove('picked'),250);$('#berryScore').textContent=run.score;$('#berryStatus').textContent=r.kind==='gold'?'Ett guldbär! +3':''});
 const start=performance.now();let nextSpawn=start+400;
 const drawBush=(i,b)=>{const el=document.querySelector(`[data-bush="${i}"]`);if(!el)return;const slot=el.querySelector('.berrySlot');if(slot)slot.innerHTML=b?berryArt(b.kind):'';el.classList.toggle('hasBerry',!!b);el.setAttribute('aria-label',b?`Buske ${i+1}: ${berryKinds[b.kind].name}`:`Buske ${i+1}`)};
 const tick=()=>{
  if(berryRun!==run||!document.querySelector('#berryBoard'))return;
  const now=performance.now(),t=now-start,left=Math.max(0,BERRY_SECONDS*1000-t);
  berryExpire(run,now).forEach(i=>drawBush(i,null));
  if(now>=nextSpawn&&left>600){const free=run.spots.map((b,i)=>b?-1:i).filter(i=>i>=0);if(free.length){const i=free[Math.floor(Math.random()*free.length)];const kind=berrySpawn();berryPut(run,i,kind,now);drawBush(i,run.spots[i])}nextSpawn=now+Math.max(420,720-t/100)}
  $('#berryTime').textContent=Math.ceil(left/1000);const bar=$('#berryBar');if(bar)bar.style.width=(left/(BERRY_SECONDS*10))+'%';
  if(left<=0){berryEnd(run);return}
  setTimeout(tick,80);
 };
 setTimeout(tick,80);
}
function berryEnd(run){
 if(berryRun!==run)return;run.over=true;berryRun=null;
 const bar=$('#berryBar');if(bar)bar.style.width='0%';$('#berryTime').textContent='0';const r=berryFinish(run.score,run.picked);sfx(r.best?'win':'finish');sidebar();
 $('#berryBoard').insertAdjacentHTML('afterend',`<section class="memoryDone"><h3>${r.score} poäng!</h3><p>${r.best?'Nytt rekord! · ':''}+${r.coins} daggdroppar · ${r.picked} blåbär till skafferiet</p><button class="primary" id="berryAgain">Plocka igen</button></section>`);
 const quit=$('#berryQuit');if(quit)quit.hidden=true;$('#berryStatus').textContent='';$('#berryAgain').onclick=renderBerries;
}

// Blueberries in the pantry, and a pie in the kitchen.
if(typeof yardDishes!=='undefined'){
 yardDishes.blueberrypie={name:'Blåbärspaj',needs:{blueberry:6,egg:1},price:36,color:'#5b5fa8'};
 pantryNames.blueberry='Blåbär';itemOne.blueberry='blåbär';
 shopGoods.blueberry={name:'Blåbär',price:3,pantry:true};shopGoods.blueberrypie={name:'Blåbärspaj',price:36,pantry:true};
 neighbourLikes.mira?.push('blueberrypie');neighbourLikes.vide?.push('blueberry');
 const plainArt=pantryArt;pantryArt=function(k){
  if(k==='blueberry')return '<svg viewBox="0 0 100 70" aria-hidden="true"><path d="M18 34H82Q78 62 50 62Q22 62 18 34Z" fill="#c9a06a"/><path d="M22 40H78M24 48H76M30 56H70" stroke="#a9824f" stroke-width="2"/>'+[[34,30],[46,26],[58,29],[70,31],[40,36],[54,35],[64,36]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="6.5" fill="#4b5da8"/><circle cx="${x-2}" cy="${y-2}" r="2" fill="#8fa0de"/>`).join('')+'</svg>';
  if(k==='blueberrypie')return '<svg viewBox="0 0 100 70" aria-hidden="true"><ellipse cx="50" cy="56" rx="40" ry="9" fill="#e8e2d4"/><path d="M16 44Q50 62 84 44L80 36H20Z" fill="#d9a75a"/><ellipse cx="50" cy="38" rx="32" ry="10" fill="#4b4f97"/><path d="M24 38L76 38M32 31L68 45M32 45L68 31" stroke="#e8c27a" stroke-width="4" stroke-linecap="round"/><circle cx="50" cy="38" r="3" fill="#e8c27a"/></svg>';
  return plainArt(k)};
}

// ---------- Birthdays ----------
const MONTH_NAMES=['januari','februari','mars','april','maj','juni','juli','augusti','september','oktober','november','december'];
const BIRTHDAY_MAX=8,BIRTHDAY_COINS=50;
function ensureBirthdays(){state.birthdays??=[];state.parties??={};return state.birthdays}
// 29 February is celebrated on 28 February in years without a 29th.
function birthdayIs(b,d){const m=d.getMonth()+1,day=d.getDate();if(b.m===m&&b.d===day)return true;return b.m===2&&b.d===29&&m===2&&day===28&&new Date(d.getFullYear(),1,29).getDate()!==29}
function birthdaysToday(d=gameDate()){return ensureBirthdays().filter(b=>birthdayIs(b,d))}
function addBirthday(name,m,d){
 const list=ensureBirthdays();name=String(name??'').replace(/\s+/g,' ').trim().slice(0,18);m=Math.floor(+m);d=Math.floor(+d);
 if(!name||list.length>=BIRTHDAY_MAX||!(m>=1&&m<=12)||!(d>=1&&d<=new Date(2024,m,0).getDate()))return null;
 state.partyNext=(state.partyNext||0)+1;const b={id:'b'+state.partyNext,name,m,d};list.push(b);save();return b;
}
function removeBirthday(id){const list=ensureBirthdays(),n=list.length;state.birthdays=list.filter(b=>b.id!==id);if(state.birthdays.length===n)return false;save();return true}
// Days until the next birthday (0 on the day itself).
function daysUntilBirthday(b,d=gameDate()){const today=new Date(d.getFullYear(),d.getMonth(),d.getDate());for(let i=0;i<=366;i++){const t=new Date(today);t.setDate(today.getDate()+i);if(birthdayIs(b,t))return i}return 366}
function nextBirthday(d=gameDate()){return ensureBirthdays().map(b=>({...b,days:daysUntilBirthday(b,d)})).sort((a,b)=>a.days-b.days)[0]||null}
function partyKey(b,d){return d.getFullYear()+':'+b.id}
function partyDone(b,d=gameDate()){return !!ensureBirthdays()&&!!state.parties[partyKey(b,d)]}
// Sing for the birthday child: once a year each.
function celebrate(id,d=gameDate()){
 const b=birthdaysToday(d).find(b=>b.id===id);if(!b||partyDone(b,d))return null;
 state.parties[partyKey(b,d)]=true;state.coins+=BIRTHDAY_COINS;const got={name:b.name,coins:BIRTHDAY_COINS};
 if(!state.decorOwned.includes('birthdaycake')){state.decorOwned.push('birthdaycake');got.cake=true}
 if(typeof giveWear==='function'&&!(state.wardrobe||[]).includes('hat-party')){giveWear('hat-party');state.frogHat='hat-party';got.hat=true}
 save();return got;
}
function dateText(m,d){return d+' '+MONTH_NAMES[m-1]}
function partyCanvasHTML(){
 const kids=state.hatched?birthdaysToday():[];if(!kids.length)return '';
 const flags=Array.from({length:14},(_,i)=>`<path d="M${i*72+8} ${18+Math.sin(i/13*Math.PI)*26}l30 0-15 30Z" fill="${['#e46a6a','#f2c94c','#6fb1d8','#9cc46a','#c58ad6'][i%5]}"/>`).join('');
 const guests=(state.village?.residents||[]).slice(0,3);
 return `<div class="partyLayer" aria-hidden="true"><svg class="partyBunting" viewBox="0 0 1000 80" preserveAspectRatio="none"><path d="M0 18Q500 70 1000 18" stroke="#8a6a4c" stroke-width="2" fill="none"/>${flags}</svg>${[['#e46a6a',8],['#6fb1d8',16],['#f2c94c',84],['#c58ad6',91]].map(([c,x],i)=>`<span class="partyBalloon" style="left:${x}%;animation-delay:${i*.6}s"><svg viewBox="0 0 40 90"><ellipse cx="20" cy="22" rx="15" ry="19" fill="${c}"/><ellipse cx="14" cy="16" rx="4" ry="6" fill="#fff" opacity=".45"/><path d="M20 41q-5 12 2 24t-2 24" stroke="#8a6a4c" fill="none"/></svg></span>`).join('')}<span class="partyCake">${birthdayCakeArt()}</span>${typeof residentArt==='function'?guests.map((id,i)=>`<span class="partyGuest" style="left:${22+i*12}%">${residentArt(id)}</span>`).join(''):''}</div>`;
}
function birthdayCakeArt(){return `<svg viewBox="0 0 120 110" aria-hidden="true">${extraBirthdayCake}</svg>`}
const extraBirthdayCake='<ellipse cx="60" cy="102" rx="40" ry="6" fill="#000" opacity=".12"/><ellipse cx="60" cy="96" rx="44" ry="8" fill="#e8e2d4"/><rect x="24" y="58" width="72" height="36" rx="8" fill="#fff6ea"/><path d="M24 66Q33 74 42 66T60 66T78 66T96 66" stroke="#f6a5c0" stroke-width="7" fill="none" stroke-linecap="round"/><rect x="36" y="40" width="48" height="22" rx="6" fill="#f6c4cf"/><g fill="#d9453f"><circle cx="44" cy="40" r="4"/><circle cx="60" cy="38" r="4"/><circle cx="76" cy="40" r="4"/></g><g stroke="#7fb3e0" stroke-width="3"><path d="M50 36V22"/><path d="M60 34V20"/><path d="M70 36V22"/></g><g fill="#f2c94c"><path d="M50 21q-3-5 0-9q3 4 0 9Z"/><path d="M60 19q-3-5 0-9q3 4 0 9Z"/><path d="M70 21q-3-5 0-9q3 4 0 9Z"/></g>';
function birthdayTodayHTML(){
 if(!state.hatched)return '';const kids=birthdaysToday();if(!kids.length)return '';
 return `<section class="partyCard" id="partyCard"><div class="partyCardArt">${birthdayCakeArt()}</div><div><div class="eyebrow">KALAS I GLÄNTAN</div><h3>Grattis på födelsedagen, ${kids.map(b=>escapeText(b.name)).join(' och ')}!</h3><p>Grannarna har kommit med ballonger och tårta.</p><div class="partyButtons">${kids.map(b=>partyDone(b)?`<span class="pill">Hurra för ${escapeText(b.name)}! ✓</span>`:`<button class="primary" data-party="${b.id}">🎂 Sjung för ${escapeText(b.name)}</button>`).join('')}</div><p class="forestNote" id="partyStatus" role="status"></p></div></section>`;
}
function birthdayListHTML(){
 if(!state.hatched)return '';const list=ensureBirthdays(),next=nextBirthday();
 const summary=list.length?(next.days===0?'Kalas i dag!':`Nästa kalas: ${escapeText(next.name)} om ${next.days} ${next.days===1?'dag':'dagar'}`):'Lägg till era födelsedagar';
 return `<details class="birthdayBox" id="birthdayBox"${birthdayOpen?' open':''}><summary><span>🎂 Födelsedagar</span><small>${summary}</small></summary><p class="forestNote">På födelsedagen blir det kalas i gläntan med tårta, ballonger och grannarna.</p>${list.length?`<ul class="birthdayList">${list.map(b=>`<li><b>${escapeText(b.name)}</b><span>${dateText(b.m,b.d)}</span><button class="outline" data-unbirthday="${b.id}" aria-label="Ta bort ${escapeText(b.name)}">✕</button></li>`).join('')}</ul>`:''}${list.length<BIRTHDAY_MAX?`<div class="birthdayForm"><input type="text" id="birthdayName" maxlength="18" placeholder="Namn" aria-label="Namn"><select id="birthdayDay" aria-label="Dag">${Array.from({length:31},(_,i)=>`<option>${i+1}</option>`).join('')}</select><select id="birthdayMonth" aria-label="Månad">${MONTH_NAMES.map((n,i)=>`<option value="${i+1}">${n}</option>`).join('')}</select><button class="primary" id="birthdayAdd">Lägg till</button></div>`:''}<p class="forestNote" id="birthdayStatus" role="status"></p></details>`;
}
let birthdayOpen=false;
function confetti(box){if(!box?.insertAdjacentHTML)return;const html=Array.from({length:28},(_,i)=>`<i style="left:${Math.random()*100}%;background:${['#e46a6a','#f2c94c','#6fb1d8','#9cc46a','#c58ad6'][i%5]};animation-delay:${Math.random()*.6}s;--drift:${Math.round(Math.random()*80-40)}px"></i>`).join('');box.insertAdjacentHTML('beforeend',`<div class="confetti" aria-hidden="true">${html}</div>`);setTimeout(()=>box.querySelector('.confetti')?.remove(),2600)}
function wireBirthdays(){
 document.querySelectorAll('[data-party]').forEach(b=>b.onclick=()=>{const got=celebrate(b.dataset.party);if(!got)return;sfx('win');sidebar();toast('Hurra för '+got.name+'!');renderHome();const s=$('#partyStatus');if(s)s.textContent=`Ja må du leva! · +${got.coins} daggdroppar`+(got.hat?' · Grodan fick en kalashatt':'')+(got.cake?' · En tårta flyttar in i gläntan':'');confetti($('#gardenCanvas'))});
 const box=$('#birthdayBox');if(!box)return;box.ontoggle=()=>{birthdayOpen=box.open};
 const add=$('#birthdayAdd');if(add)add.onclick=()=>{const b=addBirthday($('#birthdayName').value,$('#birthdayMonth').value,$('#birthdayDay').value);if(!b){$('#birthdayStatus').textContent=$('#birthdayName').value.trim()?'Det datumet finns inte.':'Skriv ett namn först.';return}sfx('chime');birthdayOpen=true;renderHome();const s=$('#birthdayStatus');if(s)s.textContent=b.name+' är tillagd · '+dateText(b.m,b.d)};
 document.querySelectorAll('[data-unbirthday]').forEach(b=>b.onclick=()=>{removeBirthday(b.dataset.unbirthday);birthdayOpen=true;renderHome()});
}

// ---------- New Year ----------
const NYAR_ROCKETS=12,NYAR_COINS=50;
function isNyar(d=gameDate()){const m=d.getMonth()+1,day=d.getDate();return (m===12&&day===31)||(m===1&&day===1)}
function nyarYear(d=gameDate()){return d.getMonth()===11?d.getFullYear()+1:d.getFullYear()}
function ensureNyar(){state.nyar??={};const y=nyarYear();state.nyar[y]??={rockets:0,gift:false};return state.nyar[y]}
function launchRocket(){
 if(!isNyar())return null;const n=ensureNyar();n.rockets++;const got={rockets:n.rockets,gift:false};
 if(n.rockets>=NYAR_ROCKETS&&!n.gift){n.gift=true;state.coins+=NYAR_COINS;got.gift=true;if(!state.decorOwned.includes('fireworkstar')){state.decorOwned.push('fireworkstar');got.star=true}}
 save();return got;
}
function nyarCardHTML(){
 if(!state.hatched||!isNyar())return '';const n=ensureNyar();
 return `<section class="partyCard nyarCard"><div class="partyCardArt">${fireworkStarArt()}</div><div><div class="eyebrow">NYÅR I ÄLVBYN</div><h3>Gott nytt år ${nyarYear()}!</h3><p>${n.gift?'Vilket fyrverkeri! Stjärnfontänen står nu i gläntan.':`Tryck på himlen i gläntan för att skjuta upp fyrverkerier. Skjut ${NYAR_ROCKETS} raketer så händer något.`}</p><span class="pill" id="nyarCount">${Math.min(n.rockets,NYAR_ROCKETS)} av ${NYAR_ROCKETS} raketer</span></div></section>`;
}
function nyarCanvasHTML(){return state.hatched&&isNyar()?'<div class="nyarShade" aria-hidden="true"></div><button class="nyarSkyTap" id="nyarSky" aria-label="Skjut upp fyrverkerier"></button>':''}
function fireworkBurst(box,x,y){
 if(!box?.insertAdjacentHTML)return;const c=['#f2c94c','#e46a6a','#6fb1d8','#c58ad6','#9ce07a','#fff6c8'][Math.floor(Math.random()*6)];
 box.insertAdjacentHTML('beforeend',`<div class="firework" style="left:${x}%;top:${y}%;--c:${c}" aria-hidden="true">${Array.from({length:14},(_,i)=>`<i style="--a:${i*360/14}deg"></i>`).join('')}</div>`);
 const el=box.lastElementChild;setTimeout(()=>el?.remove(),1500);
}
function wireNyar(){
 const sky=$('#nyarSky'),canvas=$('#gardenCanvas');if(!sky||!canvas)return;
 sky.onclick=e=>{const r=canvas.getBoundingClientRect();const x=e.clientX?((e.clientX-r.left)/r.width*100):20+Math.random()*60,y=e.clientY?((e.clientY-r.top)/r.height*100):10+Math.random()*20;fireworkBurst(canvas,x,y);sfx('chime');const got=launchRocket();if(!got)return;const p=$('#nyarCount');if(p)p.textContent=Math.min(got.rockets,NYAR_ROCKETS)+' av '+NYAR_ROCKETS+' raketer';if(got.gift){sfx('win');sidebar();toast('Gott nytt år! · +'+NYAR_COINS+' daggdroppar'+(got.star?' · En stjärnfontän i gläntan':''));for(let i=0;i<5;i++)setTimeout(()=>fireworkBurst(canvas,15+Math.random()*70,8+Math.random()*20),i*220)}};
 for(let i=0;i<3;i++)setTimeout(()=>fireworkBurst(canvas,20+Math.random()*60,8+Math.random()*18),300+i*500);
}
function fireworkStarArt(){return `<svg viewBox="0 0 120 110" aria-hidden="true">${extraFireworkStar}</svg>`}
const extraFireworkStar='<ellipse cx="60" cy="104" rx="24" ry="5" fill="#000" opacity=".12"/><path d="M48 102L52 70H68L72 102Z" fill="#c9473f"/><path d="M50 86H70" stroke="#f2c94c" stroke-width="4"/><path d="M60 70V58" stroke="#8a6a4c" stroke-width="3"/><g stroke-linecap="round" stroke-width="3"><path d="M60 54L40 24" stroke="#f2c94c"/><path d="M60 54L60 14" stroke="#fff1a8"/><path d="M60 54L80 24" stroke="#f2c94c"/><path d="M60 54L28 42" stroke="#e46a6a"/><path d="M60 54L92 42" stroke="#6fb1d8"/></g><g fill="#fff6c8"><circle cx="40" cy="22" r="3"/><circle cx="60" cy="12" r="3.5"/><circle cx="80" cy="22" r="3"/><circle cx="27" cy="41" r="2.5"/><circle cx="93" cy="41" r="2.5"/></g>';

// ---------- Hooks into the rest of the game ----------
if(typeof decorations!=='undefined')decorations.push({id:'birthdaycake',name:'Födelsedagstårta',icon:'🎂',from:'Fira en födelsedag i gläntan'},{id:'fireworkstar',name:'Stjärnfontän',icon:'🎆',from:'Skjut fyrverkerier på nyår'});
if(typeof extraGardenArt!=='undefined'){extraGardenArt.birthdaycake=extraBirthdayCake;extraGardenArt.fireworkstar=extraFireworkStar}
if(typeof wardrobe!=='undefined')wardrobe.push({id:'hat-party',slot:'frogHat',name:'Kalashatt',gift:true});
if(typeof frogHatArt==='function'){const plain=frogHatArt;frogHatArt=function(){if(wearing('frogHat')!=='hat-party')return plain();return '<g transform="translate(0 10)"><path d="M188 118L208 76L228 118Z" fill="#7fb3e0"/><path d="M193 108L223 108M198 97L218 97M203 86L213 86" stroke="#f2c94c" stroke-width="4" stroke-linecap="round"/><circle cx="208" cy="75" r="6" fill="#e46a6a"/><path d="M186 118Q208 124 230 118" stroke="#5f8fc0" stroke-width="2" fill="none"/></g>'}}
// The glade: party card and New Year card above the garden, decorations in it, birthdays below.
if(typeof renderHome==='function'){const plain=renderHome;renderHome=function(){
 plain();const canvas=$('#gardenCanvas');if(!canvas?.insertAdjacentHTML)return;
 const top=birthdayTodayHTML()+nyarCardHTML();if(top){const lead=document.querySelector('.gardenLead');(lead||canvas).insertAdjacentHTML(lead?'afterend':'beforebegin',top)}
 const layer=partyCanvasHTML()+nyarCanvasHTML();if(layer)canvas.insertAdjacentHTML('beforeend',layer);
 const lower=document.querySelector('.gardenLower');(lower||canvas).insertAdjacentHTML(lower?'beforebegin':'afterend',birthdayListHTML());
 wireBirthdays();wireNyar();
}}
