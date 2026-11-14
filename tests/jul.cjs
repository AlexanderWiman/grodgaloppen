// Jul i Älvbyn: holiday dates, the advent calendar, decorating the tree, Lucia and Christmas Eve
// gifts, Skogsdrottningen's winter coat, Christmas music and the frogs sleeping in the cottage.
const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
function game(saved=null){let stored=saved;const nodes=new Map();const $=k=>{if(!nodes.has(k))nodes.set(k,{innerHTML:'',textContent:'',value:'',style:{setProperty(){}},classList:{toggle(){},add(){},remove(){},contains:()=>false},disabled:false,dataset:{}});return nodes.get(k)};const c=vm.createContext({console,Math,Date,localStorage:{getItem:()=>stored,setItem:(k,v)=>stored=v},document:{querySelector:$,querySelectorAll:()=>[],hidden:false,addEventListener(){},removeEventListener(){},body:{dataset:{},classList:{remove(){},add(){},toggle(){}}}},performance:{now:()=>0},requestAnimationFrame:()=>0,setTimeout:()=>0,setInterval:()=>0,clearInterval(){}});for(const f of ['audio.js','garden.js','village.js','world.js','race.js','leaderboard.js','frogs.js','saga.js','seasons.js','fishing.js','house.js','shop.js','progress.js','queen.js','jul.js','astrid.js'])vm.runInContext(fs.readFileSync('dist/'+f,'utf8'),c);vm.runInContext(fs.readFileSync('dist/app.js','utf8').split("document.querySelectorAll('nav button').forEach(b=>b.onclick=")[0],c);return {run:s=>vm.runInContext(s,c),get saved(){return stored}}}
const g=game();const day=(m,d,y=2026)=>g.run(`gameClock=()=>new Date(${y},${m-1},${d},12)`);
g.run('state.hatched=true;ensureGarden();ensureFrogs()');

// Christmas lasts from 1 December to 6 January (trettondagen).
for(const [d,want] of [['2026,10,30',null],['2026,11,1','jul'],['2026,11,24','jul'],['2027,0,6','jul'],['2027,0,7',null],['2026,6,1',null]])assert.equal(g.run(`holidayFor(new Date(${d}))`),want,d);
day(1,3,2027);assert.equal(g.run('julYear()'),2026,'early January belongs to last Christmas');assert.equal(g.run('julToday()'),24,'all doors open after Christmas Eve');

// Before Christmas nothing shows.
day(11,14);assert(!g.run('isJul()'));assert.equal(g.run('julHomeHTML()'),'');assert.equal(g.run('julBannerHTML()'),'');assert.equal(g.run('julGardenHTML()'),'');assert.equal(g.run('julOpen(1)'),null);

