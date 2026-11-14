// Skogsdrottningen – Astrid's stepmother. She doesn't live in Älvbyn but far away in the deep
// forest, and visits on two random days each week. On a visit she brings a gift, has a small
// task that must be done the same day (before she goes home), and has fika in the cottage,
// where she comments on how it is furnished.

let queenClock=null,queenOverride; // tests set these
function queenNow(){return queenClock?queenClock():typeof gameDate==='function'?gameDate():new Date()}
function queenDay(d=queenNow()){return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate()}
// Two different random days in every Monday–Sunday week, the same for everyone.
function queenVisitDays(d=queenNow()){const week=Math.floor((Date.UTC(d.getFullYear(),d.getMonth(),d.getDate())/864e5+3)/7),rnd=seeded('skogsdrottningen'+week),a=Math.floor(rnd()*7);let b=Math.floor(rnd()*6);if(b>=a)b++;return [a,b].sort()}
function queenVisiting(d=queenNow()){if(queenOverride!==undefined)return queenOverride;if(typeof state!=='undefined'&&state.queen?.calledDay===queenDay(d))return true;return queenVisitDays(d).includes((d.getDay()+6)%7)}
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
 $('#content').innerHTML=`<section class="queenHero"><img src="assets/skogsdrottningen-glanta.webp" alt="Skogsdrottningen vid vattenfallet"><div><div class="eyebrow">ASTRIDS STYVMOR · PÅ BESÖK I DAG</div><h2>Skogsdrottningen</h2><p>Hon bor inte i Älvbyn utan långt bort i den djupa skogen. Ett par dagar i veckan kommer hon och hälsar på.</p><blockquote>”Hej, mina vänner! Astrid har berättat så mycket om er och era grodor.”</blockquote>${state.queen.castle?'<button class="outline" id="queenToCastle">Hälsa på i slottet →</button>':'<button class="primary" id="queenToCastle">Följ med till mitt slott</button>'}</div></section><div class="queenCards"><article class="quest"><div class="eyebrow">EN GÅVA</div><h3>Från den djupa skogen</h3><div id="queenGift">${q.gift?'<p>Ni har öppnat dagens gåva. Tack, Skogsdrottningen!</p>':'<p>Hon har med sig något till er.</p><button class="primary" id="openQueenGift">Öppna gåvan</button>'}</div></article><article class="quest"><div class="eyebrow">DAGENS UPPDRAG · INNAN HON ÅKER HEM</div><h3>${t.text}</h3><div class="questProgress"><span>${Math.min(t.count,t.need)} av ${t.need}</span><span>+${QUEEN_TASK_COINS} daggdroppar</span></div><progress max="${t.need}" value="${Math.min(t.count,t.need)}"></progress><button class="primary" id="claimQueenTask" ${done&&!t.claimed?'':'disabled'}>${t.claimed?'✓ Klart – tack!':done?'Berätta att det är klart':'Inte klart än'}</button><p class="queenTaskNote">Uppdrag klarade åt henne: ${q.tasksDone}${q.tasksDone<QUEEN_PORTRAIT_AFTER?' · efter '+QUEEN_PORTRAIT_AFTER+' får ni en överraskning':''}</p></article><article class="quest"><div class="eyebrow">FIKA</div><h3>I svamphuset</h3><p>Hon sitter och fikar i ert svamphus och tittar på hur ni har inrett.</p><button class="outline" id="queenToHouse">Gå till svamphuset →</button></article></div>`;
 if($('#openQueenGift'))$('#openQueenGift').onclick=()=>{const g=queenTakeGift();if(!g)return;sfx('chime');sidebar();renderQueen();$('#queenGift').innerHTML=`<p class="queenThanks">”${g.text}”</p><p>${g.coins?'+'+g.coins+' daggdroppar':g.furniture?'Ny möbel i svamphuset: '+houseFurniture.find(f=>f.id===g.furniture).name:'Ny sak till gläntan: '+decorations.find(d=>d.id===g.decor).name}</p>`};
 $('#claimQueenTask').onclick=()=>{const r=queenClaim();if(!r)return;sfx('win');sidebar();renderQueen();toast(r.portrait?'Tack! Hon ger er ett porträtt av sig själv till svamphuset.':'Tack för hjälpen! +'+r.coins+' daggdroppar')};
 $('#queenToHouse').onclick=()=>{tab='house';render()};
 $('#queenToCastle').onclick=()=>{queenOpenCastle();tab='castle';render()};
}

