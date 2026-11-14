// Jul i Älvbyn (survey 4, step 1). From 1 December to 6 January (trettondagen) the game keeps
// Christmas:
// - An advent calendar in the glade. There is one door a day. Missed doors can be opened later;
//   doors for days still to come stay shut.
// - A Christmas tree in the glade to decorate with the baubles from the calendar.
// - Christmas lights and Christmas music.
// - Skogsdrottningen brings a winter coat for the fairy.
// - Door 13 (Lucia) gives the fairy a Lucia crown.
// - Door 24 (Christmas Eve) gives the star for the tree and a Santa hat for the frog.
// The frogs sleep in the cottage when it is night in the glade, all year round.
// The holiday list is built so Halloween and birthdays can be added later.

const holidays=[{id:'jul',name:'Jul i Älvbyn',from:[12,1],to:[1,6]}];
function holidayFor(d){const md=(d.getMonth()+1)*100+d.getDate();const h=holidays.find(h=>{const a=h.from[0]*100+h.from[1],b=h.to[0]*100+h.to[1];return a<=b?md>=a&&md<=b:md>=a||md<=b});return h?h.id:null}
function holidayNow(){return holidayFor(gameDate())}
function isJul(){return holidayNow()==='jul'}
// Christmas belongs to the year it started in, so 3 January still counts as last year's Christmas.
function julYear(d=gameDate()){return d.getMonth()===0?d.getFullYear()-1:d.getFullYear()}
// The newest door that may be opened: the date in December up to the 24th, and all 24 after Christmas Eve.
function julToday(d=gameDate()){if(holidayFor(d)!=='jul')return 0;return d.getMonth()===11?Math.min(24,d.getDate()):24}

const JUL_SPOTS=12,JUL_TREE_DONE=10,JUL_TREE_COINS=50,JUL_QUEEN_COINS=40;
function ensureJul(){state.jul=state.jul||{};const y=julYear();if(!state.jul[y])state.jul[y]={opened:[],baubles:{},tree:Array(JUL_SPOTS).fill(null),treeDone:false,star:false,queenGift:false};return state.jul[y]}

// ---------- Baubles for the tree ----------
const julBaubles={
 red:{name:'Röd kula',art:(x,y)=>`<circle cx="${x}" cy="${y}" r="7" fill="#c9473f"/><circle cx="${x-2.5}" cy="${y-2.5}" r="2" fill="#fff" opacity=".55"/><rect x="${x-2.5}" y="${y-9.5}" width="5" height="3" rx="1" fill="#d9b24c"/>`},
 gold:{name:'Guldkula',art:(x,y)=>`<circle cx="${x}" cy="${y}" r="7" fill="#e2b94b"/><path d="M${x-7} ${y}Q${x} ${y+3} ${x+7} ${y}" stroke="#b98a2a" stroke-width="1.2" fill="none"/><circle cx="${x-2.5}" cy="${y-2.5}" r="2" fill="#fff" opacity=".6"/><rect x="${x-2.5}" y="${y-9.5}" width="5" height="3" rx="1" fill="#b98a2a"/>`},
 ginger:{name:'Pepparkaksgroda',art:(x,y)=>`<ellipse cx="${x}" cy="${y+1.5}" rx="8" ry="5.5" fill="#b9773f"/><circle cx="${x-3.5}" cy="${y-3}" r="2.8" fill="#b9773f"/><circle cx="${x+3.5}" cy="${y-3}" r="2.8" fill="#b9773f"/><g fill="#fff"><circle cx="${x-3.5}" cy="${y-3}" r="1"/><circle cx="${x+3.5}" cy="${y-3}" r="1"/></g><path d="M${x-4} ${y+2}q4 3 8 0" stroke="#fff" stroke-width="1.1" fill="none"/>`},
 straw:{name:'Halmbock',art:(x,y)=>`<g stroke="#d9b25c" stroke-width="2.2" stroke-linecap="round" fill="none"><path d="M${x-7} ${y}H${x+4}M${x-6} ${y}V${y+7}M${x+3} ${y}V${y+7}M${x+4} ${y}L${x+7} ${y-5}M${x+7} ${y-5}l-3-2M${x+7} ${y-5}l3-1"/></g><path d="M${x-7} ${y}l-2-3" stroke="#c2574e" stroke-width="1.5"/>`},
 heart:{name:'Rött hjärta',art:(x,y)=>`<path d="M${x} ${y+7}C${x-9} ${y+1} ${x-8} ${y-7} ${x-3} ${y-7}c1.6 0 2.5 1 3 2.2c.5-1.2 1.4-2.2 3-2.2c5 0 6 8-3 14z" fill="#d24b5a"/><circle cx="${x-3.5}" cy="${y-3}" r="1.4" fill="#fff" opacity=".55"/>`},
 icicle:{name:'Istapp',art:(x,y)=>`<path d="M${x-4.5} ${y-7}H${x+4.5}L${x} ${y+10}Z" fill="#e5f6fc" stroke="#9fd0dc" stroke-width="1.2"/><path d="M${x-1} ${y-5}L${x} ${y+5}" stroke="#fff" stroke-width="1.2"/>`},
 candle:{name:'Ljus',art:(x,y)=>`<rect x="${x-2.8}" y="${y-3}" width="5.6" height="11" rx="1.4" fill="#fbf6ea" stroke="#d9cdb0" stroke-width=".8"/><ellipse cx="${x}" cy="${y-6.5}" rx="2.4" ry="3.8" fill="#ffcf4a"/><ellipse cx="${x}" cy="${y-5.8}" rx="1" ry="1.8" fill="#fff6c7"/>`},
 bell:{name:'Bjällra',art:(x,y)=>`<path d="M${x-6.5} ${y+5}Q${x-6.5} ${y-7} ${x} ${y-7}Q${x+6.5} ${y-7} ${x+6.5} ${y+5}Z" fill="#e2b94b" stroke="#b98a2a" stroke-width="1"/><circle cx="${x}" cy="${y+6}" r="2" fill="#b98a2a"/><path d="M${x-2} ${y-9}h4" stroke="#c2574e" stroke-width="2"/>`}
};

