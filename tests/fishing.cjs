// Fishing and Tuss the troll: fish choice, day/night fish, catches, the bucket and Tuss's wishes.
const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
function game(saved=null){let stored=saved;const nodes=new Map();const $=k=>{if(!nodes.has(k))nodes.set(k,{innerHTML:'',textContent:'',value:'',style:{},classList:{toggle(){},add(){},remove(){}},disabled:false});return nodes.get(k)};const c=vm.createContext({console,Math,Date,localStorage:{getItem:()=>stored,setItem:(k,v)=>stored=v},document:{querySelector:$,querySelectorAll:()=>[],hidden:false,addEventListener(){},removeEventListener(){},body:{classList:{remove(){},add(){},toggle(){}}}},performance:{now:()=>0},requestAnimationFrame:()=>0,setTimeout:()=>0});for(const f of ['audio.js','garden.js','village.js','world.js','race.js','leaderboard.js','frogs.js','saga.js','seasons.js','fishing.js','astrid.js'])vm.runInContext(fs.readFileSync('dist/'+f,'utf8'),c);vm.runInContext(fs.readFileSync('dist/app.js','utf8').split("document.querySelectorAll('nav button').forEach(b=>b.onclick=")[0],c);return {run:s=>vm.runInContext(s,c),get saved(){return stored}}}
const g=game();g.run('state.hatched=true;ensureGarden()');
// Which fish bite: common ones often, the golden one rarely, the moonfish only at dusk.
const count=night=>{const n={};g.run(`state.garden.night=${night}`);for(let i=0;i<4000;i++){const id=g.run('pickFish()');n[id]=(n[id]||0)+1}return n};
const day=count(false),night=count(true);
assert(!day.manfisk,'no moonfish in daylight');assert(night.manfisk>300,'moonfish at dusk');
assert(day.mort>day.abborre&&day.abborre>day.guldfisk,'common fish bite more often');
assert(day.guldfisk>100&&day.guldfisk<450,'goldfish is rare but possible');
// The reel meter stays on screen and the net is in the middle.
for(let t=0;t<20;t+=.05)for(const id of ['mort','gadda']){const p=g.run(`fishMeterPos(${t},'${id}')`);assert(p>=.05&&p<=.95)}
assert(g.run('fishInNet(.5)')&&!g.run('fishInNet(.9)'));
// Catching: first of a kind pays a bonus, later ones a little.
g.run('state.coins=0');const first=g.run("fishCatch('mort')"),second=g.run("fishCatch('mort')");
assert(first.first&&first.coins===17&&!second.first&&second.coins===2);assert.equal(g.run('state.coins'),19);assert.equal(g.run('bucketCount()'),2);
// Tuss: each wish needs the right fish, takes them from the bucket and gives a reward.
assert(g.run('trollCanGive()'));assert(g.run('giveTroll()'));assert.equal(g.run('bucketCount()'),0);assert.equal(g.run('state.fishing.troll'),1);
assert(!g.run('trollCanGive()'),'next wish needs a perch');assert.equal(g.run('giveTroll()'),null);
g.run("fishCatch('mort')");assert(!g.run('trollCanGive()'),'a roach is not a perch');
for(const id of ['abborre','stovel','manfisk','guldfisk','gadda']){g.run(`fishCatch('${id}')`);assert(g.run('giveTroll()'),'wish for '+id)}
assert.equal(g.run('trollWish()'),null);assert.equal(g.run('state.fishing.troll'),6);
for(const d of ['trollstone','bridgelamp','trollfriend']){assert(g.run(`state.decorOwned.includes('${d}')`),d+' given');assert(g.run(`gardenArt('${d}').length`)>200,d+' has art');assert(g.run(`gardenAdd('${d}')`),d+' can be placed')}
assert.equal(g.run('giveTroll()'),null,'no more wishes');
// Progress survives a reload.
const back=game(g.saved);assert.equal(back.run('state.fishing.troll'),6);assert.equal(back.run('state.fishing.caught.mort'),3);
// The fishing page renders and is in the Gläntan menu group.
g.run("tab='fish';render()");assert(g.run("$('#content').innerHTML").includes('Fiska i dammen'));assert.equal(g.run("groupOf('fish').id"),'home');
// Tuss joins adventures from three hearts and finds a fish or 15 dewdrops on the way.
const t=game();t.run('state.hatched=true;ensureGarden();ensureFishing()');assert(!t.run('tussJoins()'));t.run('state.fishing.troll=3');assert(t.run('tussJoins()'));
t.run('state.coins=0');assert.equal(t.run('tussAdventureFind(()=>.9)'),'15 daggdroppar');assert.equal(t.run('state.coins'),15);
const found=t.run('tussAdventureFind(()=>.1)');assert(['Mört','Abborre','Gammal stövel'].includes(found));assert.equal(t.run('bucketCount()'),1);
console.log('PASS: fish choice, dusk fish, catches, bucket and all six of Tuss\'s wishes.');