// ---------- Skogsdrottningens slott (survey 3) ----------
// The family wanted to visit her castle, hear about when Astrid was little, and see her more often.
// Her castle opens the first time she invites you (on a visit day) and then stays open. There she
// tells one new story a day about little Astrid, and gives you a forest flute: blow it and she
// comes to visit today. The flute needs to rest three days between calls.
const QUEEN_FLUTE_REST=3,QUEEN_STORY_COINS=15;
const astridStories=[
 {title:'Maskroskronan',text:'När Astrid var liten ville hon bli drottning. Hon plockade alla maskrosor på slottsängen och flätade en krona som var större än hennes huvud. Den ramlade ner över öronen hela tiden, men hon bar den en hel vecka. Jag har fortfarande en torkad maskros från den kronan i en låda.'},
 {title:'Grodorna i badkaret',text:'En kväll hörde jag plask från badrummet. Där satt Astrid i badkaret med sju grodor som hon hade burit in från dammen, en i taget. ”De ville också bada”, sa hon. Vi bar ut dem tillsammans i månskenet och sa god natt till var och en.'},
 {title:'Den första flygturen',text:'Astrids vingar var små och skrynkliga när hon var liten. Hon övade varje morgon genom att hoppa från en mosstuva. En dag lyfte hon en handsbredd, men hon skrattade så mycket att hon ramlade ner igen. Sedan dess skrattar hon alltid när hon flyger.'},
 {title:'Tunneln i snön',text:'En vinter snöade det så mycket att slottsporten frös igen. Astrid sa att vi skulle gräva en tunnel. Hon grävde en hel förmiddag med en soppslev. Vi kom ut till slut, och tunneln stod kvar ända till våren.'},
 {title:'Den blyga ugglan',text:'I tornet bodde en uggla som aldrig ville prata med någon. Astrid satte sig nedanför varje kväll och berättade om sin dag. Efter en månad svarade ugglan ”hoo”. Astrid sa att det betydde ”god natt, lilla prinsessa”.'},
 {title:'Kakorna som försvann',text:'En gång bakade vi hallonkakor till en fest, men på morgonen var plåten tom. Astrid lovade att det inte var hon. Det visade sig att en ekorre hade smugit in genom fönstret. Astrid förlät honom och lät honom få en kaka på festen.'},
 {title:'Det första loppet',text:'Astrid tävlade första gången på en groda som hette Pölen. Pölen ville hellre fånga flugor än hoppa, så de kom sist. Astrid var ändå så stolt att hon gav Pölen en medalj gjord av en ekollonhatt. ”Det viktigaste är att vi hade roligt”, sa hon. Det säger hon fortfarande.'},
 {title:'Den finaste dagen',text:'Dagen då Astrid blev drottning frågade jag om hon var rädd. ”Lite”, sa hon, ”men jag har ju dig och alla grodorna.” Sedan gick hon ut på balkongen och vinkade till hela skogen. Det var en av de finaste dagarna i mitt liv.'}
];
houseFurniture.push({id:'storybook',name:'Astrids sagobok',gift:true});
extraFurnitureArt.storybook='<path d="M50 100L56 62H64L70 100Z" fill="#8a6a45"/><ellipse cx="60" cy="100" rx="22" ry="5" fill="#8a6a45"/><path d="M22 58L60 66 98 58 96 26 60 34 24 26Z" fill="#3e9a6a" stroke="#2c7550" stroke-width="2"/><path d="M28 30L60 37V62L28 55Z" fill="#fff8e6"/><path d="M92 30L60 37V62L92 55Z" fill="#fff8e6"/><g stroke="#c9b48f" stroke-width="2"><path d="M34 38L54 42M34 45L54 49M66 42L86 38M66 49L86 45"/></g><path d="M60 34V66" stroke="#d6ad48" stroke-width="2"/><circle cx="60" cy="24" r="5" fill="#f1ce69"/>';

function queenDayNum(d=queenNow()){return Math.floor(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate())/864e5)}
function ensureCastle(){const q=ensureQueen();q.stories??=[];return q}
function queenOpenCastle(){const q=ensureCastle();if(q.castle)return false;q.castle=true;save();return true}
function queenGetFlute(){const q=ensureCastle();if(!q.castle||q.flute)return false;q.flute=true;save();return true}
function queenFluteRestDays(){const q=ensureCastle();if(q.fluteDay==null)return 0;return Math.max(0,QUEEN_FLUTE_REST-(queenDayNum()-q.fluteDay))}
function queenFluteReady(){const q=ensureCastle();return !!q.flute&&!queenVisiting()&&queenFluteRestDays()===0}
function queenBlowFlute(){if(!queenFluteReady())return false;const q=state.queen;q.calledDay=queenDay();q.fluteDay=queenDayNum();save();return true}
// One new story a day; the ones already heard can be read again.
function queenStoryReady(){const q=ensureCastle();return q.castle&&q.stories.length<astridStories.length&&q.storyDay!==queenDay()}
function queenHearStory(){if(!queenStoryReady())return null;const q=state.queen,i=q.stories.length;q.stories.push(i);q.storyDay=queenDay();state.coins+=QUEEN_STORY_COINS;let book=false;if(q.stories.length===astridStories.length){ensureHouse();if(!state.house.owned.includes('storybook')){state.house.owned.push('storybook');book=true}}save();return{...astridStories[i],n:i+1,book}}