// ---------- Advent calendar: one gift behind each door ----------
const adventGifts=[
 {b:'red',coins:20},{b:'gold',berries:3},{b:'ginger',coins:25},{b:'straw',sticker:true},
 {b:'heart',coins:20},{b:'icicle',berries:3},{b:'candle',coins:25},{b:'bell',coins:30},
 {b:'red',sticker:true},{b:'gold',coins:25},{b:'ginger',berries:3},{b:'straw',coins:30},
 {b:'candle',lucia:true},{b:'heart',coins:25},{b:'icicle',sticker:true},{b:'bell',berries:3},
 {b:'red',coins:30},{b:'gold',coins:25},{b:'ginger',sticker:true},{b:'straw',berries:3},
 {b:'heart',coins:30},{b:'icicle',coins:25},{b:'bell',coins:40},{star:true,tomte:true,coins:100}
];
// The doors sit in a mixed-up order, like on a real advent calendar.
const adventOrder=[7,15,2,21,11,18,4,24,9,13,1,16,22,6,19,3,12,20,8,14,23,5,17,10];

function julCanOpen(n){if(!state.hatched||!Number.isInteger(n)||n<1||n>julToday())return false;return !ensureJul().opened.includes(n)}
function giveWear(id){if(!(state.wardrobe||[]).includes(id))state.wardrobe=[...(state.wardrobe||[]),id]}
function giveHeadwear(id){state.headwearOwned=state.headwearOwned||[];if(!state.headwearOwned.includes(id))state.headwearOwned.push(id)}
function julOpen(n){
 if(!julCanOpen(n))return null;
 const j=ensureJul(),g=adventGifts[n-1],got={n};j.opened.push(n);
 if(g.b){j.baubles[g.b]=(j.baubles[g.b]||0)+1;got.bauble=g.b}
 if(g.coins){state.coins+=g.coins;got.coins=g.coins}
 if(g.berries){ensureGarden();state.garden.berries+=g.berries;got.berries=g.berries}
 if(g.sticker&&typeof grantSticker==='function')got.sticker=grantSticker(true);
 if(g.lucia){giveHeadwear('lucia');got.lucia=true}
 if(g.star){j.star=true;got.star=true}
 if(g.tomte){giveWear('hat-tomte');state.frogHat='hat-tomte';got.tomte=true}
 save();return got;
}
function julGiftText(got){
 const parts=[];
 if(got.bauble)parts.push(julBaubles[got.bauble].name+' till granen');
 if(got.lucia)parts.push('Luciakrona till älvan');
 if(got.star)parts.push('Stjärnan till granens topp');
 if(got.tomte)parts.push('Tomteluva till grodan');
 if(got.coins)parts.push('+'+got.coins+' daggdroppar');
 if(got.berries)parts.push('+'+got.berries+' bär');
 if(got.sticker)parts.push('Klistermärke: '+got.sticker.icon+' '+got.sticker.name);
 return 'Lucka '+got.n+': '+parts.join(' · ');
}

