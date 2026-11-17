// The kitchen garden outside the mushroom cottage (survey 4, step 3) and frogs that play with each
// other in the glade. Survey 5 asked to make the garden more useful, so the harvest now goes to a
// pantry (skafferiet) and can be:
// - cooked into food in the cottage kitchen,
// - sold in the village shop,
// - given to the neighbours, or
// - fed to your frog.
// There are more crops, and hens and a rabbit to keep.
// The garden opens with 6 pieces of furniture in the cottage (milestone "yard"); the animals open
// after 8 harvests (milestone "yardanimals"). Plant a crop, water it once to start it growing, and
// harvest when it is ripe (real minutes; nothing wilts). Ten harvests give a scarecrow for the glade.

// `from` is how many harvests it takes before a crop can be planted (the first four were there from the start).
const yardCrops={
 radish:{name:'Rädisor',minutes:2,yield:3,price:4,color:'#d9456a',from:0},
 carrot:{name:'Morötter',minutes:3,yield:3,price:5,color:'#e8843a',from:0},
 strawberry:{name:'Jordgubbar',minutes:5,yield:4,price:5,color:'#d9453f',from:0},
 peas:{name:'Ärtor',minutes:4,yield:3,price:5,color:'#7fbf5a',from:3},
 potato:{name:'Potatis',minutes:8,yield:3,price:7,color:'#c9a06a',from:6},
 sunflower:{name:'Solrosor',minutes:10,yield:2,price:12,color:'#f2c94c',from:0},
 pumpkin:{name:'Pumpor',minutes:20,yield:1,price:34,color:'#e58c3a',from:0}
};
// Food cooked in the cottage kitchen. Eggs come from the hens.
const yardDishes={
 salad:{name:'Rädissallad',needs:{radish:3,peas:1},price:22,color:'#e8a0b4'},
 carrotsoup:{name:'Morotssoppa',needs:{carrot:2,potato:1},price:28,color:'#e8843a'},
 peasoup:{name:'Ärtsoppa',needs:{peas:3},price:22,color:'#9cc46a'},
 pumpkinsoup:{name:'Pumpasoppa',needs:{pumpkin:1,carrot:1},price:44,color:'#e58c3a'},
 pancakes:{name:'Pannkakor med jordgubbar',needs:{egg:2,strawberry:2},price:32,color:'#f2d38a'},
 cake:{name:'Jordgubbstårta',needs:{egg:2,strawberry:4},price:50,color:'#f6c4cf'},
 cookies:{name:'Solroskakor',needs:{sunflower:1,egg:1},price:30,color:'#d9b06a'}
};
const pantryNames={egg:'Ägg'};
// One of something, for "1 pumpa" instead of "1 pumpor".
const itemOne={radish:'rädisa',carrot:'morot',strawberry:'jordgubbe',peas:'ärta',potato:'potatis',sunflower:'solros',pumpkin:'pumpa',egg:'ägg'};
function itemCount(k,n){return n+' '+(n===1&&itemOne[k]?itemOne[k]:itemName(k).toLowerCase())}
const YARD_BEDS=6,YARD_SCARECROW_AT=10,HEN_EVERY=15*60000,HEN_NEST=4,HENHOUSE_COST=150,RABBIT_COST=120,RABBIT_SPEEDUP=3*60000,FEED_BOND=6,GIFT_THANKS=10;
function ensureYard(){
 if(!state.yard)state.yard={beds:Array(YARD_BEDS).fill(null),harvests:0,pick:'carrot'};
 const y=state.yard;y.pantry??={};y.gifts??={};y.animals??={};
 return y;
}
function itemName(k){return yardCrops[k]?.name||yardDishes[k]?.name||pantryNames[k]||k}
function pantryHave(k){return ensureYard().pantry[k]||0}
function pantryAdd(k,n){const p=ensureYard().pantry;p[k]=Math.max(0,(p[k]||0)+n)}
function cropOpen(k){return (ensureYard().harvests||0)>=(yardCrops[k]?.from||0)}
function yardBedState(b,now=Date.now()){if(!b)return 'empty';if(!b.at)return 'dry';return now-b.at>=yardCrops[b.crop].minutes*60000?'ripe':'growing'}
function yardLeft(b,now=Date.now()){return b?.at?Math.max(0,yardCrops[b.crop].minutes*60000-(now-b.at)):0}
// One tap does the next thing for a bed: plant the chosen crop, water it, or harvest it into the pantry.
function yardTap(i,now=Date.now()){
 const y=ensureYard();if(!Number.isInteger(i)||i<0||i>=YARD_BEDS)return null;const b=y.beds[i],st=yardBedState(b,now);
 if(st==='empty'){if(!yardCrops[y.pick]||!cropOpen(y.pick))return null;y.beds[i]={crop:y.pick,at:null};save();return {did:'planted',crop:y.pick}}
 if(st==='dry'){b.at=now;save();return {did:'watered',crop:b.crop}}
 if(st==='ripe'){const c=yardCrops[b.crop],got={did:'harvested',crop:b.crop,n:c.yield};pantryAdd(b.crop,c.yield);
  y.beds[i]=null;y.harvests++;if(y.harvests===YARD_SCARECROW_AT&&!state.decorOwned.includes('scarecrow')){state.decorOwned.push('scarecrow');got.scarecrow=true}
  const fresh=Object.entries(yardCrops).filter(([,v])=>v.from===y.harvests).map(([k])=>k);if(fresh.length)got.newCrops=fresh;
  save();return got}
 return {did:'growing',crop:b.crop,left:yardLeft(b,now)};
}
// Shortcuts for phones: do the next thing in every bed that is waiting for it.
function yardAll(kind,now=Date.now()){const y=ensureYard(),out=[];y.beds.forEach((b,i)=>{const st=yardBedState(b,now);if((kind==='harvest'&&st==='ripe')||(kind==='water'&&st==='dry')||(kind==='plant'&&st==='empty')){const r=yardTap(i,now);if(r)out.push(r)}});return out}

