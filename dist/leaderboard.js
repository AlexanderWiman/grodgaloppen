// Online leaderboard: best time per track for everyone who plays.
// Names are picked from fixed word lists (same lists as server/names.json),
// so no real names or free text are ever sent.
const LEADERBOARD_URL='https://api-production-4903ded9.up.railway.app';
const nameWords={
 adj:['Modiga','Snabba','Glada','Busiga','Sömniga','Glittrande','Hoppiga','Lugna','Kloka','Starka','Lilla','Gröna','Prickiga','Mysiga','Tappra','Stjärnklara','Solgula','Dansande','Studsande','Nyfikna','Fluffiga','Magiska','Vänliga','Blixtsnabba'],
 noun:['Näckros','Grodis','Daggdroppe','Svamp','Eldfluga','Kristall','Vass','Blåbär','Kotte','Ekollon','Måne','Stjärna','Regnbåge','Bubbla','Löv','Trollslända','Humla','Grodprins','Grodprinsessa','Snöflinga','Sjöstjärna','Moln','Lykta','Hjortron']
};
let leaderTrack=null;

function playerId(){if(!state.playerId){const a='abcdefghijklmnopqrstuvwxyz0123456789';state.playerId=Array.from({length:24},()=>a[Math.floor(Math.random()*a.length)]).join('');save()}return state.playerId}
function leaderName(){if(!state.leaderName){const pick=l=>l[Math.floor(Math.random()*l.length)];state.leaderName={adj:pick(nameWords.adj),noun:pick(nameWords.noun)};save()}return state.leaderName}
async function leaderApi(path,body){
 const ctrl=typeof AbortController!=='undefined'?new AbortController():null,timer=setTimeout(()=>ctrl?.abort(),7000);
 try{const res=await fetch(LEADERBOARD_URL+path,body?{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body),signal:ctrl?.signal}:{signal:ctrl?.signal});if(!res.ok)throw new Error(res.status);return await res.json()}
 finally{clearTimeout(timer)}
}
// Scores set while offline are kept and sent the next time the list is opened.
async function flushPendingScores(){
 const list=state.pendingScores||[];if(!list.length)return;
 for(const s of [...list]){try{await leaderApi('/api/score',s);state.pendingScores=state.pendingScores.filter(x=>x!==s);save()}catch{return}}
}
function leaderRows(data){
 if(!data.top.length)return '<p class="leaderEmpty">Ingen har satt en tid här än. Bli den första!</p>';
 return `<ol class="leaderList">${data.top.map(r=>`<li class="${r.me?'me':''}"><span class="rank">${r.rank}</span><span class="who"><span translate="no">${escapeText(r.name)}</span> <small>#${r.tag}</small>${r.me?' <em>du</em>':''}</span><span class="time">${r.time.toFixed(1)} s</span></li>`).join('')}</ol>${data.me&&!data.top.some(r=>r.me)?`<p class="leaderMe">Din plats: ${data.me.rank} av ${data.total} · ${data.me.time.toFixed(1)} s</p>`:''}`;
}
function renderLeaderboard(el,route){
 if(!el)return;
 if(leaderTrack===null||!trackUnlocked(leaderTrack))leaderTrack=route;
 const t=trackWorlds[leaderTrack],n=leaderName();
 el.innerHTML=`<div class="sectionHead"><h2>Topplista</h2><span class="pill">Alla som spelar</span></div><div class="leaderTabs" role="tablist">${trackWorlds.map((x,i)=>trackUnlocked(i)?`<button role="tab" aria-selected="${i===leaderTrack}" data-leader="${i}">${x.icon} ${x.name}</button>`:'').join('')}</div><div class="leaderBody" id="leaderBody"><p class="leaderEmpty">Hämtar ${t.name}…</p></div><p class="leaderNote">Du heter <b translate="no">${n.adj} ${n.noun}</b> på topplistan. Bara bästa tiden per bana räknas. <button class="linkish" id="leaderRename">Byt namn</button></p><div id="leaderRenameBox"></div>${state.leaderOptOut?'<p class="leaderNote">Spelet frågar inte om dina rekord. <button class="linkish" id="leaderOptIn">Fråga igen efter nya rekord</button></p>':''}`;
 if($('#leaderOptIn'))$('#leaderOptIn').onclick=()=>{state.leaderOptOut=false;save();renderLeaderboard(el,route)};
 el.querySelectorAll('[data-leader]').forEach(b=>b.onclick=()=>{leaderTrack=+b.dataset.leader;renderLeaderboard(el,route)});
 $('#leaderRename').onclick=()=>namePicker($('#leaderRenameBox'),()=>renderLeaderboard(el,route));
 flushPendingScores().finally(()=>leaderApi(`/api/top?track=${t.id}&player=${playerId()}`).then(d=>{if(leaderTrack===trackWorlds.indexOf(t)&&$('#leaderBody'))$('#leaderBody').innerHTML=leaderRows(d)}).catch(()=>{if($('#leaderBody'))$('#leaderBody').innerHTML='<p class="leaderEmpty">Topplistan behöver internet. Dina rekord sparas ändå och skickas senare.</p>'}));
}
function namePicker(box,done){
 const n=leaderName();
 box.innerHTML=`<div class="namePicker"><label for="nameAdj">Första ordet</label><select id="nameAdj">${nameWords.adj.map(w=>`<option ${w===n.adj?'selected':''}>${w}</option>`).join('')}</select><label for="nameNoun">Andra ordet</label><select id="nameNoun">${nameWords.noun.map(w=>`<option ${w===n.noun?'selected':''}>${w}</option>`).join('')}</select><div class="namePickerActions"><button class="outline" id="nameDice">🎲 Slumpa</button><button class="primary" id="nameSave">Spara namnet</button></div></div>`;
 $('#nameDice').onclick=()=>{$('#nameAdj').value=nameWords.adj[Math.floor(Math.random()*nameWords.adj.length)];$('#nameNoun').value=nameWords.noun[Math.floor(Math.random()*nameWords.noun.length)]};
 $('#nameSave').onclick=()=>{state.leaderName={adj:$('#nameAdj').value,noun:$('#nameNoun').value};save();toast('Ditt topplistnamn är nu '+state.leaderName.adj+' '+state.leaderName.noun);done()};
}
// After a race: offer to send a new personal record.
function offerLeaderboard(el,world,time,record){
 if(!el||!record||time===null||state.leaderOptOut)return;
 const n=leaderName();
 el.innerHTML=`<div class="leaderOffer"><p><b>Nytt rekord!</b> Vill du skicka ${time.toFixed(1)} s till topplistan som <b translate="no">${n.adj} ${n.noun}</b>?</p><div class="leaderOfferActions"><button class="primary" id="leaderSend">Skicka</button><button class="outline" id="leaderNoThanks">Nej tack</button><button class="linkish" id="leaderNever">Fråga inte igen</button></div><div id="leaderResult"></div></div>`;
 const score={player:playerId(),track:world.id,adj:n.adj,noun:n.noun,time:Math.round(time*10)/10};
 $('#leaderSend').onclick=async()=>{
  $('#leaderSend').disabled=true;
  try{const d=await leaderApi('/api/score',score);state.leaderSubmitted=true;save();const me=d.me;$('#leaderResult').innerHTML=`<p>✦ Du är nummer <b>${me?.rank??'?'}</b> av ${d.total} på ${world.name}!</p>`;sfx('chime')}
  catch{state.pendingScores=[...(state.pendingScores||[]),score];save();$('#leaderResult').innerHTML='<p>Ingen internet just nu – tiden skickas nästa gång du öppnar topplistan.</p>'}
  $('#leaderNoThanks').hidden=true;$('#leaderNever').hidden=true;
 };
 $('#leaderNoThanks').onclick=()=>{el.innerHTML=''};
 $('#leaderNever').onclick=()=>{state.leaderOptOut=true;save();el.innerHTML='<p class="leaderNote">Okej! Du kan ändra dig under Tävla → Topplista.</p>'};
}
