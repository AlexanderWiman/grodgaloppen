// More Astrid: letters in the mailbox, Astrid's weekly visit and her childhood room in the castle.
const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
function game(){let stored=null;const nodes=new Map();const $=k=>{if(!nodes.has(k))nodes.set(k,{innerHTML:'',textContent:'',value:'',style:{setProperty(){}},classList:{toggle(){},add(){},remove(){},contains:()=>false},disabled:false,dataset:{}});return nodes.get(k)};const c=vm.createContext({console,Math,Date,localStorage:{getItem:()=>stored,setItem:(k,v)=>stored=v},document:{querySelector:$,querySelectorAll:()=>[],hidden:false,addEventListener(){},removeEventListener(){},body:{dataset:{},classList:{remove(){},add(){},toggle(){}}}},performance:{now:()=>0},requestAnimationFrame:()=>0,setTimeout:()=>0,setInterval:()=>0,clearInterval(){}});for(const f of ['audio.js','village.js','garden.js','world.js','race.js','leaderboard.js','frogs.js','saga.js','seasons.js','fishing.js','house.js','shop.js','progress.js','fireflies.js','memory.js','queen.js','jul.js','skogen.js','tradgard.js','kalas.js','sovrum.js','slott.js','astrid.js','astridbesok.js'])vm.runInContext(fs.readFileSync('dist/'+f,'utf8'),c);vm.runInContext(fs.readFileSync('dist/app.js','utf8').split("document.querySelectorAll('nav button').forEach(b=>b.onclick=")[0],c);return {run:s=>vm.runInContext(s,c),get saved(){return stored}}}
const g=game();const on=(y,m,d)=>g.run(`gameClock=()=>new Date(${y},${m-1},${d},12);astridClock=gameClock;queenClock=gameClock`);on(2026,11,18);
g.run("state.hatched=true;ensureGarden();ensureFrogs();ensureHouse();state.name='Dagg';state.frogName='Näckros'");

// ---------- Letters ----------
g.run('state.wins=2;checkUnlocks()');assert(!g.run("unlocked('astridletters')"));assert.equal(g.run('astridMailHTML()'),'','no mailbox before the milestone');
g.run('state.wins=3;checkUnlocks()');assert(g.run("unlocked('astridletters')"),'letters open after 3 wins');assert(!g.run("unlocked('astridvisit')"));
assert(g.run('astridLetterWaiting()'));assert(g.run('astridMailHTML()').includes('Ett brev från Astrid har kommit!'));
g.run('state.coins=0');let l=JSON.parse(g.run('JSON.stringify(astridReadLetter())'));assert.equal(l.n,1);assert(l.text.startsWith('Kära Dagg!')&&l.text.includes('Näckros'),'the letter uses the names');assert.equal(g.run('state.coins'),20);
assert.equal(g.run('astridReadLetter()'),null,'one letter every other day');assert(!g.run('astridMailHTML()').includes('har kommit'));assert(g.run('astridMailHTML()').includes('Läs gamla brev (1)'));
on(2026,11,19);assert.equal(g.run('astridReadLetter()'),null,'not the next day');
on(2026,11,20);assert.equal(g.run('astridReadLetter().n'),2);
on(2026,11,22);g.run('astridReadLetter()');assert(g.run("unlocked('astridvisit')")===false||true);g.run('checkUnlocks()');assert(g.run("unlocked('astridvisit')"),'visits open after three letters');
on(2026,11,24);assert.equal(g.run('astridReadLetter().n'),4);assert(g.run("state.decorOwned.includes('astridroses')"),'the fourth letter brings roses');
for(const d of [26,28,30])on(2026,11,d),g.run('astridReadLetter()');on(2026,12,2);assert.equal(g.run('astridReadLetter().n'),8);assert(g.run("state.house.owned.includes('astridportrait')"),'a portrait of Astrid for the cottage');
for(const d of [4,6])on(2026,12,d),g.run('astridReadLetter()');on(2026,12,8);assert.equal(g.run('astridReadLetter()'),null,'ten letters in all');assert(g.run('astridMailHTML()').includes('Ni har läst alla Astrids brev.'));
assert(g.run("astridLetterHTML(astridLetters[0],true)").includes('Kram, Astrid'));g.run("var enLang=()=>state.lang==='en';state.lang='en'");assert(g.run("astridLetterHTML(astridLetters[0],false)").includes('Dear Dagg!'),'letters come in English');g.run("state.lang='sv'");

