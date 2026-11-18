// More Astrid in the game (Alexander, Nov 2026): letters from Queen Astrid in the mailbox by the
// cottage, and Astrid visiting the glade one day a week. Her childhood room in Skogsdrottningen's
// castle is in slott.js.
// Letters open at the milestone "astridletters" (3 wins). A new letter comes every other day, and each
// one brings a small gift. After three letters (milestone "astridvisit") Astrid also comes to visit one
// day a week, never on a day when Skogsdrottningen visits. On a visit you can greet the frogs with her,
// invite her to fika in the cottage and open the present she brings, each once.

const ASTRID_LETTER_EVERY=2,ASTRID_GREET_BOND=2,ASTRID_FIKA_COINS=20,ASTRID_FIKA_TRUST=10;
const astridLetters=[
 {title:'Välkommen till mitt rike',en:['Welcome to my kingdom','Dear {namn}! Thank you for racing in my kingdom with {groda}. I watched you jump between the water lilies, and I held my breath all the way to the finish. Here are some dewdrops for your next race.'],text:'Kära {namn}! Tack för att du och {groda} tävlar i mitt rike. Jag satt och tittade när ni hoppade mellan näckrosorna, och jag höll andan hela vägen till mål. Här är lite daggdroppar till nästa lopp.',gift:{coins:20}},
 {title:'Pölen',en:['Pölen','Dear {namn}! When I was little I had a frog called Pölen. He liked catching flies more than jumping, so we always came last. But we had so much fun. Give {groda} an extra pat from me!'],text:'Kära {namn}! När jag var liten hade jag en groda som hette Pölen. Han tyckte mer om att fånga flugor än att hoppa, så vi kom alltid sist. Men vi hade så roligt. Ge {groda} en extra klapp från mig!',gift:{coins:15}},
 {title:'Ett hemligt tips',en:['A secret tip','Dear {namn}! Here is a secret tip from an old frog racer: watch the pointer, not the frog. When the pointer is in the middle of the green area, the jump is perfect. Try it in your next race!'],text:'Kära {namn}! Här kommer ett hemligt tips från en gammal grodtävlare: titta på visaren, inte på grodan. När visaren är mitt i det gröna fältet blir hoppet perfekt. Prova i nästa lopp!',gift:{coins:20}},
 {title:'Rosor till gläntan',en:['Roses for the glade','Dear {namn}! I am sending you a rose bush from my garden. Plant it in the glade, and I will think of you every time it blooms.'],text:'Kära {namn}! Jag skickar med en rosenbuske från min trädgård. Plantera den i gläntan, så tänker jag på er varje gång den blommar.',gift:{decor:'astridroses'}},
 {title:'Fika hos er',en:['Fika at your place','Dear {namn}! My stepmother Skogsdrottningen has told me about your mushroom cottage. She says it is the cosiest house in the whole forest. Soon I want to come for fika too!'],text:'Kära {namn}! Min styvmor Skogsdrottningen har berättat om ert svamphus. Hon säger att det är det mysigaste huset i hela skogen. Snart vill jag också komma och fika hos er!',gift:{coins:20}},
 {title:'Regnet',en:['The rain','Dear {namn}! Today it is raining all over the kingdom. I am sitting by the window counting drops. Did you know that frogs love rain? I hope {groda} gets to splash in a puddle today.'],text:'Kära {namn}! I dag regnar det i hela riket. Jag sitter i fönstret och räknar droppar. Visste du att grodor älskar regn? Jag hoppas att {groda} får plaska i en pöl i dag.',gift:{coins:15}},
 {title:'Mitt gamla rum',en:['My old room','Dear {namn}! My room from when I was little is still in Skogsdrottningen\'s castle. If you find your way there, look for Pölen\'s medal. I made it from an acorn cap.'],text:'Kära {namn}! Mitt rum från när jag var liten finns kvar i Skogsdrottningens slott. Om ni hittar dit, leta efter Pölens medalj. Den gjorde jag av en ekollonhatt.',gift:{coins:20}},
 {title:'Ett porträtt',en:['A portrait','Dear {namn}! Skogsdrottningen said that her portrait hangs in your home. Then I want to be there too! Here is a portrait of me for the mushroom cottage.'],text:'Kära {namn}! Skogsdrottningen sa att hennes porträtt hänger hos er. Då vill jag också vara med! Här är ett porträtt av mig till svamphuset.',gift:{furniture:'astridportrait'}},
 {title:'Snart kommer snön',en:['Snow is coming','Dear {namn}! I can smell snow in the air. When I was little I dug a tunnel through the snow with a soup ladle. What does {groda} think of winter?'],text:'Kära {namn}! Det luktar snö i luften. När jag var liten grävde jag en tunnel genom snön med en soppslev. Vad tycker {groda} om vintern?',gift:{coins:20}},
 {title:'Det viktigaste',en:['What matters most','Dear {namn}! You are some of the bravest racers in my whole kingdom, and I am so glad you are here. Keep jumping, and remember that what matters most is having fun.'],text:'Kära {namn}! Ni är några av de modigaste tävlarna i hela mitt rike, och jag är så glad att ni finns. Fortsätt hoppa, och kom ihåg att det viktigaste är att ha roligt.',gift:{coins:30}}
];
const astridVisitGifts=[
 {coins:40,text:'Lite guld från mitt slott, till er kassa.'},
 {decor:'astridswing',text:'En gunga till gläntan. Den hängde i min trädgård när jag var liten.'},
 {coins:50,text:'En påse daggdroppar till nästa lopp.'},
 {coins:40,text:'Lite guld från mitt slott, till er kassa.'}
];

