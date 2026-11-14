// Survey 4, step 3: a kitchen garden outside the mushroom cottage, and frogs that play with each
// other in the glade. The garden opens with 6 pieces of furniture in the cottage (milestone "yard").
// Plant a crop, water it once to start it growing, then harvest when it is ripe (real minutes,
// it never wilts). Ten harvests give a scarecrow for the glade.

const yardCrops={
 carrot:{name:'Morötter',minutes:3,coins:12,color:'#e8843a'},
 strawberry:{name:'Jordgubbar',minutes:5,berries:4,color:'#d9453f'},
 sunflower:{name:'Solrosor',minutes:10,coins:25,color:'#f2c94c'},
 pumpkin:{name:'Pumpor',minutes:20,coins:45,color:'#e58c3a'}
};
const YARD_BEDS=6,YARD_SCARECROW_AT=10;
function ensureYard(){if(!state.yard)state.yard={beds:Array(YARD_BEDS).fill(null),harvests:0,pick:'carrot'};return state.yard}
function yardBedState(b,now=Date.now()){if(!b)return 'empty';if(!b.at)return 'dry';return now-b.at>=yardCrops[b.crop].minutes*60000?'ripe':'growing'}
function yardLeft(b,now=Date.now()){return b?.at?Math.max(0,yardCrops[b.crop].minutes*60000-(now-b.at)):0}
// One tap does the next thing for a bed: plant the chosen crop, water it, or harvest it.
function yardTap(i,now=Date.now()){
 const y=ensureYard();if(!Number.isInteger(i)||i<0||i>=YARD_BEDS)return null;const b=y.beds[i],st=yardBedState(b,now);
 if(st==='empty'){if(!yardCrops[y.pick])return null;y.beds[i]={crop:y.pick,at:null};save();return {did:'planted',crop:y.pick}}
 if(st==='dry'){b.at=now;save();return {did:'watered',crop:b.crop}}
 if(st==='ripe'){const c=yardCrops[b.crop],got={did:'harvested',crop:b.crop};if(c.coins){state.coins+=c.coins;got.coins=c.coins}if(c.berries){ensureGarden();state.garden.berries+=c.berries;got.berries=c.berries}
  y.beds[i]=null;y.harvests++;if(y.harvests===YARD_SCARECROW_AT&&!state.decorOwned.includes('scarecrow')){state.decorOwned.push('scarecrow');got.scarecrow=true}save();return got}
 return {did:'growing',crop:b.crop,left:yardLeft(b,now)};
}
function cropArt(crop,stage){
 const c=yardCrops[crop];if(stage==='dry')return '<g fill="#5c3a24"><circle cx="40" cy="58" r="2"/><circle cx="60" cy="60" r="2"/><circle cx="80" cy="58" r="2"/></g>';
 const sprout=x=>`<path d="M${x} 60V48" stroke="#4f8f52" stroke-width="3"/><path d="M${x} 50Q${x-8} 44 ${x-10} 48Q${x-4} 54 ${x} 52ZM${x} 50Q${x+8} 44 ${x+10} 48Q${x+4} 54 ${x} 52Z" fill="#6aa060"/>`;
 if(stage==='growing')return [40,60,80].map(sprout).join('');
 return [40,60,80].map(x=>({carrot:`<path d="M${x-5} 54L${x} 72L${x+5} 54Z" fill="${c.color}"/><path d="M${x} 54L${x-8} 36M${x} 54L${x} 34M${x} 54L${x+8} 36" stroke="#4f8f52" stroke-width="3" stroke-linecap="round"/>`,
  strawberry:`<path d="M${x} 58V40" stroke="#4f8f52" stroke-width="2"/><ellipse cx="${x-6}" cy="46" rx="7" ry="4" fill="#4f8f52"/><path d="M${x-5} 52Q${x} 66 ${x+5} 52Q${x} 48 ${x-5} 52Z" fill="${c.color}"/><g fill="#fff3b0"><circle cx="${x-1.5}" cy="55" r=".8"/><circle cx="${x+1.5}" cy="58" r=".8"/></g>`,
  sunflower:`<path d="M${x} 60V24" stroke="#4f8f52" stroke-width="3"/><ellipse cx="${x-6}" cy="44" rx="6" ry="3" fill="#6aa060"/><circle cx="${x}" cy="22" r="10" fill="${c.color}"/><circle cx="${x}" cy="22" r="5" fill="#7b5638"/>`,
  pumpkin:`<path d="M${x} 46Q${x+2} 40 ${x+6} 38" stroke="#4f8f52" stroke-width="2.4" fill="none"/><ellipse cx="${x}" cy="56" rx="10" ry="8" fill="${c.color}"/><path d="M${x-4} 49Q${x-6} 56 ${x-4} 63M${x+4} 49Q${x+6} 56 ${x+4} 63" stroke="#c96d24" stroke-width="1.4" fill="none"/>`}[crop])).join('');
}
function yardBedHTML(i){
 const y=ensureYard(),b=y.beds[i],st=yardBedState(b),left=yardLeft(b);
 const label={empty:'Plantera '+yardCrops[y.pick].name.toLowerCase(),dry:'💧 Vattna',growing:'Växer · '+Math.max(1,Math.ceil(left/60000))+' min',ripe:'Skörda!'}[st];
 return `<button class="yardBed ${st}" data-yard-bed="${i}" aria-label="Bädd ${i+1}: ${label}"><svg viewBox="0 0 120 80" aria-hidden="true"><rect x="10" y="56" width="100" height="20" rx="8" fill="#7b5638"/><rect x="14" y="54" width="92" height="14" rx="6" fill="#5c3a24"/>${b?cropArt(b.crop,st):''}</svg><small>${label}</small></button>`;
}
function yardSceneSVG(){return `<svg class="yardBackdrop" viewBox="0 0 1000 420" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><rect width="1000" height="420" fill="#cfe3d2"/><circle cx="140" cy="70" r="40" fill="#f8e8a4"/><path d="M0 170Q250 120 500 160T1000 150V420H0Z" fill="#9cc48a"/><path d="M0 230Q300 200 600 226T1000 214V420H0Z" fill="#b2d39a"/><g transform="translate(760 40) scale(1.4)"><path d="M40 120Q36 160 44 172H120Q128 160 124 120Z" fill="#f2e3c6"/><path d="M10 124Q30 40 82 36Q134 40 154 124Q82 140 10 124Z" fill="#c96c5e"/><g fill="#fff2d9"><ellipse cx="50" cy="84" rx="12" ry="8"/><ellipse cx="96" cy="66" rx="10" ry="6"/><ellipse cx="124" cy="96" rx="11" ry="7"/></g><path d="M70 172V146Q82 134 94 146V172Z" fill="#7b5638"/><circle cx="110" cy="146" r="9" fill="#f4d98e" stroke="#7b5638" stroke-width="2"/></g><g stroke="#c9a06a" stroke-width="10" stroke-linecap="round">${Array.from({length:14},(_,i)=>`<path d="M${30+i*50} 400V330"/>`).join('')}</g><path d="M20 350H720M20 380H720" stroke="#b48d63" stroke-width="8"/></svg>`}
let yardTimer=null;
function renderYard(){
 const head=`<div class="sectionHead"><div><div class="eyebrow">UTANFÖR SVAMPHUSET</div><h2>Trädgården</h2></div>${typeof unlocked==='function'&&unlocked('yard')?`<span class="pill">${ensureYard().harvests} skördar</span>`:''}</div>`;
 if(typeof unlocked==='function'&&!unlocked('yard')){$('#content').innerHTML=head+(typeof lockedHint==='function'?lockedHint('yard'):'');return}
 const y=ensureYard();
 $('#content').innerHTML=`${head}<p class="forestLead">Plantera, vattna en gång och skörda när det är moget. Inget vissnar, så det får ta den tid det tar.</p><section class="yardScene">${yardSceneSVG()}<div class="yardBeds" id="yardBeds">${Array.from({length:YARD_BEDS},(_,i)=>yardBedHTML(i)).join('')}</div></section><div class="yardCrops" role="group" aria-label="Välj vad ni planterar">${Object.entries(yardCrops).map(([k,c])=>`<button class="julBauble ${y.pick===k?'chosen':''}" data-yard-crop="${k}" aria-pressed="${y.pick===k}"><svg viewBox="26 14 68 62" aria-hidden="true">${cropArt(k,'ripe')}</svg>${c.name} · ${c.minutes} min</button>`).join('')}</div><p id="yardStatus" class="forestStatus" role="status"></p><p class="forestNote">${y.harvests<YARD_SCARECROW_AT?`Efter ${YARD_SCARECROW_AT} skördar kommer en fågelskrämma till gläntan (${y.harvests} av ${YARD_SCARECROW_AT}).`:'Fågelskrämman vaktar gläntan.'} Morötter, solrosor och pumpor ger daggdroppar, jordgubbar hamnar i bärkorgen.</p>`;
 wireYard();
 clearInterval(yardTimer);yardTimer=setInterval(()=>{if(tab!=='yard'||!$('#yardBeds')){clearInterval(yardTimer);yardTimer=null;return}$('#yardBeds').innerHTML=Array.from({length:YARD_BEDS},(_,i)=>yardBedHTML(i)).join('');wireYard()},15000);
}
function wireYard(){
 document.querySelectorAll('[data-yard-bed]').forEach(b=>b.onclick=()=>{const r=yardTap(+b.dataset.yardBed);if(!r)return;const c=yardCrops[r.crop];
  const msg={planted:c.name+' är planterade. Vattna dem!',watered:c.name+' fick vatten och börjar växa.',growing:c.name+' växer. Ungefär '+Math.max(1,Math.ceil((r.left||0)/60000))+' minuter kvar.',harvested:'Ni skördade '+c.name.toLowerCase()+'!'+(r.coins?' · +'+r.coins+' daggdroppar':'')+(r.berries?' · +'+r.berries+' bär':'')+(r.scarecrow?' · En fågelskrämma flyttar in i gläntan!':'')}[r.did];
  sfx(r.did==='harvested'?'chime':'tick');if(r.did==='harvested')sidebar();renderYard();$('#yardStatus').textContent=msg});
 document.querySelectorAll('[data-yard-crop]').forEach(b=>b.onclick=()=>{ensureYard().pick=b.dataset.yardCrop;save();renderYard()});
}
if(typeof decorations!=='undefined')decorations.push({id:'scarecrow',name:'Fågelskrämma',icon:'🌾',from:'Skörda 10 gånger i trädgården'});
if(typeof extraGardenArt!=='undefined')extraGardenArt.scarecrow='<ellipse cx="60" cy="104" rx="26" ry="5" fill="#000" opacity=".12"/><path d="M60 104V30M24 52H96" stroke="#8a6a4c" stroke-width="6" stroke-linecap="round"/><path d="M42 50H78L82 86H38Z" fill="#4f86c6"/><path d="M50 60h6v6h-6zM64 72h6v6h-6z" fill="#e2b94b"/><circle cx="60" cy="32" r="14" fill="#e9d29a"/><path d="M38 24Q60 2 82 24Z" fill="#c9473f"/><rect x="36" y="22" width="48" height="5" rx="2" fill="#a8382f"/><g fill="#263d32"><circle cx="55" cy="32" r="1.6"/><circle cx="65" cy="32" r="1.6"/></g><path d="M54 38q6 4 12 0" stroke="#263d32" stroke-width="1.4" fill="none"/><path d="M24 52l-6 6M24 52l-6-4M96 52l6 6M96 52l6-4" stroke="#e2c46a" stroke-width="2"/>';

