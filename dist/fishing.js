// Fishing in the glade pond and Tuss, the troll under the bridge (family survey 2, step 2).
// Cast, wait for the float to dip, tap "Dra upp!" in time, then tap while the fish swims
// through the net. Catches go to the bucket; Tuss wishes for certain fish and becomes a friend.

const fishKinds=[
 {id:'mort',name:'Mört',weight:40,speed:.9,hits:2,first:15,color:'#a9b8c2',fin:'#d98a6b'},
 {id:'abborre',name:'Abborre',weight:28,speed:1.15,hits:2,first:20,color:'#a3b55e',fin:'#e0803d',stripes:true},
 {id:'stovel',name:'Gammal stövel',weight:12,speed:.55,hits:1,first:10,boot:true},
 {id:'gadda',name:'Gädda',weight:12,speed:1.5,hits:3,first:35,color:'#6f8a4e',fin:'#b5a05a',long:true,bite:1.1},
 {id:'guldfisk',name:'Guldfisk',weight:6,speed:1.35,hits:3,first:50,color:'#f0b440',fin:'#f6d27a'},
 {id:'manfisk',name:'Månfisk',weight:0,night:16,speed:1.25,hits:3,first:40,color:'#cdd8f2',fin:'#9fb2e0',glow:true}
];
const FISH_NET=.26,FISH_BITE=1.4,FISH_SLIPS=3;

const trollWishes=[
 {need:{mort:2},say:'Hej… jag heter Tuss och bor under bron. Jag är så hungrig. Har du två mörtar?',thanks:'Mums! Ingen har gett mig något förut. Vi kanske kan bli vänner?',coins:30},
 {need:{abborre:1},say:'En abborre har randiga kläder. Jag har aldrig sett en på riktigt!',thanks:'Så fina ränder! Ta min glänsande trollsten.',decor:'trollstone'},
 {need:{stovel:1},say:'Jag samlar på saker som folk har tappat. En gammal stövel vore en skatt!',thanks:'En stövel! Den blir min nya blomkruka.',coins:40},
 {need:{manfisk:1},say:'När det skymmer simmar månfiskar i dammen. Kan du fånga en åt mig? Tryck på Skymning.',thanks:'Den lyser som en liten måne! Ta min brolykta, så hittar du hem i mörkret.',decor:'bridgelamp'},
 {need:{guldfisk:1},say:'Det sägs att det finns en guldfisk i dammen. Jag vill så gärna se den.',thanks:'Guld! Jag simmar ut den igen – men först en kram. Du är min bästa vän.',coins:80},
 {need:{gadda:1},say:'Den stora gäddan skrämmer de små fiskarna. Kan du flytta den till den stora sjön?',thanks:'Nu är dammen trygg igen. Får jag flytta in i er glänta på riktigt?',decor:'trollfriend',coins:60}
];
const trollChatter=['Tuss vinkar från bron.','Tuss nynnar på en trollvisa.','Tuss har plockat en blomma åt dig.','Tuss undrar om grodor kan simma baklänges.'];

