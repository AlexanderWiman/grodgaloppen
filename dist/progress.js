// Things that unlock as you play (survey 3, step 3). The family wanted a game to play for a long
// time, so new parts of the home, shop, pond and glade open one by one. Each milestone has a
// check; once it has been reached it stays unlocked (state.unlocked) even if the count drops.
// render() calls checkUnlocks(), which shows "Nytt i spelet!" for anything that just opened.

function houseOwnedCount(){return (state.house?.owned||[]).filter(id=>!houseFurniture.find(f=>f.id===id)?.gift).length}
function fishCaughtTotal(){return Object.values(state.fishing?.caught||{}).reduce((a,b)=>a+b,0)}
const milestones=[
 {id:'wallpaper',name:'Tapetmönster',where:'Svamphuset',goal:'Ha 4 möbler i svamphuset',count:()=>[houseOwnedCount(),4]},
 {id:'fika',name:'Grannar på fika',where:'Svamphuset',goal:'Ha ett svampbord och en ekollonstol',count:()=>[['table','chair'].filter(id=>state.house?.owned?.includes(id)).length,2]},
 {id:'furniture2',name:'Fler möbler',where:'Svamphuset',goal:'Ha 8 möbler i svamphuset',count:()=>[houseOwnedCount(),8]},
 {id:'workshop',name:'Verkstaden',where:'Butiken',goal:'Sälj till 10 kunder i butiken',count:()=>[state.shop?.served||0,10]},
 {id:'orders',name:'Beställningar',where:'Butiken',goal:'Tillverka 3 saker i verkstaden',count:()=>[state.shop?.crafted||0,3],after:'workshop'},
 {id:'beavers',name:'Bävrarna bygger en övervåning',where:'Svamphuset',goal:'Ha 10 möbler och 3 butiksstjärnor',count:()=>[Math.min(houseOwnedCount(),10)+Math.min(Math.floor((state.shop?.served||0)/5),3),13]},
 {id:'froghouses',name:'Grodhus med namnskylt',where:'Grodvän',goal:'Ha 3 grodor',count:()=>[(state.frogs||[]).length,3]},
 {id:'morefish',name:'Fler fiskar i dammen',where:'Fiska',goal:'Fånga 20 fiskar',count:()=>[fishCaughtTotal(),20]},
 {id:'fireflies',name:'Fånga eldflugor',where:'Gläntan',goal:'Klara äventyret Den vilsekomna eldflugan',count:()=>[state.decorOwned?.includes('lantern')?1:0,1]},
 {id:'memory',name:'Memory med klistermärken',where:'Gläntan',goal:'Samla 8 klistermärken',count:()=>[(state.stickers||[]).length,8]}
];
let unlockOverride=null; // tests may set {id:true}
function unlocked(id){if(unlockOverride&&id in unlockOverride)return unlockOverride[id];return !!state.unlocked?.[id]}
function milestoneReady(m){if(m.after&&!unlocked(m.after))return false;const [have,need]=m.count();return have>=need}
// Opens every milestone that has been reached; returns the newly opened ones.
function checkUnlocks(){
 if(!state.hatched)return [];state.unlocked??={};const fresh=[];
 for(const m of milestones)if(!state.unlocked[m.id]&&milestoneReady(m)){state.unlocked[m.id]=Date.now();fresh.push(m)}
 if(fresh.length){save();setTimeout(()=>{fresh.forEach((m,i)=>setTimeout(()=>{sfx('evolve');toast('Nytt i spelet: '+m.name+' · '+m.where)},i*3200))},400)}
 return fresh;
}
function nextGoals(n=3){return milestones.filter(m=>!unlocked(m.id)&&(!m.after||unlocked(m.after))).map(m=>{const [have,need]=m.count();return {...m,have:Math.min(have,need),need}}).sort((a,b)=>b.have/b.need-a.have/a.need).slice(0,n)}
function goalsHTML(){const g=nextGoals();if(!g.length)return '';return `<section class="goals"><div class="eyebrow">NÄSTA ÖVERRASKNINGAR</div><div class="goalList">${g.map(m=>`<article><b>${m.name}</b><small>${m.goal}</small><progress max="${m.need}" value="${m.have}"></progress><span>${m.have} av ${m.need}</span></article>`).join('')}</div></section>`}
function lockedHint(id){const m=milestones.find(m=>m.id===id);if(!m)return '';const [have,need]=m.count();return `<p class="lockedHint"><span>🔒</span> <b>${m.name}</b> <span>${m.goal}</span> <small>${Math.min(have,need)} av ${need}</small></p>`}
