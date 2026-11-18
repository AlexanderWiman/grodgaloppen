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
{id:'marsh',name:'Månskensmyren',icon:'☾',type:'UTHÅLLIGHET',stat:2,reward:130,desc:'Håll hela vägen genom den magiska myren.',className:'marsh',pad:'marshPad',padLabel:'Nästa tuva',extra:'fly',label:'Följ eldflugan till nästa tuva',hint:'Eldflugan visar landningen. När den lyser starkt hoppar du över gyttjan till nästa tuva.',twist:'flutter',twistText:'Eldflugan fladdrar – visaren byter takt hela tiden',period:3.4,bonus:4.4,music:'marsh',decor:'✧　　　✧　　　✧',surprise:{icon:'🫧',name:'gyttjebubblan'}},
{id:'crystal',name:'Kristallgrottan',icon:'💎',type:'FART',stat:0,reward:120,desc:'Studsa mellan glittrande kristaller i grottans eko.',className:'crystal',pad:'crystalPad',padLabel:'Nästa kristall',label:'Följ ekot mellan kristallerna',hint:'Visaren studsar fram och tillbaka som ett eko. Hoppa när den passerar det gröna fältet – åt vilket håll som helst.',twist:'echo',twistText:'Ekot – visaren studsar fram och tillbaka',period:4.4,bonus:4.2,music:'crystal',decor:'✦　💎　　✦　💎',surprise:{icon:'💧',name:'droppen från taket'}},
{id:'castle',name:'Slottsträdgården',icon:'♛',type:'HOPP',stat:1,reward:140,unlock:'castle',unlockText:'Öppnas i sagans första kapitel.',desc:'Hoppa mellan kungliga trappsteg under fladdrande fanor.',className:'castle',pad:'stepPad',padLabel:'Nästa trappsteg',label:'Upp för slottets trappor',hint:'Var tredje trappsteg har en kunglig fana. Träffa den för ett dubbelt skutt!',twist:'royal',twistText:'Kungliga fanor – var tredje hopp ger dubbelt skutt',period:3,bonus:3.6,music:'castle',decor:'⚑　🏰　⚑　　⚑',surprise:{icon:'🦚',name:'påfågeln'}},
{id:'sea',name:'Undervattensriket',icon:'🐚',type:'UTHÅLLIGHET',stat:2,reward:140,unlock:'sea',unlockText:'Öppnas i sagans andra kapitel.',desc:'Simhoppa mellan snäckor där strömmen gungar.',className:'sea',pad:'shellPad',padLabel:'Nästa snäcka',label:'Följ strömmen mellan snäckorna',hint:'Strömmen får det gröna fältet att gunga fram och tillbaka. Hoppa när visaren och fältet möts.',twist:'current',twistText:'Strömmen – det gröna fältet gungar hela tiden',period:3.2,bonus:4,music:'sea',decor:'🫧　🐠　　🫧　🐟',surprise:{icon:'🦀',name:'krabban'}},
{id:'clouds',name:'Molnriket',icon:'☁',type:'HOPP',stat:1,reward:150,unlock:'clouds',unlockText:'Öppnas i sagans tredje kapitel.',desc:'Studsa på mjuka moln medan vinden andas.',className:'clouds',pad:'cloudPad',padLabel:'Nästa moln',label:'Hoppa mellan molnen',hint:'Vinden andas – det gröna fältet växer och krymper. Hoppa när det är stort!',twist:'wind',twistText:'Vinden – det gröna fältet växer och krymper',period:3,bonus:4.8,bounce:true,music:'clouds',decor:'☁　　✦　☁　　✦',surprise:{icon:'💨',name:'vindpusten'}},
{id:'night',name:'Nattskogen',icon:'🦉',type:'FART',stat:0,reward:150,unlock:'night',unlockText:'Öppnas i sagans fjärde kapitel.',desc:'Hitta vägen i mörkret med hjälp av eldflugornas sken.',className:'night',pad:'moonPad',padLabel:'Nästa mossten',extra:'fly',label:'Följ ljuset genom natten',hint:'Det är mörkt! Det gröna fältet syns först när visaren kommer nära.',twist:'dark',twistText:'Mörkret – fältet syns först när visaren är nära',period:3.3,bonus:4.1,music:'night',decor:'✦　☾　　✦　✧',surprise:{icon:'🦇',name:'fladdermusen'}},
{id:'winter',name:'Vintervärlden',icon:'❄',type:'UTHÅLLIGHET',stat:2,reward:160,unlock:'winter',unlockText:'Öppnas i sagans femte kapitel.',desc:'Glid över isflak på den frusna sjön.',className:'winter',pad:'icePad',padLabel:'Nästa isflak',label:'Över den frusna sjön',hint:'Isen är hal – visaren börjar på olika ställen varje gång. Håll ögonen öppna!',twist:'ice',twistText:'Isen – visaren startar på olika ställen',period:3.4,bonus:3.9,music:'winter',decor:'❄　　⛄　❄　　❄',surprise:{icon:'☃',name:'snögubben'}}
];
// `races` is the name older code uses for the same list.
const races=trackWorlds;
function trackUnlocked(i){const t=trackWorlds[i];return !!t&&(!t.unlock||typeof placeOpen==='function'&&placeOpen(t.unlock))}