let astridClock=null,astridOverride; // tests set these
function astridNow(){return astridClock?astridClock():typeof gameDate==='function'?gameDate():new Date()}
function astridDayNum(d=astridNow()){return Math.floor(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate())/864e5)}
function astridDayKey(d=astridNow()){return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate()}
function ensureAstrid(){state.astrid??={letters:[],letterDay:null,visit:null,visits:0,gifts:0};return state.astrid}
function astridFill(text){return String(text).replaceAll('{namn}',state.name||'Dagg').replaceAll('{groda}',state.frogName||'grodan')}

// ---------- Letters ----------
function astridLettersOpen(){return typeof unlocked!=='function'||unlocked('astridletters')}
function astridLetterWaiting(){const a=ensureAstrid();return astridLettersOpen()&&a.letters.length<astridLetters.length&&(a.letterDay==null||astridDayNum()-a.letterDay>=ASTRID_LETTER_EVERY)}
function astridGiveGift(g){
 if(g.coins)state.coins+=g.coins;
 if(g.decor&&!state.decorOwned.includes(g.decor))state.decorOwned.push(g.decor);
 if(g.furniture){if(typeof ensureHouse==='function')ensureHouse();if(!state.house.owned.includes(g.furniture))state.house.owned.push(g.furniture)}
}
function astridGiftText(g){return g.coins?`+${g.coins} daggdroppar`:g.decor?`Ny sak till gläntan: ${decorations.find(d=>d.id===g.decor)?.name||''}`:`Ny sak till svamphuset: ${houseFurniture.find(f=>f.id===g.furniture)?.name||''}`}
// Opens the next letter: gives its gift once and returns it.
function astridReadLetter(){
 if(!astridLetterWaiting())return null;
 const a=ensureAstrid(),i=a.letters.length,l=astridLetters[i];
 a.letters.push(i);a.letterDay=astridDayNum();astridGiveGift(l.gift);save();
 return {...l,n:i+1,text:astridFill(l.text)};
}
function astridLetterHTML(l,fresh){const en=typeof enLang==='function'&&enLang()&&l.en;return `<article class="astridLetter${fresh?' fresh':''}"><h4 translate="no">${en?l.en[0]:l.title}</h4><p translate="no">${astridFill(en?l.en[1]:l.text)}</p><p class="astridSign" translate="no">${en?'Love, Astrid ♛':'Kram, Astrid ♛'}</p>${fresh?`<small>${astridGiftText(l.gift)}</small>`:''}</article>`}
function astridMailHTML(){
 if(!state.hatched||!astridLettersOpen())return '';
 const a=ensureAstrid(),waiting=astridLetterWaiting();
 if(!waiting&&!a.letters.length)return '';
 return `<section class="astridMail" id="astridMail"><span class="astridMailbox" aria-hidden="true">${astridMailboxArt(waiting)}</span><div><b>${waiting?'Ett brev från Astrid har kommit!':'Brevlådan'}</b><p>${waiting?'Det ligger ett brev med kungligt sigill i brevlådan.':a.letters.length>=astridLetters.length?'Ni har läst alla Astrids brev.':'Astrid skriver ett nytt brev varannan dag.'}</p></div>${waiting?'<button class="primary" id="readAstridLetter">Läs brevet</button>':`<button class="outline" id="oldAstridLetters" aria-expanded="false">Läs gamla brev (${a.letters.length})</button>`}<div id="astridLetterBox" class="astridLetterBox"></div></section>`;
}
function astridMailboxArt(full){return `<svg viewBox="0 0 60 60"><rect x="27" y="30" width="6" height="28" fill="#8a6440"/><path d="M10 18Q10 8 22 8H38Q50 8 50 18V34H10Z" fill="#3f8a65"/><path d="M10 18Q10 8 22 8Q34 8 34 18V34H10Z" fill="#2f7a55"/>${full?'<rect x="16" y="20" width="20" height="13" rx="1" fill="#fffaf0" transform="rotate(-8 26 26)"/><circle cx="26" cy="27" r="3" fill="#c9473f"/>':''}<path d="M50 14V4H58V9H50" fill="${full?'#e85f6a':'#c9c2b4'}"/><path d="M50 4V14" stroke="#8a6440" stroke-width="1.6"/></svg>`}
function wireAstridMail(){
 if($('#readAstridLetter'))$('#readAstridLetter').onclick=()=>{const l=astridReadLetter();if(!l)return;sfx('chime');sidebar();refreshAstridMail();const box=$('#astridLetterBox');if(box)box.innerHTML=astridLetterHTML(astridLetters[l.n-1],true)};
 if($('#oldAstridLetters'))$('#oldAstridLetters').onclick=e=>{const box=$('#astridLetterBox'),open=e.currentTarget.getAttribute('aria-expanded')==='true';e.currentTarget.setAttribute('aria-expanded',String(!open));box.innerHTML=open?'':ensureAstrid().letters.slice().reverse().map(i=>astridLetterHTML(astridLetters[i],false)).join('')};
}
function refreshAstridMail(){const box=$('#astridMail');if(!box?.outerHTML)return;box.outerHTML=astridMailHTML();wireAstridMail()}

