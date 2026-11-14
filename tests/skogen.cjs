// Survey 4, step 3: the secret forest (riddles, hide-and-seek, animal friends), Stora Gorm, more
// Astrid stories, the castle rose garden, the kitchen garden and frogs playing in the glade.
const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
function game(saved=null){let stored=saved;const nodes=new Map();const $=k=>{if(!nodes.has(k))nodes.set(k,{innerHTML:'',textContent:'',value:'',style:{setProperty(){}},classList:{toggle(){},add(){},remove(){},contains:()=>false},disabled:false,dataset:{}});return nodes.get(k)};const c=vm.createContext({console,Math,Date,localStorage:{getItem:()=>stored,setItem:(k,v)=>stored=v},document:{querySelector:$,querySelectorAll:()=>[],hidden:false,addEventListener(){},removeEventListener(){},body:{dataset:{},classList:{remove(){},add(){},toggle(){}}}},performance:{now:()=>0},requestAnimationFrame:()=>0,setTimeout:()=>0,setInterval:()=>0,clearInterval(){}});for(const f of ['audio.js','garden.js','village.js','world.js','race.js','leaderboard.js','frogs.js','saga.js','seasons.js','fishing.js','house.js','shop.js','progress.js','fireflies.js','memory.js','queen.js','jul.js','skogen.js','tradgard.js','astrid.js'])vm.runInContext(fs.readFileSync('dist/'+f,'utf8'),c);vm.runInContext(fs.readFileSync('dist/app.js','utf8').split("document.querySelectorAll('nav button').forEach(b=>b.onclick=")[0],c);return {run:s=>vm.runInContext(s,c),get saved(){return stored}}}
const g=game();const day=d=>g.run(`gameClock=()=>new Date(2026,10,${d},12)`);day(16);
g.run('state.hatched=true;ensureGarden();ensureFrogs()');

// The forest opens after 25 won races, Gorm after 3 wins on Mästare, the garden with 6 pieces of furniture.
g.run('checkUnlocks()');assert(!g.run("unlocked('secretforest')"));g.run('state.wins=25;checkUnlocks()');assert(g.run("unlocked('secretforest')"));
assert(!g.run("unlocked('challenger')"));for(let i=0;i<3;i++)g.run("afterRace({route:0,rank:1,time:20,perfect:0,bestStreak:0,surprisesCleared:0,difficulty:'master'})");g.run("afterRace({route:0,rank:1,time:20,perfect:0,bestStreak:0,surprisesCleared:0,difficulty:'hard'})");assert.equal(g.run('state.masterWins'),3,'only Mästare wins count');g.run('checkUnlocks()');assert(g.run("unlocked('challenger')"));
g.run("ensureHouse();state.house.owned=['bed','table','chair','rug','lamp','shelf'];checkUnlocks()");assert(g.run("unlocked('yard')"));

// Hedvig's riddle: one a day, wrong answers can be tried again, the first try pays more.
assert.equal(g.run('owlRiddles.length'),12);assert(g.run('owlRiddles.every(r=>r.a.length===3&&r.right>=0&&r.right<3)'));
g.run('state.coins=0');let r=g.run('todaysRiddle()');assert.equal(g.run(`answerRiddle(${(r.right+1)%3}).right`),false);assert.equal(g.run(`answerRiddle(${r.right}).coins`),10,'right on the second try');assert.equal(g.run(`answerRiddle(${r.right})`),null,'one riddle a day');
day(17);r=g.run('todaysRiddle()');assert.equal(g.run(`answerRiddle(${r.right}).coins`),25);assert.notEqual(g.run('todaysRiddle().q'),g.run('owlRiddles[(forestDayNum()+1)%12].q'));
// Ruska's hide-and-seek: three tries a day.
let f=JSON.parse(g.run('JSON.stringify(ensureForest())'));const wrong=g.run('foxSpots').map(s=>s.id).filter(id=>id!==f.hideSpot);
assert.equal(g.run(`lookForFox('${wrong[0]}').left`),2);assert.equal(g.run("lookForFox('nowhere')"),null);assert(g.run(`lookForFox('${f.hideSpot}').found`));assert.equal(g.run(`lookForFox('${f.hideSpot}')`),null,'once a day');
day(18);f=JSON.parse(g.run('JSON.stringify(ensureForest())'));const wr=g.run('foxSpots').map(s=>s.id).filter(id=>id!==f.hideSpot);for(let i=0;i<3;i++)g.run(`lookForFox('${wr[i]}')`);assert.equal(g.run(`lookForFox('${f.hideSpot}')`),null,'no fourth try');
// Five hearts make a friend who moves a little home into the glade.
for(let d=19;d<25;d++){day(d);const rr=g.run('todaysRiddle()');g.run(`answerRiddle(${rr.right})`);const ff=JSON.parse(g.run('JSON.stringify(ensureForest())'));g.run(`lookForFox('${ff.hideSpot}')`)}
assert.equal(g.run('state.forest.owl'),5);assert.equal(g.run('state.forest.fox'),5);assert(g.run("state.decorOwned.includes('owlhouse')&&state.decorOwned.includes('foxden')"));
assert(g.run("Object.keys(extraGardenArt).filter(k=>['owlhouse','foxden','gormcup','emeraldrose','scarecrow'].includes(k)).length===5"));

