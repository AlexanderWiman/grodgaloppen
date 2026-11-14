// Your own shop on the village square (family survey 2, step 3). Put fish from the bucket and
// berries from the glade on the shelf. While something is on the shelf, a customer comes by
// about every 40 seconds (even while you are away). At most three wait, and never more than
// there are goods on the shelf. Each customer has
// favourites and pays extra for them. Every fifth happy customer gives a shop star.

const SHOP_EVERY=40000,SHOP_QUEUE=3;
const shopGoods={bar:{name:'Bär',price:5},mort:{name:'Mört',price:6},abborre:{name:'Abborre',price:9},stovel:{name:'Gammal stövel',price:4},gadda:{name:'Gädda',price:16},manfisk:{name:'Månfisk',price:20},guldfisk:{name:'Guldfisk',price:28}};
const shopCustomers=[
 {id:'mira',name:'Mira',likes:['bar'],hello:'Har du söta bär till min blomsterte?'},
 {id:'tagge',name:'Tagge',likes:['bar'],hello:'Jag ska baka paj igen!'},
 {id:'tilda',name:'Tilda',likes:['mort','abborre'],hello:'Något gott till middag, tack.'},
 {id:'vide',name:'Vide',likes:['manfisk','guldfisk'],hello:'Har du något som lyser?'},
 {id:'tuss',name:'Tuss',likes:['stovel','gadda'],hello:'Tuss handlar! Tuss har sparat.',friend:true},
 {id:'klover',name:'Klöver',likes:['bar','mort'],hello:'Lite energi inför nästa lopp!'}
];

function ensureShop(){if(!state.shop)state.shop={stock:{},queue:[],last:null,served:0,earned:0};return state.shop}
function shopStockCount(){return Object.values(ensureShop().stock).reduce((a,b)=>a+b,0)}
function shopHave(good){if(good==='bar')return state.garden?.berries||0;return state.fishing?.bucket?.[good]||0}
function shopTake(good,n){if(good==='bar')state.garden.berries-=n;else state.fishing.bucket[good]-=n}
function shopGive(good,n){if(good==='bar'){if(typeof ensureGarden==='function')ensureGarden();state.garden.berries+=n}else{ensureFishing();state.fishing.bucket[good]=(state.fishing.bucket[good]||0)+n}}
function shopStock(good,now=Date.now()){const s=ensureShop();if(!shopGoods[good]||shopHave(good)<1)return false;const wasEmpty=shopStockCount()===0;shopTake(good,1);s.stock[good]=(s.stock[good]||0)+1;if(wasEmpty&&!s.queue.length)s.last=now-SHOP_EVERY+6000;save();return true}
function shopUnstock(good){const s=ensureShop();if(!(s.stock[good]>0))return false;s.stock[good]--;shopGive(good,1);save();return true}
function shopVisitors(){return shopCustomers.filter(c=>!c.friend||(state.fishing?.troll||0)>=1)}
function shopWant(c,rnd=Math.random){const s=ensureShop(),stocked=Object.keys(s.stock).filter(g=>s.stock[g]>0);if(!stocked.length)return null;const fav=c.likes.filter(g=>stocked.includes(g));const list=fav.length&&rnd()<.75?fav:stocked;return list[Math.floor(rnd()*list.length)]}
// Customers who arrived since the last look. Time is passed in so tests can fast-forward.
function shopTick(now=Date.now(),rnd=Math.random){
 const s=ensureShop(),room=()=>Math.min(SHOP_QUEUE,shopStockCount());if(s.last===null)s.last=now;let added=0;
 if(s.queue.length>=room()){s.last=now;return 0}
 while(now-s.last>=SHOP_EVERY&&s.queue.length<room()){
  s.last+=SHOP_EVERY;const free=shopVisitors().filter(c=>!s.queue.some(q=>q.id===c.id));if(!free.length)break;
  const c=free[Math.floor(rnd()*free.length)],want=shopWant(c,rnd);if(!want)break;s.queue.push({id:c.id,want});added++;
 }
 if(s.queue.length>=room())s.last=now;
 if(added)save();return added;
}
function shopNextIn(now=Date.now()){const s=ensureShop();if(s.queue.length>=Math.min(SHOP_QUEUE,shopStockCount())||s.last===null)return null;return Math.max(0,SHOP_EVERY-(now-s.last))}
function shopSell(i,rnd=Math.random){
 const s=ensureShop(),q=s.queue[i];if(!q)return null;const c=shopCustomers.find(c=>c.id===q.id);
 if(!(s.stock[q.want]>0)){const other=shopWant(c,rnd);if(!other){s.queue.splice(i,1);save();return{left:true}}q.want=other}
 const good=q.want,fav=c.likes.includes(good),coins=Math.round(shopGoods[good].price*(fav?1.5:1));
 s.stock[good]--;s.queue.splice(i,1);s.served++;s.earned+=coins;state.coins+=coins;
 const star=s.served%5===0;if(star)state.coins+=25;save();return{coins,fav,star,good,who:c.name};
}
function shopStars(){return Math.floor(ensureShop().served/5)}
function shopCustomerArt(id){if(id==='tuss'&&typeof trollArt==='function')return trollArt();if(id==='klover'&&typeof miniFrog==='function'){const r=rivals.find(r=>r.name==='Klöver');return miniFrog(r.color,r.hat)}return typeof residentArt==='function'?residentArt(id):''}

