// Seasons that follow the calendar, a festival in Älvbyn each season, a wardrobe for the
// fairy and the frogs, more garden things, and a small daily surprise (no streaks, no pressure).

// ---------- Seasons ----------
const seasons={
 spring:{name:'Våren',label:'Blomstersprånget',fall:'🌸',festival:{name:'Blomsterfesten',icon:'🌷',item:'tulips',text:'Hela byn smyckas med blommor och alla dansar runt blomsterstången.'}},
 summer:{name:'Sommaren',label:'Den långa ljusa',fall:'✦',festival:{name:'Sommarmarknaden',icon:'🍓',item:'parasol',text:'Torget fylls av stånd med jordgubbar, saft och glada sånger i solen.'}},
 autumn:{name:'Hösten',label:'Lövdansen',fall:'🍂',festival:{name:'Lyktfesten',icon:'🏮',item:'pumpkin',text:'När mörkret kommer tänder alla sina lyktor och vandrar runt dammen.'}},
 winter:{name:'Vintern',label:'Snöstjärnetiden',fall:'❄',festival:{name:'Snöstjärnefesten',icon:'⛄',item:'snowman',text:'Alla bygger snögubbar och dricker varm blåbärssoppa under stjärnorna.'}}
};
function seasonFor(date){const m=date.getMonth();return m>=2&&m<=4?'spring':m>=5&&m<=7?'summer':m>=8&&m<=10?'autumn':'winter'}
function currentSeason(){return seasonFor(new Date())}
function seasonKey(){const d=new Date(),s=seasonFor(d);return s+'-'+(s==='winter'&&d.getMonth()<2?d.getFullYear()-1:d.getFullYear())}
function applySeason(){
 const s=currentSeason();if(document.body?.dataset)document.body.dataset.season=s;
 const label=$('#seasonLabel');if(label)label.textContent=seasons[s].name+' · '+seasons[s].label;
}
function seasonOverlayHTML(){const s=seasons[currentSeason()];return `<div class="seasonFall" aria-hidden="true">${Array.from({length:12},(_,i)=>`<i style="left:${4+i*8}%;animation-delay:${(i*1.3)%7}s;animation-duration:${7+(i%4)*2}s">${s.fall}</i>`).join('')}</div>`}

