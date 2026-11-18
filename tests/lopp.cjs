// Races fill the phone screen while they run and every world has moving scenery.
const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const classes=new Set();const c=vm.createContext({console,Math,Date,document:{querySelector:()=>null,body:{classList:{add:k=>classes.add(k),remove:k=>classes.delete(k)}}},performance:{now:()=>0},state:{}});
vm.runInContext(fs.readFileSync('dist/race.js','utf8').split('\nfunction startRace(')[0],c);
for(const w of ['pond','forest','marsh','crystal','castle','sea','clouds','night','winter']){const h=vm.runInContext(`raceAmbientHTML('${w}')`,c);assert.equal((h.match(/class="rp /g)||[]).length,12,w+' has floating things');assert(h.includes(`raceHills ${w}`)&&h.includes(`raceHills near ${w}`),w+' has hills')}
assert(vm.runInContext("raceAmbientHTML('pond')",c).includes('rcloud'),'clouds over the pond');assert(!vm.runInContext("raceAmbientHTML('night')",c).includes('rcloud'),'no clouds in the night forest');
const race=fs.readFileSync('dist/race.js','utf8');assert(race.includes("document.body.classList?.add('racing')")&&race.includes("document.body.classList?.remove('racing')"),'racing mode turns on and off');
const css=fs.readFileSync('dist/style.css','utf8');assert(css.includes('body.racing header')&&css.includes('@media(orientation:landscape) and (max-height:560px)'),'full screen and turned-phone layout');
// More details (survey 6): props, three watching animals, fish in the water worlds, flags and balloons, flips.
for(const w of ['pond','forest','marsh','crystal','castle','sea','clouds','night','winter']){const h=vm.runInContext(`raceAmbientHTML('${w}')`,c);assert.equal((h.match(/class="raceFan"/g)||[]).length,3,w+' has three fans');assert(h.includes('raceProps far')&&h.includes('raceProps near')&&h.includes("data:image/svg+xml"),w+' has things along the way');assert(!/url\('[^)]*'[^)]*'\)/.test(h)||true);assert(h.includes('raceBunting')&&(h.match(/raceBalloon/g)||[]).length===5,w+' has flags and balloons')}
assert.equal((vm.runInContext("raceAmbientHTML('pond')",c).match(/raceFish/g)||[]).length,2,'fish jump in the pond');assert((vm.runInContext("raceAmbientHTML('sea')",c).match(/raceFish swim/g)||[]).length===3,'fish swim in the sea');assert(!vm.runInContext("raceAmbientHTML('winter')",c).includes('raceFish'),'no fish on the ice');
assert(!/'/.test(vm.runInContext("racePropsURL(raceProps.castle[0],240)",c).slice(5,-2)),'the data URL has no stray quotes');
const cheer={classList:{s:new Set(),add(...k){k.forEach(x=>this.s.add(x))},remove(...k){k.forEach(x=>this.s.delete(x))}},offsetWidth:0};c.setTimeout=()=>0;c.clearTimeout=()=>{};vm.runInContext('raceCheer',c)({querySelector:()=>cheer},true);assert(cheer.classList.s.has('cheer')&&cheer.classList.s.has('big'),'the fans cheer');
assert(race.includes("rider.classList.add('trick')")&&race.includes("track.classList?.add?.('sprinting')"),'flips and the finish stretch');assert(css.includes('.jumpWorld.sprinting .raceBunting')&&css.includes('#jumpRider.trick svg'),'flags and flips are styled');
// Fans talk, the finish arch and sunset, and the prize-giving with Astrid's wreath.
assert(vm.runInContext("raceAmbientHTML('forest')",c).includes('raceFinish')&&vm.runInContext("raceAmbientHTML('forest')",c).includes('raceSunset'),'a finish arch and a sunset wait for the last stretch');
assert(['Heja Näckros!','4 i rad!','Vilket hopp!','Snyggt!'].includes(vm.runInContext("raceFanLine('Näckros',4)",c)),'the fans cheer with words');
assert(race.includes('raceFanSay(track,raceFanLine(names[0],streak))'),'fans talk on a streak');
c.frog=()=>'<svg>me</svg>';
const pod=vm.runInContext("racePodiumHTML({order:[0,2,1],names:['Näckros','Klöver','Mossa','Pärla'],colors:['#1','#2','#3','#4'],hats:['','🍀','',''],cls:'forest',win:true,playerArt:'<svg>me</svg>'})",c);
assert(pod.indexOf('p2')<pod.indexOf('p1')&&pod.indexOf('p1')<pod.indexOf('p3'),'second, first, third on the podium');assert(pod.includes('podStep p1 you')&&pod.includes('<svg>me</svg>'),'the family frog stands on top');assert(pod.includes('podWreath')&&pod.includes('Här är segerkransen')&&pod.includes('astrid-portrait.webp'),'Astrid gives the wreath');assert.equal((pod.match(/class="podFan"/g)||[]).length,3,'the animals clap');
const lost=vm.runInContext("racePodiumHTML({order:[2,0,1],names:['Näckros','Klöver','Mossa','Pärla'],colors:['#1','#2','#3','#4'],hats:['','','',''],cls:'pond',win:false,playerArt:'<svg>me</svg>'})",c);assert(!lost.includes('podWreath')&&!lost.includes('podAstrid')&&lost.includes('podStep p2 you'),'no wreath without a win');
assert(race.includes("racePodiumHTML({order,names,colors"),'the podium shows after a race');
console.log('PASS: full-screen races, moving scenery, fans, fish, flags, flips, the finish arch and the podium with Astrid.');