// 5 December: doors 1–5 can be opened in any order, missed days too; tomorrow's door stays shut.
day(12,5);g.run('applySeason()');assert.equal(g.run('document.body.dataset.holiday'),'jul');
assert(g.run('julBannerHTML()').includes('Lucka 5'),'banner points to today');
assert(!g.run('julCanOpen(6)'),'future doors stay shut');assert(!g.run('julCanOpen(0)'));
g.run('state.coins=0');const d1=g.run('julOpen(1)');assert.equal(d1.bauble,'red');assert.equal(d1.coins,20);assert.equal(g.run('state.coins'),20);
assert.equal(g.run('julOpen(1)'),null,'a door opens once');
assert.equal(g.run('julGiftText(julOpen(2))'),'Lucka 2: Guldkula till granen · +3 bär');
for(const n of [5,3,4])assert(g.run(`julOpen(${n})`),'door '+n);
assert.equal(g.run('julBannerHTML()'),'','no banner when today is open');
const html=g.run('julHomeHTML()');assert(html.includes('5 av 24 luckor'));assert.equal((html.match(/class="julDoor /g)||[]).length,24);assert(html.includes('öppnas den 6 december'));

// Decorating the tree: needs a bauble, ten baubles finish it once, and baubles can be taken down.
assert(!g.run("julHang(0,'bell')"),'no bell yet');assert(!g.run("julHang(99,'red')"));
assert(g.run("julHang(0,'red')"));assert(!g.run("julHang(0,'gold')"),'spot taken');assert.equal(g.run("ensureJul().baubles.red"),0);
assert(g.run('julTakeDown(0)'));assert.equal(g.run("ensureJul().baubles.red"),1);assert(!g.run('julTakeDown(0)'));
day(12,13);for(let n=6;n<=13;n++)g.run(`julOpen(${n})`);
assert(g.run("(state.headwearOwned||[]).includes('lucia')"),'Lucia crown on door 13');
const baubles=Object.entries(JSON.parse(g.run('JSON.stringify(ensureJul().baubles)'))).flatMap(([k,n])=>Array(n).fill(k));assert(baubles.length>=10);
g.run('state.coins=0');for(let i=0;i<9;i++)g.run(`julHang(${i},'${baubles[i]}')`);assert.equal(g.run('julTreeCheck()'),null,'nine is not enough');
g.run(`julHang(9,'${baubles[9]}')`);assert.equal(g.run('julTreeCheck().coins'),50);assert(g.run("state.decorOwned.includes('tomtenisse')"));assert.equal(g.run('julTreeCheck()'),null,'only once');
assert(g.run('julTreeSVG()').includes('julTwinkle'));

// Christmas Eve: the star and a Santa hat for the frog. Gift clothes cannot be bought.
day(12,24);for(let n=14;n<=24;n++)g.run(`julOpen(${n})`);
assert(g.run('ensureJul().star'));assert(g.run("ownsWear('hat-tomte')"));assert.equal(g.run("wearing('frogHat')"),'hat-tomte');assert(g.run('frogHatArt()').includes('#c9473f'));
assert(!g.run("buyWear('outfit-winter')"),'the winter coat is a gift');assert(!g.run('wardrobeHTML([["outfitStyle","Kläder"]],"x")').includes('Vinterkappa'),'hidden until given');

// Skogsdrottningen's first visit at Christmas brings the winter coat, then her usual gifts.
let visits=[];for(let d=1;d<=31&&visits.length<2;d++)if(g.run(`queenVisiting(new Date(2026,11,${d},12))`))visits.push(d);
day(12,visits[0]);g.run('state.coins=0');const coat=g.run('queenTakeGift()');assert.equal(coat.wear,'outfit-winter');assert.equal(g.run('state.coins'),40);assert(g.run("ownsWear('outfit-winter')"));assert(g.run('outfitShape()').includes('#f7f4ec'),'coat has white fur');
assert.equal(g.run('queenTakeGift()'),null,'one gift a visit');day(12,visits[1]);assert.notEqual(g.run('queenTakeGift().wear'),'outfit-winter','the coat comes once');

// Christmas music in the glade and the village; other places keep their own.
assert(g.run('musicThemes.jul&&musicNames.jul==="Julmusik"'));g.run("setMusic('glade')");assert.equal(g.run('musicWanted'),'jul');g.run("setMusic('castle')");assert.equal(g.run('musicWanted'),'castle');
day(2,1,2027);g.run("setMusic('glade')");assert.equal(g.run('musicWanted'),'glade','back to normal after Christmas');

// Next Christmas starts fresh.
day(12,2,2027);assert.equal(g.run('ensureJul().opened.length'),0);assert(g.run('julCanOpen(1)'));

// The frogs sleep in the cottage when it is night in the glade.
g.run('state.garden.night=false');assert(!g.run('sleepingFrogsHTML()').includes('frogBed'));assert(g.run('sleepingFrogsHTML()').includes('Godnatt'));
g.run('state.garden.night=true');assert(g.run('sleepingFrogsHTML()').includes('frogBed'));assert(g.run('sleepingFrogsHTML()').includes('God morgon'));

// Saved and loaded again.
g.run('save()');assert.equal(JSON.parse(g.saved).jul[2026].opened.length,24,'Christmas is saved');
console.log('PASS: Christmas dates, advent calendar, tree, Lucia, Christmas Eve, winter coat, music, sleeping frogs.');