// ---------- The Christmas tree ----------
const julSpots=[[100,80],[82,99],[118,99],[72,136],[100,128],[128,136],[58,151],[142,151],[66,196],[90,182],[112,201],[136,186]];
function julHang(i,kind){const j=ensureJul();if(!Number.isInteger(i)||i<0||i>=JUL_SPOTS||j.tree[i]||!julBaubles[kind]||!(j.baubles[kind]>0))return false;j.baubles[kind]--;j.tree[i]=kind;save();return true}
function julTakeDown(i){const j=ensureJul(),k=j.tree[i];if(!k)return false;j.tree[i]=null;j.baubles[k]=(j.baubles[k]||0)+1;save();return true}
function julTreeCount(){return ensureJul().tree.filter(Boolean).length}
// When ten baubles hang on the tree the first time: dewdrops and a tomte for the glade to keep.
function julTreeCheck(){const j=ensureJul();if(j.treeDone||julTreeCount()<JUL_TREE_DONE)return null;j.treeDone=true;state.coins+=JUL_TREE_COINS;if(!state.decorOwned.includes('tomtenisse'))state.decorOwned.push('tomtenisse');save();return {coins:JUL_TREE_COINS}}
function julTreeSVG(cls=''){
 const j=ensureJul(),lights=[[88,62],[112,74],[70,116],[104,110],[132,120],[50,168],[84,160],[118,166],[150,172],[40,214],[76,210],[124,216],[160,212]];
 const tier=(top,bottom,half)=>`<path d="M100 ${top}L${100-half} ${bottom}Q100 ${bottom+10} ${100+half} ${bottom}Z" fill="#3f8a55"/><path d="M${100-half} ${bottom}Q${100-half*.5} ${bottom-6} 100 ${bottom+3}Q${100+half*.5} ${bottom-6} ${100+half} ${bottom}Q100 ${bottom+10} ${100-half} ${bottom}Z" fill="#fff" opacity=".85"/>`;
 return `<svg class="${cls}" viewBox="0 0 200 260" aria-hidden="true"><ellipse cx="100" cy="246" rx="70" ry="9" fill="#000" opacity=".1"/><rect x="91" y="222" width="18" height="24" rx="3" fill="#7b5638"/>${tier(115,225,75)}${tier(70,160,60)}${tier(30,105,45)}<path d="M100 30L74 90" stroke="#2f6e44" stroke-width="3" opacity=".4"/><path d="M68 112Q100 128 136 108M52 168Q100 186 150 160" stroke="#d9b24c" stroke-width="1.6" fill="none" opacity=".8"/><g class="julTwinkle">${lights.map(([x,y],i)=>`<circle cx="${x}" cy="${y}" r="2.6" fill="${['#ffd76a','#f6a5c0','#9fd3e0','#fff3b0'][i%4]}" style="animation-delay:${(i*.37)%2}s"/>`).join('')}</g>${j.tree.map((k,i)=>k?`<path d="M${julSpots[i][0]} ${julSpots[i][1]-12}v3" stroke="#a37a4c" stroke-width="1"/>`+julBaubles[k].art(...julSpots[i]):'').join('')}${j.star?'<path d="M100 10l5 11 12 1.2-9 8 2.8 11.8L100 36l-10.8 6 2.8-11.8-9-8 12-1.2Z" fill="#f6d36b" stroke="#c99a2c" stroke-width="1.4"/><circle cx="100" cy="27" r="16" fill="#fff3b0" opacity=".25"/>':''}</svg>`;
}
let julPick=null;

