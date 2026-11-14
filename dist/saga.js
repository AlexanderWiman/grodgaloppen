// The Star Crown saga: five chapters, each in a new place with its own adventure and race track.
// Also the photo album, medals and stickers. Everything lives under the "Äventyr" tab.
//
// Chapter flow: read the intro → six-hop adventure (opens the place's track, gives an egg)
// → finish one race on the new track → chapter done. After five chapters: the coronation party.

const sagaChapters=[
 {id:'castle',n:1,title:'Den trasiga stjärnkronan',place:'Astrids slott',track:4,gem:'Solstenen',icon:'☀',item:'banner',
  intro:[['Astrid','Något hemskt har hänt! I natt föll stjärnkronan från tornet och dess fem stenar rullade ut över hela riket.'],['Astrid','Utan kronan kan årstiderna inte byta plats. Vill du hjälpa mig att hitta stenarna?'],['Astrid','Den första, Solstenen, borde finnas kvar i slottsträdgården. Följ trapporna!']],
  steps:['Klättra upp för slottstrappan','Något glimmar bakom rosorna…','Där är Solstenen!','Bär den förbi fontänen','Tornet syns ovanför','Solstenen lyser i kronan igen!'],
  ending:'Solstenen sitter på sin plats och slottet fylls av varmt ljus. Astrid ler: ”En sten av fem. Jag visste att du kunde!”'},
 {id:'sea',n:2,title:'Sjöstjärnornas sång',place:'Undervattensriket',track:5,gem:'Havspärlan',icon:'🫧',item:'shell',
  intro:[['Astrid','Fiskarna säger att Havspärlan sjönk ner till sjöstjärnornas rike.'],['Sköldpaddan Ture','Välkommen ner i djupet! Sjöstjärnorna har slutat sjunga sedan pärlan kom. Den lyser så starkt att de inte kan sova.'],['Ture','Följ strömmen så hittar du den. Andas lugnt – en bubbla i taget.']],
  steps:['Dyk ner bland snäckorna','Strömmen drar åt höger…','Havspärlan glittrar i en mussla!','Sjöstjärnorna börjar nynna','Ture vinkar från korallen','Sjöstjärnorna sjunger igen!'],
  ending:'När pärlan är borta kan sjöstjärnorna somna, och de sjunger en tacksång. Ture ger dig en snäcka som hälsning.'},
 {id:'clouds',n:3,title:'Vindarnas bro',place:'Molnriket',track:6,gem:'Vindkristallen',icon:'💠',item:'cloudlamp',
  intro:[['Astrid','Den tredje stenen blåste ända upp till molnen!'],['Vindälvan Sirra','Hej där nere! Vindkristallen fastnade i ett åskmoln, och nu andas vinden alldeles ojämnt.'],['Sirra','Hoppa när molnen är stora och mjuka. Jag blåser dig i rätt riktning!']],
  steps:['Studsa upp på första molnet','Vinden puffar dig framåt','Vindkristallen snurrar i ett moln!','Hoppa över molnbron','Regnbågen pekar hemåt','Vinden andas lugnt igen!'],
  ending:'Vinden andas lugnt och en regnbåge spänner sig över hela riket. Sirra ger dig en molnlykta.'},
 {id:'night',n:4,title:'Ugglans gåta',place:'Nattskogen',track:7,gem:'Månstenen',icon:'🌙',item:'owl',
  intro:[['Astrid','Månstenen gömmer sig i Nattskogen. Där är det så mörkt att man knappt ser sina egna tår.'],['Ugglan Hedvig','Hoo! Jag vaktar Månstenen. Den som vill ha den måste svara på min gåta: Vad blir större ju mer man tar bort?'],['Hedvig','Ett hål! Mycket klokt. Följ nu eldflugorna – de visar vägen i mörkret.']],
  steps:['Gå in bland de mörka träden','Eldflugorna tänder sina lyktor','Månstenen glimmar i ett ihåligt träd!','Hedvig hoar uppmuntrande','Skogen blir ljusare','Månen lyser över Nattskogen!'],
  ending:'Månstenen lyser upp hela Nattskogen. Hedvig blinkar nöjt och ger dig en liten uggla av mossa.'},
 {id:'winter',n:5,title:'Den frusna sjön',place:'Vintervärlden',track:8,gem:'Snöstjärnan',icon:'❄',item:'snowglobe',
  intro:[['Astrid','Den sista stenen, Snöstjärnan, ligger mitt på den frusna sjön.'],['Snöharen Frost','Brr! Utan Snöstjärnan kommer våren aldrig. Men isen är hal.'],['Frost','Hoppa försiktigt mellan isflaken. Jag tror på dig – och på din groda!']],
  steps:['Kliv ut på den första isflaken','Isen knarrar men håller','Snöstjärnan gnistrar på sjön!','Frost skuttar bredvid dig','Slottet syns långt borta','Snöstjärnan är hemma!'],
  ending:'Alla fem stenar sitter i kronan. Isen glittrar i vårsolen och Frost gör en glädjevolt.'}
];
const sagaEpilogue={title:'Kröningsfesten',text:['Astrid sätter på sig stjärnkronan. Alla fem stenar lyser samtidigt, och över hela riket byter årstiderna plats igen.','Klöver, Mossa och Pärla bär in en tårta av näckrosblad. Mira dansar, Tagge bjuder på bärpaj och Tilda har hittat vägen hem för alla.','Astrid: ”Utan dig och din groda hade riket varit fruset för alltid. Från och med i dag är ni rikets hjältar.”']};

