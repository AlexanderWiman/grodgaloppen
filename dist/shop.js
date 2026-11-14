// Your own shop on the village square (family survey 2, step 3). Put fish from the bucket and
// berries from the glade on the shelf. While something is on the shelf, a customer comes by
// about every 40 seconds (even while you are away). At most three wait, and never more than
// there are goods on the shelf. Each customer has
// favourites and pays extra for them. Every fifth happy customer gives a shop star.

const SHOP_EVERY=40000,SHOP_QUEUE=3;
const shopGoods={bar:{name:'Bär',price:5},mort:{name:'Mört',price:6},abborre:{name:'Abborre',price:9},stovel:{name:'Gammal stövel',price:4},gadda:{name:'Gädda',price:16},manfisk:{name:'Månfisk',price:20},guldfisk:{name:'Guldfisk',price:28},ruda:{name:'Ruda',price:6},gos:{name:'Gös',price:18},roding:{name:'Röding',price:22},
 // Made in the workshop (unlocks after 10 sales).
 jam:{name:'Bärsylt',price:22,made:true},pie:{name:'Fiskpaj',price:30,made:true},planter:{name:'Stövelkruka',price:18,made:true}};
const shopRecipes={jam:{bar:3},pie:{mort:1,bar:2},planter:{stovel:1,bar:1}};
const shopCustomers=[
 {id:'mira',name:'Mira',likes:['bar','jam'],hello:'Har du söta bär till min blomsterte?'},
 {id:'tagge',name:'Tagge',likes:['bar','jam'],hello:'Jag ska baka paj igen!'},
 {id:'tilda',name:'Tilda',likes:['mort','abborre','pie'],hello:'Något gott till middag, tack.'},
 {id:'vide',name:'Vide',likes:['manfisk','guldfisk','planter'],hello:'Har du något som lyser?'},
 {id:'tuss',name:'Tuss',likes:['stovel','gadda','planter'],hello:'Tuss handlar! Tuss har sparat.',friend:true},
 {id:'klover',name:'Klöver',likes:['bar','mort','pie'],hello:'Lite energi inför nästa lopp!'}
];

