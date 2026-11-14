// Survey 5: the garden is more useful. Harvests go to the pantry. The pantry feeds the kitchen,
// the shop, the neighbours and the frog. There are new crops, hens and a rabbit.
const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
function game(saved=null){let stored=saved;const nodes=new Map();const $=k=>{if(!nodes.has(k))nodes.set(k,{innerHTML:'',textContent:'',value:'',style:{setProperty(){}},classList:{toggle(){},add(){},remove(){},contains:()=>false},disabled:false,dataset:{}});return nodes.get(k)};const c=vm.createContext({console,Math,Date,localStorage:{getItem:()=>stored,setItem:(k,v)=>stored=v},document:{querySelector:$,querySelectorAll:()=>[],hidden:false,addEventListener(){},removeEventListener(){},body:{dataset:{},classList:{remove(){},add(){},toggle(){}}}},performance:{now:()=>0},requestAnimationFrame:()=>0,setTimeout:()=>0,setInterval:()=>0,clearInterval(){}});for(const f of ['audio.js','garden.js','village.js','world.js','race.js','leaderboard.js','frogs.js','saga.js','seasons.js','fishing.js','house.js','shop.js','progress.js','fireflies.js','memory.js','queen.js','jul.js','skogen.js','tradgard.js','astrid.js'])vm.runInContext(fs.readFileSync('dist/'+f,'utf8'),c);vm.runInContext(fs.readFileSync('dist/app.js','utf8').split("document.querySelectorAll('nav button').forEach(b=>b.onclick=")[0],c);return {run:s=>vm.runInContext(s,c),get saved(){return stored}}}
const g=game();g.run('state.hatched=true;ensureGarden();ensureFrogs();ensureVillage();unlockOverride={yard:true,orders:true}');
const T=Date.parse('2026-11-16T12:00:00');const day=d=>g.run(`gameClock=()=>new Date(2026,10,${d},12)`);day(16);
const grow=(crop,times=1)=>{g.run(`ensureYard().pick='${crop}'`);for(let i=0;i<times;i++){g.run(`yardTap(5,${T})`);g.run(`yardTap(5,${T})`);g.run(`yardTap(5,${T+30*60000})`)}};

// New crops open with harvests; the old four are there from the start.
for(const k of ['radish','carrot','strawberry','sunflower','pumpkin'])assert(g.run(`cropOpen('${k}')`),k);
assert(!g.run("cropOpen('peas')")&&!g.run("cropOpen('potato')"));g.run("ensureYard().pick='peas'");assert.equal(g.run(`yardTap(0,${T})`),null,'locked seeds cannot be planted');
grow('radish',3);assert(g.run("cropOpen('peas')"));grow('carrot',3);assert(g.run("cropOpen('potato')"));
assert.equal(g.run("pantryHave('radish')"),9);assert.equal(g.run("pantryHave('carrot')"),9);

// "Do it everywhere" buttons.
g.run("ensureYard().pick='potato'");assert.equal(g.run(`yardAll('plant',${T}).length`),6);assert.equal(g.run(`yardAll('water',${T}).length`),6);assert.equal(g.run(`yardAll('harvest',${T}).length`),0,'not ripe yet');
assert.equal(g.run(`yardAll('harvest',${T+8*60000}).length`),6);assert.equal(g.run("pantryHave('potato')"),18);
grow('peas',2);grow('strawberry',2);grow('pumpkin');grow('sunflower');

// Cooking takes the ingredients; missing ones block it.
assert(!g.run("cook('cake')"),'cake needs eggs');assert(g.run("cook('carrotsoup')"));assert.equal(g.run("pantryHave('carrot')"),7);assert.equal(g.run("pantryHave('potato')"),17);assert.equal(g.run("pantryHave('carrotsoup')"),1);
assert(g.run("cook('salad')")&&g.run("cook('peasoup')")&&g.run("cook('pumpkinsoup')"));
g.run('state.bond=10');assert(g.run("feedFrog('salad')"));assert.equal(g.run('state.bond'),16);assert(!g.run("feedFrog('salad')"),'none left');
assert(g.run('kitchenHTML()').includes('Jordgubbstårta'));

