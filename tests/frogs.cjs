// Several frogs: migration, hatching, switching, growth, abilities, stories and saving.
const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
function game(saved=null){let stored=saved;const nodes=new Map();const $=k=>{if(!nodes.has(k))nodes.set(k,{innerHTML:'',textContent:'',value:'',style:{},classList:{toggle(){}},disabled:false});return nodes.get(k)};const c=vm.createContext({console,Math,Date,localStorage:{getItem:()=>stored,setItem:(k,v)=>stored=v},document:{querySelector:$,querySelectorAll:()=>[],hidden:false,addEventListener(){},removeEventListener(){},body:{classList:{remove(){},add(){},toggle(){}}}},performance:{now:()=>0},requestAnimationFrame(){},setTimeout:()=>0});for(const f of ['audio.js','world.js','race.js','leaderboard.js','frogs.js','astrid.js'])vm.runInContext(fs.readFileSync('dist/'+f,'utf8'),c);vm.runInContext(fs.readFileSync('dist/app.js','utf8').split("document.querySelectorAll('nav button').forEach(b=>b.onclick=")[0],c);return {run:s=>vm.runInContext(s,c),get saved(){return stored}}}
// An old single-frog save becomes frog number one with everything kept.
const legacy=JSON.stringify({coins:500,owned:[],hatched:true,frogName:'Näckros',frog:'#66aaa0',pattern:'spots',baseStats:[50,40,45],personality:'Modig',bond:30,careLog:{}});
const g=game(legacy);g.run('ensureFrogs();save()');
assert.equal(g.run('state.frogs.length'),1);assert.equal(g.run('state.frogs[0].frogName'),'Näckros');assert.equal(g.run('state.frogs[0].bond'),30);
assert.equal(g.run('unlockedStories(activeFrog()).length'),1);
// Hatching costs drops (or an egg) and needs five taps.
assert(g.run('startEgg()'));assert.equal(g.run('state.coins'),300);assert(!g.run('startEgg()'));
for(let i=0;i<4;i++)assert.equal(g.run('crackEgg()'),null);
const born=g.run('crackEgg()');assert(born&&born.id);assert.equal(g.run('state.frogs.length'),2);assert.equal(g.run('state.newEgg'),null);
assert.notEqual(born.personality,'Modig','a new frog prefers a personality the pond lacks');
// Switching keeps each frog's own name, bond and stats.
g.run(`state.bond=44;switchFrog('${born.id}')`);assert.equal(g.run('state.frogName'),born.frogName);assert.equal(g.run('state.bond'),0);
g.run("state.frogName='Pippi';switchFrog('f1')");assert.equal(g.run('state.frogName'),'Näckros');assert.equal(g.run('state.bond'),44);
assert.equal(g.run(`state.frogs.find(f=>f.id==='${born.id}').frogName`),'Pippi');
// Growing: enough experience moves a frog up a stage, raises stats and unlocks colours.
const before=g.run('state.baseStats[0]');const note=g.run('frogXp(130)');assert(note&&note.includes('Ung groda'));
assert.equal(g.run('frogStage(activeFrog())'),1);assert.equal(g.run('state.baseStats[0]'),before+4);assert.equal(g.run('frogColorChoices().length'),6);
// Abilities differ by personality and grow with the stage.
assert.equal(g.run('frogAbilityMods().surpriseDrops'),3);
g.run(`switchFrog('${born.id}')`);const m=g.run('JSON.stringify(frogAbilityMods())');assert.notEqual(m,'{}');
// A finished race gives experience through the race hook.
g.run('afterRace({route:0,rank:1,time:22,perfect:4,bestStreak:5,surprisesCleared:0})');assert(g.run('activeFrog().xp')>=29);assert(g.run('raceNotes.length')>=1);
// Everything survives a reload.
g.run('save()');const r=game(g.saved);assert.equal(r.run('state.frogs.length'),2);assert.equal(r.run('state.activeFrog'),born.id);assert.equal(r.run('state.frogName'),'Pippi');
console.log('PASS: migration, hatching, switching, growth, abilities, race experience, stories and reload.');
