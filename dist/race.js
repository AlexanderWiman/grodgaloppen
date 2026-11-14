// Shared hopping engine for races, cup rounds and adventures.
//
// Races:
//   - Fart (stat 0) widens the green jump window.
//   - Hopp (stat 1) makes every successful hop carry further.
//   - Uthållighet (stat 2) keeps more speed after a miss.
//   - The rhythm varies hop to hop and speeds up in the final stretch.
//   - Each track has a twist (see twistRules) and occasional surprise obstacles.
//   - Rivals have personalities, lines, small spurts and are visible on the track.
//   - The active frog's ability can adjust the numbers (raceMods, defined in frogs.js).
// Adventures keep a steady rhythm, no rivals, no surprises and no time pressure.

// Every track is data. Index order is stable: saves store best times and visits by index.
const trackWorlds=[
{id:'pond',name:'Näckrosdammen',icon:'❀',type:'FART',stat:0,reward:90,desc:'Hoppa mellan näckrosor i den soliga dammen.',className:'pond',pad:'lilyPad',padLabel:'Nästa näckros',label:'Hoppa till nästa näckros',hint:'Du står på den vänstra näckrosen. Hoppa när nästa näckros lyser grönt – då landar du på den.',twist:'drift',twistText:'Näckrosorna driver – det gröna fältet flyttar sig varje hopp',period:3.1,bonus:3.8,music:'pond',decor:'❀　　　❀　　　❀',surprise:{icon:'🪵',name:'stocken'}},
{id:'forest',name:'Svampskogen',icon:'🍄',type:'HOPP',stat:1,reward:110,desc:'Ta stora språng över rötter och svampar.',className:'forest',pad:'mushroomPad',padLabel:'Nästa studssvamp',extra:'root',label:'Över roten, upp på studssvampen',hint:'Vänta tills svampen lyser grönt. Hoppa över roten och landa på hatten för extra studs!',twist:'golden',twistText:'Var fjärde svamp är gyllene – smalare fält men dubbelt skutt',period:2.8,bonus:4.5,bounce:true,music:'forest',decor:'♣　🍄　♣　🍄',surprise:{icon:'🐌',name:'snigeln'}},
{id:'marsh',name:'Månskensmyren',icon:'☾',type:'UTHÅLLIGHET',stat:2,reward:130,desc:'Håll hela vägen genom den magiska myren.',className:'marsh',pad:'marshPad',padLabel:'Nästa tuva',extra:'fly',label:'Följ eldflugan till nästa tuva',hint:'Eldflugan visar landningen. När den lyser starkt hoppar du över gyttjan till nästa tuva.',twist:'flutter',twistText:'Eldflugan fladdrar – visaren byter takt hela tiden',period:3.4,bonus:4,music:'marsh',decor:'✧　　　✧　　　✧',surprise:{icon:'🫧',name:'gyttjebubblan'}},
{id:'crystal',name:'Kristallgrottan',icon:'💎',type:'FART',stat:0,reward:120,desc:'Studsa mellan glittrande kristaller i grottans eko.',className:'crystal',pad:'crystalPad',padLabel:'Nästa kristall',label:'Följ ekot mellan kristallerna',hint:'Visaren studsar fram och tillbaka som ett eko. Hoppa när den passerar det gröna fältet – åt vilket håll som helst.',twist:'echo',twistText:'Ekot – visaren studsar fram och tillbaka',period:4.4,bonus:4.2,music:'crystal',decor:'✦　💎　　✦　💎',surprise:{icon:'💧',name:'droppen från taket'}}
];
// `races` is the name older code uses for the same list.
const races=trackWorlds;
function trackUnlocked(i){const t=trackWorlds[i];return !!t&&(!t.unlock||typeof chapterDone!=='function'||chapterDone(t.unlock))}