// ---------- Festival in Älvbyn ----------
const festivalTasks=[
 {id:'berries',text:'Ta med tre bär till festbordet',icon:'🍓'},
 {id:'races',text:'Kör två lopp medan byn förbereder festen',icon:'🏁'},
 {id:'decorate',text:'Pynta torget (30 daggdroppar)',icon:'🎀'}
];
function festival(){state.festivals=state.festivals||{};const k=seasonKey();if(!state.festivals[k])state.festivals[k]={berries:false,races:0,decorate:false,done:false};return state.festivals[k]}
function festivalTaskDone(f,id){return id==='races'?f.races>=2:!!f[id]}
function festivalReady(){const f=festival();return !f.done&&festivalTasks.every(t=>festivalTaskDone(f,t.id))}
function festivalBerries(){const f=festival();if(f.berries||!state.garden||state.garden.berries<3)return false;state.garden.berries-=3;f.berries=true;save();return true}
function festivalDecorate(){const f=festival();if(f.decorate||state.coins<30)return false;state.coins-=30;f.decorate=true;save();return true}
function celebrateFestival(){
 if(!festivalReady())return false;
 const f=festival(),fest=seasons[currentSeason()].festival;
 f.done=true;state.coins+=60;grantDecoration(fest.item);
 const s=typeof grantSticker==='function'?grantSticker(true):null;save();return {fest,sticker:s};
}
afterRaceHooks.push(()=>{const f=festival();if(!f.done&&f.races<2){f.races++;if(f.races===2)raceNotes.push('🎀 Byn har nästan förberett '+seasons[currentSeason()].festival.name+'!')}});
function festivalHTML(){
 const f=festival(),s=seasons[currentSeason()],fest=s.festival;
 if(f.done)return `<section class="festival done"><div class="festIcon">${fest.icon}</div><div><div class="eyebrow">${s.name.toUpperCase()} I ÄLVBYN</div><h3>${fest.name} är firad!</h3><p>${fest.text} Nästa fest kommer när årstiden byts.</p></div></section>`;
 return `<section class="festival"><div class="festIcon">${fest.icon}</div><div><div class="eyebrow">${s.name.toUpperCase()} I ÄLVBYN</div><h3>Snart: ${fest.name}</h3><p>${fest.text} Hjälp byn att förbereda!</p><ul class="festTasks">${festivalTasks.map(t=>`<li class="${festivalTaskDone(f,t.id)?'ok':''}">${festivalTaskDone(f,t.id)?'✓':t.icon} ${t.text}${t.id==='races'?` (${Math.min(2,f.races)}/2)`:''}</li>`).join('')}</ul><div class="festActions">${f.berries?'':`<button class="outline" id="festBerries" ${state.garden?.berries>=3?'':'disabled'}>Ge 3 bär</button>`}${f.decorate?'':`<button class="outline" id="festDecorate" ${state.coins>=30?'':'disabled'}>Pynta · 30 ✦</button>`}<button class="primary" id="festStart" ${festivalReady()?'':'disabled'}>Starta festen!</button></div></div></section>`;
}
function wireFestival(){
 if($('#festBerries'))$('#festBerries').onclick=()=>{if(festivalBerries()){renderVillage();toast('Bären står på festbordet!')}};
 if($('#festDecorate'))$('#festDecorate').onclick=()=>{if(festivalDecorate()){sidebar();renderVillage();toast('Torget glittrar av girlanger!')}};
 if($('#festStart'))$('#festStart').onclick=()=>{const r=celebrateFestival();if(!r)return;sidebar();setMusic('festival');sfx('win');
  $('#content').innerHTML=`<section class="festParty"><div class="confetti" aria-hidden="true">${Array.from({length:18},(_,i)=>`<i style="left:${i*5.5}%;animation-delay:${i*.15}s">${['🎉','✦',r.fest.icon,'🌸'][i%4]}</i>`).join('')}</div><div class="eyebrow">ÄLVBYN FIRAR</div><h2>${r.fest.name}!</h2><div class="partyRow">${['mira','tagge','tilda','vide'].filter(id=>state.village?.residents.includes(id)).map(id=>`<span class="partyGuest">${residentArt(id)}</span>`).join('')}<span class="partyGuest frogGuest">${frog()}</span></div><p>${r.fest.text}</p><ul class="rewardList"><li>+60 daggdroppar</li><li>${decorations.find(d=>d.id===r.fest.item).name} till gläntan</li>${r.sticker?`<li>Klistermärke: ${r.sticker.icon} ${r.sticker.name}</li>`:''}</ul><button class="primary" id="festBack">Tillbaka till byn</button></section>`;
  $('#festBack').onclick=()=>{setMusic('village');renderVillage()}};
}

// ---------- Daily surprise ----------
const giftFinds=['en blank sten','en fjäder','ett glittrande löv','en liten kotte','en droppe morgondagg','ett fyrklöverblad','en vacker snäcka','en bit av en regnbåge'];
function todayKey(){const d=new Date();return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate()}
function dailyGiftAvailable(){return state.hatched&&state.lastGift!==todayKey()}
function takeDailyGift(){
 if(!dailyGiftAvailable())return null;
 state.lastGift=todayKey();
 const roll=Math.random(),gift={find:giftFinds[Math.floor(Math.random()*giftFinds.length)]};
 if(roll<.2&&typeof grantSticker==='function'){gift.sticker=grantSticker(true)}
 if(!gift.sticker&&roll<.45&&state.garden){state.garden.berries+=2;gift.berries=2}
 if(!gift.sticker&&!gift.berries){gift.coins=15+Math.floor(Math.random()*21);state.coins+=gift.coins}
 state.bond=Math.min(100,state.bond+2);save();return gift;
}
function dailyGiftHTML(){if(!dailyGiftAvailable())return '';return `<section class="dailyGift" id="dailyGift"><span class="giftFrog">${miniFrog(state.frog)}</span><div><b>${escapeText(state.frogName)} har något åt dig!</b><p>Din groda har letat i gläntan medan du var borta.</p></div><button class="primary" id="takeGift">Titta!</button></section>`}
function wireDailyGift(){if(!$('#takeGift'))return;$('#takeGift').onclick=()=>{const g=takeDailyGift();if(!g)return;sfx('chime');sidebar();$('#dailyGift').innerHTML=`<span class="giftFrog">${miniFrog(state.frog)}</span><div><b>${escapeText(state.frogName)} hittade ${g.find}!</b><p>${g.sticker?`Och ett klistermärke: ${g.sticker.icon} ${g.sticker.name}`:g.berries?'Och två bär till korgen.':`Och ${g.coins} daggdroppar.`}</p><p>+2 vänskap. Vi ses i morgon – om du vill!</p></div>`}}

