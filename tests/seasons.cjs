// Seasons, festival, daily surprise, wardrobe and new garden things.
const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
function game(saved=null,now=new Date('2026-11-14T10:00:00')){let stored=saved;const nodes=new Map();const $=k=>{if(!nodes.has(k))nodes.set(k,{innerHTML:'',textContent:'',value:'',style:{},classList:{toggle(){}},disabled:false});return nodes.get(k)};
 class FakeDate extends Date{constructor(...a){super(...(a.length?a:[now.getTime()]))}static now(){return now.getTime()}};
 const c=vm.createContext({console,Math,Date:FakeDate,localStorage:{getItem:()=>stored,setItem:(k,v)=>stored=v},document:{querySelector:$,querySelectorAll:()=>[],hidden:false,addEventListener(){},removeEventListener(){},body:{dataset:{},classList:{remove(){},add(){},toggle(){}}}},performance:{now:()=>0},requestAnimationFrame(){},setTimeout:()=>0});
 for(const f of ['audio.js','garden.js','village.js','world.js','race.js','leaderboard.js','frogs.js','saga.js','seasons.js','astrid.js'])vm.runInContext(fs.readFileSync('dist/'+f,'utf8'),c);vm.runInContext(fs.readFileSync('dist/app.js','utf8').split("document.querySelectorAll('nav button').forEach(b=>b.onclick=")[0],c);return {run:s=>vm.runInContext(s,c),get saved(){return stored}}}
const g=game();g.run('state.hatched=true;ensureVillage();ensureFrogs()');
// Calendar seasons.
assert.equal(g.run("seasonFor(new Date('2026-04-02'))"),'spring');assert.equal(g.run("seasonFor(new Date('2026-07-20'))"),'summer');assert.equal(g.run("seasonFor(new Date('2026-11-14'))"),'autumn');assert.equal(g.run("seasonFor(new Date('2027-01-10'))"),'winter');
assert.equal(g.run('currentSeason()'),'autumn');g.run('applySeason()');assert.equal(g.run('document.body.dataset.season'),'autumn');
// Festival: three tasks, then one celebration per season.
assert(!g.run('festivalReady()'));assert(!g.run('festivalBerries()'),'needs three berries');
g.run('state.garden.berries=3;state.coins=100');assert(g.run('festivalBerries()'));assert.equal(g.run('state.garden.berries'),0);assert(g.run('festivalDecorate()'));assert.equal(g.run('state.coins'),70);
g.run('afterRace({route:0,rank:3,time:25,perfect:0,bestStreak:0,surprisesCleared:0,difficulty:"normal"})');assert(!g.run('festivalReady()'));
g.run('afterRace({route:1,rank:2,time:25,perfect:0,bestStreak:0,surprisesCleared:0,difficulty:"normal"})');assert(g.run('festivalReady()'));
assert(g.run('celebrateFestival()'));assert(g.run("state.decorOwned.includes('pumpkin')"));assert.equal(g.run('state.coins'),130);assert(!g.run('celebrateFestival()'),'only once');
// Daily surprise: once per calendar day, never a penalty.
assert(g.run('dailyGiftAvailable()'));const bond=g.run('state.bond');assert(g.run('takeDailyGift()'));assert.equal(g.run('state.bond'),bond+2);assert(!g.run('takeDailyGift()'));
const tomorrow=game(g.saved,new Date('2026-11-15T09:00:00'));assert(tomorrow.run('dailyGiftAvailable()'));
const winter=game(g.saved,new Date('2026-12-20T09:00:00'));assert.equal(winter.run('festival().done'),false,'a new season brings a new festival');
// Wardrobe: free defaults, buy once, wear later; frog hats belong to each frog.
assert.equal(g.run("wearing('wings')"),'wings-classic');g.run('state.coins=500');
assert(g.run("buyWear('wings-star')"));assert.equal(g.run('state.coins'),360);assert(!g.run("buyWear('wings-star')"));assert(g.run("wear('wings-classic')"));assert(g.run("wear('wings-star')"));
assert(g.run("buyWear('hat-top')"));g.run('startEgg();for(let i=0;i<5;i++)crackEgg()');const second=g.run('state.frogs[1].id');
g.run(`switchFrog('${second}')`);assert.equal(g.run("wearing('frogHat')"),'hat-none');g.run("wear('hat-top')");g.run("switchFrog('f1')");assert.equal(g.run("wearing('frogHat')"),'hat-top');
assert(g.run('frogHatArt().length')>0,'the hat is drawn');assert(g.run('frog().indexOf(frogHatArt())>frog().indexOf(\'cx="222" cy="143"\')&&frog().indexOf(frogHatArt())<frog().indexOf(\'cx="194" cy="140"\')'),'the hat sits over the eye domes but under the eye whites');assert(g.run('wingShape().includes("path")'));
// Every hairstyle draws both layers, with and without a hair band.
for(const hs of ['short','long','curly','braid','ponytail','pigtails','bun','twobraids','puffs','bob','wavy'])for(const band of ['outfit','none','#d9788a']){g.run(`state.hairstyle='${hs}';state.hairBand='${band}'`);assert(g.run('hairBackShape().length')>60&&g.run('hairShape().length')>200,hs+' '+band);assert(!g.run('frog()').includes('undefined'),hs+' draws cleanly')}
// New garden things have art; buyable ones cost drops, festival ones do not.
for(const id of ['bench','swing','fountain','birdhouse','mushroomring','lanternstring','tulips','parasol','pumpkin','snowman'])assert(g.run(`gardenArt('${id}').length`)>60,id);
g.run('state.coins=100');assert(g.run("buyDecoration('bench')"));assert(!g.run("buyDecoration('snowman')"));
console.log('PASS: calendar seasons, festival once per season, daily surprise once per day, wardrobe per frog, garden things.');
