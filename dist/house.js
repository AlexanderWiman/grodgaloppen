// Inside the mushroom cottage (family survey 2, step 3): buy furniture with dewdrops, then
// drag it around the room, resize or mirror it. Wall and floor colours are free.
// The aquarium shows the fish you have caught; the painting shows your racing frog.

const houseFurniture=[
 {id:'rug',name:'Rund matta',cost:50,floor:true},
 {id:'mossbed',name:'Mossäng',cost:90},
 {id:'table',name:'Svampbord',cost:60},
 {id:'chair',name:'Ekollonstol',cost:40},
 {id:'lamp',name:'Golvlykta',cost:55},
 {id:'shelf',name:'Bokhylla',cost:80},
 {id:'plant',name:'Krukväxt',cost:30},
 {id:'teaset',name:'Teservis',cost:35},
 {id:'picture',name:'Tavla av grodan',cost:70,wall:true},
 {id:'clock',name:'Väggklocka',cost:45,wall:true},
 {id:'stove',name:'Kakelugn',cost:120},
 {id:'aquarium',name:'Akvarium',cost:100}
];
const houseWalls=['#f3e3c3','#e7d3e6','#d6e6d0','#d5e3ef','#f2d2c4'],houseFloors=['#b98d5f','#9c7350','#cfae7f'];
let houseSelected=null;

function ensureHouse(){if(!state.house)state.house={owned:[],items:[],next:1,wall:houseWalls[0],floor:houseFloors[0]};return state.house}
function houseBuy(id){const h=ensureHouse(),f=houseFurniture.find(f=>f.id===id);if(!f||f.gift||h.owned.includes(id)||state.coins<f.cost)return false;state.coins-=f.cost;h.owned.push(id);save();return true}
function housePlace(id){const h=ensureHouse(),f=houseFurniture.find(f=>f.id===id);if(!f||!h.owned.includes(id)||h.items.some(o=>o.id===id))return false;const uid='h'+h.next++;h.items.push({uid,id,x:28+Math.random()*58,y:f.wall?22+Math.random()*16:f.floor?84:72+Math.random()*14,scale:1,flip:false});save();return uid}
function houseMove(uid,patch){const o=ensureHouse().items.find(o=>o.uid===uid);if(!o)return false;for(const [k,min,max] of [['x',6,94],['y',12,94],['scale',.6,1.6]])if(Number.isFinite(patch[k]))o[k]=Math.min(max,Math.max(min,patch[k]));if(typeof patch.flip==='boolean')o.flip=patch.flip;save();return true}
function houseStore(uid){const h=ensureHouse(),n=h.items.length;h.items=h.items.filter(o=>o.uid!==uid);save();return h.items.length<n}
function houseColour(kind,v){const h=ensureHouse(),list=kind==='wall'?houseWalls:houseFloors;if(!list.includes(v))return false;h[kind]=v;save();return true}