// ---------- Wardrobe ----------
const wardrobe=[
 {id:'wings-classic',slot:'wings',name:'Älvvingar',cost:0},{id:'wings-butterfly',slot:'wings',name:'Fjärilsvingar',cost:80},{id:'wings-dragonfly',slot:'wings',name:'Trollsländevingar',cost:100},{id:'wings-star',slot:'wings',name:'Stjärnvingar',cost:140},
 {id:'outfit-dress',slot:'outfitStyle',name:'Klänning',cost:0},{id:'outfit-overalls',slot:'outfitStyle',name:'Hängselbyxor',cost:70},{id:'outfit-cape',slot:'outfitStyle',name:'Kappa',cost:90},{id:'outfit-ballgown',slot:'outfitStyle',name:'Balklänning',cost:150},
 {id:'hat-none',slot:'frogHat',name:'Ingen hatt',cost:0},{id:'hat-flower',slot:'frogHat',name:'Blomma',cost:50},{id:'hat-cap',slot:'frogHat',name:'Keps',cost:60},{id:'hat-beanie',slot:'frogHat',name:'Mössa',cost:70},{id:'hat-top',slot:'frogHat',name:'Hög hatt',cost:90},{id:'hat-crownlet',slot:'frogHat',name:'Liten krona',cost:160},
 {id:'jewel-none',slot:'frogJewel',name:'Inget smycke',cost:0},{id:'jewel-bowtie',slot:'frogJewel',name:'Fluga',cost:50},{id:'jewel-bell',slot:'frogJewel',name:'Bjällra',cost:60},{id:'jewel-medallion',slot:'frogJewel',name:'Medaljong',cost:90},{id:'jewel-pearls',slot:'frogJewel',name:'Pärlhalsband',cost:110}
];
function wearing(slot){const v=state[slot];return v||wardrobe.find(w=>w.slot===slot&&w.cost===0).id}
function ownsWear(id){const w=wardrobe.find(w=>w.id===id);return !!w&&(w.cost===0||(state.wardrobe||[]).includes(id))}
function buyWear(id){const w=wardrobe.find(w=>w.id===id);if(!w||ownsWear(id)||state.coins<w.cost)return false;state.coins-=w.cost;state.wardrobe=[...(state.wardrobe||[]),id];state[w.slot]=id;save();return true}
function wear(id){const w=wardrobe.find(w=>w.id===id);if(!w||!ownsWear(id))return false;state[w.slot]=id;save();return true}
function wardrobeHTML(slots,title){return `<section class="editor wardrobe"><h3>${title}</h3>${slots.map(([slot,label])=>`<label>${label}</label><div class="options wearOptions">${wardrobe.filter(w=>w.slot===slot).map(w=>{const own=ownsWear(w.id),on=wearing(slot)===w.id;return `<button data-wear="${w.id}" aria-pressed="${on}" class="${on?'chosen':''}" ${!own&&state.coins<w.cost?'disabled':''}>${w.name}${own?'':` · ${w.cost} ✦`}</button>`}).join('')}</div>`).join('')}<p>Köpta saker finns kvar för alltid. Grodans hatt och smycke följer just den grodan.</p></section>`}
function wireWardrobe(rerender){document.querySelectorAll('[data-wear]').forEach(b=>b.onclick=()=>{const id=b.dataset.wear;if(ownsWear(id)?wear(id):buyWear(id)){sidebar();rerender()}else toast('Du behöver fler daggdroppar.')})}

