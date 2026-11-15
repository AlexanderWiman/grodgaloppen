// Survey 5: trips between places, berry picking, birthdays in the glade and New Year fireworks.
const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
function game(saved=null){let stored=saved;const nodes=new Map();const $=k=>{if(!nodes.has(k))nodes.set(k,{innerHTML:'',textContent:'',value:'',style:{setProperty(){}},classList:{toggle(){},add(){},remove(){},contains:()=>false},disabled:false,dataset:{}});return nodes.get(k)};const c=vm.createContext({console,Math,Date,localStorage:{getItem:()=>stored,setItem:(k,v)=>stored=v},document:{querySelector:$,querySelectorAll:()=>[],hidden:false,addEventListener(){},removeEventListener(){},body:{dataset:{},classList:{remove(){},add(){},toggle(){}}}},performance:{now:()=>0},requestAnimationFrame:()=>0,setTimeout:()=>0,setInterval:()=>0,clearInterval(){}});for(const f of ['audio.js','garden.js','village.js','world.js','race.js','leaderboard.js','frogs.js','saga.js','seasons.js','fishing.js','house.js','shop.js','progress.js','fireflies.js','memory.js','queen.js','jul.js','skogen.js','tradgard.js','kalas.js','astrid.js'])vm.runInContext(fs.readFileSync('dist/'+f,'utf8'),c);vm.runInContext(fs.readFileSync('dist/app.js','utf8').split("document.querySelectorAll('nav button').forEach(b=>b.onclick=")[0],c);vm.runInContext(fs.readFileSync('dist/resor.js','utf8'),c);return {run:s=>vm.runInContext(s,c),get saved(){return stored}}}
const g=game();const on=(y,m,d)=>g.run(`gameClock=()=>new Date(${y},${m-1},${d},12)`);on(2026,11,16);
g.run('state.hatched=true;ensureGarden();ensureFrogs();ensureVillage()');

// ---------- Trips between places ----------
assert.equal(g.run("placeOf('shop')"),'shop');assert.equal(g.run("placeOf('memory')"),'home','memory is in the glade');assert.equal(g.run("placeOf('race')"),null,'races are not a place');
for(const [a,b] of [['home','house'],['yard','castle'],['forest','fish']]){const ms=g.run(`travelTime('${a}','${b}')`);assert(ms>=1100&&ms<=2000,a+'→'+b+' '+ms)}
assert(g.run("travelTime('house','home')")<g.run("travelTime('forest','shop')"),'longer trips take longer');
assert.deepEqual(JSON.parse(g.run('JSON.stringify(travelPoint(0))')),[14,74]);assert.deepEqual(JSON.parse(g.run('JSON.stringify(travelPoint(1))')),[86,70]);assert.deepEqual(JSON.parse(g.run('JSON.stringify(travelPoint(1,true))')),[14,70],'going left mirrors the path');
assert.equal(g.run('travelHop(0)'),0);assert(g.run('travelHop(.125)')>8,'mid-hop is up in the air');
// render() starts a trip only when the place changes.
// render() (wrapped in resor.js) starts a trip only when the place changes.
g.run("var trips=[];playTravel=(a,b)=>trips.push(a+'>'+b);tab='home';render()");
for(const t of ['house','house','race','frog','shop','fireflies'])g.run(`tab='${t}';try{render()}catch(e){if(placeOf(tab))throw e}`);
assert.equal(g.run("trips.join()"),'home>house,house>shop,shop>home');
g.run("state.travel=false;tab='castle';render()");assert.equal(g.run('trips.length'),3,'trips can be turned off');g.run("state.travel=true;tab='home';render()");
assert(g.run("travelSceneHTML('house','shop')").includes('På väg till Butiken'));assert(g.run("travelSceneHTML('shop','house')").includes('travelRider flip'),'the frog turns around');

// ---------- Berry picking ----------
g.run('unlockOverride=null;state.wins=4;checkUnlocks()');assert(!g.run("unlocked('berries')"));g.run('state.wins=5;checkUnlocks()');assert(g.run("unlocked('berries')"),'opens after 5 wins');
assert.equal(g.run('berrySpawn(()=>.01)'),'gold');assert.equal(g.run('berrySpawn(()=>.2)'),'green');assert.equal(g.run('berrySpawn(()=>.9)'),'blue');
g.run('var run=berryNewRun()');assert(g.run("berryPut(run,0,'blue',0)"));assert(!g.run("berryPut(run,0,'gold',0)"),'one berry per bush');
g.run("berryPut(run,1,'gold',0);berryPut(run,2,'green',0)");
assert.deepEqual(JSON.parse(g.run('JSON.stringify(berryTap(run,2))')),{kind:'green',points:0});assert(g.run('run.spots[2]'),'green berries stay');
assert.equal(g.run('berryTap(run,0).points'),1);assert.equal(g.run('berryTap(run,1).points'),3);assert.equal(g.run('berryTap(run,1)'),null,'already picked');
assert.equal(g.run('run.score'),4);assert.equal(g.run('run.picked'),3,'a golden berry counts as two blueberries');
g.run("berryPut(run,3,'blue',1000)");assert.deepEqual(JSON.parse(g.run('JSON.stringify(berryExpire(run,1300))')),[]);assert.deepEqual(JSON.parse(g.run('JSON.stringify(berryExpire(run,2400))')),[2,3],'berries fall off after a while');
g.run('state.coins=0');let r=g.run('JSON.stringify(berryFinish(45,20))');r=JSON.parse(r);assert.equal(r.coins,30,'at most 30 a round');assert(r.best);assert.equal(g.run("pantryHave('blueberry')"),20);
r=JSON.parse(g.run('JSON.stringify(berryFinish(25,10))'));assert.equal(r.coins,10,'at most 40 a day');assert(!r.best);assert.equal(g.run('state.coins'),40);
on(2026,11,17);assert.equal(g.run('berryFinish(12,5).coins'),12,'a new day');assert.equal(g.run('state.berryPick.best'),45);
// Blueberry pie in the kitchen, sold in the shop.
g.run("pantryAdd('egg',2)");assert(g.run("canCook('blueberrypie')"));assert(g.run("cook('blueberrypie')"));assert.equal(g.run("pantryHave('blueberry')"),29);
assert(g.run("pantryArt('blueberrypie').includes('<svg')&&pantryArt('blueberry').includes('<svg')"));assert.equal(g.run("shopGoods.blueberrypie.price"),36);assert.equal(g.run("itemCount('blueberry',1)"),'1 blåbär');
g.run("unlockOverride={yard:true}");assert(g.run("kitchenHTML()").includes('Blåbärspaj'));