// Adventures for the chapters run in the normal hopping engine.
sagaChapters.forEach(c=>storyQuests.push({id:'saga-'+c.id,chapter:c.id,title:'Kapitel '+c.n+': '+c.title,route:c.track,icon:c.icon,tokenLabel:c.gem,reward:70,trust:20,item:c.item,intro:c.intro.map(l=>l[1]).join(' '),steps:c.steps,music:trackWorlds[c.track].music}));
decorations.push(
 {id:'banner',name:'Kunglig fana',icon:'⚑',quest:'saga-castle'},{id:'shell',name:'Sjungande snäcka',icon:'🐚',quest:'saga-sea'},{id:'cloudlamp',name:'Molnlykta',icon:'☁',quest:'saga-clouds'},
 {id:'owl',name:'Mossuggla',icon:'🦉',quest:'saga-night'},{id:'snowglobe',name:'Snöglob',icon:'❄',quest:'saga-winter'},{id:'starcrown',name:'Stjärnkronans kopia',icon:'♛',quest:'saga-epilogue'}
);
const extraGardenArt={
 banner:'<path d="M40 100V14" stroke="#8d7451" stroke-width="5"/><path d="M42 16H92L80 34L92 52H42Z" fill="#b48ad6"/><circle cx="62" cy="34" r="7" fill="#f1ce69"/><ellipse cx="40" cy="102" rx="20" ry="5" fill="#91ad75"/>',
 shell:'<path d="M20 86Q60 6 100 86Z" fill="#f6d5c4" stroke="#d29c86" stroke-width="2"/><path d="M60 22V86M40 40L48 86M80 40L72 86M28 62L38 86M92 62L82 86" stroke="#d29c86" stroke-width="2"/><ellipse cx="60" cy="90" rx="44" ry="8" fill="#e8d7b0"/>',
 cloudlamp:'<path d="M60 100V60" stroke="#8d7451" stroke-width="4"/><g fill="#fdfdff" stroke="#cfdcef" stroke-width="2"><circle cx="45" cy="45" r="18"/><circle cx="68" cy="38" r="22"/><circle cx="86" cy="50" r="15"/></g><circle cx="66" cy="44" r="8" fill="#fff3a6"/>',
 owl:'<ellipse cx="60" cy="68" rx="30" ry="34" fill="#7d9a5f"/><path d="M34 40L42 50M86 40L78 50" stroke="#5f7d47" stroke-width="6" stroke-linecap="round"/><circle cx="48" cy="58" r="11" fill="#f4ecc4"/><circle cx="72" cy="58" r="11" fill="#f4ecc4"/><circle cx="48" cy="58" r="5" fill="#263d32"/><circle cx="72" cy="58" r="5" fill="#263d32"/><path d="M56 70L60 78L64 70Z" fill="#d6a74c"/>',
 snowglobe:'<circle cx="60" cy="50" r="36" fill="#dceefa" stroke="#a9c6dc" stroke-width="3"/><path d="M46 62Q60 40 74 62Z" fill="#fff"/><circle cx="60" cy="44" r="6" fill="#fff"/><g fill="#fff"><circle cx="40" cy="36" r="2"/><circle cx="78" cy="30" r="2"/><circle cx="70" cy="56" r="2"/></g><path d="M30 84H90L84 100H36Z" fill="#a37f5a"/>',
 starcrown:'<path d="M22 76L16 30 40 50 60 18 80 50 104 30 98 76Z" fill="#f1ce69" stroke="#b58a22" stroke-width="3"/><g><circle cx="38" cy="66" r="6" fill="#f6b25b"/><circle cx="50" cy="62" r="6" fill="#9fd3e0"/><circle cx="60" cy="58" r="7" fill="#b9a6ef"/><circle cx="70" cy="62" r="6" fill="#f3e9a8"/><circle cx="82" cy="66" r="6" fill="#e7f3ff"/></g><path d="M22 84H98" stroke="#b58a22" stroke-width="6"/>'
};