// A painted illustration in the same style as Skogsdrottningen's portraits (made with Higgsfield).
function castleSceneHTML(){return '<img class="castleScene" src="assets/skogsdrottningen-slott.webp" alt="Skogsdrottningens slott med smaragdtorn bredvid ett vattenfall i skogen">'}

function renderCastle(){
 const q=ensureCastle();
 if(!q.castle){const here=queenVisiting(),next=queenNextVisit();$('#content').innerHTML=`<section class="queenHero"><img src="assets/skogsdrottningen-glanta.webp" alt="Skogsdrottningen i sin skog"><div><div class="eyebrow">LÅNGT IN I DEN DJUPA SKOGEN</div><h2>Skogsdrottningens slott</h2><p>Slottet ligger långt in i den djupa skogen. Skogsdrottningen visar vägen första gången hon hälsar på.</p>${here?'<p><b>Hon är på besök i dag!</b></p><button class="primary" id="castleInvite">Följ med till slottet</button>':`<p>${next?'Hon kommer på besök igen på '+weekdays[next.getDay()]+'.':''}</p><p>När hon är på besök: tryck på Hälsa på under Tävla, och sedan på Följ med till mitt slott.</p>`}</div></section>`;if($('#castleInvite'))$('#castleInvite').onclick=()=>{queenOpenCastle();renderCastle()};return}
 const firstFlute=queenGetFlute(),ready=queenStoryReady(),here=queenVisiting(),rest=queenFluteRestDays();
 const heard=q.stories.map(i=>astridStories[i]);
 $('#content').innerHTML=`<div class="sectionHead"><div><div class="eyebrow">LÅNGT IN I DEN DJUPA SKOGEN</div><h2>Skogsdrottningens slott</h2></div><span class="pill">${q.stories.length} av ${astridStories.length} sagor</span></div><section class="castleHero">${castleSceneHTML()}<div class="castleWelcome"><img src="assets/skogsdrottningen-portratt.webp" alt="Skogsdrottningen"><p>”${firstFlute?'Välkomna till mitt slott! Ta den här flöjten. Blås i den när ni saknar mig, så kommer jag.':ready?'Kom in, kom in! Sätt er vid brasan, så ska jag berätta om när Astrid var liten.':'Så roligt att ni tittade in igen. Brasan är varm och teet är klart.'}”</p></div></section><div class="castleCards"><article class="quest castleStory"><div class="eyebrow">SAGOR OM NÄR ASTRID VAR LITEN</div>${ready?`<h3>En ny saga väntar</h3><p>Skogsdrottningen berättar en ny saga varje dag ni hälsar på.</p><button class="primary" id="hearStory">Lyssna på dagens saga</button>`:q.stories.length>=astridStories.length?'<h3>Alla sagor är berättade</h3><p>Ni har hört alla hennes sagor om Astrid. Sagoboken står i ert svamphus.</p>':'<h3>Kom tillbaka i morgon</h3><p>Hon har redan berättat dagens saga. I morgon kommer en ny.</p>'}<div id="storyText"></div>${heard.length?`<details class="storyList"><summary>Sagorna ni har hört (${heard.length})</summary>${heard.map(s=>`<h4>${s.title}</h4><p>${s.text}</p>`).join('')}</details>`:''}</article><article class="quest castleFlute"><div class="eyebrow">SKOGSFLÖJTEN</div><h3>${here?'Hon är på besök i dag':rest?'Flöjten vilar':'Blås i flöjten'}</h3><p>${here?'Skogsdrottningen är redan på besök i dag. Gå till Älvbyn och hälsa på!':rest?'Flöjten behöver vila '+rest+' '+(rest===1?'dag':'dagar')+' till innan den kan kalla på henne igen.':'Blås i flöjten, så kommer Skogsdrottningen på besök i dag, med gåva och uppdrag. Sedan behöver flöjten vila i tre dagar.'}</p><button class="primary" id="blowFlute" ${queenFluteReady()?'':'disabled'}>🎶 Blås i flöjten</button></article></div>`;
 if(firstFlute)toast('Ni fick Skogsflöjten!');
 if($('#hearStory'))$('#hearStory').onclick=()=>{const s=queenHearStory();if(!s)return;sfx('chime');sidebar();renderCastle();$('#storyText').innerHTML=`<div class="storyNew"><h4><span>${s.n}.</span> ${s.title}</h4><p>${s.text}</p><small>+${QUEEN_STORY_COINS} daggdroppar${s.book?' · Ni fick Astrids sagobok till svamphuset!':''}</small></div>`};
 $('#blowFlute').onclick=()=>{if(!queenBlowFlute())return;sfx('flute');toast('Tuu-tuu! Skogsdrottningen är på väg.');tab='queen';render()};
}
