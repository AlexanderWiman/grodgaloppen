// Seasons that follow the calendar, a festival in Älvbyn each season, a wardrobe for the
// fairy and the frogs, more garden things, and a small daily surprise (no streaks, no pressure).

// ---------- Seasons ----------
const seasons={
 spring:{name:'Våren',label:'Blomstersprånget',fall:'🌸',festival:{name:'Blomsterfesten',icon:'🌷',item:'tulips',text:'Hela byn smyckas med blommor och alla dansar runt blomsterstången.'}},
 summer:{name:'Sommaren',label:'Den långa ljusa',fall:'✦',festival:{name:'Sommarmarknaden',icon:'🍓',item:'parasol',text:'Torget fylls av stånd med jordgubbar, saft och glada sånger i solen.'}},
 autumn:{name:'Hösten',label:'Lövdansen',fall:'🍂',festival:{name:'Lyktfesten',icon:'🏮',item:'pumpkin',text:'När mörkret kommer tänder alla sina lyktor och vandrar runt dammen.'}},
 winter:{name:'Vintern',label:'Snöstjärnetiden',fall:'❄',festival:{name:'Snöstjärnefesten',icon:'⛄',item:'snowman',text:'Alla bygger snögubbar och dricker varm blåbärssoppa under stjärnorna.'}}
};
// The game's date. On a local preview (localhost) ?datum=2026-12-05 pretends it is another day, so
// Christmas can be tried in November; tests set gameClock.
let gameClock=null;
function gameDate(){if(gameClock)return gameClock();try{if(/^(localhost|127\.0\.0\.1)$/.test(location.hostname)){const m=/[?&]datum=(\d{4})-(\d{2})-(\d{2})/.exec(location.search);if(m){const n=new Date();return new Date(+m[1],m[2]-1,+m[3],n.getHours(),n.getMinutes())}}}catch{}return new Date()}
function seasonFor(date){const m=date.getMonth();return m>=2&&m<=4?'spring':m>=5&&m<=7?'summer':m>=8&&m<=10?'autumn':'winter'}
function currentSeason(){return seasonFor(gameDate())}
function seasonKey(){const d=gameDate(),s=seasonFor(d);return s+'-'+(s==='winter'&&d.getMonth()<2?d.getFullYear()-1:d.getFullYear())}
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
 if(f.done)return `<section class="festival done"><div class="festIcon">${fest.icon}</div><div><div class="eyebrow">${s.name.toUpperCase()} I ÄLVBYN</div><h3>${fest.name} är firad!</h3><p>${fest.text} Nästa fest kommer när årstiden byts.</p><button class="outline festWatch" id="festWatch">${fest.icon} Titta på festen</button></div></section>`;
 return `<section class="festival"><div class="festIcon">${fest.icon}</div><div><div class="eyebrow">${s.name.toUpperCase()} I ÄLVBYN</div><h3>Snart: ${fest.name}</h3><p>${fest.text} Hjälp byn att förbereda!</p><ul class="festTasks">${festivalTasks.map(t=>`<li class="${festivalTaskDone(f,t.id)?'ok':''}">${festivalTaskDone(f,t.id)?'✓':t.icon} ${t.text}${t.id==='races'?` (${Math.min(2,f.races)}/2)`:''}</li>`).join('')}</ul><div class="festActions">${f.berries?'':`<button class="outline" id="festBerries" ${state.garden?.berries>=3?'':'disabled'}>Ge 3 bär</button>`}${f.decorate?'':`<button class="outline" id="festDecorate" ${state.coins>=30?'':'disabled'}>Pynta · 30 ✦</button>`}<button class="primary" id="festStart" ${festivalReady()?'':'disabled'}>Starta festen!</button></div></div></section>`;
}
// The festival scenes (paper craft, made with Higgsfield): one picture per season of the whole village
// celebrating round the pond. The player's own fairy and frog stand on the empty path in front.
function festSceneHTML(season=currentSeason()){const fest=seasons[season].festival;return `<div class="festScene festScene-${season}"><img src="assets/fest/${season}.webp" alt="${fest.name} i Älvbyn: grannarna firar runt dammen" width="1600" height="894"><span class="festRider">${frog()}</span><div class="festSparkle" aria-hidden="true">${Array.from({length:14},(_,i)=>`<i style="left:${(i*37)%92+4}%;top:${(i*23)%52+4}%;animation-delay:${((i*.37)%3).toFixed(2)}s"></i>`).join('')}</div></div>`}
// r is the result of celebrateFestival() (rewards shown), or null to just watch the party again.
function showFestivalScene(r){
 const fest=seasons[currentSeason()].festival;
 $('#content').innerHTML=`<section class="festParty"><div class="festConfetti" aria-hidden="true">${r?Array.from({length:18},(_,i)=>`<i style="left:${i*5.5}%;animation-delay:${i*.15}s">${['🎉','✦',fest.icon,'🌸'][i%4]}</i>`).join(''):''}</div><div class="eyebrow">ÄLVBYN FIRAR</div><h2>${fest.name}!</h2>${festSceneHTML()}<p>${fest.text}</p>${r?`<ul class="rewardList"><li>+60 daggdroppar</li><li>${decorations.find(d=>d.id===fest.item).name} till gläntan</li>${r.sticker?`<li>Klistermärke: ${r.sticker.icon} ${r.sticker.name}</li>`:''}</ul>`:''}<button class="primary" id="festBack">Tillbaka till byn</button></section>`;
 $('#festBack').onclick=()=>{setMusic('village');renderVillage()};
}
function wireFestival(){
 if($('#festWatch'))$('#festWatch').onclick=()=>{setMusic('festival');showFestivalScene(null);scrollTo?.(0,0)};
 if($('#festBerries'))$('#festBerries').onclick=()=>{if(festivalBerries()){renderVillage();toast('Bären står på festbordet!')}};
 if($('#festDecorate'))$('#festDecorate').onclick=()=>{if(festivalDecorate()){sidebar();renderVillage();toast('Torget glittrar av girlanger!')}};
 if($('#festStart'))$('#festStart').onclick=()=>{const r=celebrateFestival();if(!r)return;sidebar();setMusic('festival');sfx('win');
  showFestivalScene(r);};

}