function ensureSaga(){if(!state.saga)state.saga={chapters:{},epilogue:false}}
function chapterStatus(id){ensureSaga();return state.saga.chapters[id]||'new'}
function chapterAvailable(c){return c.n===1||chapterStatus(sagaChapters[c.n-2].id)==='done'}
// A place's race track opens when its chapter adventure is finished.
function placeOpen(id){return ['race','done'].includes(chapterStatus(id))}
function sagaDone(){return sagaChapters.every(c=>chapterStatus(c.id)==='done')}

// Called by adventureEnding (world.js) when a chapter adventure is finished.
function chapterEnding(questId){
 const q=storyQuests.find(q=>q.id===questId),c=sagaChapters.find(c=>c.id===q.chapter);
 completeAdventure(questId);ensureSaga();
 const first=chapterStatus(c.id)==='new';
 if(first){state.saga.chapters[c.id]='race';state.eggs=(state.eggs||0)+1}
 const sticker=grantSticker(true),fresh=checkMedals();save();sidebar();sfx('evolve');
 $('#content').innerHTML=`<section class="queenHero sagaEnding"><div class="sagaArt">${albumArt('saga-'+c.id)}</div><div><div class="eyebrow">KAPITEL ${c.n} · ${c.place.toUpperCase()}</div><h2>Du hittade ${c.gem}!</h2><p>${c.ending}</p><ul class="rewardList"><li>+${q.reward} daggdroppar · +${q.trust} förtroende</li><li>${decorations.find(d=>d.id===c.item).name} till gläntan</li>${first?'<li>🥚 Ett grodägg att kläcka i Grodvän</li>':''}<li>Ny bana: <b>${trackWorlds[c.track].name}</b></li>${sticker?`<li>Klistermärke: ${sticker.icon} ${sticker.name}</li>`:''}${fresh.map(m=>`<li>Medalj: ${m.icon} ${m.name}</li>`).join('')}</ul><p><b>Sista steget:</b> kör ett lopp i ${trackWorlds[c.track].name} för att avsluta kapitlet.</p><button class="primary" id="chapterRace">Till ${trackWorlds[c.track].name} →</button><button class="outline" id="chapterBack">Tillbaka till sagan</button></div></section>`;
 $('#chapterRace').onclick=()=>{chosen=c.track;activeRun=null;tab='race';astridStart()};
 $('#chapterBack').onclick=()=>{tab='adventure';advSection='saga';render()};
}
afterRaceHooks.push(r=>{
 ensureSaga();
 const c=sagaChapters.find(c=>c.track===r.route&&chapterStatus(c.id)==='race');
 if(c){state.saga.chapters[c.id]='done';raceNotes.push(`📖 Kapitel ${c.n} är klart! ${c.gem} lyser i stjärnkronan.`);if(c.n<5)raceNotes.push('Nästa kapitel väntar under Äventyr.');else raceNotes.push('♛ Alla stenar är hittade – Astrid bjuder till kröningsfest under Äventyr!')}
 // Counters for medals.
 state.bestStreakEver=Math.max(state.bestStreakEver||0,r.bestStreak);state.surprisesTotal=(state.surprisesTotal||0)+r.surprisesCleared;
 if(r.rank===1&&r.difficulty==='hard')state.hardWins=(state.hardWins||0)+1;
 const s=grantSticker(false,r.rank===1?.6:.4);if(s)raceNotes.push(`Nytt klistermärke: ${s.icon} ${s.name}!`);
 checkMedals().forEach(m=>raceNotes.push(`🏅 Ny medalj: ${m.icon} ${m.name}!`));
});