// ---------- Visits ----------
function astridVisitsOpen(){return typeof unlocked!=='function'||unlocked('astridvisit')}
// One day each Monday–Sunday week, the same for everyone, never one of Skogsdrottningen's days.
function astridVisitWeekday(d=astridNow()){
 const week=Math.floor((Date.UTC(d.getFullYear(),d.getMonth(),d.getDate())/864e5+3)/7),taken=typeof queenVisitDays==='function'?queenVisitDays(d):[];
 const free=[0,1,2,3,4,5,6].filter(x=>!taken.includes(x));return free[Math.floor(seeded('drottning-astrid'+week)()*free.length)];
}
function astridVisiting(d=astridNow()){if(astridOverride!==undefined)return astridOverride;return astridVisitsOpen()&&(d.getDay()+6)%7===astridVisitWeekday(d)}
function astridNextVisit(d=astridNow()){for(let i=1;i<=14;i++){const n=new Date(d.getFullYear(),d.getMonth(),d.getDate()+i);if((n.getDay()+6)%7===astridVisitWeekday(n))return n}return null}
function astridVisit(){const a=ensureAstrid(),day=astridDayKey();if(a.visit?.day!==day){a.visit={day,greet:false,fika:false,gift:false};a.visits++}return a.visit}
function astridGreetFrogs(){
 if(!astridVisiting())return null;const v=astridVisit();if(v.greet)return null;v.greet=true;
 if(typeof ensureFrogs==='function')ensureFrogs();
 for(const f of state.frogs||[]){if(f.id===state.activeFrog)state.bond=Math.min(100,(state.bond||0)+ASTRID_GREET_BOND);else f.bond=Math.min(100,(f.bond||0)+ASTRID_GREET_BOND)}
 save();return {frogs:(state.frogs||[]).length||1};
}
function astridInviteFika(){if(!astridVisiting())return null;const v=astridVisit();if(v.fika)return null;v.fika=true;state.coins+=ASTRID_FIKA_COINS;state.trust=(state.trust||0)+ASTRID_FIKA_TRUST;save();return {coins:ASTRID_FIKA_COINS,trust:ASTRID_FIKA_TRUST}}
function astridOpenGift(){if(!astridVisiting())return null;const a=ensureAstrid(),v=astridVisit();if(v.gift)return null;const g=astridVisitGifts[a.gifts%astridVisitGifts.length];v.gift=true;a.gifts++;astridGiveGift(g);save();return g}
function astridFikaLine(){
 const ids=(state.house?.items||[]).map(o=>o.id),has=id=>ids.includes(id);
 if(has('astridportrait'))return 'Där hänger ju jag! Och så fint jag ser ut bredvid er.';
 if(has('storybook'))return 'Min styvmors sagobok! Har ni läst om grodorna i badkaret? Det var sant, varje ord.';
 if(has('queenportrait'))return 'Min styvmor på väggen. Hon kommer att bli så glad när jag berättar.';
 if(has('teaset')&&has('table'))return 'Te vid ett riktigt svampbord. Precis så här fikade jag och Pölen.';
 if(!has('table'))return 'Jag sitter gärna på golvet, det gjorde jag jämt när jag var liten.';
 return 'Så mysigt ni har det! Får jag komma tillbaka nästa vecka?';
}
function astridFikaHTML(){if(!astridVisiting())return '';const v=ensureAstrid().visit;if(!v||v.day!==astridDayKey()||!v.fika)return '';return `<div class="queenFika astridFika"><img src="assets/astrid-portrait.webp" alt="Drottning Astrid fikar i svamphuset"><p>”${astridFikaLine()}”</p></div>`}
function astridVisitHTML(){
 if(!state.hatched||!astridVisiting())return '';const v=astridVisit();
 const btn=(id,done,label,doneLabel)=>`<button class="${done?'outline':'primary'}" id="${id}" ${done?'disabled':''}>${done?'✓ '+doneLabel:label}</button>`;
 return `<section class="queenBanner astridBanner" id="astridVisit"><img src="assets/astrid-portrait.webp" alt="Drottning Astrid"><div><b>Drottning Astrid är på besök i dag!</b><p id="astridVisitSay">”${v.greet&&v.fika&&v.gift?'Tack för en underbar dag! Vi ses nästa vecka.':'Hej allihop! Jag har längtat efter att få träffa era grodor.'}”</p></div><div class="astridActions">${btn('astridGreet',v.greet,'Hälsa på grodorna','Grodorna har hälsat')}${btn('astridFika',v.fika,'Bjud på fika','Fika i svamphuset')}${btn('astridGift',v.gift,'Öppna presenten','Presenten är öppnad')}</div></section>`;
}
function wireAstridVisit(){
 const say=t=>{const p=$('#astridVisitSay');if(p)p.textContent=t};
 if($('#astridGreet'))$('#astridGreet').onclick=()=>{const r=astridGreetFrogs();if(!r)return;sfx('chime');refreshAstridVisit();say(`”${r.frogs>1?'Vilka fina grodor ni har!':'Vilken fin groda ni har!'} Pölen hade blivit så avundsjuk.” · +${ASTRID_GREET_BOND} vänskap`)};
 if($('#astridFika'))$('#astridFika').onclick=()=>{const r=astridInviteFika();if(!r)return;sfx('chime');sidebar();refreshAstridVisit();say(`”Gärna! Jag sätter mig i svamphuset.” · +${r.coins} daggdroppar · +${r.trust} förtroende`)};
 if($('#astridGift'))$('#astridGift').onclick=()=>{const g=astridOpenGift();if(!g)return;sfx('win');sidebar();refreshAstridVisit();say(`”${g.text}” · ${astridGiftText(g)}`)};
}
function refreshAstridVisit(){const box=$('#astridVisit');if(!box?.outerHTML)return;box.outerHTML=astridVisitHTML();wireAstridVisit()}

