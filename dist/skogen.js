// Survey 4, step 3: the secret forest beyond the map with the fox Ruska and the owl Hedvig, the big
// challenger Stora Gorm in the races, more stories about little Astrid, and Skogsdrottningen's rose
// garden at the castle. Milestones in progress.js open the forest (25 won races) and the challenger
// (3 won races on Mästare).

// ---------- Art ----------
function foxArt(){return '<svg viewBox="0 0 120 110" aria-hidden="true"><ellipse cx="60" cy="100" rx="34" ry="6" fill="#000" opacity=".12"/><path d="M86 86Q118 80 112 52Q106 66 92 70Z" fill="#d9733a"/><path d="M112 52Q110 62 104 66Q110 58 106 50Z" fill="#fff6ea"/><ellipse cx="62" cy="78" rx="28" ry="20" fill="#d9733a"/><path d="M48 80Q60 98 74 80Q66 70 60 70Q54 70 48 80Z" fill="#fff6ea"/><rect x="44" y="88" width="8" height="12" rx="4" fill="#5c3a24"/><rect x="66" y="88" width="8" height="12" rx="4" fill="#5c3a24"/><path d="M36 50Q34 26 46 22L54 40ZM84 50Q86 26 74 22L66 40Z" fill="#d9733a"/><path d="M40 44Q40 30 46 27L51 40ZM80 44Q80 30 74 27L69 40Z" fill="#5c3a24" opacity=".55"/><path d="M36 48Q60 30 84 48Q84 66 60 74Q36 66 36 48Z" fill="#e3843f"/><path d="M44 60Q60 80 76 60Q70 70 60 72Q50 70 44 60Z" fill="#fff6ea"/><g fill="#2a1d14"><ellipse cx="50" cy="52" rx="3" ry="3.6"/><ellipse cx="70" cy="52" rx="3" ry="3.6"/><ellipse cx="60" cy="66" rx="4" ry="3"/></g><g fill="#fff"><circle cx="51" cy="51" r="1"/><circle cx="71" cy="51" r="1"/></g></svg>'}
function owlArt(){return '<svg viewBox="0 0 120 110" aria-hidden="true"><ellipse cx="60" cy="102" rx="26" ry="5" fill="#000" opacity=".12"/><path d="M34 34L40 14L50 28ZM86 34L80 14L70 28Z" fill="#8a6446"/><ellipse cx="60" cy="62" rx="30" ry="38" fill="#9a7352"/><ellipse cx="60" cy="72" rx="20" ry="24" fill="#e8d6b4"/><g fill="#9a7352" opacity=".5"><path d="M50 66q4 3 8 0M62 66q4 3 8 0M48 76q4 3 8 0M60 76q4 3 8 0M70 76q-1 2 0 3M54 86q4 3 8 0"/></g><path d="M30 56Q24 80 40 92Q36 72 38 58ZM90 56Q96 80 80 92Q84 72 82 58Z" fill="#7d5a3d"/><circle cx="47" cy="44" r="12" fill="#f5ead2"/><circle cx="73" cy="44" r="12" fill="#f5ead2"/><circle cx="47" cy="44" r="7" fill="#e2a73a"/><circle cx="73" cy="44" r="7" fill="#e2a73a"/><circle cx="47" cy="44" r="4" fill="#2a1d14"/><circle cx="73" cy="44" r="4" fill="#2a1d14"/><g fill="#fff"><circle cx="49" cy="42" r="1.5"/><circle cx="75" cy="42" r="1.5"/></g><path d="M56 52L60 60L64 52Z" fill="#e2a73a"/><path d="M50 100h6M64 100h6" stroke="#e2a73a" stroke-width="3" stroke-linecap="round"/></svg>'}
function gormArt(){return '<svg viewBox="0 0 120 100" aria-hidden="true"><ellipse cx="60" cy="92" rx="52" ry="7" fill="#000" opacity=".14"/><ellipse cx="60" cy="66" rx="50" ry="26" fill="#4d6b3a"/><ellipse cx="60" cy="76" rx="32" ry="12" fill="#c9d39a"/><circle cx="36" cy="38" r="15" fill="#4d6b3a"/><circle cx="84" cy="38" r="15" fill="#4d6b3a"/><circle cx="36" cy="37" r="9" fill="#f6f1c8"/><circle cx="84" cy="37" r="9" fill="#f6f1c8"/><circle cx="38" cy="38" r="4.5" fill="#1f2a1c"/><circle cx="86" cy="38" r="4.5" fill="#1f2a1c"/><path d="M26 28L30 31M94 28L90 31" stroke="#1f2a1c" stroke-width="3" stroke-linecap="round"/><path d="M34 66Q60 80 86 66" fill="none" stroke="#1f2a1c" stroke-width="3" stroke-linecap="round"/><g fill="#3b5530" opacity=".6"><circle cx="30" cy="58" r="4"/><circle cx="92" cy="60" r="5"/><circle cx="74" cy="52" r="3"/></g><path d="M44 22L42 8 52 15 60 4 68 15 78 8 76 22Z" fill="#e2b94b" stroke="#a8822a" stroke-width="1.5"/><circle cx="60" cy="16" r="2.6" fill="#c9473f"/></svg>'}

