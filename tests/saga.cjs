// The Star Crown saga: chapter flow, unlocked tracks, eggs, medals, stickers, album and epilogue.
const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
function game(saved=null){let stored=saved;const nodes=new Map();let frame,now=0;const $=k=>{if(!nodes.has(k))nodes.set(k,{innerHTML:'',textContent:'',value:'',style:{},classList:{toggle(){}},disabled:false});return nodes.get(k)};const c=vm.createContext({console,Math,Date,localStorage:{getItem:()=>stored,setItem:(k,v)=>stored=v},document:{querySelector:$,querySelectorAll:()=>[],hidden:false,addEventListener(){},removeEventListener(){},body:{classList:{remove(){},add(){},toggle(){}}}},performance:{now:()=>now},requestAnimationFrame:f=>frame=f,setTimeout:()=>0});for(const f of ['audio.js','garden.js','world.js','race.js','leaderboard.js','frogs.js','saga.js','astrid.js'])vm.runInContext(fs.readFileSync('dist/'+f,'utf8'),c);vm.runInContext(fs.readFileSync('dist/app.js','utf8').split("document.querySelectorAll('nav button').forEach(b=>b.onclick=")[0],c);return {run:s=>vm.runInContext(s,c),tick(){now+=1000/60;frame(now)},get saved(){return stored}}}
// Plays an adventure through the real engine by hopping in the middle of the green field.
function playAdventure(g,id,track){g.run(`state.hatched=true;activeRun={kind:'adventure',id:'${id}'};chosen=${track};startRace()`);for(let i=0;i<20000&&g.run('running');i++){g.tick();if(g.run('raceProbe.ready()&&Math.abs(raceProbe.phase()-raceProbe.zone().c)<.03'))g.run('raceProbe.hop()')}assert(!g.run('running'),'adventure finished')}
const g=game();g.run('state.hatched=true;ensureSaga()');
assert(!g.run('trackUnlocked(4)'),'castle track starts locked');assert(!g.run('chapterAvailable(sagaChapters[1])'));
playAdventure(g,'saga-castle',4);
assert.equal(g.run("chapterStatus('castle')"),'race');assert(g.run('trackUnlocked(4)'));assert.equal(g.run('state.eggs'),1);
assert(g.run("state.decorOwned.includes('banner')"));assert(g.run("albumUnlocked('saga-castle')"));assert(g.run('state.stickers.length')>=1);
assert(!g.run('chapterAvailable(sagaChapters[1])'),'next chapter waits for the race');
// Finishing a race on the new track completes the chapter.
g.run('afterRace({route:4,rank:2,time:24,perfect:2,bestStreak:3,surprisesCleared:1,difficulty:"normal"})');
assert.equal(g.run("chapterStatus('castle')"),'done');assert(g.run("state.medals.includes('saga1')"));assert(g.run('chapterAvailable(sagaChapters[1])'));
assert(g.run("raceNotes.some(n=>n.includes('Kapitel 1'))"));
// A race elsewhere does not complete other chapters.
g.run("state.saga.chapters.sea='race'");g.run('afterRace({route:0,rank:1,time:22,perfect:0,bestStreak:0,surprisesCleared:0,difficulty:"hard"})');assert.equal(g.run("chapterStatus('sea')"),'race');assert(g.run("state.medals.includes('brave')"));
// Medals are granted once.
const count=g.run('state.medals.length');assert.equal(g.run('checkMedals().length'),0);assert.equal(g.run('state.medals.length'),count);
// Epilogue after all five chapters, rewards once.
g.run("sagaChapters.forEach(c=>state.saga.chapters[c.id]='done')");assert(g.run('sagaDone()'));
const coins=g.run('state.coins');g.run('advSection="saga";showEpilogue()');assert.equal(g.run('state.coins'),coins+300);assert(g.run("state.medals.includes('hero')"));
g.run('showEpilogue()');assert.equal(g.run('state.coins'),coins+300);
assert(g.run("albumUnlocked('saga-epilogue')"));assert(g.run("state.decorOwned.includes('starcrown')"));
// All nine tracks open, everything survives a reload.
assert.equal(g.run('trackWorlds.filter((t,i)=>trackUnlocked(i)).length'),9);
g.run('save()');const r=game(g.saved);assert(r.run('state.saga.epilogue'));assert.equal(r.run('state.eggs'),1);assert(r.run('trackUnlocked(8)'));
console.log('PASS: chapter adventure, track unlock, egg, race completes chapter, medals once, epilogue once, album and reload.');