// ---------- The cottage kitchen ----------
function canCook(id){const d=yardDishes[id];return !!d&&Object.entries(d.needs).every(([k,n])=>pantryHave(k)>=n)}
function cook(id){if(!canCook(id))return false;for(const [k,n] of Object.entries(yardDishes[id].needs))pantryAdd(k,-n);pantryAdd(id,1);ensureYard().cooked=(state.yard.cooked||0)+1;save();return true}
// Share a dish with your frog: friendship grows.
function feedFrog(id){if(!yardDishes[id]||pantryHave(id)<1)return false;pantryAdd(id,-1);state.bond=Math.min(100,(state.bond||0)+FEED_BOND);save();return true}

// ---------- Gifts for the neighbours ----------
// Each neighbour likes some things best. One gift a day each: a dish gives 3 friendship, a
// favourite crop 2, anything else 1. They say thank you with a few dewdrops.
const neighbourLikes={mira:['cake','salad','strawberry','sunflower'],tagge:['carrotsoup','pumpkinsoup','carrot','pumpkin'],tilda:['peasoup','pancakes','peas','potato'],vide:['cookies','cake','sunflower','radish']};
function giftDay(){return typeof todayKey==='function'?todayKey():new Date().toDateString()}
function neighbourGiftPick(id){const likes=neighbourLikes[id]||[];const fav=likes.find(k=>pantryHave(k)>0);if(fav)return fav;return Object.keys(yardCrops).find(k=>pantryHave(k)>0)||null}
function giveNeighbour(id){
 const y=ensureYard();if(!(state.village?.residents||[]).includes(id)||y.gifts[id]===giftDay())return null;
 const k=neighbourGiftPick(id);if(!k)return null;pantryAdd(k,-1);y.gifts[id]=giftDay();
 const fav=(neighbourLikes[id]||[]).includes(k),points=yardDishes[k]?3:fav?2:1;
 state.village.friendship??={};state.village.friendship[id]=(state.village.friendship[id]||0)+points;state.coins+=GIFT_THANKS;save();
 return {item:k,points,fav};
}

// ---------- Hens and a rabbit ----------
// Hens lay an egg every 15 minutes, at most 4 waiting in the nest. The rabbit Nos gets one carrot
// a day; a fed rabbit tends the beds, so everything growing is 3 minutes closer to ripe.
function buyAnimal(kind,now=Date.now()){const a=ensureYard().animals,cost=kind==='hens'?HENHOUSE_COST:kind==='rabbit'?RABBIT_COST:null;if(cost===null||a[kind]||(typeof unlocked==='function'&&!unlocked('yardanimals'))||state.coins<cost)return false;state.coins-=cost;a[kind]=kind==='hens'?{at:now}:{fed:null};save();return true}
function eggsWaiting(now=Date.now()){const h=ensureYard().animals.hens;return h?Math.min(HEN_NEST,Math.floor((now-h.at)/HEN_EVERY)):0}
function collectEggs(now=Date.now()){const h=ensureYard().animals.hens,n=eggsWaiting(now);if(!n)return 0;pantryAdd('egg',n);h.at=n>=HEN_NEST?now:h.at+n*HEN_EVERY;save();return n}
function feedRabbit(now=Date.now()){const y=ensureYard(),r=y.animals.rabbit;if(!r||r.fed===giftDay()||pantryHave('carrot')<1)return null;pantryAdd('carrot',-1);r.fed=giftDay();let helped=0;y.beds.forEach(b=>{if(b?.at&&yardBedState(b,now)==='growing'){b.at-=RABBIT_SPEEDUP;helped++}});save();return {helped}}

