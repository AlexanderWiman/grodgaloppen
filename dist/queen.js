// Skogsdrottningen – Astrid's stepmother. She doesn't live in Älvbyn but far away in the deep
// forest, and visits on two random days each week. On a visit she brings a gift, has a small
// task that must be done the same day (before she goes home), and has fika in the cottage,
// where she comments on how it is furnished.

let queenClock=null,queenOverride; // tests set these
function queenNow(){return queenClock?queenClock():new Date()}
function queenDay(d=queenNow()){return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate()}
// Two different random days in every Monday–Sunday week, the same for everyone.
function queenVisitDays(d=queenNow()){const week=Math.floor((Date.UTC(d.getFullYear(),d.getMonth(),d.getDate())/864e5+3)/7),rnd=seeded('skogsdrottningen'+week),a=Math.floor(rnd()*7);let b=Math.floor(rnd()*6);if(b>=a)b++;return [a,b].sort()}
function queenVisiting(d=queenNow()){if(queenOverride!==undefined)return queenOverride;return queenVisitDays(d).includes((d.getDay()+6)%7)}
function queenNextVisit(d=queenNow()){for(let i=1;i<=14;i++){const n=new Date(d.getFullYear(),d.getMonth(),d.getDate()+i);if(queenVisiting(n))return n}return null}

const queenGifts=[
 {coins:40,text:'Lite skogsguld till er kassa.'},
 {furniture:'emeraldlamp',text:'En smaragdlykta till ert svamphus.'},
 {coins:50,text:'En påse daggdroppar från mitt slott.'},
 {decor:'emeraldtree',text:'Ett litet smaragdträd till gläntan.'},
 {coins:50,text:'En påse daggdroppar från mitt slott.'},
 {furniture:'goldmirror',text:'En gyllene spegel som har hängt i mitt slott.'}
];
const queenTasks=[
 {id:'win',text:'Vinn ett lopp medan jag är här.',need:1},
 {id:'fish',text:'Fånga tre fiskar i dammen åt mig.',need:3},
 {id:'sold',text:'Sälj två varor i er butik.',need:2},
 {id:'perfect',text:'Gör fem perfekta hopp i loppen.',need:5},
 {id:'care',text:'Mata, klappa och lek med er groda.',need:3}
];
const QUEEN_TASK_COINS=60,QUEEN_PORTRAIT_AFTER=3;

function ensureQueen(){
 if(!state.queen)state.queen={day:null,gift:false,giftsTaken:0,task:null,tasksDone:0};
 const q=state.queen,today=queenDay();
 if(q.day!==today){q.day=today;q.gift=false;const t=queenTasks[Math.floor(seeded('uppdrag'+today)()*queenTasks.length)];q.task={id:t.id,count:0,claimed:false}}
 return q;
}
function queenTask(){const q=ensureQueen();return {...queenTasks.find(t=>t.id===q.task.id),...q.task}}
function queenCount(kind,n=1){if(!state.hatched||!queenVisiting())return;const q=ensureQueen();if(q.task.id!==kind||q.task.claimed)return;const need=queenTask().need;if(q.task.count>=need)return;q.task.count=Math.min(need,q.task.count+n);save()}
function queenTakeGift(){if(!queenVisiting())return null;const q=ensureQueen();if(q.gift)return null;const g=queenGifts[q.giftsTaken]||{coins:40,text:'Lite skogsguld till er kassa.'};q.gift=true;q.giftsTaken++;if(g.coins)state.coins+=g.coins;if(g.furniture){ensureHouse();if(!state.house.owned.includes(g.furniture))state.house.owned.push(g.furniture)}if(g.decor&&!state.decorOwned.includes(g.decor))state.decorOwned.push(g.decor);save();return g}
function queenClaim(){if(!queenVisiting())return null;const q=ensureQueen(),t=queenTask();if(t.claimed||t.count<t.need)return null;q.task.claimed=true;q.tasksDone++;state.coins+=QUEEN_TASK_COINS;let portrait=false;if(q.tasksDone===QUEEN_PORTRAIT_AFTER){ensureHouse();if(!state.house.owned.includes('queenportrait')){state.house.owned.push('queenportrait');portrait=true}}save();return{coins:QUEEN_TASK_COINS,portrait}}

