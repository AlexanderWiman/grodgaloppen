// Utforska slottet: the family wanted to see more of Skogsdrottningen's castle than a picture of her.
// Four painted rooms (made with Higgsfield in the same style as the castle): the throne room, the
// library, the kitchen and the tower. Three small things are hidden in each room. Each find gives 10
// dewdrops once, and finding all twelve gives a little castle tower for the glade and 50 dewdrops.
// The rooms can be explored before the queen has shown the way; her stories and the flute still
// come with her first visit, as before.

const CASTLE_FIND_COINS=10,CASTLE_ALL_COINS=50;
const castleRooms=[
 {id:'tron',name:'Tronsalen',say:'Här tar jag emot alla skogens djur. Tronen är gjord av en gammal ek som föll i en storm.',finds:[{id:'key',name:'Guldnyckeln',x:47,y:50},{id:'feather',name:'Smaragdfjädern',x:12,y:80},{id:'bell',name:'Silverklockan',x:84,y:86}]},
 {id:'bibliotek',name:'Biblioteket',say:'Alla sagor om Astrid står här någonstans. Kartorna visar skogens hemliga stigar.',finds:[{id:'book',name:'Sagoboken med guldkant',x:54,y:66},{id:'quill',name:'Fjäderpennan',x:80,y:44},{id:'map',name:'Kartbiten',x:66,y:88}]},
 {id:'kok',name:'Köket',say:'Bärpajerna är bakade på blåbär från gläntan. Ta gärna en bit!',finds:[{id:'gingerfrog',name:'Pepparkaksgrodan',x:66,y:64},{id:'honey',name:'Honungsburken',x:21,y:86},{id:'whisk',name:'Vispen',x:8,y:58}]},
 {id:'torn',name:'Tornrummet',say:'Härifrån ser jag hela skogen. På natten räknar jag stjärnor tills jag somnar.',finds:[{id:'starstone',name:'Stjärnstenen',x:40,y:90},{id:'compass',name:'Månkompassen',x:24,y:74},{id:'pendant',name:'Stjärnhänget',x:88,y:63}]}
];
const castleFindArt={
 key:'<circle cx="12" cy="20" r="7" fill="none" stroke="#e2b94b" stroke-width="3.4"/><path d="M19 20H35M30 20V26M34 20V25" stroke="#e2b94b" stroke-width="3.4" stroke-linecap="round"/>',
 feather:'<path d="M8 34Q12 12 32 6Q30 26 8 34Z" fill="#3f9a6e"/><path d="M8 34Q20 20 30 9" stroke="#e8f5ec" stroke-width="1.6" fill="none"/>',
 bell:'<path d="M12 28Q12 12 20 11Q28 12 28 28Z" fill="#cfd6df"/><rect x="9" y="27" width="22" height="4" rx="2" fill="#aeb8c4"/><circle cx="20" cy="33" r="2.6" fill="#aeb8c4"/><circle cx="20" cy="9" r="2.4" fill="#aeb8c4"/>',
 book:'<rect x="8" y="10" width="24" height="20" rx="2" fill="#2f7a55"/><rect x="10" y="26" width="22" height="4" fill="#fbf3dc"/><path d="M8 10H32M8 30H32" stroke="#e2b94b" stroke-width="1.6"/><circle cx="20" cy="18" r="3" fill="#e2b94b"/>',
 quill:'<path d="M12 32L30 6Q34 16 16 30Z" fill="#f4f1ea" stroke="#c9c2b4"/><ellipse cx="12" cy="33" rx="6" ry="3" fill="#3a2a22"/>',
 map:'<path d="M7 10L16 8L24 11L33 9V30L24 32L16 29L7 31Z" fill="#efdcae" stroke="#c9a971"/><path d="M11 25Q16 18 21 22T30 14" stroke="#b5603f" stroke-width="1.4" stroke-dasharray="2 2" fill="none"/><path d="M28 12l2 2M30 12l-2 2" stroke="#b5603f" stroke-width="1.2"/>',
 gingerfrog:'<ellipse cx="20" cy="24" rx="12" ry="8" fill="#b9773f"/><circle cx="14" cy="16" r="5" fill="#b9773f"/><circle cx="26" cy="16" r="5" fill="#b9773f"/><g fill="#fff"><circle cx="14" cy="16" r="1.5"/><circle cx="26" cy="16" r="1.5"/></g><path d="M14 26q6 4 12 0" stroke="#fff" stroke-width="1.4" fill="none"/>',
 honey:'<rect x="10" y="13" width="20" height="20" rx="5" fill="#e8a83a"/><rect x="9" y="9" width="22" height="6" rx="2" fill="#c9473f"/><path d="M12 20Q20 24 28 20" stroke="#ffd36b" stroke-width="2" fill="none"/>',
 whisk:'<path d="M20 34V22" stroke="#8a6440" stroke-width="3.4" stroke-linecap="round"/><path d="M20 22Q10 14 14 6Q20 2 26 6Q30 14 20 22ZM20 22Q16 12 20 4Q24 12 20 22Z" fill="none" stroke="#b8c2cc" stroke-width="1.6"/>',
 starstone:'<path d="M20 4L24 15L35 16L26 23L29 34L20 28L11 34L14 23L5 16L16 15Z" fill="#bde3ff" stroke="#7fb4dd"/><circle cx="17" cy="15" r="2" fill="#fff"/>',
 compass:'<circle cx="20" cy="20" r="13" fill="#e2b94b"/><circle cx="20" cy="20" r="10" fill="#fbf3dc"/><path d="M20 11L23 20L20 29L17 20Z" fill="#3b5d8f"/><path d="M26 13a6 6 0 1 0 0 8a5 5 0 1 1 0-8Z" fill="#f1ce69" opacity=".8"/>',
 pendant:'<path d="M20 2V12" stroke="#e2b94b" stroke-width="1.4"/><path d="M20 12L23 20L31 21L25 26L27 34L20 30L13 34L15 26L9 21L17 20Z" fill="#f1ce69" stroke="#c99a2a"/>'
};
function ensureCastleFinds(){state.castleFinds??={found:[],room:'tron',done:false};return state.castleFinds}
function castleFindCount(){return castleRooms.reduce((n,r)=>n+r.finds.length,0)}
// Finding something: once each. The last one gives the castle tower for the glade.
function castleFind(roomId,findId){
 const c=ensureCastleFinds(),room=castleRooms.find(r=>r.id===roomId),f=room?.finds.find(f=>f.id===findId);
 if(!f||c.found.includes(findId))return null;
 c.found.push(findId);state.coins+=CASTLE_FIND_COINS;const got={name:f.name,coins:CASTLE_FIND_COINS,all:false};
 if(c.found.length>=castleFindCount()&&!c.done){c.done=true;state.coins+=CASTLE_ALL_COINS;got.all=true;if(!state.decorOwned.includes('castletower'))state.decorOwned.push('castletower')}
 save();return got;
}
function castleExploreHTML(){
 const c=ensureCastleFinds(),room=castleRooms.find(r=>r.id===c.room)||castleRooms[0],left=room.finds.filter(f=>!c.found.includes(f.id));
 return `<section class="castleExplore" id="castleExplore"><div class="sectionHead"><div><div class="eyebrow">UTFORSKA SLOTTET</div><h3>${room.name}</h3></div><span class="pill">${c.found.length} av ${castleFindCount()} fynd</span></div><div class="castleRoomTabs" role="group" aria-label="Rum i slottet">${castleRooms.map(r=>`<button data-castle-room="${r.id}" aria-pressed="${r.id===room.id}">${r.name}${r.finds.every(f=>c.found.includes(f.id))?' ✓':''}</button>`).join('')}</div><div class="castleRoom"><img src="assets/slott/${room.id}.webp" alt="${room.name} i Skogsdrottningens slott" width="1600" height="894">${left.map(f=>`<button class="castleFind" data-castle-find="${f.id}" style="left:${f.x}%;top:${f.y}%" aria-label="Något glimmar här"><svg viewBox="0 0 40 40" aria-hidden="true">${castleFindArt[f.id]}</svg></button>`).join('')}</div><p class="castleSay"><img src="assets/skogsdrottningen-portratt.webp" alt="">”${room.say}”</p><p class="forestNote" id="castleFindStatus" role="status">${left.length?`Något glimmar i ${room.name.toLowerCase()}. Hittar ni ${left.length===1?'det':'alla '+left.length}?`:'Ni har hittat allt i det här rummet.'}</p>${c.found.length?`<div class="castleFoundList">${castleRooms.flatMap(r=>r.finds).filter(f=>c.found.includes(f.id)).map(f=>`<span title="${f.name}"><svg viewBox="0 0 40 40" aria-hidden="true">${castleFindArt[f.id]}</svg><small>${f.name}</small></span>`).join('')}</div>`:''}</section>`;
}
function wireCastleExplore(){
 document.querySelectorAll('[data-castle-room]').forEach(b=>b.onclick=()=>{ensureCastleFinds().room=b.dataset.castleRoom;save();sfx('tick');refreshCastleExplore()});
 document.querySelectorAll('[data-castle-find]').forEach(b=>b.onclick=()=>{const r=castleFind(ensureCastleFinds().room,b.dataset.castleFind);if(!r)return;sfx(r.all?'win':'chime');sidebar();refreshCastleExplore();const s=$('#castleFindStatus');if(s)s.textContent=`Ni hittade ${r.name.toLowerCase()}! · +${r.coins} daggdroppar`+(r.all?` · Ni har hittat allt! +${CASTLE_ALL_COINS} daggdroppar och ett litet slottstorn till gläntan`:'');if(r.all)toast('Ni har utforskat hela slottet!')});
}
function refreshCastleExplore(){const box=$('#castleExplore');if(!box?.outerHTML)return;box.outerHTML=castleExploreHTML();wireCastleExplore()}

