// Grodornas sovrum: a room in the mushroom cottage where every frog has its own little bed.
// It opens when the family has two frogs (milestone "bedroom"). The cottage gets a room button for it
// next to the floors. At night (the same ☾ as in the glade) the frogs sleep in their beds; tap a
// sleeping frog to tuck it in, once a day each, for a little friendship. In the daytime the beds
// are made and the frogs sit on them. Once the bedroom is open, the frogs sleep there instead of
// downstairs.

const BEDROOM_TUCK_BOND=1;
function bedroomOpen(){return typeof unlocked!=='function'||unlocked('bedroom')}
function bedroomNight(){return !!state.garden?.night}
function bedroomFrogs(){if(typeof ensureFrogs==='function')ensureFrogs();return (state.frogs||[]).map(f=>f.id===state.activeFrog?{...f,frog:state.frog,frogName:state.frogName,bond:state.bond}:f)}
function bedroomDay(){return typeof todayKey==='function'?todayKey():new Date().toDateString()}
// Tuck a frog in: only at night, once a day each.
function tuckFrog(id){
 if(!bedroomOpen()||!bedroomNight())return null;
 const f=(state.frogs||[]).find(f=>f.id===id);if(!f)return null;
 state.bedroom??={tucked:{}};const day=bedroomDay(),first=state.bedroom.tucked[id]!==day;
 if(first){state.bedroom.tucked[id]=day;if(id===state.activeFrog)state.bond=Math.min(100,(state.bond||0)+BEDROOM_TUCK_BOND);else f.bond=Math.min(100,(f.bond||0)+BEDROOM_TUCK_BOND);save()}
 return {first,name:id===state.activeFrog?state.frogName:f.frogName};
}
function quiltColour(c){const n=parseInt(String(c).replace('#',''),16);if(!Number.isFinite(n))return '#e9dcc8';const mix=v=>Math.round(v+(255-v)*.55);return '#'+[n>>16&255,n>>8&255,n&255].map(v=>mix(v).toString(16).padStart(2,'0')).join('')}
function bedArt(f,night){
 const q=quiltColour(f.frog),c=f.frog;
 const sleeper=`<g><ellipse cx="34" cy="44" rx="17" ry="11" fill="${c}"/><circle cx="25" cy="36" r="6.5" fill="${c}"/><circle cx="41" cy="36" r="6.5" fill="${c}"/><path d="M21.5 36.5q3.5 3 7 0M37.5 36.5q3.5 3 7 0" stroke="#263d32" stroke-width="1.6" fill="none" stroke-linecap="round"/><path d="M28 48q6 3 12 0" stroke="#263d32" stroke-width="1.4" fill="none" stroke-linecap="round"/><path d="M19 32Q27 18 42 26L46 31Q34 26 21 34Z" fill="#7d8fc9"/><circle cx="47" cy="31" r="3" fill="#f4f1ea"/></g>`;
 return `<svg viewBox="0 0 120 92" aria-hidden="true"><ellipse cx="60" cy="88" rx="54" ry="4" fill="#000" opacity=".12"/><path d="M8 58V30Q8 14 26 14H30Q42 14 42 30V58Z" fill="#a37a4c"/><path d="M12 56V32Q12 19 26 19H30Q38 19 38 32V56Z" fill="#b98d5f"/><rect x="6" y="56" width="108" height="20" rx="6" fill="#8a6440"/><rect x="10" y="74" width="7" height="12" rx="2" fill="#7b5638"/><rect x="103" y="74" width="7" height="12" rx="2" fill="#7b5638"/><ellipse cx="32" cy="52" rx="20" ry="8" fill="#fbf6ec"/>${night?sleeper:''}<path d="${night?'M36 48Q74 40 112 50V64Q74 70 36 64Z':'M24 52Q70 46 112 50V64Q70 70 24 64Z'}" fill="${q}"/><g fill="#fff" opacity=".55">${[50,64,78,92,104].map(x=>`<circle cx="${x}" cy="57" r="1.4"/>`).join('')}</g><path d="${night?'M36 48Q42 56 36 64':'M24 52Q30 58 24 64'}" stroke="#000" stroke-opacity=".08" stroke-width="3" fill="none"/></svg>`;
}
function bedHTML(f){
 const night=bedroomNight(),tucked=state.bedroom?.tucked?.[f.id]===bedroomDay();
 return `<button class="bed${night?' asleep':''}" data-bed-frog="${f.id}" aria-label="${night?`${escapeText(f.frogName)} sover${tucked?', nattad':'. Tryck för att natta'}`:`${escapeText(f.frogName)}s säng`}">${bedArt(f,night)}${night?`<span class="bedZ" aria-hidden="true">z<i>z</i></span>${tucked?'<span class="bedHeart" aria-hidden="true">♥</span>':''}`:`<span class="bedSitter" aria-hidden="true">${miniFrog(f.frog)}</span>`}<small>${escapeText(f.frogName)}</small></button>`;
}
function bedroomWindowArt(night){return `<svg viewBox="0 0 140 140" aria-hidden="true"><circle cx="70" cy="70" r="66" fill="#8a6440"/><circle cx="70" cy="70" r="56" fill="${night?'#2b3a63':'#cfe6f2'}"/>${night?'<circle cx="88" cy="50" r="14" fill="#f6eec4"/><circle cx="94" cy="46" r="12" fill="#2b3a63"/><g fill="#fff6c8"><circle cx="44" cy="44" r="2"/><circle cx="56" cy="86" r="1.6"/><circle cx="96" cy="92" r="1.8"/><circle cx="36" cy="72" r="1.4"/></g>':'<circle cx="92" cy="48" r="13" fill="#f8e08a"/><g fill="#fff"><ellipse cx="50" cy="80" rx="18" ry="7"/><ellipse cx="62" cy="76" rx="12" ry="7"/></g>'}<path d="M70 14V126M14 70H126" stroke="#8a6440" stroke-width="6"/></svg>`}
function houseLevelsHTML(current){const h=ensureHouse();const list=[['down','Nedervåningen'],...(h.upstairs?[['up','Övervåningen']]:[]),...(bedroomOpen()?[['bed','Sovrummet']]:[])];if(list.length<2)return '';return `<div class="houseLevels" role="group" aria-label="Rum">${list.map(([k,n])=>`<button data-house-level="${k}" aria-pressed="${current===k}">${n}</button>`).join('')}</div>`}
function renderBedroom(){
 const frogs=bedroomFrogs(),night=bedroomNight();
 $('#content').innerHTML=`<div class="sectionHead"><div><div class="eyebrow">ERT HEM I GLÄNTAN</div><h2>Grodornas sovrum</h2></div><span class="pill">${frogs.length} ${frogs.length===1?'säng':'sängar'}</span></div>${houseLevelsHTML('bed')}<section class="bedroom${night?' night':''}" aria-label="Grodornas sovrum"><span class="bedroomWindow">${bedroomWindowArt(night)}</span>${night?'<span class="bedroomLamp" aria-hidden="true"></span>':''}<div class="bedGrid">${frogs.map(bedHTML).join('')}</div></section><div class="gardenEditor"><p id="bedroomStatus" role="status">${night?'Grodorna sover. Tryck på en groda för att natta den.':'Sängarna är bäddade. Grodorna somnar när det blir natt.'}</p><div class="gardenTools"><button class="outline" id="bedroomNight">${night?'☀ God morgon':'☾ Godnatt'}</button></div></div>`;
 document.querySelectorAll('[data-house-level]').forEach(b=>b.onclick=()=>{state.house.level=b.dataset.houseLevel;save();renderHouse()});
 $('#bedroomNight').onclick=()=>{ensureGarden();state.garden.night=!state.garden.night;save();sfx('tick');renderBedroom()};
 document.querySelectorAll('[data-bed-frog]').forEach(b=>b.onclick=()=>{const id=b.dataset.bedFrog;if(!bedroomNight()){const f=bedroomFrogs().find(f=>f.id===id);sfx('jump');b.classList.remove('bounce');void b.offsetWidth;b.classList.add('bounce');$('#bedroomStatus').textContent=(f?.frogName||'Grodan')+' studsar i sängen!';return}const r=tuckFrog(id);if(!r)return;sfx('chime');renderBedroom();$('#bedroomStatus').textContent=r.first?`Sov gott, ${r.name}! · +${BEDROOM_TUCK_BOND} vänskap`:`${r.name} är redan nattad. Sov gott!`});
}

