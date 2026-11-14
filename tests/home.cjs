// Step 3: furniture in the mushroom cottage, the village shop and room for twelve frogs.
const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
function game(saved=null){let stored=saved;const nodes=new Map();const $=k=>{if(!nodes.has(k))nodes.set(k,{innerHTML:'',textContent:'',value:'',style:{setProperty(){}},classList:{toggle(){},add(){},remove(){},contains:()=>false},disabled:false,dataset:{}});return nodes.get(k)};const c=vm.createContext({console,Math,Date,localStorage:{getItem:()=>stored,setItem:(k,v)=>stored=v},document:{querySelector:$,querySelectorAll:()=>[],hidden:false,addEventListener(){},removeEventListener(){},body:{classList:{remove(){},add(){},toggle(){}}}},performance:{now:()=>0},requestAnimationFrame:()=>0,setTimeout:()=>0,setInterval:()=>0,clearInterval(){}});for(const f of ['audio.js','garden.js','village.js','world.js','race.js','leaderboard.js','frogs.js','saga.js','seasons.js','fishing.js','house.js','shop.js','astrid.js'])vm.runInContext(fs.readFileSync('dist/'+f,'utf8'),c);vm.runInContext(fs.readFileSync('dist/app.js','utf8').split("document.querySelectorAll('nav button').forEach(b=>b.onclick=")[0],c);return {run:s=>vm.runInContext(s,c),get saved(){return stored}}}
const g=game();g.run('state.hatched=true;ensureGarden();state.coins=500');

// The cottage: buy once, place once, move within the room, store and place again.
assert(!g.run("housePlace('table')"),'cannot place what you do not own');
assert(g.run("houseBuy('table')"));assert.equal(g.run('state.coins'),440);assert(!g.run("houseBuy('table')"),'bought only once');
const uid=g.run("housePlace('table')");assert(uid);assert(!g.run("housePlace('table')"),'one table in the room');
g.run(`houseMove('${uid}',{x:-50,y:500,scale:9,flip:true})`);const o=g.run(`JSON.stringify(state.house.items[0])`);
assert.deepEqual(JSON.parse(o),{uid,id:'table',x:6,y:94,scale:1.6,flip:true,lvl:'down'},'kept inside the room');
assert(g.run(`houseStore('${uid}')`));assert.equal(g.run('state.house.items.length'),0);assert(g.run("housePlace('table')"),'stored furniture comes back');
g.run('state.coins=10');assert(!g.run("houseBuy('stove')"),'too expensive');assert.equal(g.run('state.coins'),10);assert(!g.run("state.house.owned.includes('stove')"));
assert(g.run("houseColour('wall','#d5e3ef')"));assert(!g.run("houseColour('wall','red')"));
for(const f of g.run("houseFurniture.map(f=>f.id)"))assert(g.run(`furnitureArt('${f}').length`)>150,f+' has art');
g.run("fishCatch('guldfisk');fishCatch('mort')");assert(g.run("furnitureArt('aquarium')").length>g.run("furnitureArt('rug')").length,'aquarium shows caught fish');

// The shop: stock from the bucket and berries, customers arrive over time, favourites pay more.
let t=1e6;g.run('state.coins=0;state.garden.berries=3;state.fishing.bucket={mort:2}');
assert(!g.run(`shopStock('gadda',${t})`),'nothing to stock');assert.equal(g.run(`shopTick(${t+999999})`),0,'no customers with an empty shelf');
assert(g.run(`shopStock('bar',${t})`));assert.equal(g.run('state.garden.berries'),2);assert(g.run(`shopStock('mort',${t})`));assert.equal(g.run('state.fishing.bucket.mort'),1);
assert.equal(g.run(`shopTick(${t+5000})`),0,'first customer comes soon, not at once');
assert.equal(g.run(`shopTick(${t+7000})`),1,'first customer after a few seconds');
assert.equal(g.run(`shopTick(${t+7000+40000*10})`),1,'a second customer later');
assert.equal(g.run('state.shop.queue.length'),2,'never more customers than goods on the shelf');
const q=g.run('JSON.stringify(state.shop.queue)');const sold=g.run('shopSell(0)');assert(sold&&sold.coins>0);assert.equal(g.run('state.coins'),sold.coins);
const tilda=g.run("shopCustomers.find(c=>c.id==='tilda')");g.run("state.shop.stock={mort:1};state.shop.queue=[{id:'tilda',want:'mort'}]");assert.equal(g.run('shopSell(0).coins'),9,'favourite pays 1.5×');
g.run("state.shop.stock={};state.shop.queue=[{id:'mira',want:'bar'}]");assert.deepEqual({...g.run('shopSell(0)')},{left:true},'leaves when nothing is left');
assert(!g.run('shopVisitors().some(c=>c.id==="tuss")')||g.run('state.fishing.troll')>=1,'Tuss shops only once he is a friend');
g.run("state.shop.served=4;state.shop.stock={bar:1};state.shop.queue=[{id:'mira',want:'bar'}];state.coins=0");const st=g.run('shopSell(0)');assert(st.star);assert.equal(g.run('state.coins'),st.coins+25);assert.equal(g.run('shopStars()'),1);
g.run('state.shop.stock={mort:1}');assert(g.run("shopUnstock('mort')"));assert.equal(g.run('state.fishing.bucket.mort'),2,'goods come back home');

// Twelve frogs.
assert.equal(g.run('MAX_FROGS'),12);g.run('ensureFrogs();state.eggs=20');let hatched=g.run('state.frogs.length');while(g.run('eggCanHatch()')){g.run('startEgg()');for(let i=0;i<5;i++)g.run('crackEgg()');hatched++;assert.equal(g.run('state.frogs.length'),hatched)}
assert.equal(g.run('state.frogs.length'),12);

// Everything survives a reload, and the new pages render in their menu groups.
const back=game(g.saved);assert.equal(back.run('state.house.items.length'),1);assert.equal(back.run('state.frogs.length'),12);assert.equal(back.run('shopStars()'),1);
for(const [t,grp,h] of [['house','home','Inne i svamphuset'],['shop','village','Grodbutiken']]){g.run(`tab='${t}';render()`);assert(g.run("$('#content').innerHTML").includes(h));assert.equal(g.run(`groupOf('${t}').id`),grp)}
console.log('PASS: cottage furniture, the village shop, shop stars and twelve frogs.');
