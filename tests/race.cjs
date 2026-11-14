// Race balance: plays the real engine with simulated players of different skill and equipment.
const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
function game(){let stored=null;const nodes=new Map(),handlers={};let frame,now=0;const $=k=>{if(!nodes.has(k))nodes.set(k,{innerHTML:'',textContent:'',value:'',style:{},classList:{toggle(){}},disabled:false});return nodes.get(k)};const c=vm.createContext({console,Math,localStorage:{getItem:()=>stored,setItem:(k,v)=>stored=v},document:{querySelector:$,querySelectorAll:()=>[],hidden:false,addEventListener:(n,f)=>handlers[n]=f,removeEventListener:n=>delete handlers[n],body:{classList:{remove(){},add(){},toggle(){}}}},performance:{now:()=>now},requestAnimationFrame:f=>frame=f,setTimeout:()=>0});for(const f of ['world.js','race.js','astrid.js'])vm.runInContext(fs.readFileSync('dist/'+f,'utf8'),c);vm.runInContext(fs.readFileSync('dist/app.js','utf8').split("document.querySelectorAll('nav button').forEach(b=>b.onclick=")[0],c);return {run:s=>vm.runInContext(s,c),tick(){now+=1000/60;frame(now)}}}
const gauss=()=>Math.sqrt(-2*Math.log(Math.random()||1e-9))*Math.cos(2*Math.PI*Math.random());
// sigma: timing error in meter fractions (null = never presses). stats: base [fart,hopp,uthållighet]. owned: items.
function race(route,{sigma,base=[45,45,45],owned=[]}){const g=game();g.run(`state.hatched=true;state.baseStats=${JSON.stringify(base)};state.owned=${JSON.stringify(owned)};chosen=${route};startRace()`);let aim=null,last=-1;for(let i=0;i<6000&&g.run('running');i++){g.tick();if(sigma===null)continue;const ready=g.run('raceProbe.ready()'),phase=g.run('raceProbe.phase()');if(!ready){aim=null;last=-1;continue}if(aim===null||phase<last)aim=g.run('raceProbe.zone().c')+gauss()*sigma;last=phase;if(phase>=aim)g.run('raceProbe.hop()')}return g.run('raceProbe.result()')}
function sample(opts,n){const R=[];for(let k=0;k<n;k++)R.push(race(k%3,opts));return{win:R.filter(r=>r.place===1).length/n,avg:R.reduce((a,r)=>a+r.place,0)/n,time:R.reduce((a,r)=>a+r.time,0)/n}}
const N=+process.env.N||45,all=['goggles','boots','charm','scarf'];
const profiles={idle:{sigma:null},skilled:{sigma:.03},normal:{sigma:.07},sloppy:{sigma:.12},normalGear:{sigma:.07,owned:all},sloppyGear:{sigma:.12,owned:all},weakNormal:{sigma:.07,base:[35,35,35]}};
const out={};for(const [k,o] of Object.entries(profiles)){out[k]=sample(o,k==='idle'?9:N);console.log(k.padEnd(11),'vinst',(out[k].win*100).toFixed(0).padStart(3)+'%','snittplacering',out[k].avg.toFixed(2),'tid',out[k].time.toFixed(1)+'s')}
if(!process.env.N){
 assert.equal(out.idle.win,0,'a frog that never jumps must not win');
 assert(out.skilled.win>=.7,'skilled timing should usually win');
 assert(out.sloppy.win<out.normal.win&&out.normal.win<out.skilled.win,'better timing should win more');
 assert(out.normalGear.win>out.normal.win&&out.sloppyGear.win>out.sloppy.win,'equipment should matter');
 assert(out.normal.time>18&&out.normal.time<40,'races should last about half a minute');
 console.log('PASS: idle loses, skill and equipment both raise win rate, race length stays reasonable.');
}