function ensureFishing(){if(!state.fishing)state.fishing={bucket:{},caught:{},casts:0,troll:0};return state.fishing}
function fishKind(id){return fishKinds.find(f=>f.id===id)}
function fishNight(){return !!state.garden?.night}
function pickFish(rnd=Math.random,night=fishNight()){const pool=fishKinds.map(f=>[f,night?(f.night??f.weight*(f.id==='guldfisk'?.5:1)):f.weight]).filter(([,w])=>w>0),total=pool.reduce((a,[,w])=>a+w,0);let r=rnd()*total;for(const [f,w] of pool){if((r-=w)<0)return f.id}return pool[0][0].id}
// Where the fish is on the reel meter (0–1) after t seconds of reeling.
function fishMeterPos(t,id){const f=fishKind(id);return .5+.44*Math.sin(t*f.speed*2.1+.7*Math.sin(t*1.3))}
function fishInNet(pos){return Math.abs(pos-.5)<=FISH_NET/2}
function fishCatch(id){const f=ensureFishing(),k=fishKind(id);if(!k)return null;const first=!f.caught[id];f.bucket[id]=(f.bucket[id]||0)+1;f.caught[id]=(f.caught[id]||0)+1;const coins=2+(first?k.first:0);state.coins+=coins;if(typeof frogXp==='function')frogXp(1);save();return{first,coins}}
function bucketCount(){return Object.values(ensureFishing().bucket).reduce((a,b)=>a+b,0)}
function trollWish(){return trollWishes[ensureFishing().troll]||null}
function trollCanGive(){const w=trollWish(),b=ensureFishing().bucket;return !!w&&Object.entries(w.need).every(([id,n])=>(b[id]||0)>=n)}
function giveTroll(){if(!trollCanGive())return null;const f=state.fishing,w=trollWish();for(const [id,n] of Object.entries(w.need))f.bucket[id]-=n;f.troll++;if(w.coins)state.coins+=w.coins;if(w.decor&&!state.decorOwned.includes(w.decor))state.decorOwned.push(w.decor);save();return w}

decorations.push(
 {id:'trollstone',name:'Trollsten',icon:'🪨',from:'Gåva från Tuss'},
 {id:'bridgelamp',name:'Brolykta',icon:'🏮',from:'Gåva från Tuss'},
 {id:'trollfriend',name:'Tuss',icon:'🧌',from:'Tuss flyttar in'}
);