// ---------- The secret forest: Hedvig's riddle and Ruska's hide-and-seek ----------
const FOREST_HEARTS=5,RIDDLE_COINS=25,RIDDLE_RETRY_COINS=10,HIDE_COINS=20,HIDE_TRIES=3;
const owlRiddles=[
 {q:'Jag har tänder men kan inte bita. Vad är jag?',a:['En kam','En katt','En sko'],right:0},
 {q:'Ju mer jag torkar, desto blötare blir jag. Vad är jag?',a:['En sol','En handduk','En vind'],right:1},
 {q:'Jag har ett öga men kan inte se. Vad är jag?',a:['En nål','En uggla','En fisk'],right:0},
 {q:'Jag springer hela dagen men har inga ben. Vad är jag?',a:['En snigel','En stol','En bäck'],right:2},
 {q:'Jag bär mitt hus på ryggen överallt. Vem är jag?',a:['Snigeln','Räven','Grodan'],right:0},
 {q:'Grön utanpå, röd inuti och full av svarta prickar. Vad är jag?',a:['En gurka','En vattenmelon','En nyckelpiga'],right:1},
 {q:'Jag har blad men är inget träd. Vad är jag?',a:['En svamp','En bok','En sten'],right:1},
 {q:'Jag har tangenter men kan inte låsa upp en enda dörr. Vad är jag?',a:['Ett piano','En nyckelknippa','En mus'],right:0},
 {q:'Jag följer efter dig hela dagen men försvinner när det blir mörkt. Vad är jag?',a:['En katt','Din skugga','En fjäril'],right:1},
 {q:'Vit som mjöl, faller utan ljud och smälter i handen. Vad är jag?',a:['Snö','Socker','Moln'],right:0},
 {q:'Jag har en hals men inget huvud. Vad är jag?',a:['En orm','En flaska','En svan'],right:1},
 {q:'Jag lyser på natten men är ingen lampa, och jag blir rund en gång i månaden. Vad är jag?',a:['Månen','En eldfluga','En stjärna'],right:0}
];
const foxSpots=[{id:'bush',name:'Bärbusken',x:16,y:70},{id:'log',name:'Den ihåliga stocken',x:38,y:84},{id:'rock',name:'Mossstenen',x:30,y:58},{id:'stump',name:'Stubben',x:60,y:76},{id:'ferns',name:'Ormbunkarna',x:80,y:82},{id:'roots',name:'Under rötterna',x:86,y:66}];
function forestDayNum(d=typeof gameDate==='function'?gameDate():new Date()){return Math.floor(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate())/864e5)}
function forestDay(){return typeof todayKey==='function'?todayKey():new Date().toDateString()}
function ensureForest(){
 if(!state.forest)state.forest={owl:0,fox:0,riddleDay:null,riddleTries:0,riddleSolved:false,hideDay:null,hideTries:0,hideFound:false,hideSpot:null,gifts:[]};
 const f=state.forest,today=forestDay();
 if(f.riddleDay!==today){f.riddleDay=today;f.riddleTries=0;f.riddleSolved=false}
 if(f.hideDay!==today){f.hideDay=today;f.hideTries=0;f.hideFound=false;f.hideSpot=foxSpots[Math.floor(Math.random()*foxSpots.length)].id}
 return f;
}
function todaysRiddle(){return owlRiddles[forestDayNum()%owlRiddles.length]}
// Hearts make friends. At five hearts the animal moves a little home into the glade.
function forestHeart(who){const f=ensureForest();if(f[who]>=FOREST_HEARTS)return null;f[who]++;let gift=null;if(f[who]===FOREST_HEARTS){gift=who==='owl'?'owlhouse':'foxden';if(!state.decorOwned.includes(gift))state.decorOwned.push(gift)}return gift}
function answerRiddle(i){
 const f=ensureForest();if(f.riddleSolved)return null;const r=todaysRiddle();f.riddleTries++;
 if(i!==r.right){save();return {right:false}}
 f.riddleSolved=true;const coins=f.riddleTries===1?RIDDLE_COINS:RIDDLE_RETRY_COINS;state.coins+=coins;const gift=forestHeart('owl');save();return {right:true,coins,gift};
}
function lookForFox(spot){
 const f=ensureForest();if(f.hideFound||f.hideTries>=HIDE_TRIES||!foxSpots.some(s=>s.id===spot))return null;f.hideTries++;
 if(spot!==f.hideSpot){save();return {found:false,left:HIDE_TRIES-f.hideTries}}
 f.hideFound=true;state.coins+=HIDE_COINS;const gift=forestHeart('fox');save();return {found:true,coins:HIDE_COINS,gift};
}
function forestSceneSVG(){return `<svg class="forestBackdrop" viewBox="0 0 1000 600" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="forestSky" x2="0" y2="1"><stop stop-color="#1f4a44"/><stop offset=".6" stop-color="#3d6e55"/><stop offset="1" stop-color="#4f7a4c"/></linearGradient></defs><rect width="1000" height="600" fill="url(#forestSky)"/><g fill="#fff6c7" opacity=".09"><path d="M420 0L300 600H420L520 0Z"/><path d="M640 0L600 600H700L700 0Z"/></g><g fill="#183b33" opacity=".7">${[60,180,330,520,700,860,960].map((x,i)=>`<rect x="${x}" y="0" width="${26+i%3*10}" height="600"/>`).join('')}</g><g fill="#173a30"><circle cx="40" cy="10" r="90"/><circle cx="200" cy="-20" r="110"/><circle cx="400" cy="10" r="80"/><circle cx="560" cy="-10" r="100"/><circle cx="760" cy="0" r="110"/><circle cx="950" cy="20" r="90"/></g><g fill="#2c5640" opacity=".8"><circle cx="120" cy="40" r="60"/><circle cx="320" cy="30" r="70"/><circle cx="660" cy="50" r="70"/><circle cx="880" cy="40" r="60"/></g><path d="M0 380Q250 330 500 370T1000 350V600H0Z" fill="#3f6b45"/><path d="M0 470Q300 420 600 460T1000 440V600H0Z" fill="#4c7a4d"/><g fill="#2c5640">${[[90,0,70],[250,0,90],[610,0,80],[800,0,96]].map(([x,y,w])=>`<rect x="${x}" y="${y}" width="${w}" height="420" rx="10"/>`).join('')}</g><g fill="#24493a"><path d="M800 420Q790 470 760 500H900Q870 470 866 420Z"/><ellipse cx="848" cy="250" rx="22" ry="34" fill="#162e25"/></g><g fill="#a7cf9a" opacity=".16"><ellipse cx="200" cy="420" rx="260" ry="26"/><ellipse cx="760" cy="470" rx="300" ry="30"/></g><g>${[[150,520],[470,560],[900,520],[330,500]].map(([x,y])=>`<path d="M${x-16} ${y}Q${x-8} ${y-26} ${x} ${y-4}Q${x+8} ${y-26} ${x+16} ${y}Z" fill="#c96c5e"/><rect x="${x-3}" y="${y}" width="6" height="12" fill="#f4e4c1"/>`).join('')}</g><g fill="#fff3a0">${[[120,200],[380,140],[560,260],[720,180],[930,300],[260,330]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="3" class="forestGlow"/>`).join('')}</g></svg>`}
function foxSpotArt(id){return {bush:'<ellipse cx="60" cy="70" rx="52" ry="34" fill="#3f7a46"/><ellipse cx="40" cy="58" rx="28" ry="22" fill="#4f8f52"/><ellipse cx="80" cy="56" rx="26" ry="20" fill="#4f8f52"/><g fill="#c9473f"><circle cx="34" cy="62" r="4"/><circle cx="58" cy="50" r="4"/><circle cx="84" cy="66" r="4"/><circle cx="70" cy="80" r="4"/></g>',log:'<rect x="8" y="58" width="104" height="34" rx="17" fill="#7b5638"/><ellipse cx="104" cy="75" rx="12" ry="17" fill="#3a2a1c"/><ellipse cx="104" cy="75" rx="7" ry="11" fill="#2a1d14"/><path d="M20 66H90M24 80H84" stroke="#5c3a24" stroke-width="2"/><ellipse cx="40" cy="58" rx="16" ry="5" fill="#6aa060"/>',rock:'<path d="M14 92Q8 52 46 40Q86 30 104 66Q112 92 96 96H20Z" fill="#8a948a"/><path d="M30 50Q60 34 92 56Q70 44 44 48Z" fill="#6aa060"/>',stump:'<path d="M26 96L32 50H88L94 96Z" fill="#7b5638"/><ellipse cx="60" cy="50" rx="28" ry="9" fill="#c9a06a"/><ellipse cx="60" cy="50" rx="16" ry="5" fill="none" stroke="#9a6f3e" stroke-width="2"/><path d="M20 96Q30 84 40 96M80 96Q90 84 100 96" fill="#7b5638"/>',ferns:[0,1,2,3,4].map(i=>`<path d="M60 98Q${20+i*20} ${40+(i%2)*10} ${8+i*26} ${30+(i%3)*8}" stroke="#4f8f52" stroke-width="7" fill="none" stroke-linecap="round"/>`).join(''),roots:'<path d="M10 96Q30 60 50 70Q60 40 70 70Q90 58 110 96Z" fill="#5c3a24"/><path d="M40 96Q50 78 60 80Q70 78 80 96Z" fill="#2a1d14"/>'}[id]}
function renderForest(){
 const head=`<div class="sectionHead"><div><div class="eyebrow">BORTOM KARTAN</div><h2>Den hemliga skogen</h2></div></div>`;
 if(typeof unlocked==='function'&&!unlocked('secretforest')){$('#content').innerHTML=head+(typeof lockedHint==='function'?lockedHint('secretforest'):'');return}
 const f=ensureForest(),r=todaysRiddle(),hearts=n=>'♥'.repeat(n)+'♡'.repeat(FOREST_HEARTS-n);
 const spots=foxSpots.map(s=>{const show=(f.hideFound||f.hideTries>=HIDE_TRIES)&&s.id===f.hideSpot;return `<button class="foxSpot ${show?'found':''}" data-fox-spot="${s.id}" style="left:${s.x}%;top:${s.y}%" aria-label="${show?'Där är Ruska!':'Titta: '+s.name}" ${f.hideFound||f.hideTries>=HIDE_TRIES?'disabled':''}><svg viewBox="0 0 120 110" aria-hidden="true">${foxSpotArt(s.id)}</svg>${show?`<span class="foxPeek">${foxArt()}</span>`:''}</button>`}).join('');
 $('#content').innerHTML=`${head}<p class="forestLead">Bakom de sista träden på kartan finns en stig som bara grodor hittar. Här bor räven Ruska och ugglan Hedvig.</p><section class="forestScene">${forestSceneSVG()}<button class="forestOwl" id="forestOwl" aria-label="Ugglan Hedvig">${owlArt()}</button>${spots}</section>