// ---------- Stickers ----------
const stickers=[['🐸','Grodkram'],['🍄','Svampis'],['🌸','Körsbärsblom'],['🦋','Fjärilen'],['🐞','Nyckelpigan'],['🌈','Regnbågen'],['⭐','Stjärnan'],['🌙','Månen'],['🫧','Bubblan'],['🐌','Snigeln'],['🦔','Tagge'],['🐭','Tilda'],['🧚','Mira'],['🏮','Lyktan'],['💎','Kristallen'],['🐚','Snäckan'],['☁','Molnet'],['🦉','Hedvig'],['❄','Snöflingan'],['🍓','Smultronet'],['🌻','Solrosen'],['🐝','Humlan'],['🎈','Ballongen'],['👑','Kronan']].map(([icon,name],i)=>({id:'s'+i,icon,name}));
function grantSticker(sure,chance=1){
 state.stickers=state.stickers||[];
 const free=stickers.filter(s=>!state.stickers.includes(s.id));
 if(!free.length||(!sure&&Math.random()>chance))return null;
 const s=free[Math.floor(Math.random()*free.length)];state.stickers.push(s.id);return s;
}

// ---------- Medals ----------
const medals=[
 {id:'first_win',icon:'🥇',name:'Första segern',desc:'Vinn ett lopp.',ok:()=>state.wins>=1},
 {id:'ten_wins',icon:'🏅',name:'Tio segrar',desc:'Vinn tio lopp.',ok:()=>state.wins>=10},
 {id:'explorer',icon:'🧭',name:'Upptäckare',desc:'Tävla på fyra olika banor.',ok:()=>state.visitedTracks.length>=4},
 {id:'traveler',icon:'🌍',name:'Världsresenär',desc:'Tävla på alla nio banor.',ok:()=>state.visitedTracks.length>=9},
 {id:'flow',icon:'🔥',name:'Grodflow-mästare',desc:'Tio lyckade hopp i rad.',ok:()=>(state.bestStreakEver||0)>=10},
 {id:'hurdles',icon:'🪵',name:'Hinderhoppare',desc:'Klara tio överraskningshinder.',ok:()=>(state.surprisesTotal||0)>=10},
 {id:'brave',icon:'⚡',name:'Modig mot de snabba',desc:'Vinn ett lopp på Svår.',ok:()=>(state.hardWins||0)>=1},
 {id:'champion',icon:'🏆',name:'Kunglig mästare',desc:'Vinn Astrids mästerskap.',ok:()=>state.cupWins>=1},
 {id:'family',icon:'🐸',name:'Grodfamilj',desc:'Ha tre grodor.',ok:()=>(state.frogs||[]).length>=3},
 {id:'magic',icon:'✨',name:'Magisk groda',desc:'Låt en groda bli magisk.',ok:()=>(state.frogs||[]).some(f=>typeof frogStage==='function'&&frogStage(f)>=3)},
 {id:'friends',icon:'💚',name:'Bästa vänner',desc:'Nå 100 i vänskap med en groda.',ok:()=>(state.frogs||[]).some(f=>(f.bond||0)>=100)||state.bond>=100},
 {id:'saga1',icon:'📖',name:'Sagans början',desc:'Avsluta sagans första kapitel.',ok:()=>chapterStatus('castle')==='done'},
 {id:'hero',icon:'👑',name:'Rikets hjälte',desc:'Fira kröningsfesten med Astrid.',ok:()=>!!state.saga?.epilogue},
 {id:'listed',icon:'📜',name:'På topplistan',desc:'Skicka en tid till topplistan.',ok:()=>!!state.leaderSubmitted},
 {id:'stickers',icon:'🌈',name:'Klistermärkessamlare',desc:'Samla tolv klistermärken.',ok:()=>(state.stickers||[]).length>=12}
];
function checkMedals(){state.medals=state.medals||[];const fresh=medals.filter(m=>!state.medals.includes(m.id)&&m.ok());fresh.forEach(m=>state.medals.push(m.id));if(fresh.length)save();return fresh}