// Wings sit on the fairy's back: drawn behind her and moved down from head height to the shoulders.
function wingShape(){return '<g transform="translate(0 34)">'+({
 'wings-classic':'<g stroke="#fff6ec" stroke-width="2"><ellipse cx="137" cy="80" rx="19" ry="43" transform="rotate(-40 137 80)" fill="#f5e6fb" opacity=".85"/><ellipse cx="167" cy="78" rx="16" ry="39" transform="rotate(35 167 78)" fill="#e3f0f6" opacity=".85"/></g><g stroke="none"><ellipse cx="137" cy="80" rx="19" ry="43" transform="rotate(-40 137 80)" fill="url(#fgWing)"/><ellipse cx="167" cy="78" rx="16" ry="39" transform="rotate(35 167 78)" fill="url(#fgWing)"/></g><g stroke="#b9a4d6" stroke-opacity=".55" stroke-width="1.1" fill="none" stroke-linecap="round"><path d="M150 96Q136 82 112 56M150 96Q130 92 108 76M143 88Q134 74 128 62"/><path d="M156 96Q168 80 186 56M156 96Q174 92 192 80M163 88Q172 76 176 64"/></g>',
 'wings-butterfly':'<g opacity=".9" stroke="#c98aa8" stroke-opacity=".6" stroke-width="2"><ellipse cx="130" cy="66" rx="20" ry="24" transform="rotate(-30 130 66)" fill="#f6c8de"/><ellipse cx="174" cy="64" rx="19" ry="23" transform="rotate(30 174 64)" fill="#f6c8de"/><ellipse cx="135" cy="98" rx="12" ry="15" transform="rotate(-20 135 98)" fill="#c9b5f0"/><ellipse cx="169" cy="96" rx="11" ry="14" transform="rotate(20 169 96)" fill="#c9b5f0"/><circle cx="128" cy="64" r="5" fill="#fff"/><circle cx="176" cy="62" r="5" fill="#fff"/></g><g fill="url(#fgWing)"><ellipse cx="130" cy="66" rx="20" ry="24" transform="rotate(-30 130 66)"/><ellipse cx="174" cy="64" rx="19" ry="23" transform="rotate(30 174 64)"/></g><g stroke="#a35f86" stroke-opacity=".35" stroke-width="1" fill="none"><path d="M150 86Q138 72 120 56M150 88Q140 96 128 104M154 86Q166 72 184 56M154 88Q164 96 176 102"/></g><g fill="#a35f86" opacity=".3"><circle cx="120" cy="74" r="2.4"/><circle cx="184" cy="72" r="2.4"/><circle cx="138" cy="102" r="1.8"/><circle cx="166" cy="100" r="1.8"/></g>',
 'wings-dragonfly':'<g stroke="#7fb8c6" stroke-opacity=".5" stroke-width=".8" fill="none"><path d="M150 84L102 62M150 84L198 62M150 90L104 98M150 90L196 98"/></g><g opacity=".78" fill="#d8f1f7" stroke="#9fd0dc" stroke-width="1.5"><ellipse cx="124" cy="74" rx="30" ry="8" transform="rotate(25 124 74)"/><ellipse cx="176" cy="74" rx="30" ry="8" transform="rotate(-25 176 74)"/><ellipse cx="126" cy="94" rx="26" ry="7" transform="rotate(-12 126 94)"/><ellipse cx="174" cy="94" rx="26" ry="7" transform="rotate(12 174 94)"/></g>',
 'wings-star':'<g fill="#fff3b0" stroke="#e5c35a" stroke-width="1.5" opacity=".92"><path d="M150 84L114 40L134 70L100 62L140 86Z"/><path d="M156 84L190 38L172 70L206 60L166 86Z"/></g><g fill="#fff"><circle cx="114" cy="44" r="2.5"/><circle cx="190" cy="42" r="2.5"/></g>'
})[wearing('wings')]+'</g>'}
function outfitShape(){const c=state.outfit,dress=`<path d="M148 112 Q137 130 125 147 L157 153 165 113" fill="${c}"/>`;return ({
 'outfit-dress':dress,
 'outfit-overalls':dress+'<path d="M151 114L154 138M161 114L159 138" stroke="#ffffffaa" stroke-width="3"/><rect x="146" y="132" width="10" height="8" rx="2" fill="#ffffff66"/>',
 'outfit-cape':`<path d="M146 108Q122 138 116 160L170 158Q160 132 166 110Z" fill="${c}" opacity=".6"/>`+dress+'<circle cx="156" cy="112" r="3" fill="#f1ce69"/>',
 'outfit-ballgown':`<path d="M148 112Q130 135 110 156Q140 168 174 156Q164 132 165 113Z" fill="${c}"/><g fill="#fff" opacity=".7"><circle cx="132" cy="150" r="1.8"/><circle cx="150" cy="156" r="1.8"/><circle cx="162" cy="146" r="1.8"/></g>`
})[wearing('outfitStyle')]}
// The frog's hat rests on top of the head between the eyes; frog() draws it over the green eye domes
// but under the eye whites, so the eyes peek over the brim. Jewels hang under the chin, below the mouth.
function frogHatArt(){
 const hat={'hat-none':'',
  'hat-flower':'<g transform="translate(236 116)"><circle r="6" cx="-6" fill="#f6a5c0"/><circle r="6" cx="6" fill="#f6a5c0"/><circle r="6" cy="-6" fill="#f6a5c0"/><circle r="6" cy="6" fill="#f6a5c0"/><circle r="4" fill="#f6d36b"/></g>',
  'hat-cap':'<path d="M182 116Q206 88 230 116Z" fill="#4f86c6"/><path d="M226 114Q246 112 252 120L226 120Z" fill="#3a6ea8"/><circle cx="206" cy="98" r="3" fill="#fff"/>',
  'hat-beanie':'<path d="M180 118Q206 80 232 118Z" fill="#c95b5b"/><rect x="178" y="112" width="56" height="9" rx="4" fill="#f2e6d6"/><circle cx="206" cy="96" r="7" fill="#f2e6d6"/>',
  'hat-top':'<rect x="190" y="82" width="32" height="30" rx="3" fill="#2f3a35"/><rect x="180" y="108" width="52" height="7" rx="3" fill="#2f3a35"/><rect x="190" y="100" width="32" height="6" fill="#c2574e"/>',
  'hat-crownlet':'<path d="M190 116L186 96 197 106 206 90 215 106 226 96 222 116Z" fill="#f1ce69" stroke="#b58a22" stroke-width="1.5"/><circle cx="206" cy="104" r="3" fill="#4b9d8a"/>'}[wearing('frogHat')]||'';
 // Each hat is moved so its bottom rests at about y 128, the top of the head between the eyes.
 const lift={'hat-flower':6,'hat-cap':12,'hat-beanie':8,'hat-top':13,'hat-crownlet':12}[wearing('frogHat')]??10;
 return hat?`<g transform="translate(0 ${lift})">${hat}</g>`:'';
}
function frogWearArt(){
 const jewel={'jewel-none':'',
  'jewel-bowtie':'<path d="M199 196L187 189V203ZM211 196L223 189V203Z" fill="#c2574e"/><circle cx="205" cy="196" r="4" fill="#a8443c"/>',
  'jewel-pearls':'<path d="M170 186Q205 206 238 176" fill="none" stroke="#fffaf0" stroke-width="6" stroke-dasharray="1 7" stroke-linecap="round"/>',
  'jewel-bell':'<path d="M170 186Q205 206 238 176" fill="none" stroke="#c2574e" stroke-width="3"/><circle cx="205" cy="201" r="6" fill="#f1ce69" stroke="#b58a22"/>',
  'jewel-medallion':'<path d="M170 186Q205 206 238 176" fill="none" stroke="#b58a22" stroke-width="2"/><circle cx="205" cy="203" r="7" fill="#e8c35c"/><path d="M205 199l1.5 3 3 .5-2.2 2 .6 3-2.9-1.5-2.9 1.5.6-3-2.2-2 3-.5Z" fill="#fff6c4"/>'}[wearing('frogJewel')]||'';
 return jewel;
}
// Frog hats and jewels belong to each frog (frogs.js mirrors these fields per frog).
if(typeof FROG_FIELDS!=='undefined')FROG_FIELDS.push('frogHat','frogJewel');