// Stora Gorm: takes Mossa's place, never shows as a normal difficulty, first win pays once.
assert.equal(JSON.parse(g.run('JSON.stringify(challengeRivals().map(r=>r.name))')).join(),'Klöver,Stora Gorm,Pärla');assert(!g.run("'boss' in difficulties"));assert(g.run('gormDifficulty.rival>=difficulties.master.rival'));
assert(g.run('challengerHTML()').includes('Anta utmaningen'));
g.run('state.coins=0');g.run("afterRace({route:0,rank:2,time:20,perfect:0,bestStreak:0,surprisesCleared:0,difficulty:'normal',challenge:true})");assert.equal(g.run('state.gorm.tries'),1);assert(!g.run("state.decorOwned.includes('gormcup')"));
g.run("afterRace({route:0,rank:1,time:20,perfect:0,bestStreak:0,surprisesCleared:0,difficulty:'normal',challenge:true})");assert.equal(g.run('state.coins'),150);assert(g.run("state.decorOwned.includes('gormcup')"));assert(g.run('raceNotes.join()').includes('besegrade Stora Gorm'));
g.run("afterRace({route:0,rank:1,time:20,perfect:0,bestStreak:0,surprisesCleared:0,difficulty:'master',challenge:true})");assert.equal(g.run('state.coins'),150,'the bonus comes once');assert.equal(g.run('state.masterWins'),3,'challenge wins are not Mästare wins');

// More Astrid stories; the story book still comes after eight.
assert.equal(g.run('astridStories.length'),14);g.run('queenOpenCastle()');const q=g.run('JSON.stringify(state.queen.stories||[])');
for(let d=1;d<=8;d++){g.run(`gameClock=()=>new Date(2026,11,${d},12)`);g.run('queenHearStory()')}assert(g.run("state.house.owned.includes('storybook')"),'book after eight stories');
g.run(`gameClock=()=>new Date(2026,11,9,12)`);assert(g.run('queenStoryReady()'),'stories continue after the book');

// The rose garden: one watering a day, three waterings make a bloom, five blooms give the emerald rose.
g.run('state.coins=0');assert(g.run('waterRose(0)'));assert.equal(g.run('waterRose(1)'),null,'one a day');
let n=10;for(let i=0;i<5;i++)for(let k=0;k<3;k++){if(i===0&&k===0)continue;g.run(`gameClock=()=>new Date(2026,11,${n++},12)`);const res=g.run(`waterRose(${i})`);assert(res,'rose '+i+' day '+k)}
assert.equal(g.run('state.coins'),150);assert(g.run("ensureRoses().done&&state.decorOwned.includes('emeraldrose')"));assert(!g.run('roseCanWater()'),'nothing left to water');

// The kitchen garden: plant, water, wait, harvest into the pantry; ten harvests give a scarecrow.
const t0=Date.parse('2026-11-16T12:00:00');
assert.equal(g.run(`yardTap(0,${t0}).did`),'planted');assert.equal(g.run(`yardTap(0,${t0}).did`),'watered');assert.equal(g.run(`yardTap(0,${t0+60000}).did`),'growing');assert.equal(g.run(`yardTap(0,${t0+3*60000}).n`),3);assert.equal(g.run("pantryHave('carrot')"),3);
assert.equal(g.run(`yardTap(9,${t0})`),null);
let got;for(let i=0;i<9;i++){g.run(`yardTap(2,${t0})`);g.run(`yardTap(2,${t0})`);got=g.run(`yardTap(2,${t0+5*60000})`)}assert(got.scarecrow);assert.equal(g.run('state.yard.harvests'),10);assert(g.run("state.decorOwned.includes('scarecrow')"));

// Frogs play in the glade: only the other frogs, a little friendship once a day each.
assert.equal(g.run('frogPlayHTML()'),'','no playmates with one frog');
g.run("state.frogs.push({id:'f2',frog:'#5f9ea0',frogName:'Bubbel',bond:10})");assert(g.run('frogPlayHTML()').includes('data-glade-frog="f2"'));
g.run('state.bond=0');let p=g.run("frogPlay('f2')");assert(p.first);assert.equal(g.run("state.frogs.find(f=>f.id==='f2').bond"),12);assert.equal(g.run('state.bond'),1);
assert(!g.run("frogPlay('f2').first"),'once a day');assert.equal(g.run("frogPlay(state.activeFrog)"),null,'the riding frog is with the fairy');
console.log('PASS: secret forest, Stora Gorm, Astrid stories, rose garden, kitchen garden, frogs playing.');
