// Skogsdrottningen: visit days, gift, the same-day task, fika lines and her gifts for the cottage.
const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
function game(saved=null){let stored=saved;const nodes=new Map();const $=k=>{if(!nodes.has(k))nodes.set(k,{innerHTML:'',textContent:'',value:'',style:{setProperty(){}},classList:{toggle(){},add(){},remove(){},contains:()=>false},disabled:false,dataset:{}});return nodes.get(k)};const c=vm.createContext({console,Math,Date,localStorage:{getItem:()=>stored,setItem:(k,v)=>stored=v},document:{querySelector:$,querySelectorAll:()=>[],hidden:false,addEventListener(){},removeEventListener(){},body:{classList:{remove(){},add(){},toggle(){}}}},performance:{now:()=>0},requestAnimationFrame:()=>0,setTimeout:()=>0,setInterval:()=>0,clearInterval(){}});for(const f of ['audio.js','garden.js','village.js','world.js','race.js','leaderboard.js','frogs.js','saga.js','seasons.js','fishing.js','house.js','shop.js','queen.js','astrid.js'])vm.runInContext(fs.readFileSync('dist/'+f,'utf8'),c);vm.runInContext(fs.readFileSync('dist/app.js','utf8').split("document.querySelectorAll('nav button').forEach(b=>b.onclick=")[0],c);return {run:s=>vm.runInContext(s,c),get saved(){return stored}}}
const g=game();g.run('state.hatched=true;ensureGarden()');
// Exactly two visit days in every week, on different weekdays from week to week.
const patterns=new Set();for(let w=0;w<30;w++){let n=0,days=[];for(let d=0;d<7;d++){const day=`new Date(2026,10,${16+w*7+d})`;if(g.run(`queenVisiting(${day})`)){n++;days.push(d)}}assert.equal(n,2,'two visits in week '+w);patterns.add(days.join())}
assert(patterns.size>=8,'visit days change from week to week');
// Find a visiting day and a non-visiting day.
let visit=null,away=null;for(let d=16;d<30&&(visit===null||away===null);d++){if(g.run(`queenVisiting(new Date(2026,10,${d}))`))visit??=d;else away??=d}
const day=d=>g.run(`queenClock=()=>new Date(2026,10,${d},12)`);
day(away);assert.equal(g.run('queenTakeGift()'),null,'no gift when she is away');assert.equal(g.run('queenBannerHTML()'),'');g.run("fishCatch('mort')");day(visit);assert.equal(g.run('queenTask().count'),0,'nothing counts while she is away');
// On a visit: the gift rotation, once a day.
g.run('state.coins=0');const gift=g.run('queenTakeGift()');assert.equal(gift.coins,40);assert.equal(g.run('state.coins'),40);assert.equal(g.run('queenTakeGift()'),null,'one gift per visit');
assert(g.run('queenBannerHTML()').includes('Skogsdrottningen'));
// The task: count it through the real game actions, then claim it.
for(const kind of ['win','fish','sold','perfect','care']){g.run(`state.queen.task={id:'${kind}',count:0,claimed:false}`);assert.equal(g.run('queenClaim()'),null,'not done yet');
 if(kind==='win')g.run("afterRace({rank:1,perfect:0})");
 if(kind==='perfect')g.run("afterRace({rank:3,perfect:5})");
 if(kind==='fish')g.run("fishCatch('mort');fishCatch('mort');fishCatch('abborre')");
 if(kind==='sold'){g.run("state.shop=null;ensureShop();state.shop.stock={mort:2};state.shop.queue=[{id:'tilda',want:'mort'},{id:'klover',want:'mort'}];shopSell(0);shopSell(0)")}
 if(kind==='care'){g.run("state.careLog={};careAction('feed');careAction('pet');careAction('play')")}
 const t=g.run('JSON.stringify(queenTask())');assert(JSON.parse(t).count>=JSON.parse(t).need,kind+' counted: '+t);
 const c0=g.run('state.coins');assert(g.run('queenClaim()'),kind+' claimed');assert.equal(g.run('state.coins'),c0+60);assert.equal(g.run('queenClaim()'),null,'claimed once')}