// ---------- More things for the glade ----------
decorations.push(
 {id:'bench',name:'Liten bänk',icon:'🪑',cost:80},{id:'swing',name:'Gunga',icon:'🌳',cost:110},{id:'fountain',name:'Fontän',icon:'⛲',cost:150},
 {id:'birdhouse',name:'Fågelholk',icon:'🐦',cost:70},{id:'mushroomring',name:'Svampring',icon:'🍄',cost:60},{id:'lanternstring',name:'Ljusslinga',icon:'✨',cost:90},
 {id:'tulips',name:'Tulpanrabatt',icon:'🌷',festival:'spring'},{id:'parasol',name:'Solparasoll',icon:'⛱',festival:'summer'},{id:'pumpkin',name:'Pumpalykta',icon:'🎃',festival:'autumn'},{id:'snowman',name:'Snögubbe',icon:'⛄',festival:'winter'}
);
Object.assign(extraGardenArt,{
 bench:'<rect x="18" y="56" width="84" height="10" rx="4" fill="#a37f5a"/><rect x="18" y="38" width="84" height="8" rx="4" fill="#b48d63"/><path d="M28 66V92M92 66V92M30 46V56M90 46V56" stroke="#7b5c3e" stroke-width="6" stroke-linecap="round"/>',
 swing:'<path d="M14 100L30 14H90L106 100" fill="none" stroke="#8d7451" stroke-width="7" stroke-linecap="round"/><path d="M48 16V70M72 16V70" stroke="#c9b28a" stroke-width="2"/><rect x="42" y="68" width="36" height="7" rx="3" fill="#c2574e"/>',
 fountain:'<ellipse cx="60" cy="88" rx="46" ry="14" fill="#a9b4b0"/><ellipse cx="60" cy="84" rx="38" ry="9" fill="#8dc0d0"/><rect x="54" y="44" width="12" height="40" fill="#b9c2be"/><path d="M60 40Q40 30 30 60M60 40Q80 30 90 60" fill="none" stroke="#bfe6f2" stroke-width="4" stroke-linecap="round"/><circle cx="60" cy="38" r="8" fill="#d0d8d4"/>',
 birdhouse:'<path d="M60 100V54" stroke="#8d7451" stroke-width="5"/><path d="M36 40L60 18L84 40Z" fill="#c2574e"/><rect x="40" y="38" width="40" height="30" fill="#e6c79a"/><circle cx="60" cy="52" r="6" fill="#5c4532"/>',
 mushroomring:'<ellipse cx="60" cy="86" rx="48" ry="14" fill="#91ad75" opacity=".6"/>'+[[24,78],[44,68],[70,66],[94,76],[60,92],[34,92],[86,92]].map(([x,y])=>`<path d="M${x-7} ${y}Q${x} ${y-12} ${x+7} ${y}Z" fill="#c96c5e"/><rect x="${x-2}" y="${y}" width="4" height="7" fill="#f4e4c1"/>`).join(''),
 lanternstring:'<path d="M8 30Q60 70 112 30" fill="none" stroke="#5c4532" stroke-width="2"/>'+[[22,40],[42,50],[60,54],[78,50],[98,40]].map(([x,y],i)=>`<circle cx="${x}" cy="${y+6}" r="6" fill="${['#f6d36b','#f6a5c0','#9fd3e0','#f6d36b','#c9b5f0'][i]}"/>`).join(''),
 tulips:'<ellipse cx="60" cy="94" rx="46" ry="10" fill="#8a6a4a"/>'+[20,36,52,68,84,100].map((x,i)=>`<path d="M${x} 94V60" stroke="#5f8a3a" stroke-width="3"/><path d="M${x-7} 62Q${x-7} 46 ${x} 50Q${x+7} 46 ${x+7} 62Z" fill="${['#e5687a','#f6d36b','#f19bb8'][i%3]}"/>`).join(''),
 parasol:'<path d="M60 100V30" stroke="#8d7451" stroke-width="4"/><path d="M14 44Q60 0 106 44Z" fill="#f6d36b"/><path d="M14 44Q37 30 60 44Q83 30 106 44" fill="#e5687a"/><ellipse cx="60" cy="100" rx="30" ry="5" fill="#e3d2a2"/>',
 pumpkin:'<ellipse cx="60" cy="72" rx="40" ry="30" fill="#e58c3a"/><path d="M40 50Q34 72 40 96M80 50Q86 72 80 96M60 44V100" stroke="#c96d24" stroke-width="3" fill="none"/><path d="M58 44Q56 30 66 26" stroke="#5f8a3a" stroke-width="5" fill="none"/><path d="M44 66L52 74 44 74ZM76 66L68 74 76 74ZM48 84Q60 92 72 84" fill="#fff3a6"/>',
 snowman:'<circle cx="60" cy="80" r="26" fill="#fff" stroke="#d6e4ee" stroke-width="2"/><circle cx="60" cy="42" r="18" fill="#fff" stroke="#d6e4ee" stroke-width="2"/><path d="M60 44L76 48L60 50Z" fill="#e58c3a"/><circle cx="54" cy="38" r="2" fill="#263d32"/><circle cx="66" cy="38" r="2" fill="#263d32"/><path d="M44 56H76" stroke="#c2574e" stroke-width="6"/><rect x="48" y="16" width="24" height="12" fill="#2f3a35"/>'
});