// Before the queen has shown the way: the castle from outside, how to meet her, and the rooms.
function renderCastleGate(){
 const here=queenVisiting(),next=queenNextVisit();
 $('#content').innerHTML=`<div class="sectionHead"><div><div class="eyebrow">LÅNGT IN I DEN DJUPA SKOGEN</div><h2>Skogsdrottningens slott</h2></div></div><section class="castleHero">${castleSceneHTML()}<div class="castleWelcome"><img src="assets/skogsdrottningen-portratt.webp" alt="Skogsdrottningen"><p>”Kliv på och titta er omkring! När jag hälsar på er nästa gång berättar jag sagor om Astrid här vid brasan.”</p></div></section>${here?'<p class="castleGateNote"><b>Hon är på besök i dag!</b> <button class="primary" id="castleInvite">Följ med till slottet</button></p>':`<p class="castleGateNote">${next?'Skogsdrottningen kommer på besök igen på '+weekdays[next.getDay()]+'. Då kan ni följa med henne och höra hennes sagor.':''}</p>`}${castleExploreHTML()}`;
 if($('#castleInvite'))$('#castleInvite').onclick=()=>{queenOpenCastle();renderCastle()};
 wireCastleExplore();
}

// ---------- Hooks ----------
if(typeof renderCastle==='function'){const plain=renderCastle;renderCastle=function(){const q=ensureCastle();if(!q.castle){renderCastleGate();return}plain();const c=$('#content');if(c?.insertAdjacentHTML){c.insertAdjacentHTML('beforeend',castleExploreHTML());wireCastleExplore()}}}
if(typeof decorations!=='undefined')decorations.push({id:'castletower',name:'Litet slottstorn',icon:'🏰',from:'Utforska hela slottet'});
if(typeof extraGardenArt!=='undefined')extraGardenArt.castletower='<ellipse cx="60" cy="104" rx="26" ry="5" fill="#000" opacity=".12"/><rect x="42" y="44" width="36" height="58" rx="3" fill="#efe4c8"/><path d="M38 46L60 12L82 46Z" fill="#3f8a65"/><path d="M60 12V4" stroke="#b58a22" stroke-width="2"/><path d="M60 4l8 3-8 3Z" fill="#d6ad48"/><path d="M53 102V84Q60 76 67 84V102Z" fill="#8a6440"/><rect x="54" y="56" width="12" height="16" rx="6" fill="#f6d36b"/><path d="M42 50h36" stroke="#d6c8a4" stroke-width="2"/><g fill="#7aab5d"><circle cx="44" cy="96" r="6"/><circle cx="76" cy="98" r="5"/></g>';