function ensureShop(){if(!state.shop)state.shop={stock:{},queue:[],last:null,served:0,earned:0};return state.shop}
function shopStockCount(){return Object.values(ensureShop().stock).reduce((a,b)=>a+b,0)}
function shopHave(good){if(shopGoods[good]?.made)return state.shop?.made?.[good]||0;if(good==='bar')return state.garden?.berries||0;return state.fishing?.bucket?.[good]||0}
function shopTake(good,n){if(shopGoods[good]?.made){state.shop.made[good]-=n;return}if(good==='bar')state.garden.berries-=n;else state.fishing.bucket[good]-=n}
function shopGive(good,n){if(shopGoods[good]?.made){ensureShop().made??={};state.shop.made[good]=(state.shop.made[good]||0)+n;return}if(good==='bar'){if(typeof ensureGarden==='function')ensureGarden();state.garden.berries+=n}else{ensureFishing();state.fishing.bucket[good]=(state.fishing.bucket[good]||0)+n}}
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
 const s=ensureShop();shopTick();shopNewOrder();clearInterval(shopTimer);
 const goods=Object.entries(shopGoods);
 $('#content').innerHTML=`<div class="sectionHead"><div><div class="eyebrow">PÅ TORGET I ÄLVBYN</div><h2>Grodbutiken</h2></div><span class="pill">${'★'.repeat(shopStars())||'☆'} · ${s.served} nöjda kunder</span></div><section class="shopFront"><div class="shopAwning" aria-hidden="true"></div><div class="shopShelf">${goods.filter(([g])=>s.stock[g]>0).map(([g,v])=>`<div class="shopGood"><div class="shopGoodArt">${shopGoodArt(g)}</div><b>${v.name}</b><small>${s.stock[g]} st · ${v.price} ✦</small></div>`).join('')||'<p class="shopEmpty">Hyllan är tom. Ställ ut fisk eller bär nedanför, så kommer kunderna!</p>'}</div><div class="shopQueue" id="shopQueue"></div></section><div class="gardenLower"><section class="editor"><h3>Ställ ut varor</h3><p>Fisk kommer från hinken i dammen och bär från gläntans odlingsbäddar. Grannarna betalar extra för sina favoriter.</p>${typeof pantryHave==='function'&&(typeof unlocked!=='function'||unlocked('yard'))?'<p>Grönsaker, ägg och mat kommer från skafferiet i trädgården.</p>':''}<div class="shopStockList">${goods.filter(([g,v])=>g==='bar'||shopHave(g)>0||s.stock[g]>0).map(([g,v])=>`<div class="shopStockRow"><span class="shopGoodArt small">${shopGoodArt(g)}</span><span><b>${v.name}</b><small>Hemma: ${shopHave(g)} · På hyllan: ${s.stock[g]||0}</small></span><button class="outline" data-unstock="${g}" ${s.stock[g]>0?'':'disabled'} aria-label="Ta tillbaka">−</button><button class="primary" data-stock="${g}" ${shopHave(g)>0?'':'disabled'} aria-label="Ställ ut">+</button></div>`).join('')}</div></section><section class="editor"><h3>Så går det</h3><p>Ni har tjänat ${s.earned} daggdroppar i butiken.</p><p>Var femte nöjda kund ger en butiksstjärna och 25 daggdroppar i tack.</p><p>Kunder kommer även när ni är borta. Högst tre väntar åt gången, och aldrig fler än det finns varor.</p></section></div><div class="houseExtras">${workshopHTML()}${ordersHTML()}</div>`;
 renderShopQueue();
 document.querySelectorAll('[data-stock]').forEach(b=>b.onclick=()=>{if(shopStock(b.dataset.stock)){sfx('tick');renderShop()}});
 document.querySelectorAll('[data-unstock]').forEach(b=>b.onclick=()=>{if(shopUnstock(b.dataset.unstock))renderShop()});
 document.querySelectorAll('[data-craft]').forEach(b=>b.onclick=()=>{if(shopCraft(b.dataset.craft)){sfx('chime');renderShop();toast('Tillverkat: '+shopGoods[b.dataset.craft].name)}});
 document.querySelectorAll('[data-deliver]').forEach(b=>b.onclick=()=>{const r=shopDeliver(+b.dataset.deliver);if(r){sfx('win');sidebar();renderShop();toast('Levererat · +'+r.reward+' daggdroppar')}});
 shopTimer=setInterval(()=>{if(typeof tab==='undefined'||tab!=='shop'||!$('#shopQueue')){clearInterval(shopTimer);return}if(shopTick())renderShop();else renderShopQueue()},1000);
}
function renderShopQueue(){
 const box=$('#shopQueue');if(!box)return;const s=ensureShop(),next=shopNextIn();
 box.innerHTML=s.queue.map((q,i)=>{const c=shopCustomers.find(c=>c.id===q.id);return `<article class="shopCustomer"><div class="shopCustomerArt">${shopCustomerArt(c.id)}</div><div><b>${c.name}</b><p>”${c.hello}”</p><small>Vill köpa: ${shopGoods[q.want].name}</small>${c.likes.includes(q.want)?'<small class="shopFav">♥ favorit</small>':''}<button class="primary" data-sell="${i}">Sälj · ${Math.round(shopGoods[q.want].price*(c.likes.includes(q.want)?1.5:1))} ✦</button></div></article>`}).join('')+(next!==null?`<p class="shopNext">Nästa kund om ${Math.ceil(next/1000)} s</p>`:s.queue.length?'':'<p class="shopNext">Inga kunder just nu.</p>');
 document.querySelectorAll('[data-sell]').forEach(b=>b.onclick=()=>{const r=shopSell(+b.dataset.sell);if(!r)return;if(r.left)toast('Kunden hittade inget och går hem.');else{sfx(r.star?'win':'chime');toast(`Sålt: ${shopGoods[r.good].name} · +${r.coins} daggdroppar${r.star?' · ★ Ny butiksstjärna! +25':''}`)}sidebar();renderShop()});
}
function shopGoodArt(g){if(g==='bar')return '<svg viewBox="0 0 100 70" aria-hidden="true"><path d="M20 30H80L72 64H28Z" fill="#c79a62" stroke="#8d6744" stroke-width="3"/><g fill="#d9435a"><circle cx="38" cy="28" r="10"/><circle cx="56" cy="24" r="11"/><circle cx="68" cy="31" r="9"/></g><g fill="#fff" opacity=".5"><circle cx="35" cy="25" r="3"/><circle cx="53" cy="20" r="3"/></g><path d="M56 13Q60 6 66 8" stroke="#6f9b5c" stroke-width="3" fill="none"/></svg>';return typeof fishArt==='function'?fishArt(g):''}

// ---------- Survey 3, step 3: the workshop and orders from the neighbours ----------
// The workshop (after 10 sales) turns berries and fish into things worth more. Orders (after
// crafting 3 things) come one a day, up to two open at once, and never run out of time.
function shopCraft(id){const r=shopRecipes[id];if(!r||typeof unlocked==='function'&&!unlocked('workshop'))return false;if(!Object.entries(r).every(([g,n])=>shopHave(g)>=n))return false;Object.entries(r).forEach(([g,n])=>shopTake(g,n));shopGive(id,1);state.shop.crafted=(state.shop.crafted||0)+1;save();return true}
function workshopHTML(){if(typeof unlocked==='function'&&!unlocked('workshop'))return `<section class="editor"><h3>Verkstaden</h3>${typeof lockedHint==='function'?lockedHint('workshop'):''}</section>`;
 return `<section class="editor workshop"><h3>Verkstaden</h3><p>Gör egna varor av bär och fisk. De är värda mer i butiken.</p><div class="shopStockList">${Object.entries(shopRecipes).map(([id,r])=>{const ok=Object.entries(r).every(([g,n])=>shopHave(g)>=n);return `<div class="shopStockRow craftRow"><span class="shopGoodArt small">${shopGoodArt(id)}</span><span><b>${shopGoods[id].name}</b><small>${Object.entries(r).map(([g,n])=>'<span>'+n+' '+shopGoods[g].name.toLowerCase()+'</span>').join(' + ')} <span>· ${shopGoods[id].price} ✦</span></small></span><button class="primary" data-craft="${id}" ${ok?'':'disabled'}>Gör</button></div>`}).join('')}</div></section>`}