// How each twist changes a cycle: zone placement, pointer speed and pointer path.
const twistRules={
 drift:{zone:c=>({c:.6+Math.random()*.26})},
 golden:{zone:c=>c.cycle%4===0?{golden:true}:{}},
 flutter:{rate:c=>1+.3*Math.sin(c.elapsed*3.7+c.seed)+.2*Math.sin(c.elapsed*6.1+c.seed*2)},
 echo:{path:p=>p<.5?p*2:2-p*2,zone:()=>({c:.55+Math.random()*.3,wMult:.8})},
 current:{live:c=>({c:.72+.12*Math.sin(c.elapsed*1.6+c.seed)})},
 wind:{live:c=>({wMult:.85+.25*Math.sin(c.elapsed*2.2+c.seed)})},
 dark:{hidden:true},
 ice:{start:()=>.12+Math.random()*.2},
 royal:{zone:c=>c.cycle%3===0?{golden:true}:{}}
};

// Rival personalities: pace curve over their own progress (0–100), lines and a short story.
const rivals=[
{name:'Klöver',color:'#7fb069',style:'Snabb start',pace:p=>1.1-.2*p/100,hat:'🍀',
 bio:'Den snabbaste grodan i Näckrosdammen. Startar som en raket men glömmer ibland att spara ork. Drömmer om Astrids pokal.',
 lines:{start:'Snabbast vinner! Häng med om du kan!',passed:'Va?! Hur gick det där till?',passes:'Hej då! Vi ses vid målet!',sprint:'Puh… benen börjar bli trötta…',win:'Bra kämpat! Jag var lite för snabb idag.',lose:'Du var snabbare. Revansch nästa gång!'}},
{name:'Mossa',color:'#5f9ea0',style:'Jämn och stadig',pace:()=>1,hat:'🌿',
 bio:'Bor under en gammal ek och har tävlat längst av alla. Lugn, klok och alltid snäll mot nya grodor.',
 lines:{start:'Lugnt och fint. Ett hopp i taget.',passed:'Snyggt hopp, vännen.',passes:'Ett steg i taget…',sprint:'Andas in, hoppa ut.',win:'Tålamod lönar sig. Du var nära!',lose:'Du har lärt dig mycket. Jag är stolt över dig.'}},
{name:'Pärla',color:'#c49bd6',style:'Stark slutspurt',pace:p=>.9+.22*p/100,hat:'🫧',
 bio:'Kom från Månskensmyren med en pärla på huvudet. Lite blyg i början men otroligt snabb på slutet.',
 lines:{start:'Jag sparar krafterna till slutet…',passed:'Oj, vad du glittrar idag!',passes:'Här kommer jag! ✨',sprint:'Nu! Nu är det min tur!',win:'Slutspurten är min hemlighet.',lose:'Du glittrade starkast idag!'}}
];
const RIVAL_BASE=4.0;
// Difficulty only changes how fast the rivals are; hard races pay a little more.
const difficulties={easy:{label:'Lätt',rival:.9,reward:1},normal:{label:'Lagom',rival:1,reward:1},hard:{label:'Svår',rival:1.1,reward:1.25}};
function difficulty(){return difficulties[state.difficulty]||difficulties.normal}
// Frog abilities (frogs.js) may return {window, hop, missSlow, surpriseDrops, streakFrom, firstPerfect}.
function raceMods(){return typeof frogAbilityMods==='function'?frogAbilityMods()||{}:{}}

// Exposed for tests and balancing: lets a bot read the meter and press jump.
let raceProbe=null;

function raceTuning(st){return{window:.17+st[0]*.0011,hopMult:.75+st[1]*.006,missSlow:Math.min(.85,.45+st[2]*.004)}}

function jumpVerdict(phase,zone={c:.82,w:.24}){const d=Math.abs(phase-zone.c);return d<=zone.w*.19?'perfect':d<=zone.w/2?'good':'miss'}

function miniFrog(color,hat=''){return `<svg viewBox="0 0 60 44" aria-hidden="true"><ellipse cx="30" cy="30" rx="24" ry="13" fill="${color}"/><circle cx="19" cy="15" r="8" fill="${color}"/><circle cx="41" cy="15" r="8" fill="${color}"/><circle cx="19" cy="14" r="4.5" fill="#fbf6d8"/><circle cx="41" cy="14" r="4.5" fill="#fbf6d8"/><circle cx="20" cy="14" r="2.2" fill="#263d32"/><circle cx="42" cy="14" r="2.2" fill="#263d32"/><path d="M21 31Q30 37 39 31" fill="none" stroke="#263d32" stroke-width="2" stroke-linecap="round"/>${hat?`<text x="30" y="9" font-size="11" text-anchor="middle">${hat}</text>`:''}</svg>`}