// ---------- Things she gives ----------
if(typeof decorations!=='undefined')decorations.push({id:'astridroses',name:'Astrids rosenbuske',icon:'🌹',from:'Brev från Astrid'},{id:'astridswing',name:'Astrids gunga',icon:'🪢',from:'Gåva från Astrid'});
if(typeof extraGardenArt!=='undefined')Object.assign(extraGardenArt,{
 astridroses:'<ellipse cx="60" cy="102" rx="34" ry="6" fill="#000" opacity=".12"/><path d="M60 102V70M48 102Q46 84 40 74M72 102Q74 84 80 74" stroke="#4f7a3a" stroke-width="3" fill="none"/><g fill="#5f8f4a"><ellipse cx="44" cy="80" rx="18" ry="16"/><ellipse cx="76" cy="80" rx="18" ry="16"/><ellipse cx="60" cy="66" rx="20" ry="18"/></g><g fill="#e8879e">'+[[44,72],[60,58],[76,74],[52,86],[70,88],[62,74]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="6"/><circle cx="${x}" cy="${y}" r="2.6" fill="#c9566e"/>`).join('')+'</g>',
 astridswing:'<ellipse cx="60" cy="104" rx="40" ry="5" fill="#000" opacity=".12"/><path d="M20 104L30 12M100 104L90 12" stroke="#8a6440" stroke-width="6" stroke-linecap="round"/><path d="M26 14H94" stroke="#8a6440" stroke-width="6" stroke-linecap="round"/><path d="M44 16V76M76 16V76" stroke="#c9b48f" stroke-width="2"/><rect x="38" y="74" width="44" height="7" rx="3" fill="#3f8a65"/><g fill="#f6d36b"><circle cx="44" cy="30" r="3"/><circle cx="76" cy="44" r="3"/><circle cx="44" cy="58" r="3"/></g><g fill="#e8879e"><circle cx="76" cy="24" r="3"/><circle cx="44" cy="44" r="3"/><circle cx="76" cy="62" r="3"/></g>'
});
if(typeof houseFurniture!=='undefined')houseFurniture.push({id:'astridportrait',name:'Porträtt av drottning Astrid',gift:true,wall:true});
if(typeof extraFurnitureArt!=='undefined')extraFurnitureArt.astridportrait='<rect x="16" y="6" width="88" height="94" rx="6" fill="#d6ad48" stroke="#a8862f" stroke-width="3"/><clipPath id="astridFrame"><rect x="24" y="14" width="72" height="78" rx="3"/></clipPath><image href="assets/astrid-portrait.webp" x="4" y="8" width="112" height="84" preserveAspectRatio="xMidYMid slice" clip-path="url(#astridFrame)"/><path d="M52 2L56 8L60 0L64 8L68 2V10H52Z" fill="#f1ce69" stroke="#a8862f"/>';
if(typeof milestones!=='undefined')milestones.push(
 {id:'astridletters',name:'Brev från Astrid',where:'Gläntan',goal:'Vinn 3 lopp',count:()=>[state.wins||0,3]},
 {id:'astridvisit',name:'Astrid hälsar på',where:'Gläntan',goal:'Läs 3 brev från Astrid',count:()=>[state.astrid?.letters?.length||0,3],after:'astridletters'}
);

// ---------- Hooks ----------
if(typeof renderHome==='function'){const plain=renderHome;renderHome=function(){
 plain();const canvas=$('#gardenCanvas');if(!canvas?.insertAdjacentHTML)return;
 const top=astridVisitHTML()+astridMailHTML();if(top){const lead=document.querySelector('.gardenLead');(lead||canvas).insertAdjacentHTML(lead?'afterend':'beforebegin',top)}
 wireAstridVisit();wireAstridMail();
}}
if(typeof fikaGuestHTML==='function'){const plain=fikaGuestHTML;fikaGuestHTML=function(){return plain()+astridFikaHTML()}}