// ---------- What the glade shows at Christmas ----------
function julLightsHTML(){return `<svg class="julLights" viewBox="0 0 1000 80" preserveAspectRatio="none" aria-hidden="true"><path d="M0 8Q125 60 250 14T500 14T750 14T1000 8" fill="none" stroke="#4f5f45" stroke-width="2"/>${Array.from({length:21},(_,i)=>{const x=i*50,y=8+Math.abs(Math.sin(i/5*Math.PI))*36;return `<ellipse cx="${x}" cy="${y+6}" rx="6" ry="8" fill="${['#e5687a','#f6d36b','#7fc6d9','#9fd37c'][i%4]}" style="animation-delay:${(i*.29)%2}s"/>`}).join('')}</svg>`}
// Snow on the hilltops, the treetops and the grass, drawn over the glade's painted backdrop (the pond stays clear).
function julSnowHTML(){return `<svg class="julSnow" viewBox="0 0 1000 600" preserveAspectRatio="none" aria-hidden="true"><g fill="none" stroke="#fff" stroke-linecap="round" opacity=".85"><path d="M0 200Q150 120 300 210T600 180T1000 195" stroke-width="12"/><path d="M0 290Q250 180 500 270T1000 260" stroke-width="16"/></g><g fill="#fff" opacity=".9"><ellipse cx="40" cy="12" rx="85" ry="26"/><ellipse cx="160" cy="-48" rx="80" ry="40"/><ellipse cx="965" cy="20" rx="88" ry="28"/><ellipse cx="880" cy="-50" rx="80" ry="40"/></g><g fill="#fff" opacity=".7">${[[560,330,60,10],[800,380,80,12],[900,520,70,12],[470,560,90,12],[110,540,60,10],[640,470,50,8],[300,520,46,8]].map(([x,y,rx,ry])=>`<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}"/>`).join('')}</g></svg>`}
function julGardenHTML(){if(!isJul())return '';return `${julSnowHTML()}${julLightsHTML()}<button class="julTreeGlade" id="julTreeGlade" aria-label="Julgranen. Klä den med kulorna från adventskalendern">${julTreeSVG()}</button>`}
function julHomeHTML(){
 if(!isJul()||!state.hatched)return '';
 const j=ensureJul(),today=julToday(),owned=Object.entries(j.baubles).filter(([,n])=>n>0);
 if(julPick&&!(j.baubles[julPick]>0))julPick=null;
 return `<div id="julZone"><section class="julCal"><div class="julHead"><div><div class="eyebrow">JUL I ÄLVBYN</div><h3>Adventskalendern</h3></div><span class="pill">${j.opened.length} av 24 luckor</span></div><p>En lucka för varje dag fram till julafton. Har ni missat en dag går den att öppna senare.</p><div class="julDoors">${adventOrder.map(n=>{const open=j.opened.includes(n),can=n<=today&&!open,g=adventGifts[n-1];return `<button class="julDoor ${open?'open':''} ${can?'ready':''} ${n===24?'eve':''}" data-jul-door="${n}" ${can?'':'disabled'} aria-label="${open?'Lucka '+n+', öppnad':can?'Öppna lucka '+n:'Lucka '+n+', öppnas den '+n+' december'}">${open?`<svg viewBox="-12 -14 24 26" aria-hidden="true">${g.star?'<path d="M0-11l3 7 7.5.7-5.7 5 1.8 7.3L0 5.3-6.6 9l1.8-7.3-5.7-5 7.5-.7Z" fill="#f6d36b" stroke="#c99a2c"/>':julBaubles[g.b].art(0,0)}</svg>`:`<b>${n}</b>`}</button>`}).join('')}</div><p id="julStatus" class="julStatus" role="status"></p></section>
<section class="julTreeCard"><div class="julHead"><div><div class="eyebrow">I GLÄNTAN</div><h3>Klä granen</h3></div><span class="pill">${julTreeCount()} av ${JUL_SPOTS} kulor</span></div><p>${j.treeDone?'Granen är klädd. Tomtenissen bor nu i gläntan!':'Välj en kula och tryck på en plats i granen. Häng '+JUL_TREE_DONE+' kulor så kommer någon på besök.'}</p><div class="julTreeWrap">${julTreeSVG('julTreeBig')}${julSpots.map(([x,y],i)=>`<button class="julSpot ${j.tree[i]?'full':''}" data-jul-spot="${i}" style="left:${x/2}%;top:${y/2.6}%" aria-label="${j.tree[i]?julBaubles[j.tree[i]].name+', tryck för att ta ner':'Tom plats i granen'}"></button>`).join('')}</div><div class="julBaubles" role="group" aria-label="Era kulor">${owned.length?owned.map(([k,n])=>`<button class="julBauble ${julPick===k?'chosen':''}" data-jul-bauble="${k}" aria-pressed="${julPick===k}"><svg viewBox="-12 -14 24 26" aria-hidden="true">${julBaubles[k].art(0,0)}</svg>${julBaubles[k].name} · ${n}</button>`).join(''):'<p class="julEmpty">Kulorna finns bakom luckorna i kalendern.</p>'}</div></section></div>`;
}
function wireJul(){
 const zone=$('#julZone');if(!zone||!zone.querySelectorAll)return;
 const again=msg=>{zone.outerHTML=julHomeHTML();wireJul();const glade=$('#julTreeGlade');if(glade)glade.innerHTML=julTreeSVG();if(msg&&$('#julStatus'))$('#julStatus').textContent=msg};
 zone.querySelectorAll('[data-jul-door]').forEach(b=>b.onclick=()=>{const got=julOpen(+b.dataset.julDoor);if(!got)return;sfx(got.star||got.lucia?'win':'chime');sidebar();const text=julGiftText(got);toast(got.star?'God jul!':got.lucia?'Glad Lucia!':'Lucka '+got.n+' är öppnad!');again(text)});
 zone.querySelectorAll('[data-jul-bauble]').forEach(b=>b.onclick=()=>{julPick=julPick===b.dataset.julBauble?null:b.dataset.julBauble;again(julPick?'Tryck på en plats i granen för att hänga kulan.':'')});
 zone.querySelectorAll('[data-jul-spot]').forEach(b=>b.onclick=()=>{const i=+b.dataset.julSpot;if(ensureJul().tree[i]){julTakeDown(i);sfx('tick');again('Kulan ligger i lådan igen.');return}if(!julPick){again('Välj först en kula nedanför granen.');return}if(julHang(i,julPick)){sfx('tick');const done=julTreeCheck();if(done){sfx('win');sidebar();toast('Granen är klädd!');again('Granen är klädd! En tomtenisse flyttar in i gläntan · +'+done.coins+' daggdroppar')}else again()}});
 const glade=$('#julTreeGlade');if(glade)glade.onclick=()=>{const c=document.querySelector('.julTreeCard');if(c?.scrollIntoView)c.scrollIntoView({behavior:'smooth',block:'center'})};
}