function platformScene(world){return `<div class="landingPlatform ${world.pad}" id="currentPad"></div><div class="landingPlatform ${world.pad}" id="nextPad"></div><span id="landingCue">${world.padLabel}</span>${world.extra==='root'?'<svg id="rootObstacle" viewBox="0 0 100 60" aria-hidden="true"><path d="M5 52Q25 51 30 30Q35 4 50 12Q65 20 60 38Q70 49 95 52" fill="none" stroke="#6f5139" stroke-width="13" stroke-linecap="round"/><path d="M31 28L19 18M60 37L80 26" stroke="#6f5139" stroke-width="7" stroke-linecap="round"/></svg>':world.extra==='fly'?'<div id="guideFly" aria-hidden="true">✦</div>':''}<div id="surpriseThing" aria-hidden="true">${world.surprise?.icon||''}</div>`}

// On small screens, bring the play area into view so track and jump button fit together.
function scrollToPlay(el){if(el?.scrollIntoView&&typeof innerWidth!=='undefined'&&innerWidth<=700)el.scrollIntoView({block:'start',behavior:'smooth'})}
function scrollToContent(){const c=$('#content');if(c?.getBoundingClientRect&&c.getBoundingClientRect().top<0)c.scrollIntoView({block:'start'})}

function startRace(){
 if(!state.hatched)return;running=true;
 const run=activeRun,adventure=run?.kind==='adventure'?storyQuests.find(q=>q.id===run.id):null;
 const route=chosen,world=trackWorlds[route],r=world,st=stats(),strength=st[r.stat],tune=raceTuning(st),mods=raceMods(),rule=adventure?{}:twistRules[world.twist]||{};
 tune.window*=mods.window||1;tune.hopMult*=mods.hop||1;tune.missSlow=Math.min(.92,tune.missSlow+(mods.missSlow||0));
 const names=[typeof activeFrogName==='function'?activeFrogName():'Ditt team',...rivals.map(x=>x.name)],colors=[state.frog,...rivals.map(x=>x.color)];
 let progress=[0,0,0,0],finished=[],last=performance.now(),elapsed=0,phaseTime=0,period=world.period,zone={c:.82,w:tune.window},baseZone=zone,cycle=0,golden=false,surprise=false,lastSurprise=-9,attempted=false,slowUntil=0,good=0,perfect=0,misses=0,drops=0,streak=0,bestStreak=0,surprisesCleared=0,ended=false,platformFlight=null,sprint=false,place=1,finishTime=null,sayUntil=0,firstPerfectUsed=false;
 const diff=difficulty(),seed=Math.random()*6;
 const speeds=[2.8+strength*.009,...rivals.map(()=>RIVAL_BASE*diff.rival*(.97+Math.random()*.06))];
 const rivalMult=[1,1,1,1],spurts=[0,0,0,0],nextSpurt=[0,...rivals.map(()=>3+Math.random()*5)],said={};
 $('#content').innerHTML=`${adventure?`<div class="storyStage"><strong>${adventure.title}</strong><p id="storyStep">${adventure.steps[Math.min(5,storyProgress(adventure.id).steps)]}</p><span id="storyCount">${storyProgress(adventure.id).steps} / 6 etapper</span><button class="outline" id="pauseStory">Pausa äventyret</button></div>`:''}<div class="sectionHead"><h2>${r.name}</h2><span class="pill">${r.type} ger fördel</span></div><section class="jumpWorld ${world.className}" aria-label="${r.name}, tävlingsbana"><div class="worldCaption">${world.label}</div>${adventure?'':`<div class="twistBadge">✦ ${world.twistText}</div><div id="placeChip" class="placeChip">Plats 1 av 4</div><div id="streakChip" class="streakChip"></div><div id="rivalSay" class="rivalSay" role="status"></div>`}<div class="worldDecor">${world.decor}</div>${adventure?'':rivals.map((x,i)=>`<div class="rival" id="rival${i+1}" aria-hidden="true">${miniFrog(x.color,x.hat)}</div>`).join('')}${platformScene(world)}${adventure?`<div id="storyToken" class="storyToken" aria-label="${adventure.tokenLabel||adventure.title}">${adventure.icon}</div>`:''}<div id="jumpRider">${frog()}</div><div id="jumpObstacle" aria-hidden="true">${world.icon}</div><div class="ground"></div></section><div class="jumpControls"><p>${world.hint}</p><div class="timingLabel"><span id="timingState">Vänta…</span><strong id="timingHelp">HOPPA I DET GRÖNA FÄLTET</strong></div><div class="timingMeter" aria-hidden="true"><div class="timingTarget" id="timingTarget"></div><div id="timingPointer"></div></div><div class="jumpAction"><button class="primary" id="jumpButton">Hoppa!<span class="kbdHint"> · Mellanslag</span></button><span id="jumpScore">✦ 0 daggdroppar</span></div><p id="jumpFeedback" role="status">Tryck en gång per hinder. Missar kostar lite fart – du fortsätter direkt.</p></div><div class="raceLane">${names.map((n,i)=>`<div class="laneRow ${i?'':'me'}"><span>${escapeText(n)}${i?`<small>${rivals[i-1].style}</small>`:''}</span><div class="laneWater"><i class="laneFinish">⚑</i><b id="runner${i}">${miniFrog(colors[i],i?rivals[i-1].hat:'')}</b></div></div>`).join('')}</div><div class="raceInfo"><h2 id="raceTitle">Astrid: Låt racet börja!</h2></div>`;
 const button=$('#jumpButton'),rider=$('#jumpRider'),pointer=$('#timingPointer'),target=$('#timingTarget'),feedback=$('#jumpFeedback'),thing=$('#surpriseThing');
 function say(i,key){if(adventure||said[i+key]||elapsed<sayUntil)return;said[i+key]=true;sayUntil=elapsed+2.6;const b=$('#rivalSay');b.innerHTML=`<b>${rivals[i-1].name}:</b> ${rivals[i-1].lines[key]}`;b.classList.toggle('show',true);setTimeout(()=>b.classList?.toggle('show',false),2400)}
 function drawZone(){target.style.left=(zone.c-zone.w/2)*100+'%';target.style.width=zone.w*100+'%';$('#nextPad').classList.toggle('golden',golden);target.classList.toggle('golden',golden);target.classList.toggle('surprise',surprise);thing.classList.toggle('show',surprise);$('#timingHelp').textContent=surprise?'HINDER! TRÄFFA DET SMALA FÄLTET':golden?'GYLLENE – DUBBELT SKUTT':'HOPPA I DET GRÖNA FÄLTET'}
 function nextCycle(){
  phaseTime=0;attempted=false;button.disabled=false;golden=false;surprise=false;
  if(adventure){period=world.period;zone={c:.82,w:tune.window};drawZone();return}
  cycle++;
  period=world.period*(.82+Math.random()*.36)*(sprint?.85:1);
  const z={c:.82,...(rule.zone?rule.zone({cycle,elapsed,seed}):{})};
  let w=tune.window*(z.wMult||1);golden=!!z.golden;
  if(golden)w*=.65;
  // Surprise obstacles: now and then, never twice in a row, never on a golden hop.
  if(!golden&&cycle>=3&&cycle-lastSurprise>2&&Math.random()<.16){surprise=true;lastSurprise=cycle;w*=.75}
  if(rule.start)phaseTime=rule.start()*period;
  zone={c:Math.min(z.c,.97-w/2),w};baseZone=zone;
  drawZone();
  if(golden)$('#landingCue').textContent='Gyllene!';
  if(surprise)$('#landingCue').textContent='Hinder: '+world.surprise.name+'!';
 }
 function setStreak(){const chip=$('#streakChip');if(!chip)return;chip.textContent=streak>=2?'✦ '+streak+' i rad'+(streak>=(mods.streakFrom||3)?' · Grodflow!':''):'';chip.classList.toggle('hot',streak>=(mods.streakFrom||3))}
 function miss(pressed){
  misses++;streak=0;setStreak();
  if(surprise&&pressed){slowUntil=elapsed+1.8;sfx('bump');feedback.textContent='Bonk! '+world.surprise.name[0].toUpperCase()+world.surprise.name.slice(1)+' var i vägen – grodan skakar på huvudet och fortsätter.';return}
  slowUntil=elapsed+1.1;if(pressed)sfx('miss');
  feedback.textContent=adventure?'Ingen fara! Vänta på grönt och försök igen – du förlorar inga framsteg.':'Lite för tidigt eller sent – bara ett litet farttapp. Försök vid nästa hinder!'
 }
 function hop(){
  if(ended||attempted||platformFlight||!adventure&&finished.includes(0))return;
  attempted=true;button.disabled=true;sfx('jump');
  let verdict=jumpVerdict(shownPhase(),zone);
  if(verdict==='good'&&mods.firstPerfect&&!firstPerfectUsed){verdict='perfect';firstPerfectUsed=true}
  platformFlight={start:elapsed,success:verdict!=='miss',golden,landed:false};
  if(verdict==='miss'){miss(true);return}
  good++;streak++;bestStreak=Math.max(bestStreak,streak);setStreak();
  const isPerfect=verdict==='perfect';if(isPerfect){perfect++;sfx('perfect')}
  let gain=world.bonus*tune.hopMult+(isPerfect?1.2:0),earned=isPerfect?3:1;
  if(golden){gain*=2;earned+=2;sfx('golden')}
  if(surprise){surprisesCleared++;earned+=2+(mods.surpriseDrops||0);gain+=1}
  const flowFrom=mods.streakFrom||3;
  if(streak>=flowFrom){gain+=.5*Math.min(streak-flowFrom+1,4);earned+=1;if(streak===flowFrom)sfx('combo')}
  drops+=earned;progress[0]+=gain;
  if(adventure){feedback.textContent='Fint hopp! Du är på rätt väg.';return}
  feedback.textContent=surprise?'Du hoppade över '+world.surprise.name+'! +'+earned+' daggdroppar':golden?'Gyllene superstuds! Dubbelt skutt · +'+earned+' daggdroppar':isPerfect?'Perfekt språng! +'+earned+' daggdroppar ✦':world.bounce?'Studssvampen ger extra fart! +'+earned+' daggdroppar':'Fint hopp! +'+earned+' daggdroppar';
  if(streak>=flowFrom)feedback.textContent+=' · '+streak+' i rad!';
  $('#jumpScore').textContent='✦ '+drops+' daggdroppar';
 }
 function shownPhase(){const p=phaseTime/period;return rule.path?rule.path(p):p}
 raceProbe={phase:()=>shownPhase(),zone:()=>zone,ready:()=>!ended&&!attempted&&!platformFlight,hop,result:()=>({place:finished.indexOf(0)+1,time:finishTime,good,perfect,misses,bestStreak,surprisesCleared})};
 function keydown(e){if(e.code==='Space'&&!e.repeat){e.preventDefault();hop()}else if(e.code==='Space')e.preventDefault()}
 function stop(){ended=true;running=false;document.removeEventListener('keydown',keydown)}
 button.onclick=hop;document.addEventListener('keydown',keydown);
 // Tapping anywhere on the track also jumps – easier with a thumb on a phone.
 const track=$('.jumpWorld');track.onpointerdown=e=>{if(e.button>0)return;e.preventDefault?.();hop()};
 scrollToPlay(track);
 if(adventure){feedback.textContent='Hoppa när nästa landningsplats lyser. Missar går bra – försök bara igen.';$('#storyToken').classList.toggle('carried',storyProgress(adventure.id).steps>=3);$('.raceLane').style.display='none';$('#raceTitle').textContent='Ta den tid du behöver';$('#jumpScore').textContent='Sex lyckade hopp – ingen tidspress';$('#pauseStory').onclick=()=>{stop();activeRun=null;tab='adventure';render()}}
 nextCycle();
 setMusic(adventure?(adventure.music||'adventure'):world.music);
 function finish(){
  if(adventure){stop();activeRun=null;adventureEnding(adventure.id);scrollToContent();return}
  stop();button.disabled=true;
  const rank=finished.indexOf(0)+1,reward=Math.round(r.reward*[1,.65,.4,.25][rank-1]*diff.reward);
  state.coins+=reward+drops;if(rank===1)state.wins++;
  state.bestTimes=state.bestTimes||{};const prev=state.bestTimes[route],record=finishTime!==null&&(prev===undefined||finishTime<prev);if(record)state.bestTimes[route]=+finishTime.toFixed(1);
  // Head-to-head record against each rival.
  state.rivalRecord=state.rivalRecord||{};rivals.forEach((rv,i)=>{const rec=state.rivalRecord[rv.name]||{won:0,lost:0};finished.indexOf(0)<finished.indexOf(i+1)||!finished.includes(i+1)?rec.won++:rec.lost++;state.rivalRecord[rv.name]=rec});
  const trust=recordRoyalRace(rank,route);if(run?.kind==='cup')recordCupRound(finished);
  if(typeof afterRace==='function')afterRace({route,rank,time:finishTime,perfect,bestStreak,surprisesCleared,difficulty:state.difficulty||'normal'});
  activeRun=null;save();sidebar();sfx(rank===1?'win':'finish');
  const winner=finished[0],rv=rivals[(winner||[1,2,3].sort((a,b)=>progress[b]-progress[a])[0])-1];
  $('#content').innerHTML=`<div class="jumpSummary"><strong>Plats ${rank} av 4 · ${diff.label} · ${finishTime.toFixed(1)} s${record?' · ✦ Nytt banrekord!':prev!==undefined?' · Banrekord '+prev.toFixed(1)+' s':''}</strong><p>${good} lyckade hopp · ${perfect} perfekta · ${misses} missar · bästa serie ${bestStreak} i rad${surprisesCleared?` · ${surprisesCleared} hinder`:''}<br>Du samlade ${drops} extra daggdroppar under racet.</p><p class="rivalQuote">${miniFrog(rv.color,rv.hat)}<span><b>${rv.name}:</b> ”${winner?rv.lines.win:rv.lines.lose}”</span></p><div id="leaderSubmit"></div></div><div class="raceInfo">${coronation(rank,reward+drops,trust,finished[0])}</div>`;
  if(typeof offerLeaderboard==='function')offerLeaderboard($('#leaderSubmit'),world,finishTime,record);
  scrollToContent();
  if(run?.kind==='cup'){$('#again').textContent='Visa mästerskapet →';$('#again').onclick=()=>{tab='cup';render()}}else $('#again').onclick=render;
 }
 function resetScene(){rider.style.left='20%';rider.style.transform='translateX(-50%)';$('#currentPad').style.left='20%';$('#nextPad').style.left='70%';thing.style.left='45%';$('#landingCue').textContent=world.padLabel;if(world.extra==='root')$('#rootObstacle').style.left='45%';if(world.extra==='fly')$('#guideFly').style.left='70%'}
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
   const age=elapsed-platformFlight.start,success=platformFlight.success,flight=.8,bounce=world.bounce&&success?(platformFlight.golden?.45:.28):0,pan=.55,height=platformFlight.golden?110:80;
   const t=Math.min(age/flight,1);
   const x=success?20+50*t:20+8*Math.sin(Math.PI*t),y=-Math.sin(Math.PI*t)*height;
   rider.style.left=x+'%';rider.style.transform=`translate(-50%, ${y}px)`;
   if(age>=flight&&!platformFlight.landed){platformFlight.landed=true;if(success)sfx('land')}
   if(age>=flight&&age<flight+bounce){rider.style.transform=`translate(-50%, ${-Math.sin((age-flight)/bounce*Math.PI)*(platformFlight.golden?40:22)}px)`;$('#landingCue').textContent=platformFlight.golden?'Superstuds!':'Studs! Extra fart!'}
   if(age>=flight+bounce&&success){const camera=Math.min((age-flight-bounce)/pan,1)*50;rider.style.left=(70-camera)+'%';$('#currentPad').style.left=(20-camera)+'%';$('#nextPad').style.left=(70-camera)+'%';thing.style.left=(45-camera)+'%';$('#landingCue').textContent='Landat!';if(world.extra==='root')$('#rootObstacle').style.left=(45-camera)+'%';if(world.extra==='fly')$('#guideFly').style.left=(70-camera)+'%'}
   if(age>=flight+(success?bounce+pan:.25)){
    if(adventure&&success){advanceAdventure(adventure.id);const step=storyProgress(adventure.id).steps;$('#storyStep').textContent=adventure.steps[step-1];$('#storyCount').textContent=step+' / 6 etapper';$('#storyToken').classList.toggle('carried',step>=3)}
    platformFlight=null;resetScene();nextCycle();
   }
  }else{
   phaseTime+=dt*(rule.rate?rule.rate({elapsed,seed}):1);
   if(phaseTime>=period){if(!attempted)miss(false);nextCycle()}
   if(rule.live){const l=rule.live({elapsed,seed});const w=baseZone.w*(l.wMult||1);zone={c:Math.min(l.c??baseZone.c,.97-w/2),w};drawZone()}
   const phase=shownPhase(),ready=Math.abs(phase-zone.c)<=zone.w/2;
   pointer.style.left=(phase*100)+'%';
   // In the dark the green field only shows when the pointer is close.
   if(rule.hidden)target.style.opacity=Math.abs(phase-zone.c)<zone.w/2+.18?'1':'.08';
   $('#nextPad').classList.toggle('ready',ready);$('#timingState').textContent=ready?'Nu!':'Vänta…';
   if(!(golden||surprise)||ready)$('#landingCue').textContent=ready?(golden?'Gyllene – hoppa nu!':surprise?'Över hindret – nu!':'Hoppa hit nu!'):world.extra==='fly'?'Följ eldflugan…':'Vänta på grönt…';
   rider.style.left='20%';rider.style.transform='translateX(-50%)';
   if(world.extra==='fly'){$('#guideFly').style.left=(20+50*Math.min(phase/Math.max(.05,zone.c-zone.w/2),1))+'%';$('#guideFly').classList.toggle('ready',ready)}
  }
  if(adventure){if(storyProgress(adventure.id).steps>=6&&!platformFlight){finish();return}requestAnimationFrame(frame);return}
  moveRivals();
  progress=progress.map((p,i)=>p>=100?p:p+dt*speeds[i]*(i===0?(elapsed<slowUntil?tune.missSlow:1):rivalMult[i]));
  progress.map((p,i)=>({p,i})).filter(x=>x.p>=100&&!finished.includes(x.i)).sort((a,b)=>b.p-a.p).forEach(x=>{finished.push(x.i);if(x.i===0)finishTime=elapsed});
  progress.forEach((p,i)=>$('#runner'+i).style.left=Math.min(p,100)+'%');
  if(elapsed>1.2&&elapsed<1.4)say(1+Math.floor(seed)%3,'start');
  if(!sprint&&progress[0]>=70){sprint=true;sfx('sprint');$('#raceTitle').textContent='Slutspurt! Takten ökar…';say(3,'sprint')}
  if(!finished.includes(0)){
   const now=1+progress.slice(1).filter(p=>p>progress[0]).length;
   if(now<place&&elapsed>2){const passed=[1,2,3].find(i=>progress[i]<progress[0]&&progress[i]>progress[0]-6);$('#raceTitle').textContent=passed?'Du gick om '+rivals[passed-1].name+'!':'Du klättrar uppåt!';sfx('overtake');if(passed)say(passed,'passed')}
   else if(now>place&&elapsed>2){const by=[1,2,3].find(i=>progress[i]>progress[0]&&progress[i]<progress[0]+6);$('#raceTitle').textContent='Kämpa på – du är strax bakom!';if(by)say(by,'passes')}
   place=now;$('#placeChip').textContent='Plats '+place+' av 4';
  }
  if(finished.includes(0)&&!platformFlight){button.disabled=true;if(run?.kind!=='cup'||finished.length===4){finish();return}$('#raceTitle').textContent='Du är i mål! De andra lagen är på väg…'}
  requestAnimationFrame(frame);
 }
 requestAnimationFrame(frame)
}