// How each twist changes a cycle: zone placement, pointer speed and pointer path.
const twistRules={
 drift:{zone:c=>({c:.6+Math.random()*.26})},
 golden:{zone:c=>c.cycle%4===0?{golden:true}:{}},
 flutter:{rate:c=>1+.3*Math.sin(c.elapsed*3.7+c.seed)+.2*Math.sin(c.elapsed*6.1+c.seed*2)},
 echo:{path:p=>p<.5?p*2:2-p*2,zone:()=>({c:.55+Math.random()*.3,wMult:.8})},
 current:{live:c=>({c:.72+.12*Math.sin(c.elapsed*1.6+c.seed)})},
 wind:{live:c=>({wMult:1+.25*Math.sin(c.elapsed*2.2+c.seed)})},
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
const RIVAL_BASE=4.2;
// Weather (survey 2): now and then it rains or snows during a race. Rain makes the pads
// slippery (a slightly narrower green field) but every good hop catches an extra raindrop.
// Snow calms everything: the pointer moves slower and hops get shorter – for the rivals too.
// No weather inside the crystal cave or under water. Tests set weatherOverride.
// Survey 3 added fog (the green field only shows up close), thunder (slippery rain, but lightning
// startles the rivals) and the rare rainbow (every third hop is golden).
const weatherKinds={rain:{name:'Regn',icon:'🌧',text:'Regn · halt men extra droppar',window:.97,extraDrop:1},snow:{name:'Snöfall',icon:'❄',text:'Snöfall · lugnare tempo för alla',period:1.12,hop:.93,rival:.95},fog:{name:'Dimma',icon:'🌫',text:'Dimma · det gröna fältet syns först nära',fog:true},thunder:{name:'Åska',icon:'⛈',text:'Åska · blixten skrämmer rivalerna, regnet gör det halt',window:.93,extraDrop:1,lightning:true},rainbow:{name:'Regnbåge',icon:'🌈',text:'Regnbåge · var tredje hopp är gyllene',goldenEvery:3,extraDrop:1}};
let weatherOverride;
function pickWeather(world){if(weatherOverride!==undefined)return weatherOverride;if(['crystal','sea'].includes(world.id))return null;const winter=typeof seasonFor==='function'&&seasonFor(new Date())==='winter',r=Math.random();if(world.id==='winter')return r<.4?'snow':r<.48?'fog':null;if(winter)return r<.22?'snow':r<.3?'fog':null;return r<.14?'rain':r<.2?'thunder':r<.28?'fog':r<.33?'rainbow':null}
function weatherHTML(kind){if(!kind)return '';if(kind==='fog')return '<div class="weather fog" aria-hidden="true"><i></i><i></i><i></i></div>';if(kind==='rainbow')return '<div class="weather rainbow" aria-hidden="true"><svg viewBox="0 0 400 200" preserveAspectRatio="none">'+['#e57373','#f4b25e','#f3e07a','#8cc88a','#7fb4dd','#a891d3'].map((c,i)=>`<path d="M${20+i*10} 200A${180-i*10} ${170-i*10} 0 0 1 ${380-i*10} 200" fill="none" stroke="${c}" stroke-width="10" opacity=".5"/>`).join('')+'</svg></div>';const snow=kind==='snow',n=snow?26:34;return `<div class="weather ${snow?'snow':'rain'} ${kind}" aria-hidden="true">${Array.from({length:n},(_,i)=>`<i style="left:${(i*37)%100}%;animation-delay:${-((i*.37)%(snow?4:1))}s;animation-duration:${snow?3+(i%5)*.5:.7+(i%4)*.12}s"></i>`).join('')}${kind==='thunder'?'<b class="bolt" id="bolt"></b>':''}</div>`}
// Difficulty only changes how fast the rivals are; harder races pay more. Survey 3 said the races
// were too easy, so Mästare was added on top.
const difficulties={easy:{label:'Lätt',rival:.9,reward:1},normal:{label:'Lagom',rival:1,reward:1},hard:{label:'Svår',rival:1.1,reward:1.25},master:{label:'Mästare',rival:1.16,reward:1.5}};
// Superpowers (survey 3) sometimes wait on the next landing spot; land there to pick one up.
const powerKinds={turbo:{name:'Blixtfart',icon:'⚡',text:'Supersnabb i tre sekunder'},shield:{name:'Bubbelsköld',icon:'🫧',text:'Nästa miss kostar ingen fart'},clover:{name:'Klöverlycka',icon:'🍀',text:'Bredare grönt fält i tre hopp'},star:{name:'Stjärnhopp',icon:'🌟',text:'Nästa hopp blir gyllene'}};
let powerRate=.3;
function difficulty(){return difficulties[state.difficulty]||difficulties.normal}
// Frog abilities (frogs.js) may return {window, hop, missSlow, surpriseDrops, streakFrom, firstPerfect}.
function raceMods(){return typeof frogAbilityMods==='function'?frogAbilityMods()||{}:{}}

// Other parts of the game (frogs, medals) listen for finished races and may add notes to the summary.
const afterRaceHooks=[],raceNotes=[];
function afterRace(r){raceNotes.length=0;afterRaceHooks.forEach(f=>{try{f(r)}catch(e){console.error(e)}})}

// Exposed for tests and balancing: lets a bot read the meter and press jump.
let raceProbe=null;

function raceTuning(st){return{window:.17+st[0]*.0011,hopMult:.75+st[1]*.006,missSlow:Math.min(.85,.45+st[2]*.004)}}

function jumpVerdict(phase,zone={c:.82,w:.24}){const d=Math.abs(phase-zone.c);return d<=zone.w*.19?'perfect':d<=zone.w/2?'good':'miss'}

function miniFrog(color,hat=''){return `<svg viewBox="0 0 60 44" aria-hidden="true"><ellipse cx="30" cy="30" rx="24" ry="13" fill="${color}"/><circle cx="19" cy="15" r="8" fill="${color}"/><circle cx="41" cy="15" r="8" fill="${color}"/><circle cx="19" cy="14" r="4.5" fill="#fbf6d8"/><circle cx="41" cy="14" r="4.5" fill="#fbf6d8"/><circle cx="20" cy="14" r="2.2" fill="#263d32"/><circle cx="42" cy="14" r="2.2" fill="#263d32"/><path d="M21 31Q30 37 39 31" fill="none" stroke="#263d32" stroke-width="2" stroke-linecap="round"/>${hat?`<text x="30" y="9" font-size="11" text-anchor="middle">${hat}</text>`:''}</svg>`}

// Livelier tracks (the family found them a bit still): clouds drift, hills slide past as the frog
// hops forward, and every world has something floating in the air. Landings splash or puff dust.
const raceAmbientKinds={pond:['petal','#f6c6d8'],forest:['leaf','#d39a4a'],marsh:['firefly','#f6f08a'],crystal:['sparkle','#e3d6ff'],castle:['petal','#ffe2a8'],sea:['bubble','#ffffff'],clouds:['sparkle','#ffffff'],night:['firefly','#fff6a0'],winter:['snow','#ffffff']};
function raceAmbientHTML(cls){
 const [k,c]=raceAmbientKinds[cls]||raceAmbientKinds.pond;
 const parts=Array.from({length:12},(_,i)=>`<i class="rp ${k}" style="left:${(i*37)%100}%;top:${(i*23)%55}%;animation-delay:-${(i*1.3).toFixed(1)}s;animation-duration:${(6+(i%5)*1.4).toFixed(1)}s;--c:${c}"></i>`).join('');
 const clouds=['pond','forest','castle','clouds','winter'].includes(cls)?'<span class="rcloud" style="top:7%;animation-duration:40s"></span><span class="rcloud small" style="top:19%;animation-duration:55s;animation-delay:-24s"></span><span class="rcloud small" style="top:12%;animation-duration:47s;animation-delay:-38s"></span>':'';
 return `<div class="raceAmbient" aria-hidden="true"><div class="raceSunset"></div>${clouds}<div class="raceHills ${cls}"></div><div class="raceHills near ${cls}"></div>${typeof raceDetailsHTML==='function'?raceDetailsHTML(cls):''}${parts}</div>`;
}
function raceSplash(track,leftPct,cls){if(!track?.insertAdjacentHTML)return;const water=['pond','sea','marsh'].includes(cls);track.insertAdjacentHTML('beforeend',`<span class="rsplash ${water?'water':'dust'}" style="left:${leftPct}%" aria-hidden="true"></span>${water?`<span class="rsplash water late" style="left:${leftPct}%" aria-hidden="true"></span>`:''}`);if(!track.querySelectorAll)return;const els=[...track.querySelectorAll('.rsplash')];setTimeout(()=>els.forEach(e=>e.remove()),900)}
// More details on the tracks (survey 6): things growing along the way that slide past as the frog
// hops forward, a row of animals that watch and cheer, fish jumping in the water worlds, and flags
// and balloons when the finish gets close. A perfect or golden hop makes the frog flip in the air.
const RP={
 flower:(x,c)=>`<path d="M${x} 28V16" stroke="#5f8f4a" stroke-width="1.6"/><g fill="${c}"><circle cx="${x-3}" cy="14" r="2.6"/><circle cx="${x+3}" cy="14" r="2.6"/><circle cx="${x}" cy="11" r="2.6"/><circle cx="${x}" cy="17" r="2.6"/></g><circle cx="${x}" cy="14" r="1.8" fill="#f6d36b"/>`,
 mush:(x,c)=>`<rect x="${x-2.5}" y="19" width="5" height="9" rx="2" fill="#f4ecd8"/><path d="M${x-8} 20Q${x} 8 ${x+8} 20Z" fill="${c}"/><g fill="#fff"><circle cx="${x-3}" cy="16" r="1.3"/><circle cx="${x+3}" cy="17" r="1.1"/></g>`,
 reed:x=>`<path d="M${x} 28V8M${x+5} 28V12" stroke="#5d7f48" stroke-width="1.6"/><rect x="${x-1.8}" y="7" width="3.6" height="9" rx="1.8" fill="#8a5a36"/><path d="M${x-4} 28Q${x-6} 18 ${x-9} 14" stroke="#6f9a55" stroke-width="1.4" fill="none"/>`,
 stone:(x,c='#a9a698')=>`<ellipse cx="${x}" cy="26" rx="7" ry="4" fill="${c}"/><ellipse cx="${x-2}" cy="24.6" rx="3" ry="1.3" fill="#fff" opacity=".35"/>`,
 crystal:(x,c)=>`<path d="M${x} 6L${x+4} 14L${x+3} 28H${x-3}L${x-4} 14Z" fill="${c}"/><path d="M${x+5} 16L${x+9} 21L${x+8} 28H${x+3}Z" fill="${c}" opacity=".75"/><path d="M${x} 6L${x+1} 28" stroke="#fff" stroke-opacity=".5"/>`,
 pine:(x,snow)=>`<rect x="${x-1.5}" y="22" width="3" height="6" fill="#6b4a32"/><path d="M${x} 2L${x+8} 14H${x+4}L${x+10} 23H${x-10}L${x-4} 14H${x-8}Z" fill="#3f6e52"/>${snow?`<path d="M${x} 2L${x+4} 8Q${x} 10 ${x-4} 8Z" fill="#fff"/>`:''}`,
 shell:(x,c)=>`<path d="M${x-6} 27Q${x} 14 ${x+6} 27Z" fill="${c}"/><path d="M${x} 27V19M${x-3} 27L${x-1} 20M${x+3} 27L${x+1} 20" stroke="#fff" stroke-opacity=".6"/>`,
 weed:(x,c='#4f9a7a')=>`<path d="M${x} 28Q${x-5} 20 ${x} 13T${x} 0" stroke="${c}" stroke-width="2.6" fill="none" stroke-linecap="round"/><path d="M${x+5} 28Q${x+9} 22 ${x+5} 16" stroke="${c}" stroke-width="2" fill="none" stroke-linecap="round"/>`,
 coral:(x,c)=>`<path d="M${x} 28V16M${x} 20L${x-5} 12M${x} 18L${x+5} 10" stroke="${c}" stroke-width="2.6" stroke-linecap="round"/>`,
 hedge:(x,c)=>`<ellipse cx="${x}" cy="22" rx="10" ry="8" fill="#5f8f4a"/><g fill="${c}"><circle cx="${x-4}" cy="19" r="1.6"/><circle cx="${x+3}" cy="17" r="1.6"/><circle cx="${x+5}" cy="23" r="1.6"/></g>`,
 lantern:(x,c)=>`<path d="M${x} 28V10" stroke="#4a3a2c" stroke-width="1.6"/><circle cx="${x}" cy="9" r="6" fill="${c}" opacity=".35"/><rect x="${x-2.5}" y="6" width="5" height="6" rx="1.5" fill="${c}"/>`,
 tuft:(x,c)=>`<path d="M${x-5} 28Q${x-4} 20 ${x-6} 15M${x} 28Q${x} 18 ${x+1} 12M${x+5} 28Q${x+4} 20 ${x+7} 16" stroke="${c}" stroke-width="1.8" fill="none" stroke-linecap="round"/>`,
 snowman:x=>`<circle cx="${x}" cy="23" r="5.5" fill="#fff"/><circle cx="${x}" cy="14" r="4" fill="#fff"/><path d="M${x+3} 14l3 1-3 1Z" fill="#e8873a"/><rect x="${x-3.5}" y="7" width="7" height="3" fill="#3a3a48"/>`,
 lily:x=>`<path d="M${x-9} 25A9 4 0 1 0 ${x+9} 25L${x} 25Z" fill="#6f9d52"/>`,
 puff:x=>`<g fill="#fff" opacity=".85"><circle cx="${x-6}" cy="24" r="6"/><circle cx="${x+2}" cy="21" r="8"/><circle cx="${x+10}" cy="25" r="5"/></g>`
};
// [far strip, near strip] for each world; each entry is [prop, x, colour].
const raceProps={
 pond:[[['tuft',14,'#6f9a55'],['flower',40,'#f6b6cf'],['reed',70],['flower',104,'#f6d36b'],['stone',134],['tuft',164,'#6f9a55'],['flower',196,'#ffffff'],['reed',224]],[['lily',20],['reed',70],['lily',130],['tuft',176,'#5d8f5a']]],
 forest:[[['mush',16,'#d0574a'],['tuft',44,'#5f7f45'],['pine',78],['stone',112,'#9a957f'],['mush',140,'#e0a24a'],['tuft',168,'#5f7f45'],['pine',204],['mush',230,'#d0574a']],[['tuft',20,'#4f6f3a'],['mush',72,'#d0574a'],['stone',124,'#8a856f'],['tuft',170,'#4f6f3a']]],
 marsh:[[['reed',12],['tuft',40,'#3f5f4a'],['mush',70,'#9fe0c0'],['reed',100],['reed',112],['stone',150,'#55625a'],['tuft',184,'#3f5f4a'],['reed',220]],[['reed',24],['tuft',80,'#2f4f3a'],['reed',140],['mush',186,'#c6f0a0']]],
 crystal:[[['crystal',18,'#b9a6ff'],['stone',50,'#5a5070'],['crystal',86,'#8fd0ff'],['crystal',130,'#ffb0e8'],['stone',166,'#5a5070'],['crystal',206,'#b9a6ff']],[['crystal',30,'#d8ccff'],['stone',100,'#4a4060'],['crystal',160,'#a8e0ff']]],
 castle:[[['hedge',18,'#f3b5c8'],['flower',50,'#e85f6a'],['lantern',80,'#ffd36b'],['hedge',116,'#ffffff'],['flower',150,'#f6d36b'],['flower',166,'#e85f6a'],['hedge',204,'#f3b5c8']],[['tuft',24,'#5f8f4a'],['flower',80,'#e85f6a'],['tuft',140,'#5f8f4a'],['flower',186,'#f6d36b']]],
 sea:[[['weed',14],['shell',46,'#f3c2b0'],['coral',80,'#f07a8a'],['weed',114,'#6fae8a'],['stone',148,'#7aa5a8'],['coral',182,'#f6a65a'],['shell',216,'#e8dcf6']],[['weed',24,'#3f8a6a'],['shell',90,'#f3c2b0'],['coral',150,'#f07a8a']]],
 clouds:[[['puff',30],['puff',120],['puff',200]],[['puff',40],['puff',150]]],
 night:[[['pine',20],['mush',52,'#b8f0ff'],['lantern',84,'#ffe88a'],['tuft',116,'#2f4a5a'],['pine',150],['mush',186,'#f6f08a'],['tuft',220,'#2f4a5a']],[['tuft',24,'#1f3a4a'],['mush',90,'#b8f0ff'],['tuft',156,'#1f3a4a']]],
 winter:[[['pine',20,1],['snowman',58],['stone',92,'#e9f2fa'],['pine',126,1],['pine',146,1],['stone',184,'#e9f2fa'],['snowman',222]],[['stone',30,'#f4f9fd'],['pine',100,1],['stone',170,'#f4f9fd']]]
};
function racePropsURL(list,w){const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} 28" width="${w}" height="28">${list.map(([k,...a])=>RP[k](...a)).join('')}</svg>`;return `url('data:image/svg+xml,${encodeURIComponent(svg).replace(/'/g,'%27')}')`}
// Animals that watch the race from the hills, three per world.
const raceFanArt={
 rabbit:(c='#c9b49a')=>`<ellipse cx="20" cy="31" rx="10" ry="8" fill="${c}"/><circle cx="20" cy="20" r="7" fill="${c}"/><ellipse cx="16" cy="8" rx="2.6" ry="7" fill="${c}"/><ellipse cx="24" cy="8" rx="2.6" ry="7" fill="${c}"/><ellipse cx="16" cy="9" rx="1.2" ry="4.5" fill="#f2b8c0"/><ellipse cx="24" cy="9" rx="1.2" ry="4.5" fill="#f2b8c0"/><circle cx="17.5" cy="19" r="1.3" fill="#263d32"/><circle cx="22.5" cy="19" r="1.3" fill="#263d32"/><circle cx="20" cy="22" r="1.2" fill="#e88a9a"/>`,
 hedgehog:()=>`<path d="M6 36Q8 18 22 16Q34 18 36 36Z" fill="#7a5a40"/><path d="M8 26l-4-2M12 20l-3-4M18 17l-1-5M25 17l2-5M31 20l4-3" stroke="#5a4030" stroke-width="2" stroke-linecap="round"/><ellipse cx="11" cy="31" rx="7" ry="5.4" fill="#e8cfa8"/><circle cx="9" cy="29" r="1.2" fill="#263d32"/><circle cx="5" cy="32" r="1.4" fill="#263d32"/>`,
 squirrel:()=>`<path d="M26 36Q38 30 34 16Q30 8 24 14Q32 20 26 30Z" fill="#c8743a"/><ellipse cx="18" cy="30" rx="8" ry="7" fill="#d9864a"/><circle cx="17" cy="19" r="6" fill="#d9864a"/><path d="M13 14l1-5 3 4M19 13l2-5 2 5" fill="#d9864a"/><circle cx="15" cy="18" r="1.2" fill="#263d32"/><ellipse cx="17" cy="31" rx="4" ry="4" fill="#f2d4b0"/>`,
 bird:(c='#6f9fd0')=>`<ellipse cx="20" cy="28" rx="9" ry="8" fill="${c}"/><ellipse cx="20" cy="31" rx="5" ry="4" fill="#f6e6c8"/><path d="M27 26l6-3-1 6Z" fill="${c}"/><circle cx="17" cy="24" r="1.3" fill="#263d32"/><path d="M11 26l-4 1 4 1Z" fill="#e8a83a"/><path d="M17 36v3M22 36v3" stroke="#e8a83a" stroke-width="1.4"/>`,
 mouse:()=>`<path d="M28 34Q38 34 36 26" stroke="#b9a7a0" stroke-width="1.6" fill="none"/><ellipse cx="20" cy="30" rx="9" ry="7" fill="#b9b2ac"/><circle cx="14" cy="22" r="4.4" fill="#b9b2ac"/><circle cx="24" cy="22" r="4.4" fill="#b9b2ac"/><circle cx="14" cy="22" r="2.4" fill="#f2c4c8"/><circle cx="24" cy="22" r="2.4" fill="#f2c4c8"/><circle cx="19" cy="27" r="5" fill="#c9c2bc"/><circle cx="17" cy="26" r="1.1" fill="#263d32"/><circle cx="21" cy="26" r="1.1" fill="#263d32"/><circle cx="19" cy="29" r="1.1" fill="#e88a9a"/>`,
 owl:()=>`<ellipse cx="20" cy="27" rx="10" ry="11" fill="#8a6a4a"/><ellipse cx="20" cy="30" rx="6" ry="7" fill="#d9c09a"/><path d="M11 18l2-6 4 5M29 18l-2-6-4 5" fill="#8a6a4a"/><circle cx="16" cy="21" r="3.6" fill="#fbf3dc"/><circle cx="24" cy="21" r="3.6" fill="#fbf3dc"/><circle cx="16" cy="21" r="1.7" fill="#263d32"/><circle cx="24" cy="21" r="1.7" fill="#263d32"/><path d="M19 24l1 2 1-2Z" fill="#e8a83a"/>`,
 crab:()=>`<ellipse cx="20" cy="30" rx="11" ry="7" fill="#e0644e"/><path d="M9 28Q3 22 6 16M31 28Q37 22 34 16" stroke="#e0644e" stroke-width="2.4" fill="none"/><circle cx="6" cy="15" r="3.4" fill="#e0644e"/><circle cx="34" cy="15" r="3.4" fill="#e0644e"/><path d="M16 24V19M24 24V19" stroke="#e0644e" stroke-width="1.6"/><circle cx="16" cy="18" r="2" fill="#fff"/><circle cx="24" cy="18" r="2" fill="#fff"/><circle cx="16" cy="18" r="1" fill="#263d32"/><circle cx="24" cy="18" r="1" fill="#263d32"/>`,
 fish:(c='#f6a65a')=>`<path d="M8 26Q18 14 30 26Q18 38 8 26Z" fill="${c}"/><path d="M29 26l8-6v12Z" fill="${c}"/><circle cx="14" cy="24" r="1.5" fill="#263d32"/>`
};
const raceFans={pond:[['rabbit'],['bird'],['hedgehog']],forest:[['squirrel'],['hedgehog'],['rabbit']],marsh:[['owl'],['mouse'],['bird','#7fae8a']],crystal:[['mouse'],['bird','#b9a6ff'],['hedgehog']],castle:[['mouse'],['rabbit','#efe6da'],['bird','#e88a9a']],sea:[['crab'],['fish'],['crab']],clouds:[['bird','#ffffff'],['owl'],['bird','#f6d36b']],night:[['owl'],['hedgehog'],['mouse']],winter:[['rabbit','#ffffff'],['bird','#e0644e'],['squirrel']]};
function raceFish(cls){
 const fish=(c,x,b,d,dur,cl='')=>`<svg class="raceFish${cl}" viewBox="0 0 40 40" style="left:${x}%;bottom:${b}%;animation-delay:-${d}s;animation-duration:${dur}s" aria-hidden="true">${raceFanArt.fish(c)}</svg>`;
 if(['pond','marsh'].includes(cls))return fish('#f6a65a',44,16,2,7)+fish('#e8d27a',90,22,5,9.5);
 if(cls==='sea')return fish('#f6a65a',0,30,3,14,' swim')+fish('#9fd0f0',0,18,9,18,' swim')+fish('#f3c2e0',0,40,1,22,' swim');
 return '';
}
function raceBalloons(){return ['#e85f6a','#f6d36b','#6f9fd0','#8cc88a','#c9a0e0'].map((c,i)=>`<span class="raceBalloon" style="left:${8+i*21}%;--c:${c};animation-delay:-${(i*1.7).toFixed(1)}s"></span>`).join('')}
function raceDetailsHTML(cls){
 const [far,near]=raceProps[cls]||raceProps.pond;
 const fans=(raceFans[cls]||raceFans.pond).map(([k,c],i)=>`<span class="raceFan" style="left:${[7,47,91][i]}%;animation-delay:-${i*.7}s"><svg viewBox="0 0 40 40">${raceFanArt[k](c)}</svg><i aria-hidden="true">${['♥','♪','✦'][i]}</i></span>`).join('');
 return `<div class="raceProps far" style="background-image:${racePropsURL(far,240)}"></div><div class="raceFans">${fans}</div><div class="raceProps near" style="background-image:${racePropsURL(near,200)}"></div>${raceFish(cls)}<div class="raceBunting"></div><div class="raceFinish">${raceFinishArt}</div>${raceBalloons()}`;
}
// The audience cheers on every landed hop, and a bit more on perfect ones.
function raceCheer(track,big){const f=track?.querySelector?.('.raceFans');if(!f?.classList)return;f.classList.remove('cheer','big');void f.offsetWidth;f.classList.add('cheer');if(big)f.classList.add('big');clearTimeout(raceCheer.t);raceCheer.t=setTimeout(()=>f.classList?.remove('cheer','big'),1100)}
// The fans say something now and then when the frog hops well several times in a row.
function raceFanSay(track,text){const fans=track?.querySelectorAll?.('.raceFan');if(!fans?.length)return;track.querySelectorAll('.raceFanSay').forEach(b=>b.remove());const f=fans[Math.floor(Math.random()*fans.length)];f.insertAdjacentHTML?.('beforeend',`<b class="raceFanSay${f.style?.left==='91%'?' left':''}">${text}</b>`);const b=f.querySelector?.('.raceFanSay');setTimeout(()=>b?.remove?.(),1800)}
function raceFanLine(name,streak){const lines=[`Heja ${name}!`,`${streak} i rad!`,'Vilket hopp!','Snyggt!'];return lines[Math.floor(Math.random()*lines.length)]}
// The finish line: a flower arch with a chequered banner that rolls in for the last stretch.
const raceFinishArt=`<svg viewBox="0 0 100 140" aria-hidden="true"><defs><pattern id="rfCheck" width="8" height="8" patternUnits="userSpaceOnUse"><rect width="8" height="8" fill="#fff"/><rect width="4" height="4" fill="#263d32"/><rect x="4" y="4" width="4" height="4" fill="#263d32"/></pattern></defs><rect x="0" y="130" width="100" height="10" fill="url(#rfCheck)" opacity=".85"/><rect x="9" y="40" width="6" height="94" rx="2" fill="#8a6440"/><rect x="85" y="40" width="6" height="94" rx="2" fill="#8a6440"/><path d="M12 46Q50 -6 88 46" stroke="#5f8f4a" stroke-width="9" fill="none" stroke-linecap="round"/><g>${[[14,40,'#e85f6a'],[22,26,'#f6d36b'],[33,15,'#ffffff'],[45,10,'#f3b5c8'],[57,10,'#e85f6a'],[68,15,'#f6d36b'],[78,26,'#ffffff'],[86,40,'#f3b5c8']].map(([x,y,c])=>`<circle cx="${x}" cy="${y}" r="4.6" fill="${c}"/><circle cx="${x}" cy="${y}" r="1.7" fill="#f6a53a"/>`).join('')}</g><rect x="20" y="44" width="60" height="18" fill="url(#rfCheck)" stroke="#263d32" stroke-width="1"/><rect x="33" y="46" width="34" height="14" rx="3" fill="#fffef8"/><text x="50" y="57" font-size="11" font-weight="700" text-anchor="middle" fill="#263d32" font-family="system-ui,sans-serif">MÅL</text></svg>`;
// The prize-giving after a race: the top three on a podium, the track's animals clapping, and when
// the family wins, Queen Astrid comes and puts the victory wreath on the frog.
const raceWreathArt=`<svg class="podWreath" viewBox="0 0 64 26" aria-hidden="true"><path d="M6 8Q32 30 58 8" stroke="#4f8a4a" stroke-width="3" fill="none"/>${[[9,11,-40],[15,15,-25],[22,18,-12],[42,18,12],[49,15,25],[55,11,40]].map(([x,y,r])=>`<ellipse cx="${x}" cy="${y}" rx="5" ry="2.6" fill="#6fae5a" transform="rotate(${r} ${x} ${y})"/>`).join('')}<circle cx="32" cy="20" r="4" fill="#e85f6a"/><circle cx="26" cy="19.5" r="3" fill="#f6d36b"/><circle cx="38" cy="19.5" r="3" fill="#ffffff"/></svg>`;
function racePodiumHTML({order,names,colors,hats,cls,win,playerArt}){
 const step=place=>{const i=order[place-1];if(i===undefined)return '';const you=i===0;const art=you?playerArt:miniFrog(colors[i],hats[i]||'');return `<div class="podStep p${place}${you?' you':''}"><div class="podFrog">${art}${place===1&&win?raceWreathArt:''}</div><div class="podBlock"><b>${place}</b></div><small>${typeof escapeText==='function'?escapeText(names[i]):names[i]}</small></div>`};
 const fans=(raceFans[cls]||raceFans.pond).map(([k,c])=>`<span class="podFan"><svg viewBox="0 0 40 40" aria-hidden="true">${raceFanArt[k](c)}</svg></span>`);
 return `<section class="racePodium ${cls}" aria-label="Prisutdelning"><div class="podStage">${fans[0]}<div class="podSteps">${step(2)}${step(1)}${step(3)}</div>${fans[1]}${fans[2]}</div>${win?`<div class="podAstrid"><img src="assets/astrid-portrait.webp" alt="Drottning Astrid"><p><b>Drottning Astrid:</b> ”Grattis, ${typeof escapeText==='function'?escapeText(names[0]):names[0]}! Här är segerkransen.”</p></div>`:''}</section>`;
}
function platformScene(world){return `<div class="landingPlatform ${world.pad}" id="currentPad"></div><div class="landingPlatform ${world.pad}" id="nextPad"></div><span id="landingCue">${world.padLabel}</span>${world.extra==='root'?'<svg id="rootObstacle" viewBox="0 0 100 60" aria-hidden="true"><path d="M5 52Q25 51 30 30Q35 4 50 12Q65 20 60 38Q70 49 95 52" fill="none" stroke="#6f5139" stroke-width="13" stroke-linecap="round"/><path d="M31 28L19 18M60 37L80 26" stroke="#6f5139" stroke-width="7" stroke-linecap="round"/></svg>':world.extra==='fly'?'<div id="guideFly" aria-hidden="true">✦</div>':''}<div id="surpriseThing" aria-hidden="true">${world.surprise?.icon||''}</div>`}

// On small screens, bring the play area into view so track and jump button fit together.
function scrollToPlay(el){if(el?.scrollIntoView&&typeof innerWidth!=='undefined'&&innerWidth<=700)el.scrollIntoView({block:'start',behavior:'smooth'})}
function scrollToContent(){const c=$('#content');if(c?.getBoundingClientRect&&c.getBoundingClientRect().top<0)c.scrollIntoView({block:'start'})}

function startRace(){
 if(!state.hatched)return;running=true;
 const run=activeRun,field=run?.kind==='challenge'&&typeof challengeRivals==='function'?challengeRivals():rivals,adventure=run?.kind==='adventure'?storyQuests.find(q=>q.id===run.id):null;
 const route=chosen,world=trackWorlds[route],r=world,st=stats(),strength=st[r.stat],tune=raceTuning(st),mods=raceMods(),rule=adventure?{}:twistRules[world.twist]||{};
 tune.window*=mods.window||1;tune.hopMult*=mods.hop||1;tune.missSlow=Math.min(.92,tune.missSlow+(mods.missSlow||0));
 const names=[typeof activeFrogName==='function'?activeFrogName():'Ditt team',...field.map(x=>x.name)],colors=[state.frog,...field.map(x=>x.color)];
 let progress=[0,0,0,0],finished=[],last=performance.now(),elapsed=0,phaseTime=0,period=world.period,zone={c:.82,w:tune.window},baseZone=zone,cycle=0,golden=false,surprise=false,lastSurprise=-9,attempted=false,slowUntil=0,good=0,perfect=0,misses=0,drops=0,streak=0,bestStreak=0,surprisesCleared=0,ended=false,platformFlight=null,sprint=false,place=1,finishTime=null,sayUntil=0,firstPerfectUsed=false;
 const diff=run?.kind==='challenge'&&typeof gormDifficulty!=='undefined'?gormDifficulty:difficulty(),seed=Math.random()*6,weather=adventure?null:pickWeather(world),wx=weatherKinds[weather]||{};
 if(wx.window)tune.window*=wx.window;if(wx.hop)tune.hopMult*=wx.hop;
 const P={turboUntil:0,shield:false,clover:0,star:false,pad:null,last:-9,got:0,nextBolt:3,boltUntil:0},tussHere=!!adventure&&typeof tussJoins==='function'&&tussJoins();
 if(tussHere)tune.window*=1.15;
 const speeds=[2.8+strength*.009,...field.map(()=>RIVAL_BASE*diff.rival*(wx.rival||1)*(.97+Math.random()*.06))];
 const rivalMult=[1,1,1,1],spurts=[0,0,0,0],nextSpurt=[0,...field.map(()=>3+Math.random()*5)],said={};
 $('#content').innerHTML=`${adventure?`<div class="storyStage"><strong>${adventure.title}</strong><p id="storyStep">${adventure.steps[Math.min(5,storyProgress(adventure.id).steps)]}</p><span id="storyCount">${storyProgress(adventure.id).steps} / 6 etapper</span><button class="outline" id="pauseStory">Pausa äventyret</button></div>`:''}<div class="sectionHead"><h2>${r.name}</h2><span class="pill">${r.type} ger fördel</span></div><section class="jumpWorld ${world.className}" aria-label="${r.name}, tävlingsbana"><div class="worldCaption">${world.label}</div>${weatherHTML(weather)}<div id="powerThing" class="powerThing" hidden></div>${tussHere?`<div class="tussBuddy" aria-hidden="true">${trollArt()}</div>`:''}${adventure?'':`<div class="twistBadge">✦ ${world.twistText}</div>${weather?`<div class="weatherChip">${wx.icon} ${wx.text}</div>`:''}<div id="placeChip" class="placeChip">Plats 1 av 4</div><div id="streakChip" class="streakChip"></div><div id="powerChip" class="powerChip"></div><div id="rivalSay" class="rivalSay" role="status"></div>`}${raceAmbientHTML(world.className)}<div class="worldDecor">${world.decor}</div>${adventure?'':field.map((x,i)=>`<div class="rival" id="rival${i+1}" aria-hidden="true">${miniFrog(x.color,x.hat)}</div>`).join('')}${platformScene(world)}${adventure?`<div id="storyToken" class="storyToken" aria-label="${adventure.tokenLabel||adventure.title}">${adventure.icon}</div>`:''}<div id="jumpRider">${frog()}</div><div id="jumpObstacle" aria-hidden="true">${world.icon}</div><div class="ground"></div></section><div class="jumpControls"><p>${world.hint}</p><div class="timingLabel"><span id="timingState">Vänta…</span><strong id="timingHelp">HOPPA I DET GRÖNA FÄLTET</strong></div><div class="timingMeter" aria-hidden="true"><div class="timingTarget" id="timingTarget"></div><div id="timingPointer"></div></div><div class="jumpAction"><button class="primary" id="jumpButton">Hoppa!<span class="kbdHint"> · Mellanslag</span></button><span id="jumpScore">✦ 0 daggdroppar</span></div><p id="jumpFeedback" role="status">Tryck en gång per hinder. Missar kostar lite fart – du fortsätter direkt.</p></div><div class="raceLane">${names.map((n,i)=>`<div class="laneRow ${i?'':'me'}"><span>${escapeText(n)}${i?`<small>${field[i-1].style}</small>`:''}</span><div class="laneWater"><i class="laneFinish">⚑</i><b id="runner${i}">${miniFrog(colors[i],i?field[i-1].hat:'')}</b></div></div>`).join('')}</div><div class="raceInfo"><h2 id="raceTitle">Astrid: Låt racet börja!</h2></div>`;
 document.body.classList?.add('racing');let scenePan=0;
 const button=$('#jumpButton'),rider=$('#jumpRider'),pointer=$('#timingPointer'),target=$('#timingTarget'),feedback=$('#jumpFeedback'),thing=$('#surpriseThing');
 function say(i,key){if(adventure||said[i+key]||elapsed<sayUntil)return;said[i+key]=true;sayUntil=elapsed+2.6;const b=$('#rivalSay');b.innerHTML=`<b>${field[i-1].name}:</b> ${field[i-1].lines[key]}`;b.classList.toggle('show',true);setTimeout(()=>b.classList?.toggle('show',false),2400)}
 function drawZone(){target.style.left=(zone.c-zone.w/2)*100+'%';target.style.width=zone.w*100+'%';$('#nextPad').classList.toggle('golden',golden);target.classList.toggle('golden',golden);target.classList.toggle('surprise',surprise);thing.classList.toggle('show',surprise);$('#timingHelp').textContent=surprise?'HINDER! TRÄFFA DET SMALA FÄLTET':golden?'GYLLENE – DUBBELT SKUTT':'HOPPA I DET GRÖNA FÄLTET'}
 function nextCycle(){
  phaseTime=0;attempted=false;button.disabled=false;golden=false;surprise=false;
  if(adventure){period=world.period;zone={c:.82,w:tune.window};drawZone();return}
  cycle++;
  period=world.period*(.82+Math.random()*.36)*(sprint?.85:1)*(wx.period||1);
  const z={c:.82,...(rule.zone?rule.zone({cycle,elapsed,seed}):{})};
  let w=tune.window*(z.wMult||1);golden=!!z.golden;
  const starHop=P.star;if(starHop){golden=true;P.star=false}else if(wx.goldenEvery&&cycle%wx.goldenEvery===0)golden=true;
  if(golden&&!starHop)w*=.65;
  if(P.clover>0){w*=1.4;P.clover--}
  // Surprise obstacles: now and then, never twice in a row, never on a golden hop.
  if(!golden&&cycle>=3&&cycle-lastSurprise>2&&Math.random()<.16){surprise=true;lastSurprise=cycle;w*=.75}
  if(rule.start)phaseTime=rule.start()*period;
  zone={c:Math.min(z.c,.97-w/2),w};baseZone=zone;
  drawZone();
  if(golden)$('#landingCue').textContent='Gyllene!';
  if(surprise)$('#landingCue').textContent='Hinder: '+world.surprise.name+'!';
  P.pad=null;if(!golden&&!surprise&&cycle>=2&&cycle-P.last>=5&&Math.random()<powerRate){const k=Object.keys(powerKinds);P.pad=k[Math.floor(Math.random()*k.length)];P.last=cycle}
  const pt=$('#powerThing');pt.hidden=!P.pad;if(P.pad){pt.textContent=powerKinds[P.pad].icon;$('#landingCue').textContent='Superkraft: '+powerKinds[P.pad].name+'!'}
  setPowerChip();
 }
 function setStreak(){const chip=$('#streakChip');if(!chip)return;chip.textContent=streak>=2?'✦ '+streak+' i rad'+(streak>=(mods.streakFrom||3)?' · Grodflow!':''):'';chip.classList.toggle('hot',streak>=(mods.streakFrom||3))}
 function setPowerChip(){const c=$('#powerChip');if(!c)return;const on=[];if(elapsed<P.turboUntil)on.push('⚡ '+Math.ceil(P.turboUntil-elapsed)+' s');if(P.shield)on.push('🫧');if(P.clover)on.push('🍀 ×'+P.clover);if(P.star)on.push('🌟');c.textContent=on.join(' · ');c.classList.toggle('show',on.length>0)}
 function miss(pressed){
  misses++;streak=0;setStreak();
  if(P.shield){P.shield=false;setPowerChip();sfx('chime');feedback.textContent='Bubbelskölden tog smällen – ingen fart förlorad!';return}
  if(surprise&&pressed){slowUntil=elapsed+1.8;sfx('bump');feedback.textContent='Bonk! '+world.surprise.name[0].toUpperCase()+world.surprise.name.slice(1)+' var i vägen – grodan skakar på huvudet och fortsätter.';return}
  slowUntil=elapsed+1.1;if(pressed)sfx('miss');
  feedback.textContent=adventure?'Ingen fara! Vänta på grönt och försök igen – du förlorar inga framsteg.':'Lite för tidigt eller sent – bara ett litet farttapp. Försök vid nästa hinder!'
 }
 function hop(){
  if(ended||attempted||platformFlight||!adventure&&finished.includes(0))return;
  attempted=true;button.disabled=true;sfx('jump');$('#powerThing').hidden=true;
  let verdict=jumpVerdict(shownPhase(),zone);
  if(verdict==='good'&&mods.firstPerfect&&!firstPerfectUsed){verdict='perfect';firstPerfectUsed=true}
  platformFlight={start:elapsed,success:verdict!=='miss',golden,landed:false};if(verdict!=='miss'&&(verdict==='perfect'||golden)&&rider.classList?.add){rider.classList.remove('trick');void rider.offsetWidth;rider.classList.add('trick')}
  if(verdict==='miss'){miss(true);return}
  good++;streak++;bestStreak=Math.max(bestStreak,streak);setStreak();if(!adventure&&streak>=3&&streak%2===1)raceFanSay(track,raceFanLine(names[0],streak));
  let powerNote='';if(P.pad){const k=powerKinds[P.pad];if(P.pad==='turbo')P.turboUntil=elapsed+3;if(P.pad==='shield')P.shield=true;if(P.pad==='clover')P.clover=3;if(P.pad==='star')P.star=true;P.got++;powerNote=' · '+k.icon+' '+k.name+'!';P.pad=null;sfx('golden');setPowerChip()}
  const isPerfect=verdict==='perfect';if(isPerfect){perfect++;sfx('perfect')}
  let gain=world.bonus*tune.hopMult+(isPerfect?1.2:0),earned=(isPerfect?3:1)+(wx.extraDrop||0);
  if(golden){gain*=2;earned+=2;sfx('golden')}
  if(surprise){surprisesCleared++;earned+=2+(mods.surpriseDrops||0);gain+=1}
  const flowFrom=mods.streakFrom||3;
  if(streak>=flowFrom){gain+=.5*Math.min(streak-flowFrom+1,4);earned+=1;if(streak===flowFrom)sfx('combo')}
  drops+=earned;progress[0]+=gain;
  if(adventure){feedback.textContent='Fint hopp! Du är på rätt väg.';return}
  feedback.textContent=surprise?'Du hoppade över '+world.surprise.name+'! +'+earned+' daggdroppar':golden?'Gyllene superstuds! Dubbelt skutt · +'+earned+' daggdroppar':isPerfect?'Perfekt språng! +'+earned+' daggdroppar ✦':world.bounce?'Studssvampen ger extra fart! +'+earned+' daggdroppar':'Fint hopp! +'+earned+' daggdroppar';
  if(streak>=flowFrom)feedback.textContent+=' · '+streak+' i rad!';
  feedback.textContent+=powerNote;
  $('#jumpScore').textContent='✦ '+drops+' daggdroppar';
 }
 function shownPhase(){const p=phaseTime/period;return rule.path?rule.path(p):p}
 raceProbe={phase:()=>shownPhase(),zone:()=>zone,ready:()=>!ended&&!attempted&&!platformFlight,hop,result:()=>({weather,powers:P.got,place:finished.indexOf(0)+1,time:finishTime,good,perfect,misses,bestStreak,surprisesCleared})};
 function keydown(e){if(e.code==='Space'&&!e.repeat){e.preventDefault();hop()}else if(e.code==='Space')e.preventDefault()}
 function stop(){ended=true;running=false;document.body.classList?.remove('racing');document.removeEventListener('keydown',keydown)}
 button.onclick=hop;document.addEventListener('keydown',keydown);
 // Tapping anywhere on the track also jumps – easier with a thumb on a phone.
 const track=$('.jumpWorld');track.onpointerdown=e=>{if(e.button>0)return;e.preventDefault?.();hop()};
 scrollToPlay(track);
 if(adventure){feedback.textContent='Hoppa när nästa landningsplats lyser. Missar går bra – försök bara igen.';$('#storyToken').classList.toggle('carried',storyProgress(adventure.id).steps>=3);$('.raceLane').style.display='none';$('#raceTitle').textContent='Ta den tid du behöver';$('#jumpScore').textContent='Sex lyckade hopp – ingen tidspress';$('#pauseStory').onclick=()=>{stop();activeRun=null;tab='adventure';render()}}
 nextCycle();
 setMusic(adventure?(adventure.music||'adventure'):world.music);
 function finish(){
  if(adventure){stop();activeRun=null;adventureEnding(adventure.id);if(tussHere&&typeof tussAdventureFind==='function'){const f=tussAdventureFind();$('#content').insertAdjacentHTML?.('afterbegin',`<p class="tussFind"><span class="tussFace">${trollArt()}</span><span><b>Tuss följde med på äventyret!</b><br>Han hittade: ${f}</span></p>`);sidebar()}scrollToContent();return}
  stop();button.disabled=true;
  const rank=finished.indexOf(0)+1,reward=Math.round(r.reward*[1,.65,.4,.25][rank-1]*diff.reward);
  state.coins+=reward+drops;if(rank===1)state.wins++;
  state.bestTimes=state.bestTimes||{};const prev=state.bestTimes[route],record=finishTime!==null&&(prev===undefined||finishTime<prev);if(record)state.bestTimes[route]=+finishTime.toFixed(1);
  // Head-to-head record against each rival.
  state.rivalRecord=state.rivalRecord||{};field.forEach((rv,i)=>{const rec=state.rivalRecord[rv.name]||{won:0,lost:0};finished.indexOf(0)<finished.indexOf(i+1)||!finished.includes(i+1)?rec.won++:rec.lost++;state.rivalRecord[rv.name]=rec});
  const trust=recordRoyalRace(rank,route);if(run?.kind==='cup')recordCupRound(finished);
  afterRace({route,weather,rank,time:finishTime,perfect,bestStreak,surprisesCleared,difficulty:state.difficulty||'normal',challenge:run?.kind==='challenge'});
  activeRun=null;save();sidebar();sfx(rank===1?'win':'finish');
  const winner=finished[0],rv=field[(winner||[1,2,3].sort((a,b)=>progress[b]-progress[a])[0])-1];
  $('#content').innerHTML=`<div class="jumpSummary"><strong>Plats ${rank} av 4 · ${diff.label}${weather?' · '+wx.icon+' '+wx.name:''} · ${finishTime.toFixed(1)} s${record?' · ✦ Nytt banrekord!':prev!==undefined?' · Banrekord '+prev.toFixed(1)+' s':''}</strong><p>${good} lyckade hopp · ${perfect} perfekta · ${misses} missar · bästa serie ${bestStreak} i rad${surprisesCleared?` · ${surprisesCleared} hinder`:''}<br>Du samlade ${drops} extra daggdroppar under racet.</p><p class="rivalQuote">${miniFrog(rv.color,rv.hat)}<span><b>${rv.name}:</b> ”${winner?rv.lines.win:rv.lines.lose}”</span></p>${raceNotes.map(n=>`<p class="raceNote">${n}</p>`).join('')}<div id="leaderSubmit"></div></div><div class="raceInfo">${coronation(rank,reward+drops,trust,finished[0])}</div>`;
  {const order=[...finished,...[0,1,2,3].filter(i=>!finished.includes(i)).sort((a,b)=>progress[b]-progress[a])].slice(0,3);$('#content').insertAdjacentHTML?.('afterbegin',racePodiumHTML({order,names,colors,hats:['',...field.map(x=>x.hat)],cls:world.className,win:rank===1,playerArt:frog()}))}
  if(typeof offerLeaderboard==='function')offerLeaderboard($('#leaderSubmit'),world,finishTime,record);
  scrollToContent();
  if(run?.kind==='cup'){$('#again').textContent='Visa mästerskapet →';$('#again').onclick=()=>{tab='cup';render()}}else $('#again').onclick=render;
 }
 function resetScene(){rider.style.left='20%';rider.style.transform='translateX(-50%)';$('#currentPad').style.left='20%';$('#nextPad').style.left='70%';thing.style.left='45%';$('#landingCue').textContent=world.padLabel;if(world.extra==='root')$('#rootObstacle').style.left='45%';if(world.extra==='fly')$('#guideFly').style.left='70%'}
 function moveRivals(){
  for(let i=1;i<4;i++){
   const rv=field[i-1];
   if(elapsed>=nextSpurt[i]){spurts[i]=elapsed+1.2;nextSpurt[i]=elapsed+4+Math.random()*5}
   // Gentle rubber band keeps the pack together without deciding the race.
   const band=1-Math.max(-20,Math.min(20,progress[i]-progress[0]))*.006;
   const el=$('#rival'+i),rel=progress[i]-progress[0];
   el.style.opacity=Math.abs(rel)<=16&&progress[i]<100?'.9':'0';
   el.style.left=(20+rel*3.2)+'%';
   el.style.transform=`translate(-50%, ${-Math.abs(Math.sin(elapsed*3+i*1.7))*16}px)`;
   rivalMult[i]=band*rv.pace(progress[i])*(elapsed<spurts[i]?1.3:1)*(elapsed<P.boltUntil?.8:1);
  }
 }
 function frame(now){
  if(ended)return;const dt=Math.min((now-last)/1000,.08);last=now;if(document.hidden){requestAnimationFrame(frame);return}elapsed+=dt;
  if(platformFlight){
   const age=elapsed-platformFlight.start,success=platformFlight.success,flight=.8,bounce=world.bounce&&success?(platformFlight.golden?.45:.28):0,pan=.55,height=platformFlight.golden?110:80;
   const t=Math.min(age/flight,1);
   const x=success?20+50*t:20+8*Math.sin(Math.PI*t),y=-Math.sin(Math.PI*t)*height;
   rider.style.left=x+'%';rider.style.transform=`translate(-50%, ${y}px) rotate(${success?(-12*Math.cos(Math.PI*t)).toFixed(1):0}deg)`;
   if(age>=flight&&!platformFlight.landed){platformFlight.landed=true;if(success){sfx('land');raceSplash(track,success?70:20,world.className);raceCheer(track,platformFlight.golden||rider.classList?.contains?.('trick'));if(rider.classList?.remove&&rider.classList.add){rider.classList.remove('squash','trick');void rider.offsetWidth;rider.classList.add('squash')}}}
   if(age>=flight&&age<flight+bounce){rider.style.transform=`translate(-50%, ${-Math.sin((age-flight)/bounce*Math.PI)*(platformFlight.golden?40:22)}px)`;$('#landingCue').textContent=platformFlight.golden?'Superstuds!':'Studs! Extra fart!'}
   if(age>=flight+bounce&&success){const camera=Math.min((age-flight-bounce)/pan,1)*50;track.style?.setProperty?.('--pan',(scenePan+camera).toFixed(1));rider.style.left=(70-camera)+'%';$('#currentPad').style.left=(20-camera)+'%';$('#nextPad').style.left=(70-camera)+'%';thing.style.left=(45-camera)+'%';$('#landingCue').textContent='Landat!';if(world.extra==='root')$('#rootObstacle').style.left=(45-camera)+'%';if(world.extra==='fly')$('#guideFly').style.left=(70-camera)+'%'}
   if(age>=flight+(success?bounce+pan:.25)){
    if(adventure&&success){advanceAdventure(adventure.id);const step=storyProgress(adventure.id).steps;$('#storyStep').textContent=adventure.steps[step-1];$('#storyCount').textContent=step+' / 6 etapper';$('#storyToken').classList.toggle('carried',step>=3)}
    if(platformFlight.success)scenePan+=50;platformFlight=null;resetScene();nextCycle();
   }
  }else{
   phaseTime+=dt*(rule.rate?rule.rate({elapsed,seed}):1);
   if(phaseTime>=period){if(!attempted)miss(false);nextCycle()}
   if(rule.live){const l=rule.live({elapsed,seed});const w=baseZone.w*(l.wMult||1);zone={c:Math.min(l.c??baseZone.c,.97-w/2),w};drawZone()}
   const phase=shownPhase(),ready=Math.abs(phase-zone.c)<=zone.w/2;
   pointer.style.left=(phase*100)+'%';
   // In the dark the green field only shows when the pointer is close.
   if(rule.hidden)target.style.opacity=Math.abs(phase-zone.c)<zone.w/2+.18?'1':'.08';
   else if(wx.fog)target.style.opacity=Math.abs(phase-zone.c)<zone.w/2+.26?'1':'.15';
   $('#nextPad').classList.toggle('ready',ready);$('#timingState').textContent=ready?'Nu!':'Vänta…';
   if(!(golden||surprise)||ready)$('#landingCue').textContent=ready?(golden?'Gyllene – hoppa nu!':surprise?'Över hindret – nu!':'Hoppa hit nu!'):world.extra==='fly'?'Följ eldflugan…':'Vänta på grönt…';
   rider.style.left='20%';rider.style.transform='translateX(-50%)';
   if(world.extra==='fly'){$('#guideFly').style.left=(20+50*Math.min(phase/Math.max(.05,zone.c-zone.w/2),1))+'%';$('#guideFly').classList.toggle('ready',ready)}
  }
  if(adventure){if(storyProgress(adventure.id).steps>=6&&!platformFlight){finish();return}requestAnimationFrame(frame);return}
  moveRivals();
  progress=progress.map((p,i)=>p>=100?p:p+dt*speeds[i]*(i===0?(elapsed<slowUntil?tune.missSlow:1)*(elapsed<P.turboUntil?1.5:1):rivalMult[i]));
  if(P.turboUntil&&elapsed<P.turboUntil+.1)setPowerChip();
  if(wx.lightning&&elapsed>=P.nextBolt){P.nextBolt=elapsed+5+Math.random()*3;P.boltUntil=elapsed+.7;const b=$('#bolt');b?.classList?.toggle('flash',false);void b?.offsetWidth;b?.classList?.toggle('flash',true);sfx('bump')}
  progress.map((p,i)=>({p,i})).filter(x=>x.p>=100&&!finished.includes(x.i)).sort((a,b)=>b.p-a.p).forEach(x=>{finished.push(x.i);if(x.i===0)finishTime=elapsed});
  progress.forEach((p,i)=>$('#runner'+i).style.left=Math.min(p,100)+'%');
  if(elapsed>1.2&&elapsed<1.4)say(1+Math.floor(seed)%3,'start');
  if(!sprint&&progress[0]>=70){sprint=true;track.classList?.add?.('sprinting');sfx('sprint');$('#raceTitle').textContent='Slutspurt! Takten ökar…';say(3,'sprint')}
  if(!finished.includes(0)){
   const now=1+progress.slice(1).filter(p=>p>progress[0]).length;
   if(now<place&&elapsed>2){const passed=[1,2,3].find(i=>progress[i]<progress[0]&&progress[i]>progress[0]-6);$('#raceTitle').textContent=passed?'Du gick om '+field[passed-1].name+'!':'Du klättrar uppåt!';sfx('overtake');if(passed)say(passed,'passed')}
   else if(now>place&&elapsed>2){const by=[1,2,3].find(i=>progress[i]>progress[0]&&progress[i]<progress[0]+6);$('#raceTitle').textContent='Kämpa på – du är strax bakom!';if(by)say(by,'passes')}
   place=now;$('#placeChip').textContent='Plats '+place+' av 4';
  }
  if(finished.includes(0)&&!platformFlight){button.disabled=true;if(run?.kind!=='cup'||finished.length===4){finish();return}$('#raceTitle').textContent='Du är i mål! De andra lagen är på väg…'}
  requestAnimationFrame(frame);
 }
 requestAnimationFrame(frame)
}

// ---------- The "Tävla" tab: tracks, difficulty, field and leaderboard ----------
function renderRaceTab(c){
 if(!trackUnlocked(chosen))chosen=0;
 const r=trackWorlds[chosen],open=trackWorlds.filter((t,i)=>trackUnlocked(i)).length,rec=state.rivalRecord||{};
 c.innerHTML=`${typeof queenBannerHTML==='function'?queenBannerHTML():''}${typeof julBannerHTML==='function'?julBannerHTML():''}${typeof dailyGiftHTML==='function'?dailyGiftHTML():''}<div class="sectionHead"><h2>Välj ditt nästa lopp</h2><span class="pill">${open} av ${trackWorlds.length} banor öppna</span></div><div class="hero">${scene()}<div class="heroText"><span class="pill">✦ ÄLVSKOGENS FAVORIT</span><h2>Små språng.<br>Stor magi.</h2><p>Sadla din groda. Äventyret börjar vid vattenbrynet.</p></div></div><div class="raceCards">${trackWorlds.map((x,i)=>{const ok=trackUnlocked(i),best=state.bestTimes?.[i];return `<article class="card ${i===chosen?'selected':''} ${ok?'':'locked'}"><span class="icon">${ok?x.icon:'🔒'}</span><h3>${x.name}</h3><p>${ok?x.desc:x.unlockText||'Öppnas längre fram i sagan.'}</p><div class="meta"><span>✧ ${x.type}</span><span>${best!==undefined?'⏱ '+best.toFixed(1)+' s':'✦ '+x.reward}</span></div>${ok?`<button aria-label="Välj ${x.name}" data-race="${i}" aria-pressed="${i===chosen}"></button>`:''}</article>`}).join('')}</div><div class="raceBottom"><div style="font-size:12px">${r.name}<small>Gratis att delta · 4 tävlande · cirka 25 sekunder</small></div><div class="difficultyPick"><span>Svårighet</span><div role="radiogroup" aria-label="Svårighet">${Object.entries(difficulties).map(([k,d])=>`<button type="button" role="radio" data-diff="${k}" aria-checked="${(state.difficulty||'normal')===k}">${d.label}</button>`).join('')}</div><small>${{easy:'Rivalerna tar det lugnt.',normal:'Jämn kamp mot rivalerna.',hard:'Snabba rivaler · 25 % fler daggdroppar.',master:'Blixtsnabba rivaler · 50 % fler daggdroppar.'}[state.difficulty||'normal']}</small></div>${typeof frogPickerHTML==='function'?frogPickerHTML():''}<button class="primary" id="start">Till startlinjen →</button></div>${typeof challengerHTML==='function'?challengerHTML():''}<details class="rivalHall"><summary class="sectionHead"><h2>Möt rivalerna</h2><span class="pill">Klöver · Mossa · Pärla</span></summary><div class="rivalCards">${rivals.map(x=>{const r=rec[x.name]||{won:0,lost:0};return `<article class="rivalCard"><div class="rivalPortrait" style="--c:${x.color}">${miniFrog(x.color,x.hat)}</div><div><h3>${x.name}</h3><div class="eyebrow">${x.style}</div><p>${x.bio}</p><p class="rivalScore">${r.won+r.lost?`Du har slagit ${x.name} <b>${r.won}</b> ${r.won===1?'gång':'gånger'} · ${x.name} har vunnit <b>${r.lost}</b>`:'Ni har inte tävlat mot varandra än.'}</p></div></article>`}).join('')}</div></details><section id="leaderboard" class="leaderboard"></section>`;
 // On phones the tracks are a swipeable row: keep the chosen one in view.
 {const row=c.querySelector?.('.raceCards'),sel=row?.querySelector('.selected');if(row&&sel&&row.scrollWidth>row.clientWidth)row.scrollLeft=sel.offsetLeft-(row.clientWidth-sel.offsetWidth)/2}
 document.querySelectorAll('[data-diff]').forEach(b=>b.onclick=()=>{state.difficulty=b.dataset.diff;save();render()});
 document.querySelectorAll('[data-race]').forEach(b=>b.onclick=()=>{chosen=+b.dataset.race;render()});
 $('#start').onclick=()=>{activeRun=null;astridStart()};
 document.querySelectorAll('[data-pick-frog]').forEach(b=>b.onclick=()=>{if(switchFrog(b.dataset.pickFrog)){render();toast(state.frogName+' är redo att tävla!')}});
 if(typeof renderLeaderboard==='function')renderLeaderboard($('#leaderboard'),chosen);
 if(typeof wireDailyGift==='function')wireDailyGift();if(typeof wireQueenBanner==='function')wireQueenBanner();
}