function trollArt(mood='happy'){return `<svg viewBox="0 0 120 120" aria-hidden="true"><ellipse cx="60" cy="112" rx="40" ry="6" fill="#3f5a3322"/><ellipse cx="42" cy="108" rx="13" ry="6" fill="#6e5b40"/><ellipse cx="78" cy="108" rx="13" ry="6" fill="#6e5b40"/><path d="M22 104Q12 62 38 44Q60 30 82 44Q108 62 98 104Z" fill="#8c9a5c"/><ellipse cx="60" cy="86" rx="23" ry="17" fill="#bdbd8c"/><path d="M27 58L14 48 30 50M93 58L106 48 90 50" fill="#8c9a5c" stroke="#73804a" stroke-width="2" stroke-linejoin="round"/><path d="M40 44Q44 26 56 34Q60 20 68 33Q78 26 80 44" fill="#6b5a3a"/><g transform="translate(73 30)"><circle r="3" fill="#f3c6d1"/><circle cx="-3" cy="-2" r="2.2" fill="#f7dbe2"/><circle cx="3" cy="-2" r="2.2" fill="#f7dbe2"/><circle r="1.4" fill="#e7b84f"/></g><circle cx="47" cy="57" r="7" fill="#fffbea"/><circle cx="73" cy="57" r="7" fill="#fffbea"/><circle cx="48" cy="58" r="3.5" fill="#33402c"/><circle cx="72" cy="58" r="3.5" fill="#33402c"/><circle cx="49" cy="57" r="1.2" fill="#fff"/><circle cx="73" cy="57" r="1.2" fill="#fff"/><ellipse cx="60" cy="70" rx="12" ry="9" fill="#b98a6a"/><ellipse cx="56" cy="67" rx="4" ry="2.5" fill="#d9ad8c"/>${mood==='happy'?'<path d="M48 80Q60 90 72 80" fill="none" stroke="#4d3a2a" stroke-width="2.5" stroke-linecap="round"/>':'<path d="M50 83Q60 79 70 83" fill="none" stroke="#4d3a2a" stroke-width="2.5" stroke-linecap="round"/>'}<ellipse cx="41" cy="72" rx="5" ry="3" fill="#d9958a" opacity=".5"/><ellipse cx="79" cy="72" rx="5" ry="3" fill="#d9958a" opacity=".5"/></svg>`}
function fishArt(id){const f=fishKind(id);if(!f)return '';if(f.boot)return `<svg viewBox="0 0 100 70" aria-hidden="true"><path d="M30 6H58V40Q80 40 88 50Q92 62 80 62H30Z" fill="#7b5b3c" stroke="#5a4129" stroke-width="3" stroke-linejoin="round"/><path d="M30 54H88" stroke="#5a4129" stroke-width="3"/><path d="M34 12H54M34 20H54" stroke="#a37d55" stroke-width="3"/><path d="M60 46Q66 40 72 46" fill="none" stroke="#7fae6a" stroke-width="3"/></svg>`;const rx=f.long?40:30;return `<svg viewBox="0 0 100 60" aria-hidden="true">${f.glow?`<ellipse cx="45" cy="30" rx="${rx+10}" ry="25" fill="#e9f0ff" opacity=".45"/>`:''}<path d="M${45+rx-4} 30L96 12 92 30 96 48Z" fill="${f.fin}"/><path d="M38 ${30-15}Q48 2 62 ${30-13}" fill="${f.fin}"/><ellipse cx="45" cy="30" rx="${rx}" ry="${f.long?12:16}" fill="${f.color}"/>${f.stripes?'<g stroke="#4e6233" stroke-width="4" opacity=".55"><path d="M38 17V43M50 16V44M62 19V41"/></g>':''}<ellipse cx="45" cy="36" rx="${rx*.7}" ry="6" fill="#fff" opacity=".25"/><circle cx="${45-rx+11}" cy="26" r="4.5" fill="#fff"/><circle cx="${45-rx+10}" cy="26" r="2.4" fill="#26342a"/><path d="M${45-rx+3} 33Q${45-rx+8} 36 ${45-rx+12} 33" fill="none" stroke="#3b4a3a" stroke-width="1.5"/></svg>`}
function fishPondArt(){return `<svg class="fishPondArt" viewBox="0 0 1000 420" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs><linearGradient id="fishWater" x2="0" y2="1"><stop stop-color="#9fcfc3"/><stop offset="1" stop-color="#5f9a8f"/></linearGradient></defs><rect width="1000" height="420" fill="#c9dcb5"/><path d="M0 90Q200 40 420 85T1000 70V420H0Z" fill="#9dbb84"/><path d="M0 150Q300 100 560 140T1000 130V420H0Z" fill="url(#fishWater)"/><g fill="none" stroke="#e1f3ea" stroke-width="3" opacity=".7"><path d="M140 230Q240 210 340 232M560 300Q680 280 800 304M420 360Q500 346 600 362"/></g><g fill="#6f9b5c"><ellipse cx="820" cy="210" rx="60" ry="17"/><ellipse cx="900" cy="330" rx="48" ry="14"/><ellipse cx="420" cy="190" rx="40" ry="12"/></g><g fill="#fff2d1"><circle cx="822" cy="204" r="7"/><circle cx="430" cy="185" r="5"/></g><path d="M640 150Q700 95 770 150" fill="none" stroke="#a88d62" stroke-width="22"/><path d="M640 128Q700 72 770 126" fill="none" stroke="#8d7451" stroke-width="5"/><path d="M640 128V152M770 126V152" stroke="#8d7451" stroke-width="6"/><g stroke="#5e8152" stroke-width="5"><path d="M960 420Q940 300 955 230M980 420Q995 320 985 270M30 420Q46 330 22 280"/></g><ellipse cx="190" cy="330" rx="130" ry="34" fill="#739d53" stroke="#527d37" stroke-width="5"/></svg>`}

