// Survey 3, step 3: things unlock one by one as you play, and each new part works once open.
const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
function game(saved=null){let stored=saved;const nodes=new Map();const $=k=>{if(!nodes.has(k))nodes.set(k,{innerHTML:'',textContent:'',value:'',style:{setProperty(){}},classList:{toggle(){},add(){},remove(){},contains:()=>false},disabled:false,dataset:{}});return nodes.get(k)};const c=vm.createContext({console,Math,Date,localStorage:{getItem:()=>stored,setItem:(k,v)=>stored=v},document:{querySelector:$,querySelectorAll:()=>[],hidden:false,addEventListener(){},removeEventListener(){},body:{classList:{remove(){},add(){},toggle(){}}}},performance:{now:()=>0},requestAnimationFrame:()=>0,setTimeout:()=>0,setInterval:()=>0,clearInterval(){}});for(const f of ['audio.js','garden.js','village.js','world.js','race.js','leaderboard.js','frogs.js','saga.js','seasons.js','fishing.js','house.js','shop.js','progress.js','fireflies.js','queen.js','astrid.js'])vm.runInContext(fs.readFileSync('dist/'+f,'utf8'),c);vm.runInContext(fs.readFileSync('dist/app.js','utf8').split("document.querySelectorAll('nav button').forEach(b=>b.onclick=")[0],c);return {run:s=>vm.runInContext(s,c),get saved(){return stored}}}
const g=game();g.run('state.hatched=true;ensureGarden();ensureVillage();ensureFishing();ensureShop();ensureHouse();ensureFrogs();state.coins=5000');
const open=id=>g.run(`unlocked('${id}')`),check=()=>JSON.parse(g.run('JSON.stringify(checkUnlocks().map(m=>m.id))'));
// A new player has none of it.
assert.deepEqual(check(),[]);for(const id of ['wallpaper','fika','furniture2','workshop','orders','beavers','froghouses','morefish','fireflies'])assert(!open(id),id+' starts locked');
assert(!g.run("houseBuy('sofa')"),'second furniture set is locked');assert(!g.run("houseSetPattern('dots')"));assert(!g.run("houseInviteFika('mira')"));
g.run('state.garden.berries=10');assert(!g.run("shopCraft('jam')"),'workshop is locked');assert(!g.run("frogHouseBuild(state.frogs[0].id)"));
for(let i=0;i<300;i++)assert(!['ruda','gos','roding'].includes(g.run('pickFish(Math.random,false,true)')),'no new fish yet');
g.run("tab='fireflies';render()");assert(g.run("$('#content').innerHTML").includes('🔒'),'firefly game shows what unlocks it');
assert.equal(g.run('nextGoals().length'),3);assert(g.run('goalsHTML()').includes('NÄSTA ÖVERRASKNINGAR'));
// 4 pieces of furniture → wallpaper patterns.
for(const id of ['rug','plant','lamp','shelf'])assert(g.run(`houseBuy('${id}')`));assert.deepEqual(check(),['wallpaper']);assert(g.run("houseSetPattern('dots')"));assert(g.run('wallPatternSVG("dots")').includes('pattern'));
// A table and a chair → neighbours come on fika, once a day each.
g.run("houseBuy('table');houseBuy('chair')");assert(check().includes('fika'));const c0=g.run('state.coins');assert(g.run("houseInviteFika('mira')"));assert.equal(g.run('state.coins'),c0+10);assert(!g.run("houseInviteFika('mira')"),'once a day');assert(!g.run("houseInviteFika('vide')"),'only neighbours who live in the village');
g.run("housePlace('plant')");assert.match(g.run("fikaLine('mira')"),/krukväxt/);g.run('state.house.fika.day="yesterday"');assert(g.run("houseInviteFika('mira')"),'again the next day');
// 8 pieces → the second furniture set.
g.run("houseBuy('teaset');houseBuy('clock')");assert(check().includes('furniture2'));assert(g.run("houseBuy('sofa')"));for(const f of ['easel','globe','rocker','telescope','bunk','piano','chandelier'])assert(g.run(`furnitureArt('${f}').length`)>150,f+' has art');
// 10 sales → workshop; 3 crafted → orders.
g.run('state.shop.served=10');assert(check().includes('workshop'));assert(!open('orders'));
g.run('state.garden.berries=9;state.fishing.bucket={mort:2,stovel:1}');assert(g.run("shopCraft('jam')"));assert(g.run("shopCraft('pie')"));assert(g.run("shopCraft('planter')"));assert(!g.run("shopCraft('planter')"),'needs another boot');
assert.equal(g.run("shopHave('jam')"),1);assert(check().includes('orders'));
const order=g.run("JSON.stringify(shopNewOrder(Date.UTC(2026,10,20),()=>0))");assert(order&&order!=='null');assert.equal(g.run("shopNewOrder(Date.UTC(2026,10,20),()=>0)"),null,'one new order a day');
g.run("state.shop.orders=[{who:'mira',good:'jam',n:1,reward:50}]");const c1=g.run('state.coins');assert(g.run('shopDeliver(0)'));assert.equal(g.run('state.coins'),c1+50);assert.equal(g.run("shopHave('jam')"),0);
assert(g.run("shopStock('pie')"),'crafted goods go on the shelf');
// 10 furniture and 3 shop stars → the beavers build an upper floor in ten minutes.
g.run('state.shop.served=15');assert(!open('beavers')&&!check().includes('beavers'),'nine pieces are not enough');g.run("houseBuy('easel')");assert(check().includes('beavers'));const now=Date.now();const c2=g.run('state.coins');assert(g.run(`houseStartBuild(${now})`));assert.equal(g.run('state.coins'),c2-250);assert(!g.run(`houseBuildCheck(${now+60000})`));assert(g.run(`houseBuildCheck(${now+600000})`));assert(g.run('state.house.upstairs'));
g.run("state.house.level='up'");g.run("houseBuy('bunk')");const uid=g.run("housePlace('bunk')");assert.equal(g.run(`state.house.items.find(o=>o.uid==='${uid}').lvl`),'up');assert(g.run('houseAtticArt()').includes('svg'));
// Three frogs → frog houses with name signs; moving one back and out again is free.
g.run('state.eggs=5;for(let k=0;k<2;k++){startEgg();for(let i=0;i<5;i++)crackEgg()}');assert(check().includes('froghouses'));const fid=g.run('state.frogs[1].id');const c3=g.run('state.coins');assert(g.run(`frogHouseBuild('${fid}')`));assert.equal(g.run('state.coins'),c3-60);
assert(g.run(`frogHouseArt('${fid}')`).includes(g.run('state.frogs[1].frogName').slice(0,5)),'the sign shows the name');g.run(`gardenRemove(frogHouseFor('${fid}').uid)`);assert(g.run(`frogHouseBuild('${fid}')`));assert.equal(g.run('state.coins'),c3-60,'putting it back is free');
// 20 fish → more kinds; the char only bites through the ice in winter.
g.run('state.fishing.caught={mort:20}');assert(check().includes('morefish'));let seen=new Set();for(let i=0;i<2000;i++)seen.add(g.run('pickFish(Math.random,false,true)'));assert(seen.has('ruda')&&seen.has('gos')&&seen.has('roding'));seen=new Set();for(let i=0;i<2000;i++)seen.add(g.run('pickFish(Math.random,false,false)'));assert(!seen.has('roding'),'no char outside winter');
// The firefly adventure → the firefly game: 40 dewdrops a day at most, a jar after 30 fireflies.
g.run("state.decorOwned.push('lantern')");assert(check().includes('fireflies'));const c4=g.run('state.coins');assert.equal(g.run("fireflyFinish(25,'d1').coins"),25);assert.equal(g.run("fireflyFinish(25,'d1').coins"),15);assert.equal(g.run("fireflyFinish(25,'d1').coins"),0);assert.equal(g.run('state.coins'),c4+40);assert(g.run("state.decorOwned.includes('fireflyjar')"));assert.equal(g.run("fireflyFinish(5,'d2').coins"),5,'a new day');
// Once open, always open — and it survives a reload.
g.run('state.shop.served=0;state.house.owned=[]');assert(open('workshop')&&open('wallpaper'));assert.equal(g.run('nextGoals().length'),0);
const back=game(g.saved);for(const id of ['wallpaper','fika','furniture2','workshop','orders','beavers','froghouses','morefish','fireflies'])assert(back.run(`unlocked('${id}')`),id+' after reload');
g.run("tab='fireflies';render()");assert(g.run("$('#content').innerHTML").includes('Börja fånga'));g.run("tab='house';render()");assert(g.run("$('#content').innerHTML").includes('Övervåningen'));g.run("tab='shop';render()");assert(g.run("$('#content').innerHTML").includes('Verkstaden'));
console.log('PASS: nine unlocks in order, wallpaper, fika, more furniture, workshop, orders, beavers, frog houses, new fish, fireflies.');