// ---------- A banner on the race page when today's door is waiting ----------
function julBannerHTML(){if(!state.hatched||!isJul()||!julCanOpen(julToday()))return '';return `<section class="julBanner"><svg viewBox="0 0 200 260" aria-hidden="true"><path d="M100 30L55 105H145ZM100 70L40 160H160ZM100 115L25 225H175Z" fill="#3f8a55"/><rect x="91" y="222" width="18" height="24" fill="#7b5638"/><path d="M100 10l5 11 12 1.2-9 8 2.8 11.8L100 36l-10.8 6 2.8-11.8-9-8 12-1.2Z" fill="#f6d36b"/></svg><div><b>Jul i Älvbyn</b><p>Lucka ${julToday()} i adventskalendern väntar i gläntan.</p></div><button class="primary" id="julGo">Till gläntan</button></section>`}

// ---------- The frogs sleep in the cottage when it is night ----------
function sleepingFrogsHTML(){
 const night=!!state.garden?.night,frogs=(state.frogs||[]).slice(0,6);
 return `${night?'<div class="houseNightShade" aria-hidden="true"></div>':''}${night&&frogs.length?`<div class="frogBeds" aria-label="Grodorna sover">${frogs.map((f,i)=>`<span class="frogBed" style="animation-delay:${i*.4}s"><span class="bedFrog">${miniFrog(f.frog||state.frog)}</span><span class="bedQuilt"></span><i>z</i></span>`).join('')}</div>`:''}<button class="outline houseNight" id="houseNight">${night?'☀ God morgon':'☾ Godnatt'}</button>`;
}