function shopOrderDay(now=Date.now()){const d=new Date(now);return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate()}
function shopNewOrder(now=Date.now(),rnd=Math.random){
 if(typeof unlocked==='function'&&!unlocked('orders'))return null;const s=ensureShop();s.orders??=[];const day=shopOrderDay(now);
 if(s.orderDay===day||s.orders.length>=2)return null;
 const who=shopVisitors().filter(c=>!s.orders.some(o=>o.who===c.id)),c=who[Math.floor(rnd()*who.length)];if(!c)return null;
 const pool=['jam','pie','planter','mort','abborre','bar',...(typeof yardOrderGoods==='function'?yardOrderGoods():[])],good=pool[Math.floor(rnd()*pool.length)],n=1+Math.floor(rnd()*(shopGoods[good].made?2:3));
 const o={who:c.id,good,n,reward:Math.round(shopGoods[good].price*n*1.8)+10};s.orders.push(o);s.orderDay=day;save();return o;
}
function shopDeliver(i){const s=ensureShop(),o=(s.orders||[])[i];if(!o||shopHave(o.good)<o.n)return null;shopTake(o.good,o.n);state.coins+=o.reward;s.orders.splice(i,1);s.delivered=(s.delivered||0)+1;if(state.village){state.village.friendship??={};state.village.friendship[o.who]=(state.village.friendship[o.who]||0)+1}save();return{...o,who:shopCustomers.find(c=>c.id===o.who)?.name||o.who}}
function ordersHTML(){if(typeof unlocked==='function'&&!unlocked('orders'))return `<section class="editor"><h3>Beställningar</h3>${typeof lockedHint==='function'?lockedHint('orders'):''}</section>`;const s=ensureShop(),list=s.orders||[];
 return `<section class="editor orders"><h3>Beställningar</h3><p>Grannarna beställer något nytt varje dag. Leverera när ni har varorna hemma – de väntar så länge som behövs.</p>${list.length?list.map((o,i)=>{const c=shopCustomers.find(c=>c.id===o.who),have=shopHave(o.good);return `<article class="orderCard"><div class="shopCustomerArt">${shopCustomerArt(o.who)}</div><div><b>${c?.name||o.who}</b><p><span>Vill ha</span> <span>${o.n} ${shopGoods[o.good].name.toLowerCase()}</span></p><small>Ni har: ${have} av ${o.n} · Belöning ${o.reward} ✦</small><button class="primary" data-deliver="${i}" ${have>=o.n?'':'disabled'}>Leverera</button></div></article>`}).join(''):'<p class="shopNext">Inga beställningar just nu. I morgon kommer en ny.</p>'}</section>`}
const madeArt={jam:'<svg viewBox="0 0 100 70" aria-hidden="true"><rect x="32" y="16" width="36" height="46" rx="8" fill="#c94a5e"/><rect x="30" y="10" width="40" height="10" rx="3" fill="#f2e6d6"/><path d="M30 14H70" stroke="#c9b48f" stroke-width="2"/><rect x="38" y="32" width="24" height="14" rx="3" fill="#fffaf0"/><circle cx="50" cy="39" r="4" fill="#d9435a"/></svg>',pie:'<svg viewBox="0 0 100 70" aria-hidden="true"><ellipse cx="50" cy="48" rx="38" ry="14" fill="#c9a07a"/><ellipse cx="50" cy="42" rx="36" ry="12" fill="#e8c38f"/><path d="M26 42Q50 30 74 42M34 46Q50 38 66 46" stroke="#c99a5c" stroke-width="3" fill="none"/><path d="M60 36l8-4-2 6Z" fill="#a9b8c2"/></svg>',planter:'<svg viewBox="0 0 100 70" aria-hidden="true"><path d="M34 20H56V44Q72 44 76 52Q78 62 68 62H34Z" fill="#7b5b3c" stroke="#5a4129" stroke-width="2"/><g fill="#6f9b5c"><path d="M44 20Q36 4 28 8Q36 16 44 20"/><path d="M46 20Q50 2 60 4Q54 14 46 20"/></g><circle cx="30" cy="8" r="4" fill="#f6a5c0"/><circle cx="60" cy="5" r="4" fill="#f6d36b"/></svg>'};
{const sga=shopGoodArt;shopGoodArt=function(g){return madeArt[g]||sga(g)}}