assert(g.run("state.house.owned.includes('queenportrait')"),'portrait after three tasks');assert(!g.run("houseBuy('queenportrait')"),'gifts cannot be bought');
// Next visiting day: new gift (furniture) and a new task.
let visit2=null;for(let d=visit+1;d<visit+14&&visit2===null;d++)if(g.run(`queenVisiting(new Date(2026,10,${d}))`))visit2=d;day(visit2);
assert.equal(g.run('queenTask().count'),0,'a fresh task each visit');assert.equal(g.run('queenTakeGift().furniture'),'emeraldlamp');assert(g.run("state.house.owned.includes('emeraldlamp')"));
assert(g.run("housePlace('emeraldlamp')"));assert(g.run("furnitureArt('queenportrait')").includes('skogsdrottningen-portratt.webp'));
// Fika: what she says depends on the cottage.
g.run('state.house.items=[]');assert.match(g.run('queenFikaLine()'),/matta och ett bord/);g.run("state.house.owned.push('table','teaset');housePlace('table');housePlace('teaset')");assert.match(g.run('queenFikaLine()'),/svampbord/);
assert(g.run("(tab='house',render(),$('#content').innerHTML)").includes('queenFika'),'she sits in the cottage');day(away);assert(!g.run("(render(),$('#content').innerHTML)").includes('queenFika'),'not on other days');
// Her page and menu tab only show on visiting days; progress survives a reload.
day(visit2);g.run("tab='queen';render()");assert(g.run("$('#content').innerHTML").includes('DAGENS UPPDRAG'));day(away);g.run('render()');assert(g.run("$('#content').innerHTML").includes('hemma i den djupa skogen'));
const back=game(g.saved);assert.equal(back.run('state.queen.tasksDone'),5);assert.equal(back.run('state.queen.giftsTaken'),2);
// The castle (survey 3): opens when she invites you, a forest flute, one story about little Astrid a day.
const h=game();h.run('state.hatched=true;ensureGarden()');let quiet=[];for(let d=1;d<40&&quiet.length<6;d++)if(!h.run(`queenVisiting(new Date(2026,11,${d}))`))quiet.push(d);
const at=d=>h.run(`queenClock=()=>new Date(2026,11,${d},12)`);
at(quiet[0]);h.run("tab='castle';render()");assert(h.run("$('#content').innerHTML").includes('visar vägen'),'castle is closed before her invitation');assert(!h.run('queenGetFlute()'));
assert(h.run("$('#content').innerHTML").includes('Hon kommer på besök igen på'),'tells when she comes next');assert(h.run('queenOpenCastle()'));assert(!h.run('queenOpenCastle()'));assert.equal(h.run("groupOf('castle').id"),'adventure');
h.run('render()');assert(h.run('state.queen.flute'),'first castle visit gives the flute');assert(h.run("$('#content').innerHTML").includes('SKOGSFLÖJTEN'));
// The flute calls her today, then rests three days.
assert(!h.run('queenVisiting()'));assert(h.run('queenFluteReady()'));h.run('state.coins=0');assert(h.run('queenBlowFlute()'));assert(h.run('queenVisiting()'),'she comes when you blow the flute');
assert(h.run('queenTakeGift()').coins>0,'a called visit has a gift too');assert(!h.run('queenBlowFlute()'),'not twice');
const dayNum=d=>Math.floor(Date.UTC(2026,11,d)/864e5);const restDay=quiet.find(d=>dayNum(d)-dayNum(quiet[0])>=1&&dayNum(d)-dayNum(quiet[0])<3),okDay=quiet.find(d=>dayNum(d)-dayNum(quiet[0])>=3);
if(restDay){at(restDay);assert(!h.run('queenVisiting()'),'the call lasts only that day');assert(!h.run('queenFluteReady()'),'the flute rests');assert(h.run('queenFluteRestDays()')>0)}
at(okDay);assert(h.run('queenFluteReady()'),'ready again after three days');
// Stories: one new a day, +15 each, the storybook for the cottage after all eight.
let day0=quiet[0];h.run('state.coins=0');for(let i=0;i<8;i++){h.run(`queenClock=()=>new Date(2026,11,${day0+i},12)`);const st=h.run('queenHearStory()');assert(st&&st.n===i+1,'story '+(i+1));assert.equal(h.run('queenHearStory()'),null,'one story a day')}
assert.equal(h.run('state.coins'),8*15);assert(h.run("state.house.owned.includes('storybook')"));assert(h.run("furnitureArt('storybook').length")>150);
h.run(`queenClock=()=>new Date(2026,11,${day0+9},12)`);assert.equal(h.run('queenHearStory()'),null,'no more stories after the last');
const again=game(h.saved);assert.equal(again.run('state.queen.stories.length'),8);assert(again.run('state.queen.castle&&state.queen.flute'));
console.log('PASS: visits, gifts, same-day tasks, fika, the castle, the flute and the stories about little Astrid.');
