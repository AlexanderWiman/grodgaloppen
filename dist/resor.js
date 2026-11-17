// Survey 5: the family wanted to see the journey between places, so that you don't land in the
// shop straight from the cottage. When the fairy goes from one place to another (the glade, the
// cottage, the garden, the pond, Bärbacken, Älvbyn, the shop, the castle, the secret forest), the
// frog hops along a path for a second or two. A tap skips it. The 🎵 menu can turn trips off, and
// they are skipped when the device asks for reduced motion. Tabs that are not places (races, the
// wardrobe, adventures) do not travel; the fairy stays where she last was.
// This file is loaded after app.js because it wraps render().

const travelPlaces={
 home:{name:'Gläntan',at:[34,62]},house:{name:'Svamphuset',at:[24,50]},yard:{name:'Trädgården',at:[14,62]},
 fish:{name:'Dammen',at:[44,78]},berries:{name:'Bärbacken',at:[52,40]},village:{name:'Älvbyn',at:[70,58]},
 shop:{name:'Butiken',at:[80,48]},castle:{name:'Slottet',at:[86,18]},forest:{name:'Hemliga skogen',at:[8,16]}
};
// Tabs that happen at a place: fireflies and memory are in the glade, the queen has fika in the cottage.
const travelAlias={fireflies:'home',memory:'home',queen:'house'};
function placeOf(t){return travelPlaces[t]?t:travelAlias[t]||null}
// Longer trips take a little longer, between 1.1 and 2 seconds.
function travelTime(from,to){const [a,b]=travelPlaces[from].at,[c,d]=travelPlaces[to].at;return Math.round(Math.min(2000,Math.max(1100,900+Math.hypot(c-a,d-b)*14)))}
// The path across the scene (in percent), the same curve as the dotted line in travelSceneHTML.
const TRAVEL_PATH=[[14,74],[50,46],[86,70]],TRAVEL_HOPS=4;
function travelPoint(t,flip=false){const u=1-t,[p0,p1,p2]=TRAVEL_PATH;let x=u*u*p0[0]+2*u*t*p1[0]+t*t*p2[0];const y=u*u*p0[1]+2*u*t*p1[1]+t*t*p2[1];return [flip?100-x:x,y]}
function travelHop(t){return Math.abs(Math.sin(t*TRAVEL_HOPS*Math.PI))*9}
function travelOn(){return state.travel!==false}
function travelWanted(){return travelOn()&&state.hatched&&!running&&!(typeof matchMedia==='function'&&matchMedia('(prefers-reduced-motion: reduce)').matches)}