let fishRun=null;
function fishSay(t){const el=$('#fishStatus');if(el)el.textContent=t}
function fishButtonLabel(t,hot=false){const b=$('#fishButton');if(!b)return;b.textContent=t;b.classList.toggle('hot',hot)}
function startCast(){
 const night=fishNight(),run={phase:'wait',t:0,biteAt:1.4+Math.random()*3.2,fish:pickFish(Math.random,night),hits:0,slips:0,last:null};
 fishRun=run;ensureFishing().casts++;sfx('jump');
 const pond=$('#fishPond');pond.classList.add('cast');pond.classList.remove('bite','reeling','caught');
 $('#fishMeter').hidden=true;$('#fishCatch').innerHTML='';
 fishSay('Plopp! Flötet guppar i vattnet. Vänta tills det dyker…');fishButtonLabel('Vänta…');
 requestAnimationFrame(function step(now){
  if(fishRun!==run||!$('#fishPond'))return;
  const dt=run.last===null?0:Math.min(.1,(now-run.last)/1000);run.last=now;run.t+=dt;
  if(run.phase==='wait'&&run.t>=run.biteAt){run.phase='bite';run.biteStart=run.t;$('#fishPond').classList.add('bite');sfx('tick');fishSay('Det nappar! Tryck Dra upp!');fishButtonLabel('Dra upp!',true)}
  else if(run.phase==='bite'&&run.t-run.biteStart>(fishKind(run.fish).bite||FISH_BITE))return fishLost('Fisken nappade men hann simma iväg. Kasta igen!');
  else if(run.phase==='reel'){const pos=fishMeterPos(run.t-run.reelStart,run.fish);run.pos=pos;const m=$('#fishMarker');m.style.left=pos*100+'%';m.classList.toggle('inNet',fishInNet(pos))}
  requestAnimationFrame(step);
 });
}
function fishLost(text){const run=fishRun;if(run)run.phase='done';fishRun=null;sfx('miss');const pond=$('#fishPond');pond?.classList.remove('cast','bite','reeling');if($('#fishMeter'))$('#fishMeter').hidden=true;fishSay(text);fishButtonLabel('Kasta igen')}
function fishTap(){
 const run=fishRun;
 if(!run||run.phase==='done')return startCast();
 if(run.phase==='wait')return fishSay('Inte än – vänta tills flötet dyker.');
 if(run.phase==='bite'){const k=fishKind(run.fish);run.phase='reel';run.reelStart=run.t;$('#fishPond').classList.remove('bite');$('#fishPond').classList.add('reeling');$('#fishMeter').hidden=false;$('#fishMarker').innerHTML=fishArt(run.fish);fishProgress();sfx('overtake');fishSay(k.boot?'Något tungt… tryck när det är i håven!':'Den sitter! Tryck när fisken simmar genom håven.');fishButtonLabel('Håva!',true);return}
 if(run.phase==='reel'){
  const k=fishKind(run.fish);
  if(fishInNet(run.pos??.5)){run.hits++;sfx('land');fishProgress();if(run.hits>=k.hits){run.phase='done';fishRun=null;const r=fishCatch(run.fish);sfx(r.first?'golden':'win');fishShowCatch(run.fish,r);return}fishSay('Bra! '+(k.hits-run.hits)+' kvar.')}
  else{run.slips++;fishProgress();if(run.slips>=FISH_SLIPS)return fishLost(k.boot?'Stöveln sjönk till botten igen. Kasta igen!':'Plask! Fisken slet sig. Kasta igen!');sfx('bump');fishSay('Miss – vänta tills den är i håven.')}
 }
}
function fishProgress(){const run=fishRun;const el=$('#fishHits');if(!el||!run)return;const k=fishKind(run.fish);el.innerHTML=Array.from({length:k.hits},(_,i)=>`<span class="${i<run.hits?'on':''}"></span>`).join('')+`<small>${'✕'.repeat(run.slips)}</small>`}
function fishShowCatch(id,r){const k=fishKind(id),pond=$('#fishPond');pond.classList.remove('cast','reeling');pond.classList.add('caught');$('#fishMeter').hidden=true;$('#fishCatch').innerHTML=`<div class="fishCard">${fishArt(id)}<strong>Fångst: ${k.name}!</strong><span>${r.first?'Första gången · +'+r.coins+' daggdroppar':'+'+r.coins+' daggdroppar'}</span></div>`;fishSay(k.boot?'Ha! En gammal stövel. Tuss skulle älska den.':r.first?'En ny sort i fiskeboken!':'Ner i hinken med den.');fishButtonLabel('Kasta igen');sidebar();renderTrollPanel();renderFishBook()}

