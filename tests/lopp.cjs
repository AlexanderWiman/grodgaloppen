// Races fill the phone screen while they run and every world has moving scenery.
const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const classes=new Set();const c=vm.createContext({console,Math,Date,document:{querySelector:()=>null,body:{classList:{add:k=>classes.add(k),remove:k=>classes.delete(k)}}},performance:{now:()=>0},state:{}});
vm.runInContext(fs.readFileSync('dist/race.js','utf8').split('\nfunction startRace(')[0],c);
for(const w of ['pond','forest','marsh','crystal','castle','sea','clouds','night','winter']){const h=vm.runInContext(`raceAmbientHTML('${w}')`,c);assert.equal((h.match(/class="rp /g)||[]).length,12,w+' has floating things');assert(h.includes(`raceHills ${w}`)&&h.includes(`raceHills near ${w}`),w+' has hills')}
assert(vm.runInContext("raceAmbientHTML('pond')",c).includes('rcloud'),'clouds over the pond');assert(!vm.runInContext("raceAmbientHTML('night')",c).includes('rcloud'),'no clouds in the night forest');
const race=fs.readFileSync('dist/race.js','utf8');assert(race.includes("document.body.classList?.add('racing')")&&race.includes("document.body.classList?.remove('racing')"),'racing mode turns on and off');
const css=fs.readFileSync('dist/style.css','utf8');assert(css.includes('body.racing header')&&css.includes('@media(orientation:landscape) and (max-height:560px)'),'full screen and turned-phone layout');
console.log('PASS: full-screen races and moving scenery in every world.');
