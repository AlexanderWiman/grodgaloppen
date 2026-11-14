// Several frogs: hatch more eggs, pick who races, frogs grow through four stages,
// each personality gives a special ability, and friendship unlocks small stories.
//
// The active frog is mirrored into the old single-frog fields (state.frog, frogName,
// pattern, baseStats, personality, bond, careLog), so the rest of the game keeps working.
// syncFrogs() copies those fields back before every save.

const FROG_FIELDS=['frog','frogName','pattern','baseStats','personality','bond','careLog'];
const MAX_FROGS=6,EGG_COST=200;

const personalities={
 Modig:{ability:'Modigt språng',about:'Nyfiken på nästa stora språng och alltid redo för äventyr.',desc:s=>`Hoppar över hinder utan rädsla: +${2+s} extra daggdroppar per hinder.`,mods:s=>({surpriseDrops:2+s,hop:1+.01*s})},
 Sömnig:{ability:'Lugn andning',about:'Älskar en mjuk mossbädd och tar gärna en tupplur efter racet.',desc:s=>`Tappar mindre fart efter en miss (${Math.round((.06+.03*s)*100)} % mer fart kvar).`,mods:s=>({missSlow:.06+.03*s})},
 Busig:{ability:'Busigt skutt',about:'Gör små glädjeskutt och gömmer sig gärna bland blommorna.',desc:s=>s>=2?'Grodflow redan efter två hopp i rad, och lite längre skutt.':'Grodflow redan efter två hopp i rad.',mods:s=>({streakFrom:2,hop:s>=2?1.03:1})},
 Nyfiken:{ability:'Upptäckarögon',about:'Måste titta under varje löv och lukta på varje blomma.',desc:s=>`Ser det gröna fältet tydligare – ${Math.round((.03+.015*s)*100)} % bredare.`,mods:s=>({window:1.03+.015*s})},
 Glad:{ability:'Glädjeskutt',about:'Kvackar en liten sång varje morgon och smittar alla med sitt humör.',desc:s=>'Första bra hoppet i varje lopp blir perfekt'+(s?`, och skutten är ${s} % längre.`:'.'),mods:s=>({firstPerfect:true,hop:1+.01*s})}
};
const frogStages=[{name:'Liten groda',xp:0},{name:'Ung groda',xp:120},{name:'Stor groda',xp:350},{name:'Magisk groda',xp:800}];
// New colours unlock as a frog grows.
const frogColorsByStage=[['#88ad55','#66aaa0','#c49b57','#9c8db5'],['#cc8d9c','#82b8cf'],['#d9a441','#5fb3a0'],['#b98bd9','#e57f6b']];
const frogNames=['Pipp','Kvack','Lilja','Dunder','Sol','Bubbel','Tuva','Kvist','Mynta','Plask'];

// Friendship stories: one unlocks at 20, 40, 60, 80 and 100 friendship.
const frogStories={
 Modig:['Första natten i dammen hoppade din groda upp på den högsta stenen bara för att se hur långt bort månen var.','Era första lopp var läskiga, men din groda viskade: ”Om vi ramlar, hoppar vi igen.” Och det gjorde ni.','En dag räddade ni en liten skalbagge som fastnat i vassen. Den bor nu i gläntan och vinkar varje morgon.','Din groda drömmer om att en gång hoppa över hela Näckrosdammen i ett enda språng. Den tränar varje kväll.','”Vet du vad mod är?” frågar din groda. ”Det är att vara rädd och hoppa ändå – tillsammans med en vän.”'],
 Sömnig:['Din groda somnade på en näckros och flöt ända bort till andra sidan dammen. Den vaknade nöjd.','Varje kväll gäspar din groda tre gånger innan den lägger sig. Inte två. Inte fyra. Tre.','Din groda har en hemlig mossbädd bakom svamphuset. Du är den enda som får veta var den är.','I drömmen flyger din groda över molnen. När den vaknar berättar den allt, långsamt och mysigt.','”Det bästa med att vila”, säger din groda, ”är att man får göra det tillsammans med någon man tycker om.”'],
 Busig:['Din groda gömde sig i ett blåbärsris och skrämde Mossa. Mossa skrattade så hen fick hicka.','En gång bytte din groda plats på alla Tagges bär. Tagge letade i en timme och fick sedan en kram som tack.','Din groda har lärt sig göra en baklängesvolt. Den visar den bara när ingen annan tittar – utom du.','Under en fest i Älvbyn knöt din groda ihop Klövers skosnören. Nu är de bästa busvänner.','”Livet är roligare med lite bus”, säger din groda, ”men allra roligast med en vän som busar tillbaka.”'],
 Nyfiken:['Din groda hittade en glittrande sten och har burit den med sig sedan dess. Den kallar den ”Lilla månen”.','Varje löv i gläntan har din groda tittat under. Under det tvåhundrade bodde en mycket förvånad snigel.','Din groda vill veta varför eldflugor lyser. Pärla sa att de har stjärnor i magen. Det låter rimligt.','Ni hittade en gammal karta i Kristallgrottan. Din groda tror att den leder till Astrids allra första slott.','”Varje dag finns det något nytt att upptäcka”, säger din groda, ”och det bästa är att dela det med dig.”'],
 Glad:['Din groda kvackade en sång för Astrid. Drottningen nynnade med hela dagen efteråt.','När det regnar dansar din groda i pölarna. Varje droppe är en liten trumma.','Din groda samlar leenden. Hittills har den fått tjugosju i Älvbyn – och ett från en mycket sur kråka.','Efter ett tungt lopp sa din groda: ”Vi kom sist, men vi skrattade mest!” Det kändes som en seger.','”Glädje blir större när man delar den”, säger din groda, och delar den med dig varje dag.']
};