function renderTrollPanel(){
 const box=$('#trollPanel');if(!box)return;const f=ensureFishing(),w=trollWish(),hearts=Math.min(f.troll,trollWishes.length);
 box.innerHTML=`<div class="trollPortrait">${trollArt(w?'shy':'happy')}</div><div><div class="eyebrow">TROLLET UNDER BRON</div><h3>Tuss</h3><div class="trollHearts" aria-label="Vänskap ${hearts} av ${trollWishes.length}">${trollWishes.map((_,i)=>`<span class="${i<hearts?'on':''}">♥</span>`).join('')}</div>${w?`<p class="trollSay">”${w.say}”</p><p class="trollNeed">${Object.entries(w.need).map(([id,n])=>`${fishKind(id).name}: ${Math.min(n,f.bucket[id]||0)} av ${n}`).join(' · ')}</p><button class="primary" id="giveTroll" ${trollCanGive()?'':'disabled'}>Ge till Tuss</button>`:`<p class="trollSay">”${trollChatter[f.casts%trollChatter.length]}”</p><p class="trollNeed">Tuss bor nu i er glänta. Placera honom var ni vill!</p>`}</div>`;
 if($('#giveTroll'))$('#giveTroll').onclick=()=>{const g=giveTroll();if(!g)return;sfx('chime');sidebar();renderTrollPanel();renderFishBook();const box=$('#trollPanel');box.insertAdjacentHTML?.('afterbegin',`<p class="trollThanks">”${g.thanks}”<br><small>${[g.coins?'+'+g.coins+' daggdroppar':'',g.decor?'Ny sak till gläntan: '+decorations.find(d=>d.id===g.decor).name:''].filter(Boolean).join(' · ')}</small></p>`)};
}
function renderFishBook(){const box=$('#fishBook');if(!box)return;const f=ensureFishing();box.innerHTML=`<h3>Fiskeboken</h3><p>🪣 ${bucketCount()} i hinken · ${Object.keys(f.caught).length} av ${fishKinds.length} sorter</p><div class="fishBookGrid">${fishKinds.map(k=>{const n=f.caught[k.id]||0;return `<article class="${n?'':'unknown'}"><div>${fishArt(k.id)}</div><strong>${n?k.name:'???'}</strong><small>${n?'Fångad '+n+' · i hinken '+(f.bucket[k.id]||0):k.night?'Simmar bara i skymningen':'Inte fångad än'}</small></article>`}).join('')}</div>`}