// ---------- Birthdays ----------
assert.equal(g.run("addBirthday('','3','4')"),null,'needs a name');assert.equal(g.run("addBirthday('Ella',2,30)"),null,'no 30 February');assert.equal(g.run("addBirthday('Ella',13,1)"),null);
const ella=g.run("addBirthday('  Ella  ','11','20').id"),leap=g.run("addBirthday('Sixten',2,29).id");assert.equal(g.run("state.birthdays[0].name"),'Ella');
assert.equal(g.run(`daysUntilBirthday(state.birthdays[0])`),3);assert.equal(g.run('nextBirthday().name'),'Ella');
assert(g.run('birthdayListHTML()').includes('Nästa kalas: Ella om 3 dagar'));
assert.equal(g.run('birthdaysToday().length'),0);assert.equal(g.run(`celebrate('${ella}')`),null,'not her birthday yet');
on(2026,11,20);assert.equal(g.run('birthdaysToday()[0].name'),'Ella');assert(g.run('partyCanvasHTML()').includes('partyBalloon'));assert(g.run('birthdayTodayHTML()').includes('Sjung för Ella'));
g.run('state.coins=0');r=JSON.parse(g.run(`JSON.stringify(celebrate('${ella}'))`));assert.equal(r.coins,50);assert(r.cake&&r.hat);assert.equal(g.run("state.frogHat"),'hat-party');assert(g.run("state.decorOwned.includes('birthdaycake')"));
assert(g.run('frogHatArt()').includes('#7fb3e0'),'the frog wears the party hat');
assert.equal(g.run(`celebrate('${ella}')`),null,'once a year');assert(g.run('birthdayTodayHTML()').includes('Hurra för Ella'));
on(2027,11,20);r=JSON.parse(g.run(`JSON.stringify(celebrate('${ella}'))`));assert.equal(r.coins,50);assert(!r.cake&&!r.hat,'the hat and cake come once');
on(2027,2,28);assert.equal(g.run('birthdaysToday()[0]?.name'),'Sixten','29 February on the 28th in a normal year');on(2028,2,28);assert.equal(g.run('birthdaysToday().length'),0);on(2028,2,29);assert.equal(g.run('birthdaysToday()[0].name'),'Sixten');
assert(g.run(`removeBirthday('${leap}')`));assert.equal(g.run('state.birthdays.length'),1);
for(let i=0;i<7;i++)g.run(`addBirthday('Kusin ${i}',5,${i+1})`);assert.equal(g.run("addBirthday('En till',6,1)"),null,'at most 8');

// ---------- New Year ----------
on(2026,12,30);assert(!g.run('isNyar()'));assert.equal(g.run('launchRocket()'),null);assert.equal(g.run('nyarCardHTML()'),'');
on(2026,12,31);assert(g.run('isNyar()')&&g.run('isJul()'),'New Year on top of Christmas');assert.equal(g.run('nyarYear()'),2027);assert(g.run('nyarCardHTML()').includes('Gott nytt år 2027'));
g.run('state.coins=0');for(let i=0;i<11;i++)g.run('launchRocket()');assert.equal(g.run('state.coins'),0);r=JSON.parse(g.run('JSON.stringify(launchRocket())'));assert(r.gift&&r.star);assert.equal(g.run('state.coins'),50);
on(2027,1,1);assert.equal(g.run('nyarYear()'),2027);assert.equal(g.run('launchRocket().gift'),false,'once a year');assert(g.run("state.decorOwned.includes('fireworkstar')"));
on(2027,1,2);assert(!g.run('isNyar()'));
assert(g.run("Object.keys(extraGardenArt).includes('birthdaycake')&&Object.keys(extraGardenArt).includes('fireworkstar')"));

g.run('save()');const saved=JSON.parse(g.saved);assert(saved.birthdays.length===8&&saved.berryPick.best===45&&saved.nyar[2027].gift);
console.log('PASS: trips between places, berry picking, blueberry pie, birthdays and New Year.');