// ---------- Hooks into the rest of the game ----------
if(typeof decorations!=='undefined')decorations.push({id:'tomtenisse',name:'Tomtenisse',icon:'🎅',from:'Klä julgranen'});
if(typeof extraGardenArt!=='undefined')extraGardenArt.tomtenisse='<ellipse cx="60" cy="102" rx="26" ry="5" fill="#000" opacity=".12"/><path d="M38 100Q40 64 60 60Q80 64 82 100Z" fill="#8a8f96"/><path d="M44 100Q46 78 60 76Q74 78 76 100" fill="#6f747b"/><circle cx="60" cy="54" r="13" fill="#f3d3b8"/><path d="M46 56Q47 82 60 86Q73 82 74 56Q66 64 60 62Q54 64 46 56Z" fill="#f4f1ea"/><circle cx="60" cy="58" r="3.6" fill="#e59a8a"/><path d="M44 50Q50 14 86 22Q72 30 76 50Z" fill="#c9473f"/><rect x="43" y="45" width="34" height="8" rx="4" fill="#f4f1ea"/><circle cx="87" cy="23" r="5.5" fill="#f4f1ea"/><g fill="#263d32"><circle cx="55" cy="53" r="1.4"/><circle cx="65" cy="53" r="1.4"/></g><path d="M84 78v18" stroke="#5c4532" stroke-width="2"/><rect x="79" y="88" width="10" height="11" rx="2" fill="#f6d36b" stroke="#5c4532" stroke-width="1.2"/>';
if(typeof wardrobe!=='undefined')wardrobe.push({id:'outfit-winter',slot:'outfitStyle',name:'Vinterkappa',gift:true},{id:'hat-tomte',slot:'frogHat',name:'Tomteluva',gift:true});
if(typeof musicThemes!=='undefined'){musicThemes.jul={bpm:88,root:62,scale:[0,2,4,5,7,9,11],prog:[[0,4,7],[-3,0,4],[5,9,12],[7,11,14]],voice:'flute',bass:'walk',density:.5,brush:.35,air:.4};musicNames.jul='Julmusik'}
// At Christmas the glade, the village and the meadow play the Christmas tune (when the music follows the place).
if(typeof setMusic==='function'){const plain=setMusic;setMusic=function(name){return plain(isJul()&&['glade','village','meadow'].includes(name)?'jul':name)}}
if(typeof applySeason==='function'){const plain=applySeason;applySeason=function(){plain();if(document.body?.dataset)document.body.dataset.holiday=holidayNow()||''}}
// Skogsdrottningen's Christmas gift: the first visit at Christmas brings a winter coat for the fairy.
if(typeof queenTakeGift==='function'){const plain=queenTakeGift;queenTakeGift=function(){
 if(isJul()&&queenVisiting()){const j=ensureJul(),q=ensureQueen();if(!j.queenGift&&!q.gift){q.gift=true;j.queenGift=true;giveWear('outfit-winter');state.outfitStyle='outfit-winter';state.coins+=JUL_QUEEN_COINS;save();return {coins:JUL_QUEEN_COINS,wear:'outfit-winter',text:'God jul! Här är en varm vinterkappa till älvan, sydd av mossa och snöstjärnor.'}}}
 return plain()}}
if(typeof renderHouse==='function'){const plain=renderHouse;renderHouse=function(){plain();const b=$('#houseNight');if(b)b.onclick=()=>{ensureGarden();state.garden.night=!state.garden.night;save();sfx('tick');renderHouse()}}}
if(typeof renderRaceTab==='function'){const plain=renderRaceTab;renderRaceTab=function(c){plain(c);const b=$('#julGo');if(b)b.onclick=()=>{tab='home';render()}}}