// ---------- Album pictures ----------
const albumEntries=[
 {id:'firefly',caption:'Eldflugefamiljen är hemma igen',sky:['#2f4650','#5c7a6f'],ground:'#3f5a4c',motifs:['✦','✦','✧','✦'],big:'✦'},
 {id:'jewel',caption:'Kronjuvelen hittad i Svampskogen',sky:['#d9e6c6','#aca781'],ground:'#8f8a5e',motifs:['🍄','♣','🍄'],big:'◆'},
 {id:'saga-castle',caption:'Solstenen i slottsträdgården',sky:['#f3e6f7','#d9c7e6'],ground:'#c8b07a',motifs:['🏰','⚑','🌹'],big:'☀'},
 {id:'saga-sea',caption:'Sjöstjärnornas sång',sky:['#a9dce6','#3f7e94'],ground:'#2f6b7c',motifs:['🐚','🫧','🐠','⭐'],big:'🫧'},
 {id:'saga-clouds',caption:'Regnbågen över Molnriket',sky:['#e6effb','#bcd5f0'],ground:'#ffffff',motifs:['☁','🌈','☁'],big:'💠'},
 {id:'saga-night',caption:'Månen över Nattskogen',sky:['#1f2a4a','#33476e'],ground:'#24324f',motifs:['🦉','✦','🌲','✧'],big:'🌙'},
 {id:'saga-winter',caption:'Våren kommer till den frusna sjön',sky:['#eef6fc','#c4dbec'],ground:'#e3eef7',motifs:['❄','⛄','❄'],big:'❄'},
 {id:'saga-epilogue',caption:'Kröningsfesten',sky:['#fff4cf','#f6d98c'],ground:'#d9b85a',motifs:['🎉','👑','🎈','🌸'],big:'♛'}
];
function albumUnlocked(id){return id==='saga-epilogue'?!!state.saga?.epilogue:storyProgress(id).done}
function albumArt(id){
 const e=albumEntries.find(e=>e.id===id),g='g'+id.replace(/\W/g,'');
 const body=frog().replace(/<svg[^>]*>|<\/svg>/g,'');
 return `<svg viewBox="0 0 320 200" role="img" aria-label="${e.caption}"><defs><linearGradient id="${g}" x2="0" y2="1"><stop stop-color="${e.sky[0]}"/><stop offset="1" stop-color="${e.sky[1]}"/></linearGradient></defs><rect width="320" height="200" fill="url(#${g})"/><path d="M0 150Q80 120 160 145T320 138V200H0Z" fill="${e.ground}" opacity=".85"/>${e.motifs.map((m,i)=>`<text x="${30+i*(260/Math.max(1,e.motifs.length-1))}" y="${60+(i%2)*30}" font-size="26" text-anchor="middle" fill="#fff3b0" opacity=".9">${m}</text>`).join('')}<text x="250" y="140" font-size="44" text-anchor="middle" fill="#ffe27a">${e.big}</text><g transform="translate(40 70) scale(.55)">${body}</g></svg>`;
}