// ---------- The "Tävla" tab: tracks, difficulty, rivals and leaderboard ----------
function renderRaceTab(c){
 if(!trackUnlocked(chosen))chosen=0;
 const r=trackWorlds[chosen],open=trackWorlds.filter((t,i)=>trackUnlocked(i)).length,rec=state.rivalRecord||{};
 c.innerHTML=`<div class="sectionHead"><h2>Välj ditt nästa lopp</h2><span class="pill">${open} av ${trackWorlds.length} banor öppna</span></div><div class="hero">${scene()}<div class="heroText"><span class="pill">✦ ÄLVSKOGENS FAVORIT</span><h2>Små språng.<br>Stor magi.</h2><p>Sadla din groda. Äventyret börjar vid vattenbrynet.</p></div></div><div class="raceCards">${trackWorlds.map((x,i)=>{const ok=trackUnlocked(i),best=state.bestTimes?.[i];return `<article class="card ${i===chosen?'selected':''} ${ok?'':'locked'}"><span class="icon">${ok?x.icon:'🔒'}</span><h3>${x.name}</h3><p>${ok?x.desc:x.unlockText||'Öppnas längre fram i sagan.'}</p><div class="meta"><span>✧ ${x.type}</span><span>${best!==undefined?'⏱ '+best.toFixed(1)+' s':'✦ '+x.reward}</span></div>${ok?`<button aria-label="Välj ${x.name}" data-race="${i}" aria-pressed="${i===chosen}"></button>`:''}</article>`}).join('')}</div><div class="raceBottom"><div style="font-size:12px">${r.name}<small>Gratis att delta · 4 tävlande · cirka 25 sekunder</small></div><div class="difficultyPick"><span>Svårighet</span><div role="radiogroup" aria-label="Svårighet">${Object.entries(difficulties).map(([k,d])=>`<button type="button" role="radio" data-diff="${k}" aria-checked="${(state.difficulty||'normal')===k}">${d.label}</button>`).join('')}</div><small>${{easy:'Rivalerna tar det lugnt.',normal:'Jämn kamp mot rivalerna.',hard:'Snabba rivaler · 25 % fler daggdroppar.'}[state.difficulty||'normal']}</small></div><button class="primary" id="start">Till startlinjen →</button></div><section class="rivalHall"><div class="sectionHead"><h2>Möt rivalerna</h2><span class="pill">Klöver · Mossa · Pärla</span></div><div class="rivalCards">${rivals.map(x=>{const r=rec[x.name]||{won:0,lost:0};return `<article class="rivalCard"><div class="rivalPortrait" style="--c:${x.color}">${miniFrog(x.color,x.hat)}</div><div><h3>${x.name}</h3><div class="eyebrow">${x.style}</div><p>${x.bio}</p><p class="rivalScore">${r.won+r.lost?`Du har slagit ${x.name} <b>${r.won}</b> ${r.won===1?'gång':'gånger'} · ${x.name} har vunnit <b>${r.lost}</b>`:'Ni har inte tävlat mot varandra än.'}</p></div></article>`}).join('')}</div></section><section id="leaderboard" class="leaderboard"></section>`;
 document.querySelectorAll('[data-diff]').forEach(b=>b.onclick=()=>{state.difficulty=b.dataset.diff;save();render()});
 document.querySelectorAll('[data-race]').forEach(b=>b.onclick=()=>{chosen=+b.dataset.race;render()});
 $('#start').onclick=()=>{activeRun=null;astridStart()};
 if(typeof renderLeaderboard==='function')renderLeaderboard($('#leaderboard'),chosen);
}