// ---------- Frogs play together in the glade ----------
// The other frogs (not the one riding with the fairy) hop around in the glade. Tap one and it plays
// leapfrog with your frog: once a day per frog both get a little friendship.
const gladeFrogSpots=[[18,74],[32,84],[60,82],[78,72]];
function frogPlayToday(){return typeof todayKey==='function'?todayKey():new Date().toDateString()}
function gladeFrogs(){return (state.frogs||[]).filter(f=>f.id!==state.activeFrog).slice(0,gladeFrogSpots.length)}
function frogPlay(id){
 const f=gladeFrogs().find(f=>f.id===id);if(!f)return null;state.frogPlay=state.frogPlay||{};const day=frogPlayToday(),first=state.frogPlay[id]!==day;
 if(first){state.frogPlay[id]=day;f.bond=Math.min(100,(f.bond||0)+2);state.bond=Math.min(100,(state.bond||0)+1);save()}
 return {name:f.frogName,friend:state.frogName,first};
}
const frogGames=['leker bockhopp','leker kull','tävlar om vem som hoppar längst','plaskar i dammen','letar glänsande stenar'];
function frogPlayHTML(){const list=gladeFrogs();if(!list.length)return '';return list.map((f,i)=>`<button class="gladeFrog" data-glade-frog="${f.id}" style="left:${gladeFrogSpots[i][0]}%;top:${gladeFrogSpots[i][1]}%;animation-delay:${i*.7}s" aria-label="Lek med ${escapeText(f.frogName)}">${miniFrog(f.frog)}</button>`).join('')}
function wireFrogPlay(){document.querySelectorAll('[data-glade-frog]').forEach(b=>b.onclick=e=>{e.stopPropagation?.();const r=frogPlay(b.dataset.gladeFrog);if(!r)return;b.classList.remove('play');void b.offsetWidth;b.classList.add('play');sfx('jump');toast(`${r.name} och ${r.friend} ${frogGames[Math.floor(Math.random()*frogGames.length)]}!${r.first?' · +2 vänskap':''}`)})}