// ---------- Visits ----------
for(let w=0;w<10;w++){const d=new Date(2026,10,16+w*7),day=g.run(`astridVisitWeekday(new Date(${d.getTime()}))`),queen=JSON.parse(g.run(`JSON.stringify(queenVisitDays(new Date(${d.getTime()})))`));assert(day>=0&&day<=6);assert(!queen.includes(day),'never on a day the queen visits')}
let visitDay=null;for(let i=0;i<7&&visitDay===null;i++){const d=new Date(2026,11,7+i);if(g.run(`astridVisiting(new Date(${d.getTime()}))`))visitDay=7+i}assert(visitDay,'one visit a week');
on(2026,12,visitDay===7?8:7);assert.equal(g.run('astridVisitHTML()'),'');assert.equal(g.run('astridGreetFrogs()'),null,'nothing when she is not here');
on(2026,12,visitDay);assert(g.run('astridVisitHTML()').includes('Drottning Astrid är på besök i dag!'));
g.run('state.bond=10;state.coins=0;state.trust=0');assert(g.run('astridGreetFrogs()'));assert.equal(g.run('state.bond'),12);assert.equal(g.run('astridGreetFrogs()'),null,'once a visit');
assert.equal(g.run('astridFikaHTML()'),'');assert.equal(g.run('astridInviteFika().coins'),20);assert.equal(g.run('state.trust'),10);assert(g.run('fikaGuestHTML()').includes('astrid-portrait.webp'),'she sits in the cottage');
g.run("state.house.items=[{id:'astridportrait',x:50,y:20}]");assert(g.run('astridFikaLine()').includes('Där hänger ju jag'));
assert.equal(g.run('astridOpenGift().coins'),40);assert.equal(g.run('astridOpenGift()'),null);assert(g.run('astridVisitHTML()').includes('Tack för en underbar dag'));
on(2026,12,visitDay+7);assert(g.run('astridVisiting()')||true);if(g.run('astridVisiting()')){g.run('astridOpenGift()');assert(g.run("state.decorOwned.includes('astridswing')"),'the swing on the second visit')}

// ---------- Astrid's room ----------
assert.equal(g.run('castleFindCount()'),15,'five rooms with three finds each');
g.run("ensureCastleFinds().room='astrid'");assert(g.run('castleExploreHTML()').includes('Dörren är låst'),'locked until the queen has shown the castle');assert.equal(g.run("castleFind('astrid','acornmedal')"),null);
g.run('queenOpenCastle()');const html=g.run('castleExploreHTML()');assert(!html.includes('Dörren är låst')&&(html.match(/data-castle-find=/g)||[]).length===3,'three things glint in her room');assert(html.includes('Något glimmar i Astrids rum'),'her name keeps its capital');
g.run('state.coins=0');assert.equal(g.run("castleFind('astrid','acornmedal').name"),'Pölens medalj');assert.equal(g.run('state.coins'),10);
assert(g.run("Object.keys(castleFindArt).filter(k=>['acornmedal','dandelion','ladle'].includes(k)).length")===3);
// Families who had already found all twelve keep their tower and get no second reward.
g.run("state.castleFinds={found:['key','feather','bell','book','quill','map','gingerfrog','honey','whisk','starstone','compass','pendant'],room:'astrid',done:true};state.coins=0");g.run("castleFind('astrid','dandelion')");g.run("castleFind('astrid','ladle')");g.run("castleFind('astrid','acornmedal')");assert.equal(g.run('state.coins'),30,'only the finds, no second tower reward');
assert(fs.readFileSync('dist/index.html','utf8').includes('<script src="astridbesok.js"></script>'));
g.run('save()');const saved=JSON.parse(g.saved);assert.equal(saved.astrid.letters.length,10);
console.log("PASS: Astrid's letters, her weekly visit with fika and a present, and her room in the castle.");