// ---------- Hooks into the cottage ----------
if(typeof renderHouse==='function'){const plain=renderHouse;renderHouse=function(){
 const h=ensureHouse();
 if(h.level==='bed'&&bedroomOpen()){renderBedroom();return}
 if(h.level==='bed')h.level='down';
 plain();
 // The room buttons: the floors and the bedroom.
 const old=document.querySelector?.('.houseLevels'),room=$('#houseRoom');
 const html=houseLevelsHTML(h.level==='up'&&h.upstairs?'up':'down');
 if(old)old.outerHTML=html;else if(html&&room?.insertAdjacentHTML)room.insertAdjacentHTML('beforebegin',html);
 if(!bedroomOpen()&&room?.insertAdjacentHTML&&typeof lockedHint==='function')room.insertAdjacentHTML('beforebegin',lockedHint('bedroom'));
 document.querySelectorAll('[data-house-level]').forEach(b=>b.onclick=()=>{state.house.level=b.dataset.houseLevel;save();renderHouse()});
}}
// With a bedroom, the frogs sleep there instead of downstairs.
if(typeof sleepingFrogsHTML==='function'){const plain=sleepingFrogsHTML;sleepingFrogsHTML=function(){const out=plain();return bedroomOpen()?out.replace(/<div class="frogBeds"[\s\S]*?<\/div>/,''):out}}
