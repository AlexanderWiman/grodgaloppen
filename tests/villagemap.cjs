// Älvbyn's map: every place is a button that goes somewhere, has a signpost, and has English text.
const vm=require('vm'),fs=require('fs'),assert=require('assert');
const c=vm.createContext({state:{coins:0,trust:0,decorOwned:['flowers'],decorSlots:['flowers','none','none']},save(){},storyProgress:()=>({done:false})});
for(const f of ['garden.js','village.js'])vm.runInContext(fs.readFileSync('dist/'+f,'utf8'),c);
const r=s=>vm.runInContext(s,c);
r("var tab='village',rendered=0,talked=null;function render(){rendered++}showVillageDialog=id=>{talked=id}");

const places=()=>r('villageMapPlaces()');
let p=places();
assert.deepEqual(p.map(x=>x.id),['square','shop','home','mira','tagge','tilda','vide'],'square, shop, way home and one plot per neighbour');
assert.equal(p.find(x=>x.id==='square').go,'square');
assert.equal(p.find(x=>x.id==='shop').go,'tab:shop');
assert.equal(p.find(x=>x.id==='home').go,'tab:home');
assert.equal(p.find(x=>x.id==='mira').go,'talk:mira','a resident’s house opens their conversation');
assert.equal(p.find(x=>x.id==='mira').sign,'Blomsterstugan','the signpost names the house');
assert.equal(p.find(x=>x.id==='vide').go,'card:vide','an empty plot shows who may move in');
assert.equal(p.find(x=>x.id==='vide').sign,'Ledig tomt');
for(const x of p)assert(x.label&&x.sign,'every place has an aria-label and a sign: '+x.id);

assert(r("villageGo('tab:shop')"));assert.equal(r('tab'),'shop');assert.equal(r('rendered'),1,'the shop is a real trip through render()');
assert(r("villageGo('tab:home')"));assert.equal(r('tab'),'home');
assert(r("villageGo('talk:tagge')"));assert.equal(r('talked'),'tagge');assert(r("state.village.talked.includes('tagge')"),'knocking counts as a visit');
assert(!r("villageGo('talk:vide')"),'nobody answers at an empty plot');

r("state.village.done=['mira','tagge','tilda'];moveIn('vide')");
assert.equal(places().find(x=>x.id==='vide').go,'talk:vide','after moving in the plot becomes a house');
assert.equal(places().find(x=>x.id==='vide').sign,'Ljusgläntans hus');

// The map HTML: real buttons with aria-labels, every place has a wooden signpost, and the paths
// in the ground meet every place on both layouts.
r("var $=()=>null");
const html=r('villageMapHTML()');
assert.equal((html.match(/<button class="villagePlace/g)||[]).length,7,'seven place buttons');
assert.equal((html.match(/class="villageSign/g)||[]).length,7,'one signpost per place');
assert(!/houseName|plotSign/.test(html),'the old floating pills are gone');
for(const x of places())assert(html.includes(`aria-label="${x.label}"`),'aria-label for '+x.id);
for(const k of ['villageSpots','villageSpotsPhone'])assert.deepEqual(Object.keys(r(k)).sort(),p.map(x=>x.id).sort(),k+' places every spot');
assert.equal((r("villagePathD(villageSpots,[5.5,0])").match(/M/g)||[]).length,6,'a path from the square to each of the six other places');

// Every Swedish text on the map has an English version.
const src=fs.readFileSync('dist/i18n.js','utf8').split('const I18N_ATTRS')[0];
const e=vm.createContext({state:{lang:'en'},console});vm.runInContext(src,e);
const tr=s=>vm.runInContext(`tr(${JSON.stringify(s)})`,e);
for(const x of places())for(const s of [x.label,x.sign])assert.notEqual(tr(s),s,'missing English for '+s);
r("state.village.residents=['mira','tagge']");
for(const x of places())for(const s of [x.label,x.sign])assert.notEqual(tr(s),s,'missing English for '+s);

console.log('PASS: map places, where taps go, signposts, aria-labels, paths for both layouts and English text.');