// Counting toward today's task: races, fish, shop sales and caring for the frog.
afterRaceHooks.push(r=>{if(r.rank===1)queenCount('win');if(r.perfect)queenCount('perfect',r.perfect)});
{const fc=fishCatch;fishCatch=function(id){const r=fc(id);if(r)queenCount('fish');return r}}
{const ss=shopSell;shopSell=function(...a){const r=ss(...a);if(r&&!r.left)queenCount('sold');return r}}
{const ca=careAction;careAction=function(kind){const r=ca(kind);if(r)queenCount('care');return r}}

// Gifts for the cottage and the glade.
houseFurniture.push(
 {id:'emeraldlamp',name:'Smaragdlykta',gift:true},
 {id:'goldmirror',name:'Gyllene spegel',gift:true,wall:true},
 {id:'queenportrait',name:'Porträtt av Skogsdrottningen',gift:true,wall:true}
);
const extraFurnitureArt={
 emeraldlamp:'<path d="M60 102V40" stroke="#a8862f" stroke-width="4"/><ellipse cx="60" cy="102" rx="20" ry="5" fill="#a8862f"/><path d="M60 14L80 40 60 70 40 40Z" fill="#3e9a6a" stroke="#d6ad48" stroke-width="3"/><path d="M60 14L60 70 48 40Z" fill="#7fd0a2"/><circle cx="60" cy="42" r="26" fill="#bff5d6" opacity=".35"/>',
 goldmirror:'<ellipse cx="60" cy="50" rx="34" ry="44" fill="#d6ad48"/><ellipse cx="60" cy="50" rx="27" ry="37" fill="#d9eef0"/><path d="M44 30Q52 22 60 26M42 40Q46 34 52 32" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round"/><g fill="#f1ce69"><path d="M60 2L66 12H54Z"/><circle cx="26" cy="50" r="4"/><circle cx="94" cy="50" r="4"/></g><circle cx="60" cy="8" r="3" fill="#3e9a6a"/>',
 queenportrait:'<rect x="16" y="6" width="88" height="94" rx="6" fill="#d6ad48" stroke="#a8862f" stroke-width="3"/><clipPath id="queenFrame"><rect x="24" y="14" width="72" height="78" rx="3"/></clipPath><image href="assets/skogsdrottningen-portratt.webp" x="4" y="8" width="112" height="84" preserveAspectRatio="xMidYMid slice" clip-path="url(#queenFrame)"/><circle cx="60" cy="6" r="4" fill="#3e9a6a" stroke="#d6ad48" stroke-width="2"/>'
};
decorations.push({id:'emeraldtree',name:'Smaragdträd',icon:'🌳',from:'Gåva från Skogsdrottningen'});
Object.assign(extraGardenArt,{emeraldtree:'<ellipse cx="60" cy="100" rx="30" ry="6" fill="#7d9a6a"/><path d="M56 100V64H64V100Z" fill="#8a6a45"/><path d="M60 8L92 54H74L96 78H24L46 54H28Z" fill="#3e9a6a" stroke="#2c7550" stroke-width="2"/><g fill="#bff5d6"><path d="M60 20L66 30 60 40 54 30Z"/><path d="M44 58L48 64 44 70 40 64Z"/><path d="M76 60L80 66 76 72 72 66Z"/></g><circle cx="60" cy="8" r="4" fill="#f1ce69"/>'});

// What she says over fika, depending on how the cottage is furnished.
function queenFikaLine(){
 const ids=(state.house?.items||[]).map(o=>o.id),has=id=>ids.includes(id);
 if(!ids.length)return 'Så mysigt det kan bli här! Kanske en matta och ett bord att fika vid?';
 if(has('queenportrait'))return 'Är det där jag på väggen? Vad glad jag blir!';
 if(has('teaset')&&has('table'))return 'Te vid ett riktigt svampbord – precis som hemma i mitt slott. Tack!';
 if(!has('table'))return 'Jag sitter gärna på golvet. Men ett bord vore fint till nästa fika!';
 if(has('emeraldlamp'))return 'Min smaragdlykta lyser så fint hos er.';
 if(has('aquarium'))return 'Fiskarna i akvariet ser så glada ut. Har ni fångat dem själva?';
 if(has('stove'))return 'Kakelugnen värmer så skönt efter den långa resan.';
 if(ids.length>=8)return 'Det här är det mysigaste huset i hela skogen!';
 return 'Vilken fin början! Jag ser fram emot att se vad ni ställer in härnäst.';
}
function queenFikaHTML(){if(!queenVisiting())return '';return `<div class="queenFika"><img src="assets/skogsdrottningen-portratt.webp" alt="Skogsdrottningen fikar i svamphuset"><p>”${queenFikaLine()}”</p></div>`}