// ---------- Daily surprise ----------
const giftFinds=['en blank sten','en fjäder','ett glittrande löv','en liten kotte','en droppe morgondagg','ett fyrklöverblad','en vacker snäcka','en bit av en regnbåge'];
function todayKey(){const d=gameDate();return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate()}
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
function buyWear(id){const w=wardrobe.find(w=>w.id===id);if(!w||w.gift||ownsWear(id)||state.coins<w.cost)return false;state.coins-=w.cost;state.wardrobe=[...(state.wardrobe||[]),id];state[w.slot]=id;save();return true}
function wear(id){const w=wardrobe.find(w=>w.id===id);if(!w||!ownsWear(id))return false;state[w.slot]=id;save();return true}
function wardrobeHTML(slots,title){return `<section class="editor wardrobe"><h3>${title}</h3><div class="wardrobePreview" aria-hidden="true">${frog()}</div>${slots.map(([slot,label])=>`<label>${label}</label><div class="options wearOptions">${wardrobe.filter(w=>w.slot===slot&&(!w.gift||ownsWear(w.id))).map(w=>{const own=ownsWear(w.id),on=wearing(slot)===w.id;return `<button data-wear="${w.id}" aria-pressed="${on}" class="${on?'chosen':''}" ${!own&&state.coins<w.cost?'disabled':''}>${w.name}${own?'':` · ${w.cost} ✦`}</button>`}).join('')}</div>`).join('')}<p>Köpta saker finns kvar för alltid. Grodans hatt och smycke följer just den grodan.</p></section>`}
function wireWardrobe(rerender){document.querySelectorAll('[data-wear]').forEach(b=>b.onclick=()=>{const id=b.dataset.wear;if(ownsWear(id)?wear(id):buyWear(id)){sidebar();rerender()}else toast('Du behöver fler daggdroppar.')})}