// ---------- The Äventyr tab ----------
let advSection='saga',sagaReading=null;
function renderAdventures(){
 ensureSaga();checkMedals();
 const sections=[['saga','Sagan'],['small','Småäventyr'],['album','Album'],['collect','Medaljer']];
 $('#content').innerHTML=`<div class="sectionHead"><h2>Äventyr med Astrid</h2><span class="pill">${sagaChapters.filter(c=>chapterStatus(c.id)==='done').length} av 5 kapitel</span></div><div class="advTabs" role="tablist">${sections.map(([k,n])=>`<button role="tab" data-adv="${k}" aria-selected="${advSection===k}">${n}</button>`).join('')}</div><div id="advBody"></div>`;
 document.querySelectorAll('[data-adv]').forEach(b=>b.onclick=()=>{advSection=b.dataset.adv;sagaReading=null;renderAdventures()});
 ({saga:renderSaga,small:renderSmallAdventures,album:renderAlbum,collect:renderCollections})[advSection]();
}
function crownHTML(){return `<div class="crownSlots" aria-label="Stjärnkronans stenar">${sagaChapters.map(c=>`<span class="${chapterStatus(c.id)==='new'?'':'found'}" title="${c.gem}">${chapterStatus(c.id)==='new'?'○':c.icon}</span>`).join('')}</div>`}
function renderSaga(){
 const body=$('#advBody');
 if(sagaReading){
  const c=sagaChapters.find(c=>c.id===sagaReading.id),line=c.intro[sagaReading.line],last=sagaReading.line===c.intro.length-1;
  body.innerHTML=`<section class="sagaDialog"><div class="eyebrow">KAPITEL ${c.n} · ${c.place.toUpperCase()}</div><h3>${c.title}</h3><blockquote><b>${line[0]}:</b> ”${line[1]}”</blockquote><div class="dialogDots">${c.intro.map((_,i)=>`<i class="${i<=sagaReading.line?'on':''}"></i>`).join('')}</div><button class="primary" id="sagaNext">${last?'Ge dig ut →':'Nästa →'}</button><button class="outline" id="sagaClose">Senare</button></section>`;
  $('#sagaNext').onclick=()=>{if(last){sagaReading=null;activeRun={kind:'adventure',id:'saga-'+c.id};chosen=c.track;startRace()}else{sagaReading.line++;renderSaga()}};
  $('#sagaClose').onclick=()=>{sagaReading=null;renderSaga()};return;
 }
 const all=sagaDone();
 body.innerHTML=`<section class="sagaHero"><img src="assets/astrid-portrait.webp" alt="Astrid"><div><div class="eyebrow">SAGAN OM STJÄRNKRONAN</div><h3>Fem stenar, fem platser</h3><p>Stjärnkronan har tappat sina stenar. Hjälp Astrid att hitta dem i hela riket. Varje kapitel öppnar en ny plats, en ny bana och ger ett grodägg.</p>${crownHTML()}</div></section><div class="chapterList">${sagaChapters.map(c=>{const st=chapterStatus(c.id),open=chapterAvailable(c),p=storyProgress('saga-'+c.id);return `<article class="chapter ${st} ${open?'':'locked'}"><div class="chapterNum">${open?c.n:'🔒'}</div><div><div class="eyebrow">${c.place}</div><h3>${c.title}</h3><p>${!open?'Avsluta förra kapitlet för att fortsätta sagan.':st==='done'?'✓ Kapitlet är klart. '+c.gem+' lyser i kronan.':st==='race'?'Sista steget: kör ett lopp i '+trackWorlds[c.track].name+'.':p.steps?`Pågår: ${p.steps} / 6 etapper.`:c.intro[0][1]}</p>${open?st==='race'?`<button class="primary" data-chapter-race="${c.id}">Till ${trackWorlds[c.track].name} →</button>`:st==='done'?`<button class="outline" data-chapter-read="${c.id}">Läs kapitlet igen</button>`:`<button class="primary" data-chapter-read="${c.id}">${p.steps?'Fortsätt kapitlet':'Läs och ge dig ut'} →</button>`:''}</div></article>`}).join('')}${all?`<article class="chapter epilogue ${state.saga.epilogue?'done':''}"><div class="chapterNum">♛</div><div><div class="eyebrow">AVSLUTNING</div><h3>${sagaEpilogue.title}</h3><p>${state.saga.epilogue?'✓ Ni är rikets hjältar!':'Alla fem stenar är hittade. Astrid väntar på dig i slottet.'}</p><button class="primary" id="epilogue">${state.saga.epilogue?'Minns festen':'Gå till festen →'}</button></div></article>`:''}</div>`;
 document.querySelectorAll('[data-chapter-read]').forEach(b=>b.onclick=()=>{const c=sagaChapters.find(c=>c.id===b.dataset.chapterRead);if(chapterStatus(c.id)==='done'){sagaReading={id:c.id,line:0};renderSaga();return}if(storyProgress('saga-'+c.id).steps){activeRun={kind:'adventure',id:'saga-'+c.id};chosen=c.track;startRace();return}sagaReading={id:c.id,line:0};renderSaga()});
 document.querySelectorAll('[data-chapter-race]').forEach(b=>b.onclick=()=>{chosen=sagaChapters.find(c=>c.id===b.dataset.chapterRace).track;activeRun=null;tab='race';astridStart()});
 if($('#epilogue'))$('#epilogue').onclick=showEpilogue;
}
function showEpilogue(){
 const first=!state.saga.epilogue;
 if(first){state.saga.epilogue=true;state.coins+=300;state.trust+=50;grantDecoration('starcrown');save();sidebar();sfx('win')}
 const fresh=checkMedals();
 $('#advBody').innerHTML=`<section class="sagaDialog epilogueView"><div class="sagaArt">${albumArt('saga-epilogue')}</div><div class="eyebrow">AVSLUTNING</div><h3>${sagaEpilogue.title}</h3>${sagaEpilogue.text.map(t=>`<p>${t}</p>`).join('')}${first?`<ul class="rewardList"><li>+300 daggdroppar · +50 förtroende</li><li>Stjärnkronans kopia till gläntan</li>${fresh.map(m=>`<li>Medalj: ${m.icon} ${m.name}</li>`).join('')}</ul>`:''}<button class="primary" id="epilogueBack">Tillbaka till sagan</button></section>`;
 $('#epilogueBack').onclick=()=>renderSaga();
}
function renderSmallAdventures(){
 const list=storyQuests.filter(q=>!q.chapter);
 $('#advBody').innerHTML=`<div class="storyWelcome"><img src="assets/astrid-portrait.webp" alt="Astrid"><p>”Mitt rike behöver både modiga hopp och vänliga hjärtan. Ta den tid du behöver – jag tror på dig!”</p></div><div class="royalQuests">${list.map(q=>{const p=storyProgress(q.id);return `<article class="quest"><div class="storyIcon">${q.icon}</div><h3>${q.title}</h3><p>${q.intro}</p><p><strong>${p.done?'✓ Hemma igen':p.steps+' / 6 etapper'}</strong><br>${q.reward} daggdroppar · ${q.trust} förtroende<br>Gåva: ${decorations.find(d=>d.id===q.item).name}</p><button class="primary" data-story="${q.id}" ${p.done?'disabled':''}>${p.done?'Uppdrag slutfört':p.steps?'Fortsätt äventyret':'Ge dig ut →'}</button></article>`}).join('')}</div><p class="royalExplain">Ingen tidspress och inga motståndare. Sex lyckade hopp tar dig genom berättelsen. Du kan pausa och fortsätta senare.</p>`;
 document.querySelectorAll('[data-story]').forEach(b=>b.onclick=()=>{const q=storyQuests.find(q=>q.id===b.dataset.story);if(storyProgress(q.id).done)return;activeRun={kind:'adventure',id:q.id};chosen=q.route;startRace()});
}
function renderAlbum(){
 const n=albumEntries.filter(e=>albumUnlocked(e.id)).length;
 $('#advBody').innerHTML=`<p class="royalExplain">${n} av ${albumEntries.length} bilder. Varje äventyr och kapitel ger en bild – med din egen groda och älva.</p><div class="albumGrid">${albumEntries.map(e=>albumUnlocked(e.id)?`<figure class="albumPic">${albumArt(e.id)}<figcaption>${e.caption}</figcaption></figure>`:`<figure class="albumPic empty"><div>?</div><figcaption>Ännu inte upplevt</figcaption></figure>`).join('')}</div>`;
}
function renderCollections(){
 const own=state.medals||[],st=state.stickers||[];
 $('#advBody').innerHTML=`<section><div class="sectionHead"><h2>Medaljer</h2><span class="pill">${own.length} av ${medals.length}</span></div><div class="medalGrid">${medals.map(m=>`<div class="medal ${own.includes(m.id)?'won':''}"><span>${own.includes(m.id)?m.icon:'🔒'}</span><b>${m.name}</b><small>${m.desc}</small></div>`).join('')}</div></section><section class="stickerBook"><div class="sectionHead"><h2>Klistermärken</h2><span class="pill">${st.length} av ${stickers.length}</span></div><p class="royalExplain">Du kan få ett klistermärke efter varje lopp, och alltid efter ett äventyr.</p><div class="stickerGrid">${stickers.map(s=>`<div class="sticker ${st.includes(s.id)?'got':''}" title="${st.includes(s.id)?s.name:'?'}"><span>${st.includes(s.id)?s.icon:''}</span><small>${st.includes(s.id)?s.name:'?'}</small></div>`).join('')}</div></section>`;
}