let shopTimer=null;
function renderShop(){
 const s=ensureShop();shopTick();clearInterval(shopTimer);
 const goods=Object.entries(shopGoods);
 $('#content').innerHTML=`<div class="sectionHead"><div><div class="eyebrow">PÅ TORGET I ÄLVBYN</div><h2>Grodbutiken</h2></div><span class="pill">${'★'.repeat(shopStars())||'☆'} · ${s.served} nöjda kunder</span></div><section class="shopFront"><div class="shopAwning" aria-hidden="true"></div><div class="shopShelf">${goods.filter(([g])=>s.stock[g]>0).map(([g,v])=>`<div class="shopGood"><div class="shopGoodArt">${shopGoodArt(g)}</div><b>${v.name}</b><small>${s.stock[g]} st · ${v.price} ✦</small></div>`).join('')||'<p class="shopEmpty">Hyllan är tom. Ställ ut fisk eller bär nedanför, så kommer kunderna!</p>'}</div><div class="shopQueue" id="shopQueue"></div></section><div class="gardenLower"><section class="editor"><h3>Ställ ut varor</h3><p>Fisk kommer från hinken i dammen och bär från gläntans odlingsbäddar. Grannarna betalar extra för sina favoriter.</p><div class="shopStockList">${goods.map(([g,v])=>`<div class="shopStockRow"><span class="shopGoodArt small">${shopGoodArt(g)}</span><span><b>${v.name}</b><small>Hemma: ${shopHave(g)} · På hyllan: ${s.stock[g]||0}</small></span><button class="outline" data-unstock="${g}" ${s.stock[g]>0?'':'disabled'} aria-label="Ta tillbaka">−</button><button class="primary" data-stock="${g}" ${shopHave(g)>0?'':'disabled'} aria-label="Ställ ut">+</button></div>`).join('')}</div></section><section class="editor"><h3>Så går det</h3><p>Ni har tjänat ${s.earned} daggdroppar i butiken.</p><p>Var femte nöjda kund ger en butiksstjärna och 25 daggdroppar i tack.</p><p>Kunder kommer även när ni är borta. Högst tre väntar åt gången, och aldrig fler än det finns varor.</p></section></div>`;
 renderShopQueue();
 document.querySelectorAll('[data-stock]').forEach(b=>b.onclick=()=>{if(shopStock(b.dataset.stock)){sfx('tick');renderShop()}});
 document.querySelectorAll('[data-unstock]').forEach(b=>b.onclick=()=>{if(shopUnstock(b.dataset.unstock))renderShop()});
 shopTimer=setInterval(()=>{if(typeof tab==='undefined'||tab!=='shop'||!$('#shopQueue')){clearInterval(shopTimer);return}if(shopTick())renderShop();else renderShopQueue()},1000);
}
function renderShopQueue(){
 const box=$('#shopQueue');if(!box)return;const s=ensureShop(),next=shopNextIn();
 box.innerHTML=s.queue.map((q,i)=>{const c=shopCustomers.find(c=>c.id===q.id);return `<article class="shopCustomer"><div class="shopCustomerArt">${shopCustomerArt(c.id)}</div><div><b>${c.name}</b><p>”${c.hello}”</p><small>Vill köpa: ${shopGoods[q.want].name}</small>${c.likes.includes(q.want)?'<small class="shopFav">♥ favorit</small>':''}<button class="primary" data-sell="${i}">Sälj · ${Math.round(shopGoods[q.want].price*(c.likes.includes(q.want)?1.5:1))} ✦</button></div></article>`}).join('')+(next!==null?`<p class="shopNext">Nästa kund om ${Math.ceil(next/1000)} s</p>`:s.queue.length?'':'<p class="shopNext">Inga kunder just nu.</p>');
 document.querySelectorAll('[data-sell]').forEach(b=>b.onclick=()=>{const r=shopSell(+b.dataset.sell);if(!r)return;if(r.left)toast('Kunden hittade inget och går hem.');else{sfx(r.star?'win':'chime');toast(`Sålt: ${shopGoods[r.good].name} · +${r.coins} daggdroppar${r.star?' · ★ Ny butiksstjärna! +25':''}`)}sidebar();renderShop()});
}
function shopGoodArt(g){if(g==='bar')return '<svg viewBox="0 0 100 70" aria-hidden="true"><path d="M20 30H80L72 64H28Z" fill="#c79a62" stroke="#8d6744" stroke-width="3"/><g fill="#d9435a"><circle cx="38" cy="28" r="10"/><circle cx="56" cy="24" r="11"/><circle cx="68" cy="31" r="9"/></g><g fill="#fff" opacity=".5"><circle cx="35" cy="25" r="3"/><circle cx="53" cy="20" r="3"/></g><path d="M56 13Q60 6 66 8" stroke="#6f9b5c" stroke-width="3" fill="none"/></svg>';return typeof fishArt==='function'?fishArt(g):''}
