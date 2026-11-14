const trackWorlds=[
{className:'pond',icon:'❀',obstacle:'näckroskanten',label:'Hoppa till nästa näckros',hint:'Du står på den vänstra näckrosen. Hoppa när nästa näckros lyser grönt – då landar du på den.',period:3.1,bonus:3.8},
{className:'forest',icon:'🍄',obstacle:'roten',label:'Hoppa över roten',hint:'Ett bra hopp landar på en studssvamp och ger extra fart!',period:2.8,bonus:4.5},
{className:'marsh',icon:'✧',obstacle:'gyttjan',label:'Följ eldflugans ljus',hint:'Eldflugan lyser när det är dags att hoppa över gyttjan.',period:3.4,bonus:4}
];
function jumpVerdict(phase){return phase>=.70&&phase<=.94?(phase>=.79&&phase<=.88?'perfect':'good'):'miss'}
function startRace(){
 if(!state.hatched)return;running=true;
 const route=chosen,r=races[route],world=trackWorlds[route],strength=stats()[r.stat];
 let progress=[0,0,0,0],finished=[],last=performance.now(),elapsed=0,phaseTime=0,attempted=false,slowUntil=0,jumpUntil=0,good=0,perfect=0,misses=0,drops=0,ended=false,pondFlight=null;
 const speeds=[2.8+strength*.009,3.65+Math.random()*.25,3.5+Math.random()*.3,3.55+Math.random()*.3];
 $('#content').innerHTML=`<div class="sectionHead"><h2>${r.name}</h2><span class="pill">${r.type} ger fördel</span></div><section class="jumpWorld ${world.className}" aria-label="${r.name}, tävlingsbana"><div class="worldCaption">${world.label}</div><div class="worldDecor">${route===1?'♣　🍄　♣　🍄':route===2?'✧　　　✧　　　✧':'❀　　　❀　　　❀'}</div>${route===0?'<div class="lilyPad" id="currentPad"></div><div class="lilyPad" id="nextPad"></div><span id="landingCue">Nästa näckros</span>':''}<div id="jumpRider">${frog()}</div><div id="jumpObstacle" aria-hidden="true">${world.icon}</div><div class="ground"></div></section><div class="jumpControls"><p>${world.hint}</p><div class="timingLabel"><span>Vänta…</span><strong>HOPPA I DET GRÖNA FÄLTET</strong></div><div class="timingMeter" aria-hidden="true"><div class="timingTarget"></div><div id="timingPointer"></div></div><div class="jumpAction"><button class="primary" id="jumpButton">Hoppa! · Mellanslag</button><span id="jumpScore">✦ 0 daggdroppar</span></div><p id="jumpFeedback" role="status">Tryck en gång per hinder. Missar kostar lite fart – du fortsätter direkt.</p></div><div class="racePositions">${['Ditt team','Klöver','Mossa','Pärla'].map((n,i)=>`<div><span>${n}</span><progress id="raceProgress${i}" max="100" value="0" aria-label="${n}, väg till mål"></progress></div>`).join('')}</div><div class="raceInfo"><h2 id="raceTitle">Astrid: Låt racet börja!</h2></div>`;
 const button=$('#jumpButton'),rider=$('#jumpRider'),obstacle=$('#jumpObstacle'),pointer=$('#timingPointer'),feedback=$('#jumpFeedback');
 function miss(){misses++;slowUntil=elapsed+1.1;feedback.textContent='Lite för tidigt eller sent – bara ett litet farttapp. Försök vid nästa hinder!'}
 function hop(){if(ended||attempted||pondFlight)return;attempted=true;button.disabled=true;jumpUntil=elapsed+.65;const verdict=jumpVerdict(phaseTime/world.period);if(route===0)pondFlight={start:elapsed,success:verdict!=='miss'};if(verdict==='miss'){miss()}else{good++;if(verdict==='perfect')perfect++;const earned=verdict==='perfect'?3:1;drops+=earned;progress[0]+=world.bonus+(verdict==='perfect'?1.2:0);feedback.textContent=verdict==='perfect'?'Perfekt språng! +3 daggdroppar ✦':route===1?'Studssvampen ger extra fart! +1 daggdroppe':'Fint hopp! +1 daggdroppe';$('#jumpScore').textContent='✦ '+drops+' daggdroppar'}}
 function keydown(e){if(e.code==='Space'&&!e.repeat){e.preventDefault();hop()}else if(e.code==='Space')e.preventDefault()}
 button.onclick=hop;document.addEventListener('keydown',keydown);
 function finish(){ended=true;running=false;document.removeEventListener('keydown',keydown);button.disabled=true;const rank=finished.indexOf(0)+1,reward=Math.round(r.reward*[1,.65,.4,.25][rank-1]);state.coins+=reward+drops;if(rank===1)state.wins++;const trust=recordRoyalRace(rank,route);save();sidebar();$('#content').innerHTML=`<div class="jumpSummary"><strong>${good} lyckade hopp · ${perfect} perfekta · ${misses} missar</strong><p>Du samlade ${drops} extra daggdroppar under racet.</p></div><div class="raceInfo">${coronation(rank,reward+drops,trust,finished[0])}</div>`;$('#again').onclick=render}
 function frame(now){if(ended)return;const dt=Math.min((now-last)/1000,.08);last=now;if(document.hidden){requestAnimationFrame(frame);return}elapsed+=dt;
 if(route===0&&pondFlight){
 const age=elapsed-pondFlight.start,success=pondFlight.success,flight=.8,pan=.55;
 const t=Math.min(age/flight,1);
 // Move from the centre of the current pad to the centre of the next pad.
 const x=success?20+50*t:20+8*Math.sin(Math.PI*t),y=-Math.sin(Math.PI*t)*80;
 rider.style.left=x+'%';rider.style.transform=`translate(-50%, ${y}px)`;
 if(age>=flight&&success){const camera=Math.min((age-flight)/pan,1)*50;rider.style.left=(70-camera)+'%';$('#currentPad').style.left=(20-camera)+'%';$('#nextPad').style.left=(70-camera)+'%';$('#landingCue').textContent='Landat!';}
 if(age>=flight+(success?pan:.25)){pondFlight=null;phaseTime=0;attempted=false;button.disabled=false;rider.style.left='20%';rider.style.transform='translateX(-50%)';$('#currentPad').style.left='20%';$('#nextPad').style.left='70%';$('#landingCue').textContent='Nästa näckros';}
 }else{
 phaseTime+=dt;if(phaseTime>=world.period){if(!attempted)miss();phaseTime-=world.period;attempted=false;button.disabled=false}
 const phase=phaseTime/world.period;pointer.style.left=(phase*100)+'%';
 if(route===0){const ready=phase>=.70&&phase<=.94;$('#nextPad').classList.toggle('ready',ready);$('#landingCue').textContent=ready?'Hoppa hit nu!':'Vänta på grönt…';rider.style.left='20%';rider.style.transform='translateX(-50%)';}
 else{obstacle.style.left=(95-phase*90)+'%';rider.style.transform=elapsed<jumpUntil?'translateY('+(-Math.sin((.65-(jumpUntil-elapsed))/.65*Math.PI)*65)+'px)':'none';obstacle.classList.toggle('ready',phase>=.70&&phase<=.94);}
 }
 progress=progress.map((p,i)=>p>=100?p:p+dt*speeds[i]*(i===0&&elapsed<slowUntil?.62:1));progress.map((p,i)=>({p,i})).filter(x=>x.p>=100&&!finished.includes(x.i)).sort((a,b)=>b.p-a.p).forEach(x=>finished.push(x.i));progress.forEach((p,i)=>$('#raceProgress'+i).value=Math.min(p,100));if(finished.includes(0)&&!pondFlight){finish();return}requestAnimationFrame(frame)}requestAnimationFrame(frame)
}