function frogStage(f){let s=0;frogStages.forEach((st,i)=>{if((f.xp||0)>=st.xp)s=i});return s}
function activeFrog(){ensureFrogs();return state.frogs.find(f=>f.id===state.activeFrog)||state.frogs[0]}
function activeFrogName(){return state.frogName||'Ditt team'}
function ensureFrogs(){
 if(Array.isArray(state.frogs)&&state.frogs.length)return;
 state.frogs=[{id:'f1',xp:0,hatchedAt:Date.now(),...Object.fromEntries(FROG_FIELDS.map(k=>[k,state[k]]))}];
 state.activeFrog='f1';
}
// Copy the mirrored fields of the active frog back into its entry (called from save()).
function syncFrogs(){
 if(!Array.isArray(state.frogs)||!state.frogs.length)return;
 const f=state.frogs.find(f=>f.id===state.activeFrog);if(!f)return;
 FROG_FIELDS.forEach(k=>{f[k]=Array.isArray(state[k])?[...state[k]]:state[k]&&typeof state[k]==='object'?{...state[k]}:state[k]});
}
function switchFrog(id){
 ensureFrogs();syncFrogs();
 const f=state.frogs.find(f=>f.id===id);if(!f)return false;
 state.activeFrog=id;FROG_FIELDS.forEach(k=>{state[k]=Array.isArray(f[k])?[...f[k]]:f[k]&&typeof f[k]==='object'?{...f[k]}:f[k]});
 save();return true;
}
function frogAbilityMods(){const f=activeFrog(),p=personalities[f?.personality];return p?p.mods(frogStage(f)):{}}
function frogColorChoices(){const s=frogStage(activeFrog());return frogColorsByStage.slice(0,s+1).flat()}
function unlockedStories(f){return frogStories[f.personality]?.filter((_,i)=>(f.bond||0)>=(i+1)*20)||[]}

// Experience: races, adventures and care all help a frog grow.
function frogXp(amount){
 const f=activeFrog();if(!f)return null;
 const before=frogStage(f);f.xp=(f.xp||0)+amount;const after=frogStage(f);
 if(after>before){
  state.baseStats=state.baseStats.map(v=>Math.min(85,v+4*(after-before)));
  syncFrogs();sfx('evolve');
  return `✦ ${escapeText(f.frogName)} utvecklades till <b>${frogStages[after].name}</b>! Starkare, nya färger och en kraftigare förmåga.`;
 }
 return null;
}
afterRaceHooks.push(r=>{
 const xp=10+(r.rank===1?10:r.rank===2?5:0)+r.perfect+Math.min(r.bestStreak,10);
 raceNotes.push(`${escapeText(activeFrog().frogName)} fick ${xp} erfarenhet.`);
 const evolved=frogXp(xp);if(evolved)raceNotes.push(evolved);
});

function eggCanHatch(){ensureFrogs();return state.frogs.length<MAX_FROGS&&((state.eggs||0)>0||state.coins>=EGG_COST)}
function startEgg(){
 if(!eggCanHatch()||state.newEgg)return false;
 if((state.eggs||0)>0)state.eggs--;else state.coins-=EGG_COST;
 state.newEgg={clicks:0};save();return true;
}
function crackEgg(){
 if(!state.newEgg)return null;
 state.newEgg.clicks++;
 if(state.newEgg.clicks<5){save();return null}
 const pick=a=>a[Math.floor(Math.random()*a.length)],taken=state.frogs.map(f=>f.personality),free=Object.keys(personalities).filter(p=>!taken.includes(p));
 const usedNames=state.frogs.map(f=>f.frogName),names=frogNames.filter(n=>!usedNames.includes(n));
 const f={id:'f'+(Date.now()%1e9).toString(36),xp:0,hatchedAt:Date.now(),frog:pick([...frogColorsByStage[0],...frogColorsByStage[1]]),frogName:pick(names.length?names:frogNames),pattern:pick(['plain','spots','patches']),baseStats:[0,1,2].map(()=>35+Math.floor(Math.random()*26)),personality:pick(free.length?free:Object.keys(personalities)),bond:0,careLog:{}};
 syncFrogs();state.frogs.push(f);state.newEgg=null;save();return f;
}