// The shop sells straight from the pantry, and garden food can be ordered.
assert(g.run("shopStock('pumpkinsoup')"));assert.equal(g.run("pantryHave('pumpkinsoup')"),0);assert.equal(g.run("ensureShop().stock.pumpkinsoup"),1);assert(g.run("shopUnstock('pumpkinsoup')"));assert.equal(g.run("pantryHave('pumpkinsoup')"),1);
assert(g.run("shopGoodArt('carrot').includes('<svg')")&&g.run("shopGoodArt('bar').includes('<svg')"));
assert(g.run("shopCustomers.find(c=>c.id==='tagge').likes.includes('carrotsoup')"));assert(g.run("yardOrderGoods().includes('pancakes')"));
assert(!g.run("shopStock('egg')"),'no eggs yet');

// Neighbours: one gift a day each; food gives the most friendship.
g.run("state.village.residents=['mira','tagge'];state.village.friendship={};state.coins=0");
let r=g.run("giveNeighbour('tagge')");assert.equal(r.item,'carrotsoup');assert.equal(r.points,3);assert.equal(g.run('state.village.friendship.tagge'),3);assert.equal(g.run('state.coins'),10);
assert.equal(g.run("giveNeighbour('tagge')"),null,'once a day');assert.equal(g.run("giveNeighbour('tilda')"),null,'only neighbours who live here');
r=g.run("giveNeighbour('mira')");assert.equal(r.item,'strawberry');assert.equal(r.points,2);
day(17);assert(g.run("giveNeighbour('tagge')"),'a new day');

// Animals open after 8 harvests and cost dewdrops.
g.run("unlockOverride={yard:true,orders:true,yardanimals:false};state.coins=1000");assert(!g.run(`buyAnimal('hens',${T})`));
g.run("unlockOverride.yardanimals=true;state.coins=100");assert(!g.run(`buyAnimal('hens',${T})`),'needs 150');g.run('state.coins=1000');
assert(g.run(`buyAnimal('hens',${T})`));assert.equal(g.run('state.coins'),850);assert(!g.run(`buyAnimal('hens',${T})`),'one hen house');
assert.equal(g.run(`eggsWaiting(${T+14*60000})`),0);assert.equal(g.run(`eggsWaiting(${T+31*60000})`),2);assert.equal(g.run(`collectEggs(${T+31*60000})`),2);assert.equal(g.run(`eggsWaiting(${T+31*60000})`),0);
assert.equal(g.run(`eggsWaiting(${T+300*60000})`),4,'at most four in the nest');assert.equal(g.run(`collectEggs(${T+300*60000})`),4);assert.equal(g.run("pantryHave('egg')"),6);
assert(g.run("cook('cake')"),'eggs make cake');assert(g.run("cook('cookies')"));
// The rabbit eats one carrot a day and moves every growing bed 3 minutes closer to ripe.
assert(g.run(`buyAnimal('rabbit',${T})`));g.run("ensureYard().pick='pumpkin'");g.run(`yardTap(0,${T})`);g.run(`yardTap(0,${T})`);
const carrots=g.run("pantryHave('carrot')");const fed=g.run(`feedRabbit(${T+60000})`);assert.equal(fed.helped,1);assert.equal(g.run("pantryHave('carrot')"),carrots-1);assert.equal(g.run(`yardLeft(ensureYard().beds[0],${T+60000})`),16*60000);
assert.equal(g.run(`feedRabbit(${T+60000})`),null,'once a day');

// Saved with the game.
g.run('save()');const saved=JSON.parse(g.saved);assert(saved.yard.pantry.cake>=1&&saved.yard.animals.hens&&saved.yard.animals.rabbit);
console.log('PASS: new crops, pantry, quick buttons, kitchen, shop, neighbours, hens and rabbit.');