function furnitureArt(id){
 const wrap=s=>`<svg viewBox="0 0 120 110" aria-hidden="true">${s}</svg>`;
 if(id==='picture')return wrap(`<rect x="22" y="18" width="76" height="62" rx="6" fill="#a37a4c" stroke="#7a5835" stroke-width="3"/><rect x="30" y="26" width="60" height="46" fill="#dcebd2"/><g transform="translate(34 32) scale(.9)">${typeof miniFrog==='function'?miniFrog(state.frog).replace(/<svg[^>]*>|<\/svg>/g,''):''}</g>`);
 if(id==='aquarium'){const caught=Object.keys(state.fishing?.caught||{}).filter(k=>k!=='stovel').slice(0,3);return wrap(`<rect x="14" y="30" width="92" height="56" rx="8" fill="#bfe3e0" stroke="#7aa7a3" stroke-width="3" opacity=".95"/><rect x="14" y="30" width="92" height="10" fill="#e8f7f5" opacity=".7"/><path d="M20 84Q40 76 60 84T100 84" fill="#d8c79a"/><path d="M28 84V62M34 84V68" stroke="#6f9b5c" stroke-width="3"/>${caught.map((k,i)=>`<g transform="translate(${30+i*24} ${46+(i%2)*14}) scale(.32)">${typeof fishArt==='function'?fishArt(k).replace(/<svg[^>]*>|<\/svg>/g,''):''}</g>`).join('')}<rect x="20" y="86" width="80" height="16" rx="3" fill="#8a6a45"/>`)}
 return wrap(({
  rug:'<ellipse cx="60" cy="72" rx="56" ry="22" fill="#c98a7a"/><ellipse cx="60" cy="72" rx="44" ry="16" fill="#e6b58f"/><ellipse cx="60" cy="72" rx="28" ry="9" fill="#f3d8a8"/>',
  mossbed:'<rect x="10" y="40" width="10" height="56" rx="4" fill="#8d6744"/><rect x="100" y="56" width="10" height="40" rx="4" fill="#8d6744"/><rect x="14" y="62" width="92" height="22" rx="8" fill="#7f9f5c"/><path d="M14 64Q40 52 66 62T106 62V70H14Z" fill="#a6c37c"/><ellipse cx="34" cy="58" rx="16" ry="9" fill="#f6efe0"/><path d="M50 62Q76 54 104 64V74H50Z" fill="#d79e8f"/>',
  table:'<path d="M14 46Q60 18 106 46Q60 58 14 46Z" fill="#c96c5e" stroke="#9e5149" stroke-width="2"/><g fill="#fff2d9"><ellipse cx="42" cy="38" rx="7" ry="3"/><ellipse cx="70" cy="33" rx="6" ry="2.5"/><ellipse cx="86" cy="42" rx="5" ry="2"/></g><path d="M52 50H68V98H52Z" fill="#f2e3c2"/><ellipse cx="60" cy="98" rx="22" ry="5" fill="#e3cfa6"/>',
  chair:'<path d="M36 30Q60 10 84 30V58H36Z" fill="#a8774a"/><path d="M38 30Q60 16 82 30" fill="none" stroke="#7d5634" stroke-width="5"/><rect x="32" y="56" width="56" height="12" rx="5" fill="#c79a62"/><path d="M38 68V98M82 68V98" stroke="#7d5634" stroke-width="6" stroke-linecap="round"/>',
  lamp:'<path d="M60 100V36" stroke="#6e5a40" stroke-width="5"/><ellipse cx="60" cy="100" rx="18" ry="5" fill="#6e5a40"/><path d="M38 40L50 14H70L82 40Z" fill="#f2cf86" stroke="#b08a48" stroke-width="2"/><circle cx="60" cy="44" r="16" fill="#fff6c4" opacity=".55"/>',
  shelf:'<rect x="22" y="8" width="76" height="94" rx="4" fill="#9c7350" stroke="#77553a" stroke-width="3"/><path d="M26 38H94M26 70H94" stroke="#77553a" stroke-width="4"/><g><rect x="30" y="16" width="8" height="20" fill="#c7716a"/><rect x="40" y="18" width="7" height="18" fill="#7a9cc0"/><rect x="49" y="14" width="9" height="22" fill="#e1c06b"/><rect x="66" y="20" width="22" height="16" rx="8" fill="#9fc29a"/><rect x="32" y="48" width="9" height="20" fill="#8c79b2"/><rect x="43" y="50" width="7" height="18" fill="#d99a6b"/><circle cx="76" cy="60" r="8" fill="#bfe3e0"/><rect x="30" y="80" width="24" height="18" rx="3" fill="#e6d3b0"/><rect x="62" y="78" width="9" height="20" fill="#c7716a"/></g>',
  plant:'<path d="M42 72H78L72 100H48Z" fill="#c9785f"/><rect x="40" y="68" width="40" height="8" rx="3" fill="#b4664f"/><g fill="#6f9b5c"><path d="M60 70Q40 46 30 50Q44 66 60 70"/><path d="M60 70Q82 40 94 46Q78 64 60 70"/><path d="M60 70Q56 34 64 22Q70 46 60 70"/></g>',
  teaset:'<ellipse cx="60" cy="94" rx="44" ry="7" fill="#e7dcc4"/><path d="M38 60H72Q74 90 55 92Q38 90 38 60Z" fill="#f4f0e6" stroke="#b9a988" stroke-width="2"/><path d="M72 66Q86 64 82 78Q80 84 70 84" fill="none" stroke="#b9a988" stroke-width="3"/><path d="M38 66Q26 62 28 54" fill="none" stroke="#b9a988" stroke-width="3"/><circle cx="55" cy="56" r="4" fill="#b9a988"/><g fill="#9fc29a"><circle cx="50" cy="74" r="3"/><circle cx="60" cy="78" r="3"/></g><path d="M84 86H100Q99 94 92 94Q85 94 84 86Z" fill="#f4f0e6" stroke="#b9a988" stroke-width="2"/>',
  clock:'<circle cx="60" cy="48" r="34" fill="#f8efd8" stroke="#8d6744" stroke-width="6"/><path d="M60 48V26M60 48L74 56" stroke="#4b3a2a" stroke-width="4" stroke-linecap="round"/><g fill="#8d6744"><circle cx="60" cy="20" r="2.5"/><circle cx="88" cy="48" r="2.5"/><circle cx="60" cy="76" r="2.5"/><circle cx="32" cy="48" r="2.5"/></g><path d="M56 82L50 100M64 82L70 100" stroke="#8d6744" stroke-width="3"/><circle cx="60" cy="100" r="5" fill="#d6ad48"/>',
  stove:'<rect x="28" y="10" width="64" height="88" rx="10" fill="#e8eef0" stroke="#a9b8bd" stroke-width="3"/><g fill="none" stroke="#7fa0b0" stroke-width="2"><path d="M28 34H92M28 58H92M28 82H92M50 10V98M70 10V98"/></g><rect x="44" y="62" width="32" height="18" rx="4" fill="#4b3a2a"/><path d="M50 78Q60 64 70 78" fill="#f2a24a"/><path d="M55 78Q60 70 65 78" fill="#ffe08a"/><rect x="24" y="96" width="72" height="6" rx="3" fill="#a9b8bd"/>'
 })[id]||(typeof extraFurnitureArt!=='undefined'&&extraFurnitureArt[id])||'');
}
function houseRoomArt(){const h=ensureHouse();return `<svg class="houseBackdrop" viewBox="0 0 1000 600" preserveAspectRatio="none" aria-hidden="true"><rect width="1000" height="600" fill="${h.wall}"/><path d="M0 0H1000V60Q500 -10 0 60Z" fill="#c96c5e"/><path d="M0 60Q500 -10 1000 60" fill="none" stroke="#9e5149" stroke-width="10"/><g fill="#00000010"><circle cx="160" cy="180" r="10"/><circle cx="420" cy="120" r="8"/><circle cx="780" cy="200" r="12"/><circle cx="620" cy="300" r="7"/></g><circle cx="770" cy="220" r="90" fill="#b98d5f"/><circle cx="770" cy="220" r="76" fill="#bfe0d8"/><path d="M694 240Q770 190 846 236V300H694Z" fill="#9dbb84"/><circle cx="800" cy="180" r="16" fill="#f8e8a4"/><path d="M770 144V296M694 220H846" stroke="#b98d5f" stroke-width="8"/><path d="M90 430V250Q140 180 190 250V430" fill="#806449"/><circle cx="170" cy="345" r="7" fill="#f4d67e"/><rect y="430" width="1000" height="170" fill="${h.floor}"/><g stroke="#00000018" stroke-width="3"><path d="M0 470H1000M0 520H1000M0 570H1000M130 430V470M380 470V520M640 430V470M820 520V570M260 520V570"/></g><path d="M0 430H1000" stroke="#00000022" stroke-width="8"/></svg>`}
function houseItemHTML(o){const f=houseFurniture.find(f=>f.id===o.id);return `<button class="houseItem ${f.floor?'floorItem':''} ${o.uid===houseSelected?'selected':''}" data-house-item="${o.uid}" aria-label="${f.name}, flytta med piltangenter eller dra" style="left:${o.x}%;top:${o.y}%;--size:${o.scale};--flip:${o.flip?-1:1};z-index:${f.floor?1:Math.round(o.y)+2}">${furnitureArt(o.id)}</button>`}