function queenBannerHTML(){if(!state.hatched||!queenVisiting())return '';const q=ensureQueen();if(q.gift&&q.task.claimed)return '';return `<section class="queenBanner"><img src="assets/skogsdrottningen-portratt.webp" alt=""><div><b>Skogsdrottningen är på besök i dag!</b><p>Astrids styvmor har kommit hela vägen från den djupa skogen.</p></div><button class="primary" id="visitQueen">Hälsa på</button></section>`}
function wireQueenBanner(){if($('#visitQueen'))$('#visitQueen').onclick=()=>{tab='queen';render()}}

const weekdays=['söndag','måndag','tisdag','onsdag','torsdag','fredag','lördag'];
function renderQueen(){
 const here=queenVisiting(),q=ensureQueen(),t=queenTask(),next=queenNextVisit();
 if(!here){$('#content').innerHTML=`<section class="queenHero"><img src="assets/skogsdrottningen-glanta.webp" alt="Skogsdrottningen i sin skog"><div><div class="eyebrow">ASTRIDS STYVMOR</div><h2>Skogsdrottningen</h2><p>Hon är hemma i den djupa skogen i dag.</p><p>${next?'Hon kommer på besök igen på '+weekdays[next.getDay()]+'.':''}</p></div></section>`;return}
 const done=t.count>=t.need;
 $('#content').innerHTML=`<section class="queenHero"><img src="assets/skogsdrottningen-glanta.webp" alt="Skogsdrottningen vid vattenfallet"><div><div class="eyebrow">ASTRIDS STYVMOR · PÅ BESÖK I DAG</div><h2>Skogsdrottningen</h2><p>Hon bor inte i Älvbyn utan långt bort i den djupa skogen. Ett par dagar i veckan kommer hon och hälsar på.</p><blockquote>”Hej, mina vänner! Astrid har berättat så mycket om er och era grodor.”</blockquote></div></section><div class="queenCards"><article class="quest"><div class="eyebrow">EN GÅVA</div><h3>Från den djupa skogen</h3><div id="queenGift">${q.gift?'<p>Ni har öppnat dagens gåva. Tack, Skogsdrottningen!</p>':'<p>Hon har med sig något till er.</p><button class="primary" id="openQueenGift">Öppna gåvan</button>'}</div></article><article class="quest"><div class="eyebrow">DAGENS UPPDRAG · INNAN HON ÅKER HEM</div><h3>${t.text}</h3><div class="questProgress"><span>${Math.min(t.count,t.need)} av ${t.need}</span><span>+${QUEEN_TASK_COINS} daggdroppar</span></div><progress max="${t.need}" value="${Math.min(t.count,t.need)}"></progress><button class="primary" id="claimQueenTask" ${done&&!t.claimed?'':'disabled'}>${t.claimed?'✓ Klart – tack!':done?'Berätta att det är klart':'Inte klart än'}</button><p class="queenTaskNote">Uppdrag klarade åt henne: ${q.tasksDone}${q.tasksDone<QUEEN_PORTRAIT_AFTER?' · efter '+QUEEN_PORTRAIT_AFTER+' får ni en överraskning':''}</p></article><article class="quest"><div class="eyebrow">FIKA</div><h3>I svamphuset</h3><p>Hon sitter och fikar i ert svamphus och tittar på hur ni har inrett.</p><button class="outline" id="queenToHouse">Gå till svamphuset →</button></article></div>`;
 if($('#openQueenGift'))$('#openQueenGift').onclick=()=>{const g=queenTakeGift();if(!g)return;sfx('chime');sidebar();renderQueen();$('#queenGift').innerHTML=`<p class="queenThanks">”${g.text}”</p><p>${g.coins?'+'+g.coins+' daggdroppar':g.furniture?'Ny möbel i svamphuset: '+houseFurniture.find(f=>f.id===g.furniture).name:'Ny sak till gläntan: '+decorations.find(d=>d.id===g.decor).name}</p>`};
 $('#claimQueenTask').onclick=()=>{const r=queenClaim();if(!r)return;sfx('win');sidebar();renderQueen();toast(r.portrait?'Tack! Hon ger er ett porträtt av sig själv till svamphuset.':'Tack för hjälpen! +'+r.coins+' daggdroppar')};
 $('#queenToHouse').onclick=()=>{tab='house';render()};
}