<div class="forestCards"><article class="quest forestCard"><div class="forestWho"><span class="forestFace">${owlArt()}</span><div><div class="eyebrow">UGGLAN HEDVIG</div><h3>Dagens gåta</h3><span class="forestHearts" aria-label="${f.owl} av ${FOREST_HEARTS} hjärtan">${hearts(f.owl)}</span></div></div>${f.riddleSolved?'<p>”Hoo! Rätt svar. Kom tillbaka i morgon, då har jag en ny gåta.”</p>':`<p class="riddle">”${r.q}”</p><div class="riddleAnswers">${r.a.map((a,i)=>`<button class="outline" data-riddle="${i}">${a}</button>`).join('')}</div>`}<p id="riddleStatus" class="forestStatus" role="status"></p></article>
<article class="quest forestCard"><div class="forestWho"><span class="forestFace">${foxArt()}</span><div><div class="eyebrow">RÄVEN RUSKA</div><h3>Kurragömma</h3><span class="forestHearts" aria-label="${f.fox} av ${FOREST_HEARTS} hjärtan">${hearts(f.fox)}</span></div></div><p>${f.hideFound?'”Du hittade mig! Vi leker igen i morgon.”':f.hideTries>=HIDE_TRIES?'”Haha, där var jag! Vi leker igen i morgon.”':`<span>”Jag har gömt mig i skogen. Hitta mig på ${HIDE_TRIES} försök!”</span> <span>Tryck på ett gömställe i bilden.</span>`}</p><p class="forestTries">${f.hideFound||f.hideTries>=HIDE_TRIES?'':`Försök kvar: ${HIDE_TRIES-f.hideTries}`}</p><p id="foxStatus" class="forestStatus" role="status"></p></article></div>
<p class="forestNote">Med ${FOREST_HEARTS} hjärtan blir djuren era vänner och flyttar in ett litet hem i gläntan.</p>`;
 const giftText=g=>g==='owlhouse'?' · Hedvig flyttar in en uggleholk i gläntan!':g==='foxden'?' · Ruska gräver en lya i gläntan!':'';
 document.querySelectorAll('[data-riddle]').forEach(b=>b.onclick=()=>{const res=answerRiddle(+b.dataset.riddle);if(!res)return;if(!res.right){sfx('miss');b.disabled=true;$('#riddleStatus').textContent='”Hoo, inte riktigt. Försök igen!”';return}sfx('chime');sidebar();renderForest();$('#riddleStatus').textContent=`Rätt svar · +${res.coins} daggdroppar · +1 hjärta${giftText(res.gift)}`;if(res.gift)toast('Hedvig är er vän!')});
 document.querySelectorAll('[data-fox-spot]').forEach(b=>b.onclick=()=>{const res=lookForFox(b.dataset.foxSpot);if(!res)return;if(!res.found){sfx('miss');b.disabled=true;b.classList.add('empty');$('#foxStatus').textContent=res.left?'Inte här! '+res.left+' försök kvar.':'Ingen räv här…';if(!res.left)renderForest();return}sfx('win');sidebar();renderForest();$('#foxStatus').textContent=`Där är Ruska · +${res.coins} daggdroppar · +1 hjärta${giftText(res.gift)}`;if(res.gift)toast('Ruska är er vän!')});
 $('#forestOwl').onclick=()=>{sfx('tick');toast('Hoo-hoo! Hedvig har en gåta åt er.');document.querySelector('.forestCard')?.scrollIntoView?.({behavior:'smooth',block:'center'})};
}
if(typeof decorations!=='undefined')decorations.push({id:'owlhouse',name:'Hedvigs uggleholk',icon:'🦉',from:'Bli vän med ugglan Hedvig'},{id:'foxden',name:'Ruskas lya',icon:'🦊',from:'Bli vän med räven Ruska'},{id:'gormcup',name:'Gorms pokal',icon:'🏆',from:'Besegra Stora Gorm'},{id:'emeraldrose',name:'Smaragdrosen',icon:'🌹',from:'Få alla rosor på slottet att blomma'});
if(typeof extraGardenArt!=='undefined')Object.assign(extraGardenArt,{
 owlhouse:'<path d="M60 108V54" stroke="#7b5638" stroke-width="6"/><path d="M30 44L60 14L90 44Z" fill="#7b5638"/><rect x="36" y="42" width="48" height="40" rx="4" fill="#c9a06a"/><circle cx="60" cy="60" r="11" fill="#2a1d14"/><g transform="translate(46 46) scale(.24)">'+owlArt().replace(/<\/?svg[^>]*>/g,'')+'</g>',
 foxden:'<ellipse cx="60" cy="92" rx="54" ry="14" fill="#8a6a4c"/><path d="M8 92Q20 30 60 28Q100 30 112 92Z" fill="#6aa060"/><path d="M34 92Q36 56 60 54Q84 56 86 92Z" fill="#2a1d14"/><g transform="translate(38 58) scale(.38)">'+foxArt().replace(/<\/?svg[^>]*>/g,'')+'</g>',
 gormcup:'<ellipse cx="60" cy="100" rx="30" ry="6" fill="#000" opacity=".12"/><rect x="40" y="86" width="40" height="12" rx="3" fill="#7b5638"/><path d="M50 86V74H70V86Z" fill="#d9b24c"/><path d="M30 20H90Q90 66 60 72Q30 66 30 20Z" fill="#e2b94b" stroke="#a8822a" stroke-width="2"/><path d="M30 28Q12 30 18 46Q24 56 36 54M90 28Q108 30 102 46Q96 56 84 54" fill="none" stroke="#e2b94b" stroke-width="5"/><g transform="translate(42 26) scale(.3)">'+gormArt().replace(/<\/?svg[^>]*>/g,'')+'</g>',
 emeraldrose:'<path d="M60 104V50" stroke="#3f7a46" stroke-width="5"/><path d="M60 80Q40 70 34 82Q48 90 60 84ZM60 70Q80 60 86 72Q72 80 60 74Z" fill="#4f8f52"/><circle cx="60" cy="40" r="24" fill="#2f9a7a"/><path d="M46 40Q60 18 74 40Q60 54 46 40Z" fill="#46b892"/><path d="M52 40Q60 28 68 40Q60 48 52 40Z" fill="#7fd6b6"/><circle cx="60" cy="40" r="4" fill="#e9fff6"/>'
});

// ---------- Stora Gorm: the big challenger ----------
// A huge old bullfrog takes Mossa's place in a race on Mästare. He keeps a steady, strong pace.
// Beating him (first place) the first time gives Gorm's cup for the glade and 150 dewdrops.
const GORM_FIRST_COINS=150;
const gormRival={name:'Stora Gorm',color:'#4d6b3a',style:'Väldiga skutt',pace:()=>1.15,hat:'👑',
 bio:'Den största grodan i hela skogen. Han har vunnit varje lopp i hundra somrar och väntar på någon som kan slå honom.',
 lines:{start:'Hrrm. Så du vill utmana mig?',passed:'Hrrm?! Ingen har gått om mig på länge!',passes:'Hrrm. Försök hänga med.',sprint:'Nu tar jag i, hrrm!',win:'Hrrm. Kom tillbaka när du har tränat.',lose:'Hrrm… Du är den första som slår mig. Bra hoppat!'}};
// Kept out of `difficulties` so it never shows as a choice in the difficulty picker.
const gormDifficulty={label:'Mot Stora Gorm',rival:difficulties.master.rival,reward:2};
function challengeRivals(){return [rivals[0],gormRival,rivals[2]]}
function ensureGorm(){if(!state.gorm)state.gorm={tries:0,wins:0};return state.gorm}
afterRaceHooks.push(r=>{
 if(r.rank===1&&r.difficulty==='master'&&!r.challenge)state.masterWins=(state.masterWins||0)+1;
 if(!r.challenge)return;const g=ensureGorm();g.tries++;
 if(r.rank===1){g.wins++;if(g.wins===1){state.coins+=GORM_FIRST_COINS;if(!state.decorOwned.includes('gormcup'))state.decorOwned.push('gormcup');raceNotes.push('🏆 Du besegrade Stora Gorm! Gorms pokal står nu i gläntan · +'+GORM_FIRST_COINS+' daggdroppar')}else raceNotes.push('🏆 Stora Gorm är besegrad igen!')}
 else raceNotes.push('Stora Gorm vann den här gången. Försök igen!');
});
function challengerHTML(){
 if(!state.hatched||typeof unlocked!=='function'||!unlocked('challenger'))return '';const g=ensureGorm();
 return `<section class="gormCard"><span class="gormFace">${gormArt()}</span><div><div class="eyebrow">DEN STORA UTMANAREN</div><h3>Stora Gorm utmanar dig!</h3><p>${g.wins?`Du har slagit honom ${g.wins} ${g.wins===1?'gång':'gånger'}. Han vill ha revansch.`:'Han har inte förlorat på hundra somrar.'}</p><p><span>Banan</span>: <span>${races[chosen].name}</span> · <span>${gormDifficulty.label}</span></p><button class="primary" id="gormGo">Anta utmaningen</button></div></section>`;
}

// ---------- More stories about little Astrid ----------
astridStories.push(
 {title:'Snigelloppet',text:'Astrid ordnade ett lopp för sniglar på slottstrappan. Hon målade små nummer på deras skal med blåbärssaft och hejade så högt att hela slottet vaknade. Loppet tog hela eftermiddagen. Alla sniglar fick en medalj av ett ekollonlock.'},
 {title:'Det första snöfallet',text:'Den första gången det snöade sprang Astrid ut i bara nattlinnet och försökte fånga snöflingor på tungan. ”De smakar moln!” ropade hon. Sedan satt vi vid brasan med varm blåbärssoppa tills tårna slutade frysa.'},
 {title:'Den borttappade kronan',text:'En morgon var Astrids lilla krona borta. Hela slottet letade. Till slut hittade vi den i ett skatbo högt uppe i eken. Skatan hade bara lånat den, sa Astrid, och hon lät skatan behålla en glittrande knapp i stället.'},
 {title:'Astrid och vinden',text:'Astrid ville flyga. Hon band fast två stora kålblad på armarna och hoppade från en liten sten om och om igen. Hon flög inte, men vinden tog tag i bladen och snurrade henne runt tills hon skrattade så att hon ramlade i gräset.'},
 {title:'Grodkören',text:'En sommar lärde Astrid grodorna i vallgraven att sjunga. Varje kväll ställde hon sig på bryggan och dirigerade med en vasspinne. De sjöng inte riktigt i takt, men det var den vackraste kören jag har hört.'},
 {title:'Det hemliga rummet',text:'Astrid hittade en dörr bakom en gobeläng som ingen hade öppnat på länge. Bakom den låg ett litet rum fullt av gamla leksaker från när jag själv var liten. Vi lekte där hela regniga dagen, och det är fortfarande vårt hemliga rum.'}
);

// ---------- Skogsdrottningen's rose garden at the castle ----------
// Five rose bushes. Water one bush a day; after three waterings it blooms (30 dewdrops). When all
// five bloom, the queen gives the emerald rose for the glade.
const castleRoses=[{id:'red',name:'Röda rosen',color:'#c9473f'},{id:'white',name:'Vita rosen',color:'#f7f4ec'},{id:'pink',name:'Rosa rosen',color:'#f29bb5'},{id:'gold',name:'Gyllene rosen',color:'#e2b94b'},{id:'blue',name:'Blå rosen',color:'#7fb4dd'}];
const ROSE_WATERINGS=3,ROSE_COINS=30;
function ensureRoses(){const q=ensureCastle();if(!q.roses)q.roses={water:[0,0,0,0,0],day:null,done:false};return q.roses}
function roseCanWater(){const q=ensureCastle(),r=ensureRoses();return q.castle&&r.day!==queenDay()&&r.water.some(n=>n<ROSE_WATERINGS)}
function waterRose(i){
 if(!roseCanWater()||!Number.isInteger(i)||i<0||i>=castleRoses.length)return null;const r=ensureRoses();if(r.water[i]>=ROSE_WATERINGS)return null;
 r.water[i]++;r.day=queenDay();const bloom=r.water[i]===ROSE_WATERINGS;if(bloom)state.coins+=ROSE_COINS;
 let all=false;if(bloom&&!r.done&&r.water.every(n=>n>=ROSE_WATERINGS)){r.done=true;all=true;if(!state.decorOwned.includes('emeraldrose'))state.decorOwned.push('emeraldrose')}
 save();return {bloom,all,rose:castleRoses[i]};
}
function roseArt(rose,n){const grown=n/ROSE_WATERINGS;return `<svg viewBox="0 0 60 80" aria-hidden="true"><ellipse cx="30" cy="74" rx="20" ry="5" fill="#7b5638"/><path d="M30 74V${60-grown*26}" stroke="#3f7a46" stroke-width="3"/>${[0,1].map(k=>`<ellipse cx="${k?36:24}" cy="${66-grown*14}" rx="6" ry="3" fill="#4f8f52" transform="rotate(${k?-30:30} ${k?36:24} ${66-grown*14})"/>`).join('')}${n>=ROSE_WATERINGS?`<circle cx="30" cy="28" r="12" fill="${rose.color}" stroke="#00000022"/><path d="M22 28Q30 14 38 28Q30 36 22 28Z" fill="#fff" opacity=".35"/><circle cx="30" cy="28" r="3" fill="#00000022"/>`:n>0?`<ellipse cx="30" cy="${58-grown*26}" rx="4" ry="6" fill="${rose.color}" stroke="#3f7a46" stroke-width="1.5"/>`:''}</svg>`}
function castleRosesHTML(){
 const q=ensureCastle();if(!q.castle)return '';const r=ensureRoses(),can=roseCanWater();
 return `<article class="quest castleRoses"><div class="eyebrow">DROTTNINGENS ROSENTRÄDGÅRD</div><h3>${r.done?'Alla rosor blommar':'Vattna en ros om dagen'}</h3><p>${r.done?'”Så vackert det har blivit! Smaragdrosen står nu i er glänta.”':'”Mina rosor törstar. Vattna en buske om dagen, så blommar den efter tre gånger.”'}</p><div class="roseRow">${castleRoses.map((rose,i)=>`<button class="roseBush" data-rose="${i}" ${can&&r.water[i]<ROSE_WATERINGS?'':'disabled'} aria-label="${rose.name}: ${r.water[i]>=ROSE_WATERINGS?'blommar':r.water[i]+' av '+ROSE_WATERINGS+' gånger vattnad'}">${roseArt(rose,r.water[i])}<small>${r.water[i]>=ROSE_WATERINGS?'Blommar':r.water[i]+'/'+ROSE_WATERINGS}</small></button>`).join('')}</div><p id="roseStatus" class="forestStatus" role="status">${!r.done&&!can?'Ni har vattnat i dag. Kom tillbaka i morgon!':''}</p></article>`;
}

// ---------- Hooks ----------
if(typeof renderCastle==='function'){const plain=renderCastle;renderCastle=function(){plain();document.querySelectorAll('[data-rose]').forEach(b=>b.onclick=()=>{const res=waterRose(+b.dataset.rose);if(!res)return;sfx(res.bloom?'win':'tick');sidebar();renderCastle();const s=$('#roseStatus');if(s)s.textContent=res.all?'Alla rosor blommar! Smaragdrosen står nu i gläntan.':res.bloom?res.rose.name+' blommar! · +'+ROSE_COINS+' daggdroppar':res.rose.name+' fick vatten.'})}}
if(typeof renderRaceTab==='function'){const plain=renderRaceTab;renderRaceTab=function(c){plain(c);const b=$('#gormGo');if(b)b.onclick=()=>{activeRun={kind:'challenge'};astridStart()}}}
