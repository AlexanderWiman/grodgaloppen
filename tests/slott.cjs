// Exploring the castle, the garden animals in the scene, claimed quests leaving, and the trip card.
const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
function game(){let stored=null;const nodes=new Map();const $=k=>{if(!nodes.has(k))nodes.set(k,{innerHTML:'',textContent:'',value:'',style:{setProperty(){}},classList:{toggle(){},add(){},remove(){},contains:()=>false},disabled:false,dataset:{}});return nodes.get(k)};const c=vm.createContext({console,Math,Date,localStorage:{getItem:()=>stored,setItem:(k,v)=>stored=v},document:{querySelector:$,querySelectorAll:()=>[],hidden:false,addEventListener(){},removeEventListener(){},body:{dataset:{},classList:{remove(){},add(){},toggle(){}}}},performance:{now:()=>0},requestAnimationFrame:()=>0,setTimeout:()=>0,setInterval:()=>0,clearInterval(){}});for(const f of ['audio.js','garden.js','village.js','world.js','race.js','leaderboard.js','frogs.js','saga.js','seasons.js','fishing.js','house.js','shop.js','progress.js','fireflies.js','memory.js','queen.js','jul.js','skogen.js','tradgard.js','kalas.js','sovrum.js','slott.js','astrid.js'])vm.runInContext(fs.readFileSync('dist/'+f,'utf8'),c);vm.runInContext(fs.readFileSync('dist/app.js','utf8').split("document.querySelectorAll('nav button').forEach(b=>b.onclick=")[0],c);vm.runInContext(fs.readFileSync('dist/resor.js','utf8'),c);return {run:s=>vm.runInContext(s,c),nodes,get saved(){return stored}}}
const g=game();g.run('state.hatched=true;ensureGarden();ensureFrogs();ensureVillage();gameClock=()=>new Date(2026,10,17,12)');
// The castle can be explored before the queen has shown the way: the page shows the castle, not just her portrait.
g.run('ensureCastle().castle=false;renderCastle()');let page=g.nodes.get('#content').innerHTML;
assert(page.includes('skogsdrottningen-slott.webp')&&page.includes('UTFORSKA SLOTTET')&&page.includes('assets/slott/tron.webp'));
assert.equal(g.run('castleRooms.length'),5);for(const r of ['tron','bibliotek','kok','torn','astrid'])assert(fs.existsSync(`dist/assets/slott/${r}.webp`),r);
assert(g.run('castleRooms.every(r=>r.finds.every(f=>castleFindArt[f.id]))'),'every find has a picture');
// Finding things: once each, 10 dewdrops; all fifteen give the castle tower and 50 more.
g.run('state.coins=0');let r=JSON.parse(g.run("JSON.stringify(castleFind('tron','key'))"));assert.equal(r.coins,10);assert.equal(g.run("castleFind('tron','key')"),null,'once');assert.equal(g.run("castleFind('tron','book')"),null,'only in its own room');
g.run("queenOpenCastle();for(const room of castleRooms)for(const f of room.finds)castleFind(room.id,f.id)");assert.equal(g.run('state.coins'),15*10+50);assert(g.run("state.decorOwned.includes('castletower')&&extraGardenArt.castletower.length>50"));
// With the castle opened the stories page still works, and the rooms come after it.
g.run('queenOpenCastle();renderCastle()');page=g.nodes.get('#content').innerHTML;assert(page.includes('castleCards')||page.includes('castleStory'));
// Garden animals: houses and animals show in the scene only when you have them.
g.run("unlockOverride={yard:true,yardanimals:true}");assert.equal(g.run('yardPenHTML()'),'');
g.run("state.coins=1000;buyAnimal('hens');buyAnimal('rabbit')");const pen=g.run('yardPenHTML()');assert(pen.includes('id="penHens"')&&(pen.match(/class="penHen /g)||[]).length===3&&pen.includes('id="penRabbit"')&&pen.includes('penHutch'));
// Claimed quests from Astrid leave the list.
g.run("state.royalRaces=5;state.royalWins=1;state.claimedQuests=[]");g.run('renderAstrid()');const before=(g.nodes.get('#content').innerHTML.match(/data-quest="/g)||[]).length;
g.run("state.claimedQuests=royalQuests.map(q=>q.id);renderAstrid()");page=g.nodes.get('#content').innerHTML;assert(before>0);assert(!page.includes('Astrid har tackat dig'),'claimed quests are gone');assert(page.includes('ALLA UPPDRAG KLARA'));
// The trip card is light even at night.
g.run('state.garden.night=true');assert(!g.run("travelSceneHTML('home','shop')").includes('travelCard night'));assert.equal(JSON.parse(g.run("JSON.stringify(travelSky('forest',true))"))[0],'#9fb0d6');
console.log('PASS: castle rooms and finds, garden animals in the scene, claimed quests leave, light trip card.');
