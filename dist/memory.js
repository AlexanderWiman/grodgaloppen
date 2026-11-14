// Memory med klistermärken (survey 4, step 2): a small game in the glade with the stickers the
// player has collected. It unlocks after 8 stickers (milestone "memory" in progress.js). Turn two
// cards; a pair stays face up. 6 pairs is easy, 8 pairs harder. Fewer turns give more dewdrops,
// at most 40 dewdrops a day, and the fewest turns for each size is kept as a record.

const MEMORY_DAY_CAP=40,MEMORY_SIZES=[6,8];
function ensureMemory(){if(!state.memory)state.memory={best:{},wins:0,day:null,earned:0};return state.memory}
function memoryStickers(){const own=new Set(state.stickers||[]);return stickers.filter(s=>own.has(s.id))}
// A shuffled deck of pairs. It uses the player's own stickers first and fills up with others if needed.
function memoryDeck(pairs,rnd=Math.random){
 const shuffle=a=>{for(let i=a.length-1;i>0;i--){const j=Math.floor(rnd()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
 const own=shuffle(memoryStickers()),rest=shuffle(stickers.filter(s=>!own.includes(s)));
 const pick=[...own,...rest].slice(0,pairs);
 return shuffle(pick.flatMap(s=>[{id:s.id,icon:s.icon,name:s.name},{id:s.id,icon:s.icon,name:s.name}]));
}
// Dewdrops for a finished board: 6 per pair with no extra turns, 2 fewer for each extra turn, at least 10.
function memoryCoins(pairs,turns){return Math.max(10,pairs*6-Math.max(0,turns-pairs)*2)}
function memoryFinish(pairs,turns,day=typeof todayKey==='function'?todayKey():new Date().toDateString()){
 const m=ensureMemory();if(m.day!==day){m.day=day;m.earned=0}
 const coins=Math.max(0,Math.min(memoryCoins(pairs,turns),MEMORY_DAY_CAP-m.earned));m.earned+=coins;state.coins+=coins;
 const best=!m.best[pairs]||turns<m.best[pairs];if(best)m.best[pairs]=turns;m.wins++;
 save();return {coins,best,turns,pairs};
}

let memoryRun=null;
function renderMemory(){
 memoryRun=null;const m=ensureMemory();
 const head=`<div class="sectionHead"><div><div class="eyebrow">GLÄNTANS SPELBORD</div><h2>Memory med klistermärken</h2></div>${unlocked('memory')?`<span class="pill">${m.wins} vunna</span>`:''}</div>`;
 if(typeof unlocked==='function'&&!unlocked('memory')){$('#content').innerHTML=head+(typeof lockedHint==='function'?lockedHint('memory'):'');return}
 const today=m.day===(typeof todayKey==='function'?todayKey():'')?m.earned:0;
 $('#content').innerHTML=`${head}<section class="memoryStart"><p>Vänd två kort i taget och hitta paren. Korten är era egna klistermärken.</p><div class="memorySizes" role="group" aria-label="Hur många par">${MEMORY_SIZES.map(n=>`<button class="primary" data-memory-size="${n}">${n} par${m.best[n]?` · rekord ${m.best[n]} drag`:''}</button>`).join('')}</div><p class="memoryNote">Färre drag ger fler daggdroppar, högst ${MEMORY_DAY_CAP} om dagen. I dag: ${today} av ${MEMORY_DAY_CAP}.</p></section>`;
 document.querySelectorAll('[data-memory-size]').forEach(b=>b.onclick=()=>startMemory(+b.dataset.memorySize));
}
function startMemory(pairs){
 const run={pairs,deck:memoryDeck(pairs),open:[],done:new Set(),turns:0,busy:false};memoryRun=run;sfx('go');
 $('#content').innerHTML=`<div class="sectionHead"><div><div class="eyebrow">GLÄNTANS SPELBORD</div><h2>Memory · ${pairs} par</h2></div><span class="pill" id="memoryTurns">0 drag</span></div><section class="memoryBoard memory${pairs}" id="memoryBoard" aria-label="Memorykort">${run.deck.map((c,i)=>`<button class="memoryCard" data-card="${i}" aria-label="Kort ${i+1}, nedvänt"><span class="memoryBack" aria-hidden="true"></span><span class="memoryFace" aria-hidden="true"><b>${c.icon}</b><small>${c.name}</small></span></button>`).join('')}</section><p id="memoryStatus" class="memoryStatus" role="status">Hitta ${pairs} par.</p><button class="outline" id="memoryQuit">Avsluta</button>`;
 $('#memoryQuit').onclick=renderMemory;
 document.querySelectorAll('[data-card]').forEach(b=>b.onclick=()=>memoryFlip(run,+b.dataset.card));
}
function memoryFlip(run,i){
 if(memoryRun!==run||run.busy||run.done.has(i)||run.open.includes(i))return;
 const card=document.querySelector(`[data-card="${i}"]`),c=run.deck[i];
 card.classList.add('up');card.setAttribute('aria-label',c.name);sfx('tick');run.open.push(i);
 if(run.open.length<2)return;
 run.turns++;$('#memoryTurns').textContent=run.turns+' drag';
 const [a,b]=run.open;
 if(run.deck[a].id===run.deck[b].id){
  run.done.add(a);run.done.add(b);run.open=[];sfx('chime');
  [a,b].forEach(k=>document.querySelector(`[data-card="${k}"]`).classList.add('pair'));
  $('#memoryStatus').textContent=`Ett par! ${run.done.size/2} av ${run.pairs}.`;
  if(run.done.size===run.deck.length)setTimeout(()=>memoryWin(run),500);
  return;
 }
 run.busy=true;
 setTimeout(()=>{if(memoryRun!==run)return;[a,b].forEach(k=>{const el=document.querySelector(`[data-card="${k}"]`);if(el){el.classList.remove('up');el.setAttribute('aria-label',`Kort ${k+1}, nedvänt`)}});run.open=[];run.busy=false},900);
}
function memoryWin(run){
 if(memoryRun!==run)return;memoryRun=null;
 const r=memoryFinish(run.pairs,run.turns);sfx(r.best?'win':'finish');sidebar();
 $('#memoryBoard').insertAdjacentHTML('afterend',`<section class="memoryDone"><h3>Alla ${r.pairs} par på ${r.turns} drag!</h3><p>${r.best?'Nytt rekord! ':''}+${r.coins} daggdroppar</p><button class="primary" id="memoryAgain">Spela igen</button></section>`);
 $('#memoryStatus').textContent='';const quit=$('#memoryQuit');if(quit)quit.hidden=true;$('#memoryAgain').onclick=renderMemory;
}
