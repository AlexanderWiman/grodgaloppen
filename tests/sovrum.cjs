// Grodornas sovrum: a bedroom in the cottage with a bed for every frog, opened with two frogs.
const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
function game(){let stored=null;const nodes=new Map();const $=k=>{if(!nodes.has(k))nodes.set(k,{innerHTML:'',textContent:'',value:'',style:{setProperty(){}},classList:{toggle(){},add(){},remove(){},contains:()=>false},disabled:false,dataset:{}});return nodes.get(k)};const c=vm.createContext({console,Math,Date,localStorage:{getItem:()=>stored,setItem:(k,v)=>stored=v},document:{querySelector:$,querySelectorAll:()=>[],hidden:false,addEventListener(){},removeEventListener(){},body:{dataset:{},classList:{remove(){},add(){},toggle(){}}}},performance:{now:()=>0},requestAnimationFrame:()=>0,setTimeout:()=>0,setInterval:()=>0,clearInterval(){}});for(const f of ['audio.js','garden.js','village.js','world.js','race.js','leaderboard.js','frogs.js','saga.js','seasons.js','fishing.js','house.js','shop.js','progress.js','fireflies.js','memory.js','queen.js','jul.js','skogen.js','tradgard.js','kalas.js','sovrum.js','astrid.js'])vm.runInContext(fs.readFileSync('dist/'+f,'utf8'),c);vm.runInContext(fs.readFileSync('dist/app.js','utf8').split("document.querySelectorAll('nav button').forEach(b=>b.onclick=")[0],c);return {run:s=>vm.runInContext(s,c),nodes,get saved(){return stored}}}
const g=game();g.run('state.hatched=true;ensureGarden();ensureFrogs();gameClock=()=>new Date(2026,10,16,20)');
// Opens with two frogs.
g.run('checkUnlocks()');assert(!g.run('bedroomOpen()'));assert.equal(g.run("houseLevelsHTML('down')"),'','no room buttons with only one room');
g.run("state.frogs.push({id:'f2',frog:'#5f9ea0',frogName:'Bubbel',bond:10});checkUnlocks()");assert(g.run('bedroomOpen()'));
assert(g.run("houseLevelsHTML('down')").includes('data-house-level="bed"'));
// The bedroom page: one bed per frog; asleep at night, sitting up in the day.
g.run("state.garden.night=false;ensureHouse().level='bed';renderHouse()");let page=g.nodes.get('#content').innerHTML;
assert(page.includes('Grodornas sovrum')&&(page.match(/data-bed-frog=/g)||[]).length===2&&page.includes('bedSitter')&&!page.includes('bedZ'));
assert.equal(g.run("tuckFrog('f2')"),null,'no tucking in during the day');
g.run('state.garden.night=true;renderHouse()');page=g.nodes.get('#content').innerHTML;assert(page.includes('bedZ')&&!page.includes('bedSitter'));
// Tucking in: once a day each, a little friendship; the riding frog uses state.bond.
let r=JSON.parse(g.run("JSON.stringify(tuckFrog('f2'))"));assert(r.first);assert.equal(r.name,'Bubbel');assert.equal(g.run("state.frogs.find(f=>f.id==='f2').bond"),11);
assert.equal(g.run("tuckFrog('f2').first"),false,'once a day');assert.equal(g.run("state.frogs.find(f=>f.id==='f2').bond"),11);
g.run('state.bond=5');assert(g.run('tuckFrog(state.activeFrog).first'));assert.equal(g.run('state.bond'),6);
g.run('gameClock=()=>new Date(2026,10,17,20)');assert(g.run("tuckFrog('f2').first"),'a new night');
assert.equal(g.run("tuckFrog('nobody')"),null);
// With a bedroom, nobody sleeps downstairs.
assert(!g.run('sleepingFrogsHTML()').includes('frogBeds'));
g.run('save()');assert(JSON.parse(g.saved).bedroom.tucked.f2);
console.log('PASS: the frogs’ bedroom opens with two frogs, has a bed each, and frogs can be tucked in at night.');