function renderFishing(){
 ensureFishing();if(typeof ensureGarden==='function')ensureGarden();fishRun=null;const night=fishNight();
 $('#content').innerHTML=`<div class="sectionHead"><div><div class="eyebrow">NÄCKROSDAMMEN I GLÄNTAN</div><h2>Fiska i dammen</h2></div><button class="outline gardenTime" id="fishTime">${night?'☀ Morgonljus':'☾ Skymning'}</button></div><section id="fishPond" class="fishPond ${night?'night':''}" aria-label="Fiskedammen">${fishPondArt()}<div class="fishTeam">${frog()}</div><svg class="fishLine" id="fishLine" aria-hidden="true"><path class="rod" d=""/><path class="line" d=""/></svg><div id="fishFloat" class="fishFloat" aria-hidden="true"><i></i></div><div class="fishTroll" aria-hidden="true">${trollArt(trollWish()?'shy':'happy')}</div><div id="fishCatch" class="fishCatch"></div></section><div class="jumpControls fishControls"><p id="fishStatus" role="status">Kasta ut, vänta på napp och dra upp i rätt stund.</p><div id="fishMeter" class="fishMeter" hidden><div class="fishNet" style="left:${(.5-FISH_NET/2)*100}%;width:${FISH_NET*100}%"></div><div id="fishMarker" class="fishMarker"></div></div><div class="fishAction"><button class="primary" id="fishButton">Kasta ut</button><div id="fishHits" class="fishHits"></div></div></div><div class="fishLower"><section id="trollPanel" class="editor trollPanel"></section><section id="fishBook" class="editor fishBook"></section></div>`;
 $('#fishButton').onclick=fishTap;
 $('#fishTime').onclick=()=>{state.garden.night=!state.garden.night;save();render()};
 renderTrollPanel();renderFishBook();fishDrawLine();
}
// The rod sits in the fairy's hand and the line runs from its tip to the float, measured from the
// real layout so it fits every screen size. The hand is at (195,129) in the 280×240 frog drawing.
function fishDrawLine(){
 const pond=$('#fishPond'),svg=$('#fishLine'),team=document.querySelector?.('.fishTeam svg'),float=$('#fishFloat');if(!pond?.getBoundingClientRect||!team||!svg)return;
 const P=pond.getBoundingClientRect(),T=team.getBoundingClientRect(),F=float.getBoundingClientRect();if(!P.width||!T.width)return;
 const hx=T.left-P.left+T.width*195/280,hy=T.top-P.top+T.height*129/240,tx=hx+T.width*.3,ty=hy-T.height*.42,fx=F.left-P.left+F.width/2,fy=F.top-P.top+F.height*.15;
 svg.setAttribute('viewBox',`0 0 ${P.width} ${P.height}`);
 svg.querySelector('.rod').setAttribute('d',`M${hx} ${hy}L${tx} ${ty}`);
 svg.querySelector('.line').setAttribute('d',`M${tx} ${ty}Q${(tx+fx)/2} ${Math.max(ty,fy)+18} ${fx} ${fy}`);
}
if(typeof addEventListener==='function')addEventListener('resize',()=>{if(typeof tab!=='undefined'&&tab==='fish')fishDrawLine()});
if(typeof document!=='undefined'&&document.addEventListener)document.addEventListener('keydown',e=>{if(typeof tab==='undefined'||tab!=='fish'||e.code!=='Space'||e.repeat)return;const b=$('#fishButton');if(!b||document.activeElement===b)return;e.preventDefault();b.click()});

// Tuss peeks out from under the glade bridge once you are friends.
function trollGardenHTML(){const f=state.fishing;if(!f||f.troll<1||f.troll>=trollWishes.length)return '';return `<button class="gardenTroll" id="gardenTroll" aria-label="Hälsa på Tuss under bron">${trollArt()}</button>`}

Object.assign(extraGardenArt,{
 trollstone:'<ellipse cx="60" cy="98" rx="40" ry="7" fill="#7d9a6a"/><path d="M28 96Q22 58 48 40Q70 28 88 50Q100 72 92 96Z" fill="#9aa3a0" stroke="#717a77" stroke-width="2"/><path d="M48 52Q60 44 72 54" fill="none" stroke="#c7f0e4" stroke-width="3"/><g fill="#b8f0dd"><circle cx="54" cy="66" r="4"/><circle cx="70" cy="72" r="3"/><circle cx="60" cy="82" r="2.5"/></g><path d="M34 90Q46 84 58 92" fill="none" stroke="#7fae6a" stroke-width="4"/>',
 bridgelamp:'<path d="M60 102V30" stroke="#6e5a40" stroke-width="5"/><path d="M60 30Q60 18 74 20" fill="none" stroke="#6e5a40" stroke-width="4"/><path d="M74 20V30" stroke="#6e5a40" stroke-width="2"/><path d="M62 30H86L82 62H66Z" fill="#cfd8f5" stroke="#8796bf" stroke-width="2"/><circle cx="74" cy="46" r="8" fill="#fff8cf"/><circle cx="74" cy="46" r="15" fill="#fff8cf" opacity=".3"/><ellipse cx="60" cy="102" rx="22" ry="5" fill="#7d9a6a"/>',
 trollfriend:trollArt().replace(/<svg[^>]*>|<\/svg>/g,'')
});