function renderHouse(){
 const h=ensureHouse();const keepRow=document.querySelector('.gardenInventory')?.scrollLeft||0;
 $('#content').innerHTML=`<div class="sectionHead"><div><div class="eyebrow">ERT HEM I GLÄNTAN</div><h2>Inne i svamphuset</h2></div><span class="pill">${h.items.length} möbler i rummet</span></div><section id="houseRoom" class="houseRoom" aria-label="Svamphusets rum. Välj en möbel och dra den eller använd piltangenterna.">${houseRoomArt()}<div class="houseTeam">${frog()}</div>${typeof queenFikaHTML==='function'?queenFikaHTML():''}${h.items.map(houseItemHTML).join('')}${h.items.length?'':'<p class="houseEmpty">Rummet är tomt. Köp en möbel nedanför och ställ in den!</p>'}</section><div class="gardenEditor"><p id="houseHint" role="status">Välj en möbel. Dra den dit du vill eller flytta med piltangenterna.</p><div class="gardenTools"><button class="outline" data-house-adjust="smaller">− Mindre</button><button class="outline" data-house-adjust="bigger">+ Större</button><button class="outline" data-house-adjust="flip">⇋ Spegla</button><button class="outline" id="houseStore">Till förrådet</button></div></div><div class="gardenLower"><section class="editor"><h3>Möbler</h3><p>Köp en gång, flytta hur mycket ni vill.</p><div class="gardenInventory">${houseFurniture.map(f=>{const own=h.owned.includes(f.id),placed=h.items.some(o=>o.id===f.id);return `<article><div class="gardenThumb">${furnitureArt(f.id)}</div><strong>${f.name}</strong>${own?`<button class="outline" data-house-place="${f.id}" ${placed?'disabled':''}>${placed?'I rummet':'Ställ in'}</button>`:f.gift?'<small>Gåva från Skogsdrottningen</small>':`<button class="outline" data-house-buy="${f.id}" ${state.coins<f.cost?'disabled':''}>Köp · ${f.cost} ✦</button>`}</article>`}).join('')}</div></section><section class="editor"><h3>Väggar och golv</h3><label>Väggfärg</label><div class="options">${houseWalls.map(v=>`<button class="swatch ${h.wall===v?'chosen':''}" style="background:${v}" data-house-wall="${v}" aria-label="Väggfärg ${v}"></button>`).join('')}</div><label>Golv</label><div class="options">${houseFloors.map(v=>`<button class="swatch ${h.floor===v?'chosen':''}" style="background:${v}" data-house-floor="${v}" aria-label="Golv ${v}"></button>`).join('')}</div><p>✧ Akvariet visar fiskarna ni har fångat, och tavlan visar grodan som tävlar.</p></section></div>`;
 {const inv=document.querySelector('.gardenInventory');if(inv&&keepRow)inv.scrollLeft=keepRow}
 wireHouse();
}
function wireHouse(){
 const room=$('#houseRoom');
 const select=uid=>{houseSelected=uid;document.querySelectorAll('[data-house-item]').forEach(e=>e.classList.toggle('selected',e.dataset.houseItem===uid));const o=state.house.items.find(o=>o.uid===uid);$('#houseHint').textContent=o?houseFurniture.find(f=>f.id===o.id).name+' är vald. Dra eller använd piltangenterna.':'Välj en möbel att flytta.';document.querySelectorAll('[data-house-adjust],#houseStore').forEach(b=>b.disabled=!o)};
 const refresh=(o,e)=>{e.style.left=o.x+'%';e.style.top=o.y+'%';e.style.setProperty('--size',o.scale);e.style.setProperty('--flip',o.flip?-1:1);if(!e.classList.contains('floorItem'))e.style.zIndex=Math.round(o.y)+2};
 document.querySelectorAll('[data-house-item]').forEach(e=>{let drag=null;const item=()=>state.house.items.find(o=>o.uid===e.dataset.houseItem);
  e.onclick=()=>select(e.dataset.houseItem);
  e.onpointerdown=ev=>{if(ev.button!==0)return;const o=item();select(o.uid);drag={px:ev.clientX,py:ev.clientY,x:o.x,y:o.y,rect:room.getBoundingClientRect()};e.setPointerCapture(ev.pointerId)};
  e.onpointermove=ev=>{if(!drag)return;const o=item();o.x=Math.min(94,Math.max(6,drag.x+(ev.clientX-drag.px)/drag.rect.width*100));o.y=Math.min(94,Math.max(12,drag.y+(ev.clientY-drag.py)/drag.rect.height*100));refresh(o,e)};
  e.onpointerup=e.onpointercancel=()=>{if(drag){drag=null;save()}};
  e.onkeydown=ev=>{const dir={ArrowLeft:[-2,0],ArrowRight:[2,0],ArrowUp:[0,-2],ArrowDown:[0,2]}[ev.key];if(!dir)return;ev.preventDefault();select(e.dataset.houseItem);const o=item();houseMove(o.uid,{x:o.x+dir[0],y:o.y+dir[1]});refresh(o,e)};
 });
 select(houseSelected);
 document.querySelectorAll('[data-house-adjust]').forEach(b=>b.onclick=()=>{const o=state.house.items.find(o=>o.uid===houseSelected);if(!o)return;const a=b.dataset.houseAdjust;houseMove(o.uid,a==='flip'?{flip:!o.flip}:{scale:o.scale+(a==='bigger'?.1:-.1)});refresh(o,document.querySelector(`[data-house-item="${o.uid}"]`))});
 $('#houseStore').onclick=()=>{houseStore(houseSelected);houseSelected=null;renderHouse()};
 document.querySelectorAll('[data-house-buy]').forEach(b=>b.onclick=()=>{if(houseBuy(b.dataset.houseBuy)){sfx('chime');houseSelected=housePlace(b.dataset.houseBuy);sidebar();renderHouse();toast('Ny möbel i svamphuset!')}});
 document.querySelectorAll('[data-house-place]').forEach(b=>b.onclick=()=>{houseSelected=housePlace(b.dataset.housePlace);renderHouse()});
 document.querySelectorAll('[data-house-wall]').forEach(b=>b.onclick=()=>{houseColour('wall',b.dataset.houseWall);renderHouse()});
 document.querySelectorAll('[data-house-floor]').forEach(b=>b.onclick=()=>{houseColour('floor',b.dataset.houseFloor);renderHouse()});
}
