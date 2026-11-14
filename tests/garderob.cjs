// The fairy's wardrobe (clothes, shoes, glasses, bags), how she sits on the frog, and sticker memory.
const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
function game(saved=null){let stored=saved;const nodes=new Map();const $=k=>{if(!nodes.has(k))nodes.set(k,{innerHTML:'',textContent:'',value:'',style:{setProperty(){}},classList:{toggle(){},add(){},remove(){},contains:()=>false},disabled:false,dataset:{}});return nodes.get(k)};const c=vm.createContext({console,Math,Date,localStorage:{getItem:()=>stored,setItem:(k,v)=>stored=v},document:{querySelector:$,querySelectorAll:()=>[],hidden:false,addEventListener(){},removeEventListener(){},body:{dataset:{},classList:{remove(){},add(){},toggle(){}}}},performance:{now:()=>0},requestAnimationFrame:()=>0,setTimeout:()=>0,setInterval:()=>0,clearInterval(){}});for(const f of ['audio.js','garden.js','village.js','world.js','race.js','leaderboard.js','frogs.js','saga.js','seasons.js','fishing.js','house.js','shop.js','progress.js','fireflies.js','memory.js','queen.js','jul.js','astrid.js'])vm.runInContext(fs.readFileSync('dist/'+f,'utf8'),c);vm.runInContext(fs.readFileSync('dist/app.js','utf8').split("document.querySelectorAll('nav button').forEach(b=>b.onclick=")[0],c);return {run:s=>vm.runInContext(s,c),get saved(){return stored}}}
const g=game();g.run('state.hatched=true;ensureGarden();ensureFrogs()');

// New slots start with a free choice; everything else costs dewdrops and stays bought.
for(const [slot,free] of [['shoes','shoes-slippers'],['glasses','glasses-none'],['bag','bag-none']])assert.equal(g.run(`wearing('${slot}')`),free);
const items=JSON.parse(g.run("JSON.stringify(wardrobe.filter(w=>['shoes','glasses','bag'].includes(w.slot)||['outfit-tunic','outfit-flowerdress','outfit-sweater'].includes(w.id)))"));
assert.equal(items.length,18);
g.run('state.coins=0');assert(!g.run("buyWear('shoes-boots')"),'needs dewdrops');
g.run('state.coins=5000');for(const w of items.filter(w=>w.cost))assert(g.run(`buyWear('${w.id}')`),w.id);
// Every outfit, shoe, pair of glasses and bag draws something, and the fairy picture still builds.
for(const w of items){g.run(`wear('${w.id}')`);const svg=g.run('frog()');assert(svg.startsWith('<svg')&&svg.endsWith('</svg>'),w.id);
 if(w.slot==='glasses'&&w.cost)assert(g.run('glassesShape()').length>50,w.id);
 if(w.slot==='outfitStyle')assert(g.run('outfitShape()').includes('<path'),w.id)}
assert.equal(g.run("wear('glasses-none');glassesShape()"),'');
// She sits on the frog: the lap, leg, shoe and resting hand are drawn after the frog's body.
g.run("wear('shoes-red')");const svg=g.run('frog()');assert(svg.indexOf('translate(154.5 171)')>svg.indexOf('url(#fgDots)'),'her leg and shoe are in front of the frog');
assert(!g.run("frog('#7bb661',false)").includes('translate(154.5 171)'),'frogs without a rider have no legs on top');
g.run("buyWear('outfit-overalls')");assert(g.run('fairyFrontShape()').includes(`stroke="${g.run('state.outfit')}" stroke-width="6.4"`),'overalls give trousers');
// The wardrobe shows the new rows, a preview, and still hides Christmas gifts until given.
const html=g.run(`wardrobeHTML([['shoes','Skor'],['glasses','Glasögon'],['bag','Väska'],['outfitStyle','Kläder']],'Älvans garderob')`);
for(const t of ['Gummistövlar','Stjärnglasögon','Pärlväska','Blomklänning','wardrobePreview'])assert(html.includes(t),t);assert(!html.includes('Vinterkappa'));

// Sticker memory opens after 8 stickers.
g.run('state.stickers=["s0","s1","s2"];checkUnlocks()');assert(!g.run("unlocked('memory')"));
g.run('state.stickers=["s0","s1","s2","s3","s4","s5","s6","s7"];checkUnlocks()');assert(g.run("unlocked('memory')"));
// The deck is pairs, uses the player's own stickers, and is shuffled.
const deck=JSON.parse(g.run('JSON.stringify(memoryDeck(6))'));assert.equal(deck.length,12);
const ids=deck.map(c=>c.id);assert(ids.every(id=>ids.filter(x=>x===id).length===2),'pairs');assert(ids.every(id=>['s0','s1','s2','s3','s4','s5','s6','s7'].includes(id)),'own stickers first');
assert.equal(JSON.parse(g.run('JSON.stringify(memoryDeck(8))')).length,16);
g.run('state.stickers=["s0"]');assert.equal(new Set(JSON.parse(g.run('JSON.stringify(memoryDeck(6))')).map(c=>c.id)).size,6,'fills up with other stickers');
// Fewer turns give more dewdrops, never under 10, at most 40 a day; records are kept per size.
assert.equal(g.run('memoryCoins(6,6)'),36);assert.equal(g.run('memoryCoins(6,10)'),28);assert.equal(g.run('memoryCoins(6,40)'),10);assert.equal(g.run('memoryCoins(8,8)'),48);
g.run('state.coins=0');let r=g.run("memoryFinish(6,10,'d1')");assert.equal(r.coins,28);assert(r.best);
r=g.run("memoryFinish(6,12,'d1')");assert.equal(r.coins,12,'only 12 left today');assert(!r.best);
assert.equal(g.run("memoryFinish(8,8,'d1').coins"),0,'day cap reached');assert.equal(g.run('state.coins'),40);
assert.equal(g.run("memoryFinish(6,6,'d2').coins"),36,'a new day');assert.equal(g.run('ensureMemory().best[6]'),6);assert.equal(g.run('ensureMemory().best[8]'),8);assert.equal(g.run('ensureMemory().wins'),4);
console.log('PASS: wardrobe, glasses, shoes, bags, how the fairy sits, sticker memory.');