// ---------- UI in the Grodvän tab ----------
function frogCard(f){
 const s=frogStage(f),p=personalities[f.personality],next=frogStages[s+1],active=f.id===state.activeFrog;
 const pct=next?Math.round(((f.xp||0)-frogStages[s].xp)/(next.xp-frogStages[s].xp)*100):100;
 return `<article class="frogCard ${active?'active':''}"><div class="frogCardArt stage${s}">${miniFrog(f.frog,['','🌱','🌿','✨'][s])}</div><div class="frogCardBody"><h3>${escapeText(f.frogName)}${active?' <span class="pill">Tävlar nu</span>':''}</h3><div class="eyebrow">${frogStages[s].name} · ${f.personality}</div><p><b>${p.ability}:</b> ${p.desc(s)}</p><div class="xpBar" aria-label="Erfarenhet"><i style="width:${pct}%"></i></div><small>${next?`${f.xp||0} / ${next.xp} erfarenhet till ${next.name}`:'Fullvuxen magisk groda ✦'} · Vänskap ${f.bond||0}/100</small>${active?'':`<button class="outline" data-pick-frog="${f.id}">Låt ${escapeText(f.frogName)} tävla</button>`}</div></article>`;
}
function frogsPanelHTML(){
 ensureFrogs();syncFrogs();
 const f=activeFrog(),stories=frogStories[f.personality]||[];
 const egg=state.newEgg?`<div class="eggMini"><button class="eggButton small" id="crackEgg" aria-label="Knacka på ägget">${eggArt(state.newEgg.clicks)}</button><p>Knacka på ägget! ${state.newEgg.clicks} / 5</p></div>`:state.frogs.length>=MAX_FROGS?'<p class="royalExplain">Dammen är full – sex grodor är max.</p>':`<button class="primary" id="newEgg" ${eggCanHatch()?'':'disabled'}>${(state.eggs||0)>0?`🥚 Kläck ett ägg (${state.eggs} kvar)`:`🥚 Kläck ett nytt ägg · ${EGG_COST} ✦`}</button>`;
 return `<section class="frogsPanel"><div class="sectionHead"><h2>Dina grodor</h2><span class="pill">${state.frogs.length} av ${MAX_FROGS}</span></div><p class="royalExplain">Välj vem som tävlar. Grodor växer av lopp, äventyr och omvårdnad, och får starkare förmågor och nya färger.</p><div class="frogCards">${state.frogs.map(frogCard).join('')}</div><div class="eggArea">${egg}</div></section><section class="frogStories editor"><h3>${escapeText(genitive(f.frogName))} berättelser</h3><p>Ni låser upp en ny berättelse för varje 20 i vänskap.</p><ol>${stories.map((t,i)=>(f.bond||0)>=(i+1)*20?`<li>${t}</li>`:`<li class="lockedStory">🔒 Låses upp vid ${(i+1)*20} i vänskap</li>`).join('')}</ol></section>`;
}
function wireFrogsPanel(rerender){
 document.querySelectorAll('[data-pick-frog]').forEach(b=>b.onclick=()=>{if(switchFrog(b.dataset.pickFrog)){sidebar();rerender();toast(state.frogName+' är redo att tävla!')}});
 if($('#newEgg'))$('#newEgg').onclick=()=>{if(startEgg()){sidebar();rerender()}};
 if($('#crackEgg'))$('#crackEgg').onclick=()=>{const f=crackEgg();sfx(f?'evolve':'tick');if(f){toast(`Ett nytt grodbarn! Säg hej till ${f.frogName}.`);sidebar()}rerender()};
}
// A compact picker on the race page: who races next?
function frogPickerHTML(){ensureFrogs();if(state.frogs.length<2)return '';return `<div class="frogPicker"><span>Vem tävlar?</span><div>${state.frogs.map(f=>`<button type="button" data-pick-frog="${f.id}" aria-pressed="${f.id===state.activeFrog}">${miniFrog(f.frog)}<b>${escapeText(f.frogName)}</b></button>`).join('')}</div></div>`}

// Extra details on the big frog drawing as it grows.
function frogStageArt(){
 const s=frogStage(activeFrog());if(!s)return '';
 let art='<g fill="#fff" opacity=".6"><circle cx="186" cy="150" r="3"/><circle cx="214" cy="152" r="2"/></g><g fill="#f0a3a8" opacity=".55"><ellipse cx="182" cy="171" rx="7" ry="4"/><ellipse cx="236" cy="168" rx="6" ry="3.5"/></g>';
 if(s>=2)art+='<path d="M200 120Q206 104 212 120M214 121Q222 106 226 124" fill="none" stroke="#4f7d3a" stroke-width="4" stroke-linecap="round"/><path d="M84 166Q135 142 188 150" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="6" stroke-linecap="round"/>';
 if(s>=3)art+='<ellipse cx="140" cy="184" rx="90" ry="46" fill="none" stroke="#fff3a6" stroke-opacity=".55" stroke-width="3"/><g fill="#fff3a6"><path d="M58 146l3 8 8 3-8 3-3 8-3-8-8-3 8-3Z"/><path d="M246 112l2 6 6 2-6 2-2 6-2-6-6-2 6-2Z"/><path d="M120 128l2 5 5 2-5 2-2 5-2-5-5-2 5-2Z"/></g>';
 return art;
}