// ---------- Art ----------
function cropArt(crop,stage){
 const c=yardCrops[crop];if(stage==='dry')return '<g fill="#5c3a24"><circle cx="40" cy="58" r="2"/><circle cx="60" cy="60" r="2"/><circle cx="80" cy="58" r="2"/></g>';
 const sprout=x=>`<path d="M${x} 60V48" stroke="#4f8f52" stroke-width="3"/><path d="M${x} 50Q${x-8} 44 ${x-10} 48Q${x-4} 54 ${x} 52ZM${x} 50Q${x+8} 44 ${x+10} 48Q${x+4} 54 ${x} 52Z" fill="#6aa060"/>`;
 if(stage==='growing')return [40,60,80].map(sprout).join('');
 return [40,60,80].map(x=>({carrot:`<path d="M${x-5} 54L${x} 72L${x+5} 54Z" fill="${c.color}"/><path d="M${x} 54L${x-8} 36M${x} 54L${x} 34M${x} 54L${x+8} 36" stroke="#4f8f52" stroke-width="3" stroke-linecap="round"/>`,
  radish:`<path d="M${x} 50L${x-7} 36M${x} 50L${x+7} 36" stroke="#4f8f52" stroke-width="3" stroke-linecap="round"/><circle cx="${x}" cy="56" r="7" fill="${c.color}"/><path d="M${x} 63V69" stroke="#f4e4e8" stroke-width="1.5"/><circle cx="${x-2}" cy="54" r="1.6" fill="#fff" opacity=".6"/>`,
  peas:`<path d="M${x} 60V32" stroke="#4f8f52" stroke-width="2"/><path d="M${x} 40Q${x+10} 34 ${x+12} 40" stroke="#4f8f52" stroke-width="1.5" fill="none"/><path d="M${x-10} 48Q${x} 40 ${x+10} 48Q${x} 56 ${x-10} 48Z" fill="${c.color}"/><g fill="#4f8f52"><circle cx="${x-5}" cy="48" r="2"/><circle cx="${x}" cy="48" r="2"/><circle cx="${x+5}" cy="48" r="2"/></g>`,
  potato:`<path d="M${x} 52V36M${x} 44L${x-7} 38M${x} 44L${x+7} 38" stroke="#4f8f52" stroke-width="3" stroke-linecap="round"/><ellipse cx="${x-4}" cy="60" rx="7" ry="5" fill="${c.color}"/><ellipse cx="${x+5}" cy="62" rx="6" ry="4.5" fill="#b48d63"/><g fill="#8a6a4c"><circle cx="${x-6}" cy="59" r=".9"/><circle cx="${x+6}" cy="61" r=".9"/></g>`,
  strawberry:`<path d="M${x} 58V40" stroke="#4f8f52" stroke-width="2"/><ellipse cx="${x-6}" cy="46" rx="7" ry="4" fill="#4f8f52"/><path d="M${x-5} 52Q${x} 66 ${x+5} 52Q${x} 48 ${x-5} 52Z" fill="${c.color}"/><g fill="#fff3b0"><circle cx="${x-1.5}" cy="55" r=".8"/><circle cx="${x+1.5}" cy="58" r=".8"/></g>`,
  sunflower:`<path d="M${x} 60V24" stroke="#4f8f52" stroke-width="3"/><ellipse cx="${x-6}" cy="44" rx="6" ry="3" fill="#6aa060"/><circle cx="${x}" cy="22" r="10" fill="${c.color}"/><circle cx="${x}" cy="22" r="5" fill="#7b5638"/>`,
  pumpkin:`<path d="M${x} 46Q${x+2} 40 ${x+6} 38" stroke="#4f8f52" stroke-width="2.4" fill="none"/><ellipse cx="${x}" cy="56" rx="10" ry="8" fill="${c.color}"/><path d="M${x-4} 49Q${x-6} 56 ${x-4} 63M${x+4} 49Q${x+6} 56 ${x+4} 63" stroke="#c96d24" stroke-width="1.4" fill="none"/>`}[crop])).join('');
}
// A small picture of anything in the pantry (100×70, the shop's picture size).
function pantryArt(k){
 if(yardCrops[k])return `<svg viewBox="26 14 68 62" aria-hidden="true">${cropArt(k,'ripe')}</svg>`;
 if(k==='egg')return '<svg viewBox="0 0 100 70" aria-hidden="true"><ellipse cx="50" cy="56" rx="34" ry="8" fill="#c9a06a"/><ellipse cx="38" cy="42" rx="11" ry="14" fill="#fbf3e2" stroke="#e3cfa6"/><ellipse cx="60" cy="44" rx="10" ry="13" fill="#f0dcc0" stroke="#e3cfa6"/><ellipse cx="50" cy="38" rx="10" ry="13" fill="#fffaf0" stroke="#e3cfa6"/></svg>';
 const d=yardDishes[k];if(!d)return '';
 if(k==='cake')return `<svg viewBox="0 0 100 70" aria-hidden="true"><ellipse cx="50" cy="60" rx="38" ry="7" fill="#e8e2d4"/><rect x="22" y="30" width="56" height="28" rx="6" fill="#fff6ea"/><rect x="22" y="40" width="56" height="5" fill="${d.color}"/><path d="M22 34Q30 40 38 34T54 34T70 34T78 34V30H22Z" fill="#fffaf0"/><g fill="#d9453f"><circle cx="32" cy="27" r="4.5"/><circle cx="50" cy="25" r="4.5"/><circle cx="68" cy="27" r="4.5"/></g></svg>`;
 if(k==='pancakes')return `<svg viewBox="0 0 100 70" aria-hidden="true"><ellipse cx="50" cy="60" rx="38" ry="7" fill="#e8e2d4"/>${[52,46,40,34].map(y=>`<ellipse cx="50" cy="${y}" rx="28" ry="6" fill="${d.color}" stroke="#d9a75a"/>`).join('')}<g fill="#d9453f"><circle cx="44" cy="30" r="4"/><circle cx="56" cy="31" r="4"/></g></svg>`;
 if(k==='cookies')return `<svg viewBox="0 0 100 70" aria-hidden="true"><ellipse cx="50" cy="58" rx="38" ry="8" fill="#e8e2d4"/>${[[36,46],[60,46],[48,36]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="12" fill="${d.color}" stroke="#b48d63"/><g fill="#5c3a24"><circle cx="${x-4}" cy="${y-2}" r="1.3"/><circle cx="${x+3}" cy="${y+3}" r="1.3"/><circle cx="${x+2}" cy="${y-4}" r="1.3"/></g>`).join('')}</svg>`;
 if(k==='salad')return `<svg viewBox="0 0 100 70" aria-hidden="true"><path d="M16 36H84Q80 62 50 62Q20 62 16 36Z" fill="#fbf3e2" stroke="#e3cfa6"/><g fill="#7fbf5a"><circle cx="34" cy="34" r="8"/><circle cx="52" cy="30" r="9"/><circle cx="68" cy="34" r="8"/></g><g fill="#d9456a"><circle cx="42" cy="34" r="5"/><circle cx="62" cy="32" r="5"/></g></svg>`;
 return `<svg viewBox="0 0 100 70" aria-hidden="true"><path d="M14 34H86Q82 64 50 64Q18 64 14 34Z" fill="#fbf3e2" stroke="#e3cfa6" stroke-width="2"/><ellipse cx="50" cy="34" rx="36" ry="7" fill="${d.color}"/><path d="M40 20q4-6 0-12M54 20q4-6 0-12" stroke="#c9b5a0" stroke-width="2" fill="none" stroke-linecap="round"/><circle cx="58" cy="33" r="2.5" fill="#fff" opacity=".5"/></svg>`;
}
function henArt(){return '<svg viewBox="0 0 120 100" aria-hidden="true"><path d="M14 52L60 18L106 52Z" fill="#c9473f"/><rect x="22" y="50" width="76" height="40" rx="4" fill="#e6c79a"/><path d="M50 90V66Q60 58 70 66V90Z" fill="#7b5638"/><path d="M60 90L60 98" stroke="#7b5638" stroke-width="3"/>'+[[30,84],[92,86]].map(([x,y])=>`<ellipse cx="${x}" cy="${y}" rx="11" ry="9" fill="#fff"/><circle cx="${x+8}" cy="${y-8}" r="5" fill="#fff"/><path d="M${x+7} ${y-14}l2-3 2 3" fill="#d9453f"/><path d="M${x+12} ${y-8}l4 1-4 1Z" fill="#e2a73a"/><circle cx="${x+9}" cy="${y-9}" r="1" fill="#263d32"/>`).join('')+'</svg>'}
function rabbitArt(){return '<svg viewBox="0 0 120 100" aria-hidden="true"><ellipse cx="60" cy="92" rx="34" ry="5" fill="#000" opacity=".12"/><ellipse cx="62" cy="72" rx="28" ry="20" fill="#c9b5a0"/><circle cx="88" cy="74" r="7" fill="#fff"/><circle cx="44" cy="52" r="16" fill="#d4c2ae"/><path d="M36 40Q30 10 38 8Q44 10 44 38ZM48 38Q52 8 60 10Q64 14 54 40Z" fill="#d4c2ae"/><path d="M38 36Q34 16 38 13M52 36Q56 16 58 14" stroke="#f2b7c3" stroke-width="3" fill="none" stroke-linecap="round"/><circle cx="38" cy="50" r="2.4" fill="#263d32"/><circle cx="50" cy="50" r="2.4" fill="#263d32"/><ellipse cx="44" cy="57" rx="2.4" ry="1.8" fill="#e59aa8"/><path d="M30 58H22M30 61H23M58 58H66M58 61H65" stroke="#8a7a6a" stroke-width=".8"/></svg>'}
function yardBedHTML(i){
 const y=ensureYard(),b=y.beds[i],st=yardBedState(b),left=yardLeft(b);
 const label={empty:'Plantera '+yardCrops[y.pick].name.toLowerCase(),dry:'💧 Vattna',growing:'Växer · '+Math.max(1,Math.ceil(left/60000))+' min',ripe:'Skörda!'}[st];
 return `<button class="yardBed ${st}" data-yard-bed="${i}" aria-label="Bädd ${i+1}: ${label}"><svg viewBox="0 0 120 80" aria-hidden="true"><rect x="10" y="56" width="100" height="20" rx="8" fill="#7b5638"/><rect x="14" y="54" width="92" height="14" rx="6" fill="#5c3a24"/>${b?cropArt(b.crop,st):''}</svg><small>${label}</small></button>`;
}
// The animals live in the garden scene: the hen house with hens pecking around it, and Nos's hutch with
// Nos hopping about. Tap the hen house to collect eggs and Nos to give a carrot.
function penHenArt(){return '<svg viewBox="0 0 40 36" aria-hidden="true"><path d="M7 21L1 14V27Z" fill="#e9dcc4"/><path d="M8 22Q8 10 20 10Q29 10 32 17L36 22Q34 30 22 30Q10 30 8 22Z" fill="#f6efe2"/><path d="M14 20Q20 16 26 22Q20 26 14 20Z" fill="#e6dac6"/><circle cx="31" cy="11" r="6" fill="#f6efe2"/><path d="M27 6q1.5-3.5 3.5-.5q1.5-3.5 3.5-.5v2.5h-7Z" fill="#d9453f"/><path d="M36.5 10.5l4 1.6-4 1.6Z" fill="#e8a83a"/><circle cx="32.5" cy="10" r="1.1" fill="#2a201c"/><path d="M33 15q1 3 0 4" stroke="#d9453f" stroke-width="2" stroke-linecap="round"/><path d="M18 30v5M24 30v5" stroke="#e8a83a" stroke-width="1.8" stroke-linecap="round"/></svg>'}
function penRabbitArt(){return '<svg viewBox="0 0 44 36" aria-hidden="true"><path d="M30 12Q27 0 31 1Q34 2 33.5 12Z" fill="#c9b5a0"/><path d="M33 12Q33 1 37 2.5Q39 4 36 12.5Z" fill="#b8a38d"/><path d="M31 10Q29.6 4 31.2 3.6" stroke="#f0c8cc" stroke-width="1.4" fill="none"/><ellipse cx="19" cy="25" rx="13" ry="9" fill="#c9b5a0"/><circle cx="32" cy="19" r="7" fill="#c9b5a0"/><circle cx="6.5" cy="22" r="3.6" fill="#fffaf2"/><circle cx="34.5" cy="17.6" r="1.3" fill="#2a201c"/><circle cx="38.6" cy="20.4" r="1.2" fill="#e8a0aa"/><path d="M14 33q3 1 6 0M24 33q3 1 6 0" stroke="#a8927c" stroke-width="2.4" stroke-linecap="round"/></svg>'}
function hutchArt(){return '<svg viewBox="0 0 100 80" aria-hidden="true"><ellipse cx="50" cy="76" rx="42" ry="4" fill="#000" opacity=".12"/><path d="M8 30L50 8L92 30Z" fill="#8a6440"/><rect x="14" y="28" width="72" height="40" rx="3" fill="#c9a06a"/><rect x="22" y="36" width="34" height="24" rx="2" fill="#5d4632"/><g stroke="#e8e2d4" stroke-width="1.2" opacity=".85"><path d="M28 36V60M34 36V60M40 36V60M46 36V60M52 36V60M22 42H56M22 48H56M22 54H56"/></g><rect x="62" y="38" width="16" height="22" rx="2" fill="#a37a4c"/><circle cx="74" cy="49" r="1.6" fill="#e2b94b"/><path d="M16 68V76M84 68V76" stroke="#7b5638" stroke-width="4"/></svg>'}
function yardPenHTML(){
 const a=ensureYard().animals;if(!a.hens&&!a.rabbit)return '';
 const eggs=a.hens?eggsWaiting():0;
 return `<div class="yardPen">${a.hens?`<button class="penCoop" id="penHens" aria-label="Hönshuset${eggs?', '+eggs+' ägg i redet':''}">${henArt()}${eggs?`<span class="penEggs">${'🥚'.repeat(Math.min(eggs,4))}</span>`:''}</button>${[0,1,2].map(i=>`<span class="penHen hen${i}" aria-hidden="true">${penHenArt()}</span>`).join('')}`:''}${a.rabbit?`<span class="penHutch" aria-hidden="true">${hutchArt()}</span><button class="penRabbit" id="penRabbit" aria-label="Kaninen Nos"><span class="penHop">${penRabbitArt()}</span></button>`:''}</div>`;
}
function yardSceneSVG(){return `<svg class="yardBackdrop" viewBox="0 0 1000 420" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><rect width="1000" height="420" fill="#cfe3d2"/><circle cx="140" cy="70" r="40" fill="#f8e8a4"/><path d="M0 170Q250 120 500 160T1000 150V420H0Z" fill="#9cc48a"/><path d="M0 230Q300 200 600 226T1000 214V420H0Z" fill="#b2d39a"/><g transform="translate(760 40) scale(1.4)"><path d="M40 120Q36 160 44 172H120Q128 160 124 120Z" fill="#f2e3c6"/><path d="M10 124Q30 40 82 36Q134 40 154 124Q82 140 10 124Z" fill="#c96c5e"/><g fill="#fff2d9"><ellipse cx="50" cy="84" rx="12" ry="8"/><ellipse cx="96" cy="66" rx="10" ry="6"/><ellipse cx="124" cy="96" rx="11" ry="7"/></g><path d="M70 172V146Q82 134 94 146V172Z" fill="#7b5638"/><circle cx="110" cy="146" r="9" fill="#f4d98e" stroke="#7b5638" stroke-width="2"/></g><g stroke="#c9a06a" stroke-width="10" stroke-linecap="round">${Array.from({length:14},(_,i)=>`<path d="M${30+i*50} 400V330"/>`).join('')}</g><path d="M20 350H720M20 380H720" stroke="#b48d63" stroke-width="8"/></svg>`}
function pantryHTML(){const items=Object.entries(ensureYard().pantry).filter(([,n])=>n>0);return items.length?`<div class="pantryList">${items.map(([k,n])=>`<span class="pantryItem">${pantryArt(k)}<b>${n}</b><small>${itemName(k)}</small></span>`).join('')}</div>`:'<p class="forestNote">Skafferiet är tomt. Skörda något i trädgården!</p>'}

let yardTimer=null;
function renderYard(){
 const head=`<div class="sectionHead"><div><div class="eyebrow">UTANFÖR SVAMPHUSET</div><h2>Trädgården</h2></div>${typeof unlocked==='function'&&unlocked('yard')?`<span class="pill">${ensureYard().harvests} skördar</span>`:''}</div>`;
 if(typeof unlocked==='function'&&!unlocked('yard')){$('#content').innerHTML=head+(typeof lockedHint==='function'?lockedHint('yard'):'');return}
 const y=ensureYard(),now=Date.now(),count=st=>y.beds.filter(b=>yardBedState(b,now)===st).length;
 if(!cropOpen(y.pick))y.pick='carrot';
 const animalsOpen=typeof unlocked!=='function'||unlocked('yardanimals'),residents=(state.village?.residents||[]).filter(id=>neighbourLikes[id]);
 $('#content').innerHTML=`${head}<p class="forestLead">Plantera, vattna en gång och skörda när det är moget. Det ni skördar hamnar i skafferiet. Där kan ni laga mat i svamphuset, sälja i butiken eller ge till grannarna.</p>