// Wings sit on the fairy's back: drawn behind her and moved down from head height to the shoulders.
// Two pairs of long see-through wings from the shoulders (before the 34-unit shift in wingShape).
function paperWings(){const root=[150,82],leaf=([tx,ty],w)=>{const [rx,ry]=root,dx=tx-rx,dy=ty-ry,l=Math.hypot(dx,dy),nx=-dy/l*w,ny=dx/l*w,mx=rx+dx*.55,my=ry+dy*.55;return {d:`M${rx} ${ry}Q${(mx+nx).toFixed(1)} ${(my+ny).toFixed(1)} ${tx} ${ty}Q${(mx-nx*.8).toFixed(1)} ${(my-ny*.8).toFixed(1)} ${rx} ${ry}Z`,vein:`M${rx} ${ry}L${tx} ${ty}M${(rx+dx*.35).toFixed(1)} ${(ry+dy*.35).toFixed(1)}l${(nx*.6).toFixed(1)} ${(ny*.6-2).toFixed(1)}M${(rx+dx*.6).toFixed(1)} ${(ry+dy*.6).toFixed(1)}l${(nx*.55).toFixed(1)} ${(ny*.55-2).toFixed(1)}M${(rx+dx*.5).toFixed(1)} ${(ry+dy*.5).toFixed(1)}l${(-nx*.45).toFixed(1)} ${(-ny*.45).toFixed(1)}`}};
 const w=[leaf([96,30],15),leaf([206,34],14),leaf([104,106],10),leaf([198,106],9.5)];
 return `<g fill="#fbfaff" fill-opacity=".72" stroke="#cfc6dc" stroke-width="1.1">${w.map(x=>`<path d="${x.d}"/>`).join('')}</g><g stroke="#b9afcb" stroke-opacity=".75" stroke-width=".8" fill="none" stroke-linecap="round">${w.map(x=>`<path d="${x.vein}"/>`).join('')}</g>`}
