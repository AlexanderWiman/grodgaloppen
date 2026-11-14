// Race balance: plays the real engine with simulated players of different skill and equipment.
const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
function game(){let stored=null;const nodes=new Map(),handlers={};let frame,now=0;const $=k=>{if(!nodes.has(k))nodes.set(k,{innerHTML:'',textContent:'',value:'',style:{},classList:{toggle(){}},disabled:false});return nodes.get(k)};const c=vm.createContext({console,Math,localStorage:{getItem:()=>stored,setItem:(k,v)=>stored=v},document:{querySelector:$,querySelectorAll:()=>[],hidden:false,addEventListener:(n,f)=>handlers[n]=f,removeEventListener:n=>delete handlers[n],body:{classList:{remove(){},add(){},toggle(){}}}},performance:{now:()=>now},requestAnimationFrame:f=>frame=f,setTimeout:()=>0});for(const f of ['audio.js','world.js','race.js','leaderboard.js','frogs.js','saga.js','seasons.js','astrid.js'])vm.runInContext(fs.readFileSync('dist/'+f,'utf8'),c);vm.runInContext(fs.readFileSync('dist/app.js','utf8').split("document.querySelectorAll('nav button').forEach(b=>b.onclick=")[0],c);return {run:s=>vm.runInContext(s,c),tick(){now+=1000/60;frame(now)}}}
const gauss=()=>Math.sqrt(-2*Math.log(Math.random()||1e-9))*Math.cos(2*Math.PI*Math.random());
// sigma: timing error in meter fractions (null = never presses). stats: base [fart,hopp,uthållighet]. owned: items.
function race(route,{sigma,base=[45,45,45],owned=[],diff='normal',weather=null}){const g=game();g.run(`weatherOverride=${JSON.stringify(weather)};state.hatched=true;state.difficulty='${diff}';state.baseStats=${JSON.stringify(base)};state.owned=${JSON.stringify(owned)};chosen=${route};startRace()`);let aim=null,last=-1;for(let i=0;i<6000&&g.run('running');i++){g.tick();if(sigma===null)continue;const ready=g.run('raceProbe.ready()'),phase=g.run('raceProbe.phase()');if(!ready){aim=null;last=-1;continue}if(aim===null||phase<last)aim=gauss()*sigma;last=phase;if(phase>=g.run('raceProbe.zone().c')+aim)g.run('raceProbe.hop()')}return g.run('raceProbe.result()')}
function sample(opts,n){const R=[];for(let k=0;k<n;k++)R.push(race(k%4,opts));return{win:R.filter(r=>r.place===1).length/n,avg:R.reduce((a,r)=>a+r.place,0)/n,time:R.reduce((a,r)=>a+r.time,0)/n}}
const N=+process.env.N||45,all=['goggles','boots','charm','scarf'];
const profiles={idle:{sigma:null},skilled:{sigma:.03},normal:{sigma:.07},sloppy:{sigma:.12},normalGear:{sigma:.07,owned:all},sloppyGear:{sigma:.12,owned:all},weakNormal:{sigma:.07,base:[35,35,35]},easySloppy:{sigma:.12,diff:'easy'},easyNormal:{sigma:.07,diff:'easy'},hardNormal:{sigma:.07,diff:'hard'},hardSkilled:{sigma:.03,diff:'hard'},masterSkilled:{sigma:.03,diff:'master'}};
const out={};for(const [k,o] of Object.entries(profiles)){out[k]=sample(o,k==='idle'?9:N);console.log(k.padEnd(11),'vinst',(out[k].win*100).toFixed(0).padStart(3)+'%','snittplacering',out[k].avg.toFixed(2),'tid',out[k].time.toFixed(1)+'s')}
if(!process.env.N){
 assert.equal(out.idle.win,0,'a frog that never jumps must not win');
 assert(out.skilled.win>=.7,'skilled timing should usually win');
 assert(out.sloppy.win<out.normal.win&&out.normal.win<out.skilled.win,'better timing should win more');
 assert(out.normalGear.win>out.normal.win&&out.sloppyGear.win>out.sloppy.win,'equipment should matter');
 assert(out.normal.time>18&&out.normal.time<40,'races should last about half a minute');
 assert(out.easySloppy.win>out.sloppy.win&&out.easyNormal.win>=out.normal.win,'easy should be easier');
 assert(out.hardNormal.win<out.normal.win&&out.hardSkilled.win<=out.skilled.win,'hard should be harder');
 assert(out.hardSkilled.win>=.4,'a skilled player should still win often on hard');
 assert(out.masterSkilled.win<out.hardSkilled.win&&out.masterSkilled.win>=.1,'Mästare is the hardest level but still winnable');
 // Measured on its own with 150 races (standard error about 4 points), so it doesn't flake like the 45-race profiles.
 {const lagom=sample({sigma:.07},150).win;console.log('lagom (150 lopp) vinst',(lagom*100).toFixed(0)+'%');assert(lagom<=.75,'Lagom should not be a walkover (survey 3: too easy)')}
 console.log('PASS: idle loses, skill and equipment both raise win rate, race length stays reasonable.');
}
// Every track on its own: a normal player should win sometimes and lose sometimes.
if(!process.env.N){for(let t=0;t<9;t++){const R=[];for(let k=0;k<24;k++)R.push(race(t,{sigma:.07}));const w=R.filter(r=>r.place===1).length/24;console.log('bana',t,'normal vinst',(w*100).toFixed(0)+'%','hinder',R.reduce((a,r)=>a+r.surprisesCleared,0),'superkrafter',R.reduce((a,r)=>a+r.powers,0));assert(w>=.2,'track '+t+' too hard');assert(R.some(r=>r.powers>0),'superpowers show up on track '+t)}console.log('PASS: every track is winnable but not trivial.')}

// Weather changes the feel but not who usually wins: a normal player wins about as often.
if(!process.env.N){// 150 races each: the win-rate difference has a standard error of about 5 points, so 20 points is ~4σ.
 const base=sample({sigma:.07},150).win;for(const w of ['rain','snow','fog','thunder','rainbow']){const r=sample({sigma:.07,weather:w},150);console.log('väder',w,'vinst',(r.win*100).toFixed(0)+'%','(utan väder '+(base*100).toFixed(0)+'%)','tid',r.time.toFixed(1)+'s');assert(Math.abs(r.win-base)<=.2,w+' shifts the win rate too much');assert(r.win>=.3,w+' too hard')}const g=game();g.run("weatherOverride=undefined");assert.equal(g.run("pickWeather(trackWorlds[3])"),null,'no weather in the crystal cave');for(let i=0;i<40;i++)assert.notEqual(g.run("pickWeather(trackWorlds[8])"),'rain','it never rains in the winter world');console.log('PASS: rain, snow, fog, thunder and rainbow keep races fair.')}