function placeArt(id){
 const a={
  home:'<ellipse cx="60" cy="76" rx="48" ry="15" fill="#7fb7c9"/><ellipse cx="60" cy="74" rx="40" ry="10" fill="#9fd0de"/><path d="M38 74a10 4 0 1 0 14 0l-7-1Z" fill="#6f9e4f"/><g fill="#5f8f4e"><path d="M10 80q4-16 8 0M100 78q4-14 8 0M18 82q3-10 6 0"/></g><g transform="translate(86 62)"><circle r="4" cx="-4" fill="#fff3c8"/><circle r="4" cx="4" fill="#fff3c8"/><circle r="4" cy="-4" fill="#fff3c8"/><circle r="3" fill="#e2b552"/></g>',
  house:'<rect x="44" y="52" width="32" height="36" rx="6" fill="#f3e6cf"/><path d="M50 88V72q10-8 20 0V88Z" fill="#8a6a4c"/><path d="M16 56Q60 6 104 56Q60 64 16 56Z" fill="#d9534f"/><g fill="#fff"><circle cx="44" cy="40" r="6"/><circle cx="68" cy="30" r="5"/><circle cx="84" cy="46" r="4"/><circle cx="30" cy="50" r="3.5"/></g>',
  yard:'<rect x="14" y="66" width="92" height="20" rx="6" fill="#7b5638"/><g stroke="#5f8f4e" stroke-width="4" stroke-linecap="round"><path d="M30 66V54M30 58l-6-5M30 58l6-5M60 66V52M60 56l-7-5M60 56l7-5M90 66V54M90 58l-6-5M90 58l6-5"/></g><circle cx="60" cy="48" r="5" fill="#e8843a"/><g stroke="#c9a06a" stroke-width="3"><path d="M8 88V60M112 88V60M8 66H112"/></g>',
  fish:'<ellipse cx="60" cy="74" rx="50" ry="16" fill="#7fb7c9"/><path d="M14 64H58V70H14Z" fill="#a8835a"/><path d="M20 70V84M50 70V84" stroke="#8a6a4c" stroke-width="3"/><path d="M44 64L84 26" stroke="#8a6a4c" stroke-width="2.5"/><path d="M84 26Q90 50 88 70" stroke="#fff" stroke-width="1"/><circle cx="88" cy="71" r="3" fill="#e46a6a"/>',
  berries:'<g fill="#5f8f4e"><circle cx="40" cy="62" r="20"/><circle cx="76" cy="62" r="20"/><circle cx="58" cy="48" r="22"/></g><g fill="#4b5da8">'+[[44,54],[56,44],[68,56],[80,64],[36,66],[62,68],[50,60]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="4.5"/>`).join('')+'</g>',
  village:'<path d="M14 60L36 40L58 60V88H14Z" fill="#e6c79a"/><path d="M10 62L36 36L62 62" stroke="#c9473f" stroke-width="8" fill="none" stroke-linejoin="round"/><rect x="30" y="70" width="12" height="18" fill="#8a6a4c"/><path d="M62 66L84 48L106 66V88H62Z" fill="#f3e6cf"/><path d="M58 68L84 44L110 68" stroke="#4f86c6" stroke-width="8" fill="none" stroke-linejoin="round"/><rect x="78" y="74" width="12" height="14" fill="#8a6a4c"/>',
  shop:'<rect x="22" y="50" width="76" height="38" rx="4" fill="#f3e6cf"/><path d="M16 50H104L96 30H24Z" fill="#fff"/><path d="M24 30L16 50H30L36 30ZM48 30L44 50H58L60 30ZM72 30L72 50H86L84 30Z" fill="#d9534f"/><rect x="30" y="60" width="60" height="10" rx="3" fill="#a8835a"/><g fill="#e8843a"><circle cx="40" cy="58" r="4"/><circle cx="52" cy="58" r="4"/></g><circle cx="70" cy="57" r="5" fill="#4b5da8"/>',
  castle:'<g fill="#5aa37f"><rect x="22" y="40" width="20" height="48"/><rect x="78" y="40" width="20" height="48"/><rect x="38" y="52" width="44" height="36"/></g><g fill="#3f8a65"><path d="M18 42L32 16L46 42Z"/><path d="M74 42L88 16L102 42Z"/><path d="M50 54L60 30L70 54Z"/></g><path d="M52 88V72q8-8 16 0V88Z" fill="#2f5d48"/><g fill="#f2c94c"><circle cx="32" cy="15" r="3"/><circle cx="88" cy="15" r="3"/><circle cx="60" cy="29" r="3"/></g>',
  forest:'<g fill="#2f5d48"><path d="M24 88L8 88L24 30L40 88Z"/><path d="M60 88L40 88L60 14L80 88Z"/><path d="M96 88L80 88L96 34L112 88Z"/></g><g fill="#3f7a5c"><path d="M24 46L14 70H34Z"/><path d="M60 34L48 62H72Z"/><path d="M96 50L86 72H106Z"/></g><g fill="#fff0a0"><circle cx="44" cy="40" r="2"/><circle cx="78" cy="58" r="2"/><circle cx="16" cy="60" r="1.6"/></g>'
 }[id]||'';
 return `<svg viewBox="0 0 120 100" aria-hidden="true">${a}</svg>`;
}
// Light skies so the trip is easy to see; at night a soft dusk instead of darkening the whole picture.
function travelSky(to,night=false){if(night)return ['#9fb0d6','#e6dcef'];return {forest:['#a9d0b2','#e4f1dc'],castle:['#bfe0d4','#eef6ec'],village:['#d7e7f0','#f2f5e4'],shop:['#d7e7f0','#f2f5e4']}[to]||['#cfe6f4','#f1f4df']}
function travelSceneHTML(from,to){
 const night=!!state.garden?.night,flip=travelPlaces[to].at[0]<travelPlaces[from].at[0],[s1,s2]=travelSky(to,night);
 const [ax]=travelPoint(0,flip),[bx]=travelPoint(1,flip);
 return `<div class="travelCard" style="--sky1:${s1};--sky2:${s2}"><svg class="travelLand" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path d="M0 52Q25 40 50 50T100 46V100H0Z" fill="#a9c99a"/><path d="M0 66Q30 56 60 64T100 60V100H0Z" fill="#8fb87f"/><path d="M${TRAVEL_PATH.map(p=>(flip?100-p[0]:p[0])+' '+p[1]).join(' ').replace(/^(\S+ \S+) /,'$1Q')}" stroke="#e8dcb4" stroke-width="9" fill="none" stroke-linecap="round" vector-effect="non-scaling-stroke"/><path d="M${TRAVEL_PATH.map(p=>(flip?100-p[0]:p[0])+' '+p[1]).join(' ').replace(/^(\S+ \S+) /,'$1Q')}" stroke="#c9b98a" stroke-width="2" stroke-dasharray="2 8" fill="none" stroke-linecap="round" vector-effect="non-scaling-stroke"/></svg><span class="travelPlace" style="left:${ax}%">${placeArt(from)}<small>${travelPlaces[from].name}</small></span><span class="travelPlace" style="left:${bx}%">${placeArt(to)}<small>${travelPlaces[to].name}</small></span><span class="travelRider${flip?' flip':''}" id="travelRider">${frog()}</span><div class="travelCaption"><b>På väg till ${travelPlaces[to].name}</b><small>Tryck för att hoppa över</small></div><button class="travelOff" id="travelOff">Visa inte resor</button></div>`;
}
let travelFrom=null,travelLive=null;
function travelStop(){if(!travelLive)return;const el=travelLive.el;travelLive=null;el.classList.add('done');setTimeout(()=>el.remove(),260)}
function playTravel(from,to){
 if(!document.body?.appendChild||!document.createElement)return false;
 if(travelLive){travelLive.el.remove();travelLive=null}
 const el=document.createElement('div');el.className='travelOverlay';el.setAttribute('role','status');el.innerHTML=travelSceneHTML(from,to);document.body.appendChild(el);
 const flip=travelPlaces[to].at[0]<travelPlaces[from].at[0],rider=el.querySelector('#travelRider'),ms=travelTime(from,to),start=performance.now();
 const live={el};travelLive=live;sfx('jump');
 el.onclick=()=>travelStop();
 el.querySelector('#travelOff').onclick=e=>{e.stopPropagation();state.travel=false;save();travelStop();toast('Resor visas inte längre. Slå på dem igen i 🎵-menyn.')};
 let hop=0;
 const step=now=>{if(travelLive!==live)return;const t=Math.min(1,(now-start)/ms),[x,y]=travelPoint(t,flip);rider.style.left=x+'%';rider.style.top=(y-travelHop(t))+'%';const h=Math.floor(t*TRAVEL_HOPS);if(h>hop&&h<TRAVEL_HOPS){hop=h;sfx('land')}if(t<1)requestAnimationFrame(step);else setTimeout(()=>{if(travelLive===live)travelStop()},250)};
 step(start);
 return true;
}
// render() remembers where the fairy is and travels when the place changes.
{const plain=render;travelFrom=placeOf(tab);render=function(){const to=placeOf(tab),from=travelFrom;if(to)travelFrom=to;plain();if(to&&from&&from!==to&&travelWanted())playTravel(from,to)}}
// The 🎵 menu gets a switch for the trips.
if(typeof musicMenuHTML==='function'&&typeof toggleMusicMenu==='function'){const plainHTML=musicMenuHTML;musicMenuHTML=function(){return plainHTML()+`<div class="musicMenuHead">Resor mellan platser</div><button type="button" role="menuitemradio" aria-checked="${travelOn()}" data-travel="on">Visa resan</button><button type="button" role="menuitemradio" aria-checked="${!travelOn()}" data-travel="off">Hoppa över</button>`}
 const plainToggle=toggleMusicMenu;toggleMusicMenu=function(show){plainToggle(show);const m=$('#musicMenu');if(m&&!m.hidden&&m.querySelectorAll)m.querySelectorAll('[data-travel]').forEach(b=>b.onclick=()=>{state.travel=b.dataset.travel==='on';save();toggleMusicMenu(false)})}}