function wingShape(){return '<g transform="translate(0 34)">'+({
 'wings-classic':paperWings(),
 'wings-butterfly':'<g opacity=".9" stroke="#c98aa8" stroke-opacity=".6" stroke-width="2"><ellipse cx="130" cy="66" rx="20" ry="24" transform="rotate(-30 130 66)" fill="#f6c8de"/><ellipse cx="174" cy="64" rx="19" ry="23" transform="rotate(30 174 64)" fill="#f6c8de"/><ellipse cx="135" cy="98" rx="12" ry="15" transform="rotate(-20 135 98)" fill="#c9b5f0"/><ellipse cx="169" cy="96" rx="11" ry="14" transform="rotate(20 169 96)" fill="#c9b5f0"/><circle cx="128" cy="64" r="5" fill="#fff"/><circle cx="176" cy="62" r="5" fill="#fff"/></g><g fill="url(#fgWing)"><ellipse cx="130" cy="66" rx="20" ry="24" transform="rotate(-30 130 66)"/><ellipse cx="174" cy="64" rx="19" ry="23" transform="rotate(30 174 64)"/></g><g stroke="#a35f86" stroke-opacity=".35" stroke-width="1" fill="none"><path d="M150 86Q138 72 120 56M150 88Q140 96 128 104M154 86Q166 72 184 56M154 88Q164 96 176 102"/></g><g fill="#a35f86" opacity=".3"><circle cx="120" cy="74" r="2.4"/><circle cx="184" cy="72" r="2.4"/><circle cx="138" cy="102" r="1.8"/><circle cx="166" cy="100" r="1.8"/></g>',
 'wings-dragonfly':'<g stroke="#7fb8c6" stroke-opacity=".5" stroke-width=".8" fill="none"><path d="M150 84L102 62M150 84L198 62M150 90L104 98M150 90L196 98"/></g><g opacity=".78" fill="#d8f1f7" stroke="#9fd0dc" stroke-width="1.5"><ellipse cx="124" cy="74" rx="30" ry="8" transform="rotate(25 124 74)"/><ellipse cx="176" cy="74" rx="30" ry="8" transform="rotate(-25 176 74)"/><ellipse cx="126" cy="94" rx="26" ry="7" transform="rotate(-12 126 94)"/><ellipse cx="174" cy="94" rx="26" ry="7" transform="rotate(12 174 94)"/></g>',
 'wings-star':'<g fill="#fff3b0" stroke="#e5c35a" stroke-width="1.5" opacity=".92"><path d="M150 84L114 40L134 70L100 62L140 86Z"/><path d="M156 84L190 38L172 70L206 60L166 86Z"/></g><g fill="#fff"><circle cx="114" cy="44" r="2.5"/><circle cx="190" cy="42" r="2.5"/></g>'
})[wearing('wings')]+'</g>'}
function outfitShape(){const c=state.outfit,dress=`<path d="M144 109Q154 104 164 109L167 124Q171 140 174 154L130 154Q134 140 141 124Z" fill="${c}"/>`;return ({
 'outfit-dress':dress+'<path d="M141.5 123.5Q154 127.5 166.5 123.5" stroke="#8a5a3b" stroke-width="3.4" fill="none" stroke-linecap="round"/><rect x="151.5" y="123" width="5" height="4" rx="1" fill="#c9a06a"/>',
 'outfit-overalls':dress+'<path d="M148 110L150 132M160 110L158 132" stroke="#ffffffaa" stroke-width="3"/><rect x="148" y="128" width="12" height="9" rx="2" fill="#ffffff66"/><g fill="#f1ce69"><circle cx="150" cy="129" r="1.4"/><circle cx="158" cy="129" r="1.4"/></g>',
 'outfit-cape':`<path d="M142 108Q118 140 114 162L186 160Q176 132 166 108Z" fill="${c}" opacity=".6"/>`+dress+'<circle cx="154" cy="109" r="3" fill="#f1ce69"/>',
 // Skogsdrottningen's Christmas gift: a longer coat in the outfit colour with white fur trim and a collar.
 'outfit-winter':`<path d="M143 109Q154 103 165 109L168 124Q173 142 177 158L131 158Q135 142 140 124Z" fill="${c}"/><path d="M154 110V157" stroke="#000" stroke-opacity=".15" stroke-width="1.4"/><path d="M131 157Q154 162 177 157" stroke="#f7f4ec" stroke-width="5.5" stroke-linecap="round" fill="none"/><path d="M144 110Q154 116 164 110" stroke="#f7f4ec" stroke-width="5" stroke-linecap="round" fill="none"/><g fill="#f1ce69"><circle cx="157" cy="124" r="1.5"/><circle cx="157" cy="134" r="1.5"/><circle cx="157" cy="144" r="1.5"/></g><g fill="#fff" opacity=".8"><path d="M139 140l1.2 2.4M141.4 140l-3.6 2.4M138 141.2h4.8" stroke="#fff" stroke-width=".8"/><path d="M168 132l1.2 2.4M170.4 132l-3.6 2.4M167 133.2h4.8" stroke="#fff" stroke-width=".8"/></g>`,
 'outfit-flowerdress':dress+'<g opacity=".9">'+[[147,120],[159,127],[144,139],[163,145],[153,150],[150,131],[160,137]].map(([x,y])=>`<g fill="#fff"><circle cx="${x-1.5}" cy="${y}" r="1.5"/><circle cx="${x+1.5}" cy="${y}" r="1.5"/><circle cx="${x}" cy="${y-1.5}" r="1.5"/><circle cx="${x}" cy="${y+1.5}" r="1.5"/></g><circle cx="${x}" cy="${y}" r="1" fill="#f1ce69"/>`).join('')+'</g>',
 'outfit-sweater':dress+'<path d="M147 109.5Q154 114 161 109.5" stroke="#000" stroke-opacity=".16" stroke-width="3" fill="none"/><path d="M142 121.5Q154 125.5 166 121.5" stroke="#fff" stroke-opacity=".55" stroke-width="2.4" fill="none"/><path d="M141 128l3 2.6 3-2.6 3 2.6 3-2.6 3 2.6 3-2.6 3 2.6 3-2.6 3 2.6" stroke="#fff" stroke-opacity=".5" stroke-width="1.2" fill="none"/><path d="M138 143Q154 147 170 143" stroke="#fff" stroke-opacity=".45" stroke-width="2.4" fill="none"/><g stroke="#000" stroke-opacity=".06" stroke-width="1"><path d="M148 112V150M154 112V152M160 112V150"/></g>',
 'outfit-tunic':dress+'<path d="M150 109.5L154 116L158 109.5" stroke="#fff" stroke-opacity=".5" stroke-width="1.4" fill="none"/><path d="M140.5 126Q154 130.5 167.5 126" stroke="#7b5638" stroke-width="3.2" fill="none"/><rect x="151.5" y="125.8" width="5" height="4.4" rx="1" fill="none" stroke="#e2b94b" stroke-width="1.2"/>',
 'outfit-ballgown':`<path d="M144 109Q154 104 164 109L167 124Q180 142 190 158Q154 170 118 158Q128 142 141 124Z" fill="${c}"/><path d="M141 124Q154 128 167 124" stroke="#fff" stroke-opacity=".5" stroke-width="2" fill="none"/><g fill="#fff" opacity=".7"><circle cx="134" cy="150" r="1.8"/><circle cx="152" cy="156" r="1.8"/><circle cx="168" cy="146" r="1.8"/></g>`
})[wearing('outfitStyle')]}
// ---------- Survey 4, step 2: more clothes, shoes, glasses and a bag for the fairy ----------
wardrobe.push(
 {id:'outfit-tunic',slot:'outfitStyle',name:'Tunika med bälte',cost:60},{id:'outfit-flowerdress',slot:'outfitStyle',name:'Blomklänning',cost:70},{id:'outfit-sweater',slot:'outfitStyle',name:'Stickad tröja',cost:80},
 {id:'shoes-slippers',slot:'shoes',name:'Tossor',cost:0},{id:'shoes-red',slot:'shoes',name:'Röda skor',cost:50},{id:'shoes-boots',slot:'shoes',name:'Gummistövlar',cost:60},{id:'shoes-ballet',slot:'shoes',name:'Balettskor',cost:80},{id:'shoes-winter',slot:'shoes',name:'Vinterkängor',cost:90},{id:'shoes-sparkle',slot:'shoes',name:'Glitterskor',cost:140},
 {id:'glasses-none',slot:'glasses',name:'Inga glasögon',cost:0},{id:'glasses-round',slot:'glasses',name:'Runda glasögon',cost:50},{id:'glasses-sun',slot:'glasses',name:'Solglasögon',cost:60},{id:'glasses-heart',slot:'glasses',name:'Hjärtglasögon',cost:80},{id:'glasses-star',slot:'glasses',name:'Stjärnglasögon',cost:100},
 {id:'bag-none',slot:'bag',name:'Ingen väska',cost:0},{id:'bag-basket',slot:'bag',name:'Blomsterkorg',cost:60},{id:'bag-shoulder',slot:'bag',name:'Axelväska',cost:70},{id:'bag-pearl',slot:'bag',name:'Pärlväska',cost:110}
);
// Glasses sit over the eyes (eyeShape draws them at x 149 and 161, y 81).
function glassesShape(){
 const heart=(x,y)=>`<path d="M${x} ${y+4.5}C${x-6.5} ${y+.5} ${x-5.5} ${y-5} ${x-2.2} ${y-5}c1.2 0 1.8.7 2.2 1.6c.4-.9 1-1.6 2.2-1.6c3.3 0 4.3 5.5-2.2 9.5z"/>`;
 const star=(x,y)=>`<path d="M${[0,1,2,3,4,5,6,7,8,9].map(i=>{const r=i%2?2.6:5.8,a=-Math.PI/2+i*Math.PI/5;return (x+r*Math.cos(a)).toFixed(1)+' '+(y+r*Math.sin(a)).toFixed(1)}).join('L')}Z"/>`;
 const arms=c=>`<path d="M153.6 80.6q1.4-1.2 2.8 0M144.3 80.2L138.6 79.4M165.7 80.2L168.2 79.4" stroke="${c}" stroke-width="1" fill="none" stroke-linecap="round"/>`;
 return {'glasses-none':'',
  'glasses-round':`<g fill="#ffffff26" stroke="#5c4532" stroke-width="1.1"><circle cx="149" cy="81" r="4.6"/><circle cx="161" cy="81" r="4.6"/></g>${arms('#5c4532')}<path d="M146.5 79l1.6-1.4M158.5 79l1.6-1.4" stroke="#fff" stroke-opacity=".7" stroke-width=".8"/>`,
  'glasses-sun':`<g fill="#2f3a35" opacity=".9"><rect x="144.1" y="77.6" width="9.8" height="7" rx="3"/><rect x="156.1" y="77.6" width="9.8" height="7" rx="3"/></g>${arms('#2f3a35')}<path d="M145.6 79.6l2.2-1.2M157.6 79.6l2.2-1.2" stroke="#fff" stroke-opacity=".6" stroke-width=".9"/>`,
  'glasses-heart':`<g fill="#f29bb5" fill-opacity=".55" stroke="#d24b7a" stroke-width="1">${heart(149,81)}${heart(161,81)}</g>${arms('#d24b7a')}`,
  'glasses-star':`<g fill="#fff3b0" fill-opacity=".4" stroke="#d9a93a" stroke-width="1" stroke-linejoin="round">${star(149,81)}${star(161,81)}</g>${arms('#d9a93a')}`
 }[wearing('glasses')]||'';
}
// The fairy sits on the frog's back. frog() draws this after the frog, so her lap, her near leg
// with its shoe, the hand resting on the frog's back and her bag show in front of the frog instead
// of sinking into it. Overalls give trousers; the winter coat keeps its white trim.
function fairyFrontShape(){
 const c=state.outfit,skin=state.skin,style=wearing('outfitStyle'),trousers=style==='outfit-overalls';
 const lapD=style==='outfit-ballgown'?'M119 138Q152 127 185 138Q189 148 183 154Q152 162 121 154Q115 146 119 138Z':'M129 136Q147 130 162 138Q169 142 167 147L164 152L160 148.5L156 153.5L151.5 149.5L147 154L142.5 149.5L138 153.5L134 149L130.5 152Q125 144 129 136Z';
 let out=`<path d="${lapD}" fill="${c}"/><path d="${lapD}" fill="url(#fgCloth)"/><path d="M135 145Q150 150 163 145" stroke="#000" stroke-opacity=".12" stroke-width="1.5" fill="none" stroke-linecap="round"/>`;
 if(style==='outfit-winter')out+='<path d="M130 149Q150 154 165 149" stroke="#f7f4ec" stroke-width="4" stroke-linecap="round" fill="none"/>';
 if(style==='outfit-flowerdress')out+=[[137,142],[150,139],[160,145]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="1.6" fill="#fff" opacity=".85"/><circle cx="${x}" cy="${y}" r=".8" fill="#f1ce69"/>`).join('');
 if(style==='outfit-ballgown')out+='<g fill="#fff" opacity=".7"><circle cx="132" cy="148" r="1.6"/><circle cx="168" cy="146" r="1.6"/></g>';
 // The near leg hangs down the frog's side; the shoe points forward.
 out+=`<path d="M151 145Q160 147 158.5 154L154.5 170.5" fill="none" stroke="${trousers?c:skin}" stroke-width="6.4" stroke-linecap="round" stroke-linejoin="round"/><path d="M153 150.5Q158 151.5 157 156L154 168" fill="none" stroke="#000" stroke-opacity=".1" stroke-width="2" stroke-linecap="round"/>`;
 if(trousers)out+=`<path d="M151.2 166.5L158 168" stroke="#fff" stroke-opacity=".5" stroke-width="1.6"/>`;
 const foot='M-6 -1Q-6.6 6 0 6H8.6Q10.6 3 6 1.2Q4 -1.6 0 -1.6Z';
 out+='<g transform="translate(154.5 171)">'+({
  'shoes-slippers':`<path d="${foot}" fill="#8a6a4c"/><path d="M-5.6 5.4H8" stroke="#5c4532" stroke-width="1.2"/>`,
  'shoes-red':`<path d="${foot}" fill="#c9473f"/><path d="M-1 -1.2L3.4 1.6" stroke="#8f2d27" stroke-width="1.2"/><path d="M-5.6 5.4H8" stroke="#8f2d27" stroke-width="1.2"/><path d="M4 2.4l2.4-.4" stroke="#fff" stroke-opacity=".7" stroke-width=".9"/>`,
  'shoes-boots':`<path d="M-4.2 -12H3.8L4.2 0Q10.4 1.6 10.4 6H-6.3Q-6.6 0 -4.2 -12Z" fill="#f2c94c" stroke="#c79a2a" stroke-width=".8"/><rect x="-4.8" y="-13" width="9.2" height="2.6" rx="1.2" fill="#e2b33a"/><path d="M-6 5.2H10" stroke="#a8781e" stroke-width="1.2"/>`,
  'shoes-ballet':`<path d="M-3 -1L3.2 -9M3.2 -1L-3 -9" stroke="#e58fa8" stroke-width="1"/><path d="${foot}" fill="#f3b6c8"/><path d="M-5.6 5.4H8" stroke="#e58fa8" stroke-width="1"/><circle cx="1" cy="-.6" r="1.2" fill="#e58fa8"/>`,
  'shoes-winter':`<path d="M-4.2 -9H3.8L4.2 0Q10.4 1.6 10.4 6H-6.3Q-6.6 0 -4.2 -9Z" fill="#8a5a3b"/><ellipse cx="-.2" cy="-9.4" rx="5.6" ry="2.6" fill="#f7f4ec"/><path d="M-6 5.2H10" stroke="#5c3a24" stroke-width="1.4"/>`,
  'shoes-sparkle':`<path d="${foot}" fill="#b49be0"/><path d="M-5.6 5.4H8" stroke="#8a6fc0" stroke-width="1"/><g fill="#fff6c7"><circle cx="-2.5" cy="2" r=".9"/><circle cx="2" cy="1" r=".8"/><circle cx="5.5" cy="3.4" r=".9"/></g><path d="M-1 -3.6l.7 1.6 1.6.7-1.6.7-.7 1.6-.7-1.6-1.6-.7 1.6-.7Z" fill="#f1ce69"/>`
 }[wearing('shoes')]||'')+'</g>';
 // The left hand rests on the lap, on top of the frog's back.
 out+=`<circle cx="142" cy="142" r="4.4" fill="${skin}"/><path d="M139.5 143.6q2.5 1.4 5 0" stroke="#6b3324" stroke-opacity=".2" stroke-width="1" fill="none"/>`;
 out+=({'bag-none':'',
  'bag-basket':'<path d="M119.5 142Q128 128 136.5 142" fill="none" stroke="#9a6f3e" stroke-width="2"/><path d="M118 142H138L135.5 153H120.5Z" fill="#c9a06a"/><path d="M119 146H137M120 149.5H136M124 142.5L124.6 153M128 142.5V153M132 142.5L131.4 153" stroke="#9a6f3e" stroke-opacity=".6" stroke-width=".9"/><g><circle cx="122.5" cy="140.5" r="2.6" fill="#f6a5c0"/><circle cx="128" cy="139" r="2.6" fill="#fff2d1"/><circle cx="133.5" cy="140.5" r="2.6" fill="#f6a5c0"/><circle cx="128" cy="139" r="1" fill="#d6ac50"/></g>',
  'bag-shoulder':'<path d="M163 109.5L139 136" stroke="#7b4a2e" stroke-width="1.8"/><rect x="129.5" y="134" width="14" height="11" rx="2.5" fill="#b5603f"/><path d="M129.5 137.5H143.5V139Q136.5 142 129.5 139Z" fill="#8f4a30"/><circle cx="136.5" cy="139.6" r="1.1" fill="#e2b94b"/>',
  'bag-pearl':`<path d="M127.5 143Q133 133 138.5 143" fill="none" stroke="#fffaf0" stroke-width="2.2" stroke-dasharray=".1 3" stroke-linecap="round"/><path d="M126 143H140L138.5 152Q133 154 127.5 152Z" fill="#c9b5f0"/><path d="M126 143H140" stroke="#a48fd0" stroke-width="1.4"/><circle cx="133" cy="146" r="1.3" fill="#e2b94b"/>`
 })[wearing('bag')]||'';
 return out;
}

// The frog's hat rests on top of the head between the eyes; frog() draws it over the green eye domes
// but under the eye whites, so the eyes peek over the brim. Jewels hang under the chin, below the mouth.
function frogHatArt(){
 const hat={'hat-none':'',
  'hat-flower':'<g transform="translate(236 116)"><circle r="6" cx="-6" fill="#f6a5c0"/><circle r="6" cx="6" fill="#f6a5c0"/><circle r="6" cy="-6" fill="#f6a5c0"/><circle r="6" cy="6" fill="#f6a5c0"/><circle r="4" fill="#f6d36b"/></g>',
  'hat-cap':'<path d="M182 116Q206 88 230 116Z" fill="#4f86c6"/><path d="M226 114Q246 112 252 120L226 120Z" fill="#3a6ea8"/><circle cx="206" cy="98" r="3" fill="#fff"/>',
  'hat-beanie':'<path d="M180 118Q206 80 232 118Z" fill="#c95b5b"/><rect x="178" y="112" width="56" height="9" rx="4" fill="#f2e6d6"/><circle cx="206" cy="96" r="7" fill="#f2e6d6"/>',
  'hat-top':'<rect x="190" y="82" width="32" height="30" rx="3" fill="#2f3a35"/><rect x="180" y="108" width="52" height="7" rx="3" fill="#2f3a35"/><rect x="190" y="100" width="32" height="6" fill="#c2574e"/>',
  'hat-tomte':'<path d="M181 118Q192 86 216 80Q238 76 246 98Q236 92 228 96Q232 106 231 118Z" fill="#c9473f"/><path d="M194 98Q206 88 220 86" stroke="#fff" stroke-opacity=".25" stroke-width="3" fill="none" stroke-linecap="round"/><rect x="178" y="111" width="56" height="10" rx="5" fill="#f4f1ea"/><circle cx="246" cy="99" r="7" fill="#f4f1ea"/>',
  'hat-crownlet':'<path d="M190 116L186 96 197 106 206 90 215 106 226 96 222 116Z" fill="#f1ce69" stroke="#b58a22" stroke-width="1.5"/><circle cx="206" cy="104" r="3" fill="#4b9d8a"/>'}[wearing('frogHat')]||'';
 // Each hat is moved so its bottom rests at about y 128, the top of the head between the eyes.
 const lift={'hat-tomte':8,'hat-flower':6,'hat-cap':12,'hat-beanie':8,'hat-top':13,'hat-crownlet':12}[wearing('frogHat')]??10;
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