<section class="yardScene">${yardSceneSVG()}${yardPenHTML()}<div class="yardBeds" id="yardBeds">${Array.from({length:YARD_BEDS},(_,i)=>yardBedHTML(i)).join('')}</div></section>
<div class="yardQuick">${count('ripe')>1?`<button class="primary" data-yard-all="harvest">Skörda allt (${count('ripe')})</button>`:''}${count('dry')>1?`<button class="outline" data-yard-all="water">💧 Vattna allt (${count('dry')})</button>`:''}${count('empty')>1?`<button class="outline" data-yard-all="plant">Plantera i alla tomma (${count('empty')})</button>`:''}</div>
<div class="yardCrops" role="group" aria-label="Välj vad ni planterar">${Object.entries(yardCrops).map(([k,c])=>cropOpen(k)?`<button class="julBauble ${y.pick===k?'chosen':''}" data-yard-crop="${k}" aria-pressed="${y.pick===k}">${pantryArt(k)}${c.name} · ${c.minutes} min</button>`:`<span class="julBauble cropLocked">🔒 ${c.name} · efter ${c.from} skördar</span>`).join('')}</div>
<p id="yardStatus" class="forestStatus" role="status"></p>
<div class="yardCards"><section class="quest"><div class="eyebrow">SKAFFERIET</div><h3>Det ni har skördat</h3>${pantryHTML()}<p class="forestNote">Laga mat i köket i svamphuset. Sälj i butiken på torget.</p><button class="outline" id="toKitchen">Till köket i svamphuset →</button></section>
${residents.length?`<section class="quest"><div class="eyebrow">GRANNARNA</div><h3>Ge något gott</h3><p class="forestNote">En gåva om dagen till varje granne. Lagad mat ger mest vänskap, och deras favoriter näst mest.</p><div class="neighbourGifts">${residents.map(id=>{const v=villagers.find(v=>v.id===id),done=y.gifts[id]===giftDay(),k=neighbourGiftPick(id);return `<div class="neighbourGift"><span class="neighbourFace">${residentArt(id)}</span><span><b>${v.name}</b><small>Älskar ${neighbourLikes[id].slice(0,2).map(itemName).join(' och ').toLowerCase()}</small></span><button class="primary" data-give="${id}" ${done||!k?'disabled':''}>${done?'Tack!':k?'Ge '+itemName(k).toLowerCase():'Inget att ge'}</button></div>`}).join('')}</div></section>`:''}
<section class="quest"><div class="eyebrow">DJUREN</div><h3>Höns och kanin</h3>${animalsOpen?`<div class="yardAnimals"><div class="yardAnimal"><span class="animalArt">${henArt()}</span>${y.animals.hens?`<b>Hönsen</b><small>${eggsWaiting()?eggsWaiting()+' ägg i redet':'Hönsen värper. Ett ägg var femtonde minut.'}</small><button class="primary" id="collectEggs" ${eggsWaiting()?'':'disabled'}>Samla ägg</button>`:`<b>Hönshus</b><small>Ett ägg var femtonde minut, till pannkakor och tårta.</small><button class="primary" id="buyHens" ${state.coins<HENHOUSE_COST?'disabled':''}>Bygg · ${HENHOUSE_COST} ✦</button>`}</div><div class="yardAnimal"><span class="animalArt">${rabbitArt()}</span>${y.animals.rabbit?`<b>Kaninen Nos</b><small>${y.animals.rabbit.fed===giftDay()?'Nos är mätt och har pysslat i bäddarna i dag.':'Ge Nos en morot, så hjälper Nos till i trädgården: allt som växer blir 3 minuter snabbare.'}</small><button class="primary" id="feedRabbit" ${y.animals.rabbit.fed===giftDay()||pantryHave('carrot')<1?'disabled':''}>Ge en morot</button>`:`<b>Kaninbur</b><small>Kaninen Nos hjälper till i trädgården om Nos får en morot om dagen.</small><button class="primary" id="buyRabbit" ${state.coins<RABBIT_COST?'disabled':''}>Bygg · ${RABBIT_COST} ✦</button>`}</div></div>`:(typeof lockedHint==='function'?lockedHint('yardanimals'):'')}</section></div>
<p class="forestNote">${y.harvests<YARD_SCARECROW_AT?`Efter ${YARD_SCARECROW_AT} skördar kommer en fågelskrämma till gläntan (${y.harvests} av ${YARD_SCARECROW_AT}).`:'Fågelskrämman vaktar gläntan.'}</p>`;
 wireYard();
 clearInterval(yardTimer);yardTimer=setInterval(()=>{if(tab!=='yard'||!$('#yardBeds')){clearInterval(yardTimer);yardTimer=null;return}$('#yardBeds').innerHTML=Array.from({length:YARD_BEDS},(_,i)=>yardBedHTML(i)).join('');wireYard(true)},15000);
}
function harvestText(r){const c=yardCrops[r.crop];return 'Ni skördade '+c.name.toLowerCase()+'! · +'+r.n+' i skafferiet'+(r.scarecrow?' · En fågelskrämma flyttar in i gläntan!':'')+(r.newCrops?' · Nytt frö: '+r.newCrops.map(itemName).join(', '):'')}
function wireYard(bedsOnly){
 const status=t=>{const s=$('#yardStatus');if(s)s.textContent=t};
 document.querySelectorAll('[data-yard-bed]').forEach(b=>b.onclick=()=>{const r=yardTap(+b.dataset.yardBed);if(!r)return;const c=yardCrops[r.crop];
  const msg={planted:c.name+' är planterade. Vattna dem!',watered:c.name+' fick vatten och börjar växa.',growing:c.name+' växer. Ungefär '+Math.max(1,Math.ceil((r.left||0)/60000))+' minuter kvar.',harvested:harvestText(r)}[r.did];
  sfx(r.did==='harvested'?'chime':'tick');renderYard();status(msg)});
 if(bedsOnly)return;
 document.querySelectorAll('[data-yard-all]').forEach(b=>b.onclick=()=>{const kind=b.dataset.yardAll,res=yardAll(kind);if(!res.length)return;sfx(kind==='harvest'?'chime':'tick');renderYard();
  status(kind==='harvest'?'Ni skördade '+res.length+' bäddar! · +'+res.reduce((a,r)=>a+r.n,0)+' i skafferiet'+(res.some(r=>r.scarecrow)?' · En fågelskrämma flyttar in i gläntan!':''):kind==='water'?res.length+' bäddar fick vatten.':res.length+' bäddar är planterade.')});
 document.querySelectorAll('[data-yard-crop]').forEach(b=>b.onclick=()=>{ensureYard().pick=b.dataset.yardCrop;save();renderYard()});
 document.querySelectorAll('[data-give]').forEach(b=>b.onclick=()=>{const id=b.dataset.give,r=giveNeighbour(id);if(!r)return;sfx('chime');sidebar();const v=villagers.find(v=>v.id===id);renderYard();status(`${v.name} fick ${itemName(r.item).toLowerCase()}! · +${r.points} vänskap · +${GIFT_THANKS} daggdroppar i tack`)});
 const on=(id,fn)=>{const b=$('#'+id);if(b)b.onclick=fn};
 on('toKitchen',()=>{tab='house';render();setTimeout(()=>document.querySelector('.kitchen')?.scrollIntoView?.({behavior:'smooth'}),50)});
 on('buyHens',()=>{if(buyAnimal('hens')){sfx('win');sidebar();renderYard();status('Hönsen har flyttat in!')}});
 on('buyRabbit',()=>{if(buyAnimal('rabbit')){sfx('win');sidebar();renderYard();status('Kaninen Nos har flyttat in!')}});
 on('collectEggs',()=>{const n=collectEggs();if(!n)return;sfx('chime');renderYard();status('Ni samlade '+n+' ägg.')});
 on('penHens',()=>{const n=collectEggs();sfx(n?'chime':'tick');renderYard();status(n?'Ni samlade '+n+' ägg från hönshuset.':'Hönsen pickar i gräset. Inga ägg i redet än.')});
 on('penRabbit',()=>{const r=feedRabbit();if(!r){sfx('jump');status(pantryHave('carrot')<1?'Nos vill ha en morot. Skörda morötter i bäddarna!':'Nos har redan ätit i dag och skuttar runt.');return}sfx('chime');renderYard();status(r.helped?'Nos knaprar på moroten och pysslar i bäddarna · '+r.helped+' bäddar blev 3 minuter snabbare':'Nos knaprar nöjt på moroten.')});
 on('feedRabbit',()=>{const r=feedRabbit();if(!r)return;sfx('chime');renderYard();status(r.helped?'Nos knaprar på moroten och pysslar i bäddarna · '+r.helped+' bäddar blev 3 minuter snabbare':'Nos knaprar nöjt på moroten.')});
}

// The kitchen in the cottage: cook from the pantry, share food with your frog.
function kitchenHTML(){
 if(typeof unlocked==='function'&&!unlocked('yard'))return '';
 const dishes=Object.entries(ensureYard().pantry).filter(([k,n])=>yardDishes[k]&&n>0);
 return `<section class="editor kitchen"><h3>Köket</h3><p>Laga mat av det ni har skördat. Maten kan säljas i butiken, ges till grannarna eller delas med er groda.</p><div class="recipeList">${Object.entries(yardDishes).map(([id,d])=>{const ok=canCook(id);return `<div class="recipe ${ok?'ready':''}"><span class="recipeArt">${pantryArt(id)}</span><span><b>${d.name}</b><small>${Object.entries(d.needs).map(([k,n])=>`<span class="${pantryHave(k)>=n?'have':'need'}">${itemCount(k,n)} (${pantryHave(k)})</span>`).join(' · ')}</small></span><button class="primary" data-cook="${id}" ${ok?'':'disabled'}>Laga</button></div>`}).join('')}</div>${dishes.length?`<h4>Färdig mat</h4><div class="recipeList">${dishes.map(([id,n])=>`<div class="recipe"><span class="recipeArt">${pantryArt(id)}</span><span><b>${yardDishes[id].name}</b><small>${n} st</small></span><button class="outline" data-feed="${id}">Dela med ${escapeText(state.frogName)}</button></div>`).join('')}</div>`:''}<p id="kitchenStatus" class="forestStatus" role="status"></p></section>`;
}
function wireKitchen(){
 document.querySelectorAll('[data-cook]').forEach(b=>b.onclick=()=>{const id=b.dataset.cook;if(!cook(id))return;sfx('chime');renderHouse();document.querySelector('.kitchen')?.scrollIntoView?.({block:'center'});const s=$('#kitchenStatus');if(s)s.textContent=yardDishes[id].name+' är klar!'});
 document.querySelectorAll('[data-feed]').forEach(b=>b.onclick=()=>{const id=b.dataset.feed;if(!feedFrog(id))return;sfx('chime');sidebar();renderHouse();document.querySelector('.kitchen')?.scrollIntoView?.({block:'center'});const s=$('#kitchenStatus');if(s)s.textContent=`${state.frogName} smaskar i sig ${yardDishes[id].name.toLowerCase()} · +${FEED_BOND} vänskap`});
}

// ---------- Hooks: the shop sells the pantry, the cottage gets a kitchen, the village orders food ----------
for(const [k,c] of Object.entries(yardCrops))shopGoods[k]={name:c.name,price:c.price,pantry:true};
for(const [k,d] of Object.entries(yardDishes))shopGoods[k]={name:d.name,price:d.price,pantry:true};
shopGoods.egg={name:'Ägg',price:4,pantry:true};
const shopLikesExtra={mira:['strawberry','cake','salad'],tagge:['carrot','pumpkin','carrotsoup'],tilda:['peas','potato','peasoup'],vide:['sunflower','cookies'],tuss:['potato','pumpkinsoup'],klover:['radish','pancakes']};
shopCustomers.forEach(c=>{if(shopLikesExtra[c.id])c.likes.push(...shopLikesExtra[c.id])});
// Village orders may ask for garden food once the garden is open.
function yardOrderGoods(){return typeof unlocked==='function'&&unlocked('yard')?['carrot','strawberry','carrotsoup','pancakes']:[]}
{const have=shopHave,take=shopTake,give=shopGive,art=shopGoodArt;
 shopHave=g=>shopGoods[g]?.pantry?pantryHave(g):have(g);
 shopTake=(g,n)=>shopGoods[g]?.pantry?pantryAdd(g,-n):take(g,n);
 shopGive=(g,n)=>shopGoods[g]?.pantry?pantryAdd(g,n):give(g,n);
 shopGoodArt=g=>shopGoods[g]?.pantry?pantryArt(g):art(g);}
if(typeof renderHouse==='function'){const plain=renderHouse;renderHouse=function(){plain();const k=kitchenHTML();if(k){const lower=document.querySelector('#content .gardenLower');if(lower?.insertAdjacentHTML)lower.insertAdjacentHTML('beforebegin',k);else if($('#content').insertAdjacentHTML)$('#content').insertAdjacentHTML('beforeend',k);wireKitchen()}}}
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
