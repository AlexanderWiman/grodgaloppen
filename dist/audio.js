// Sound effects and calm background music, synthesized with Web Audio – no audio files.
// Everything is silent where Web Audio is missing (tests, very old browsers) or turned off.
// Music starts after the first tap or key press, as browsers require.

let audioCtx=null,sfxBus=null,musicBus=null;

function audio(){
 if(typeof AudioContext==='undefined')return null;
 try{
  if(!audioCtx){
   audioCtx=new AudioContext();
   sfxBus=audioCtx.createGain();sfxBus.connect(audioCtx.destination);
   // Music: soft low-pass plus a gentle echo for a dreamy forest feel.
   musicBus=audioCtx.createGain();musicBus.gain.value=0;
   const tone=audioCtx.createBiquadFilter();tone.type='lowpass';tone.frequency.value=2600;
   const delay=audioCtx.createDelay(1),feedback=audioCtx.createGain(),echo=audioCtx.createGain(),damp=audioCtx.createBiquadFilter();
   delay.delayTime.value=.33;feedback.gain.value=.3;echo.gain.value=.32;damp.type='lowpass';damp.frequency.value=1700;
   musicBus.connect(tone);tone.connect(audioCtx.destination);
   tone.connect(delay);delay.connect(damp);damp.connect(feedback);feedback.connect(delay);damp.connect(echo);echo.connect(audioCtx.destination);
  }
  if(audioCtx.state==='suspended')audioCtx.resume();
  return audioCtx;
 }catch{return null}
}

function sfx(name){
 if(state.sound===false)return;
 const ctx=audio();if(!ctx)return;startMusicSoon();
 try{
  const t=ctx.currentTime;
  const tone=(freq,start,dur,type='sine',vol=.15,slide)=>{const o=ctx.createOscillator(),g=ctx.createGain();o.type=type;o.frequency.setValueAtTime(freq,t+start);if(slide)o.frequency.exponentialRampToValueAtTime(slide,t+start+dur);g.gain.setValueAtTime(.0001,t+start);g.gain.exponentialRampToValueAtTime(vol,t+start+.015);g.gain.exponentialRampToValueAtTime(.0001,t+start+dur);o.connect(g);g.connect(sfxBus);o.start(t+start);o.stop(t+start+dur+.05)};
  const notes=(list,gap,dur,type,vol)=>list.forEach((f,i)=>tone(f,i*gap,i===list.length-1?dur*2:dur,type,vol));
  ({
   jump:()=>tone(240,0,.2,'sine',.13,560),
   land:()=>tone(170,0,.13,'triangle',.18,85),
   perfect:()=>{tone(880,0,.12,'sine',.1);tone(1320,.08,.22,'sine',.1)},
   golden:()=>notes([784,988,1175,1568],.05,.1,'triangle',.09),
   combo:()=>notes([660,880,1100],.06,.1,'triangle',.08),
   miss:()=>tone(320,0,.32,'triangle',.11,150),
   bump:()=>tone(140,0,.25,'square',.06,70),
   overtake:()=>{tone(520,0,.09,'square',.05);tone(780,.08,.14,'square',.05)},
   tick:()=>tone(440,0,.12,'sine',.14),
   go:()=>tone(880,0,.4,'sine',.16),
   sprint:()=>notes([523,659,784],.08,.1,'square',.05),
   win:()=>notes([523,659,784,1047],.13,.18,'triangle',.15),
   finish:()=>notes([523,659,784],.12,.18,'sine',.12),
   chime:()=>notes([784,1047,1319],.09,.16,'sine',.09),
   evolve:()=>notes([392,523,659,784,1047,1319],.07,.12,'triangle',.1)
  })[name]?.()
 }catch{}
}

// ---------- Background music ----------
// Each place has a small theme: tempo, key, chord loop and a melody scale.
// A seeded two-bar motif per theme keeps every place recognisable.
const musicThemes={
 meadow:{bpm:76,root:60,scale:[0,2,4,7,9],prog:[[0,4,7],[-3,0,4],[5,9,12],[7,11,14]],lead:'triangle',density:.5},
 glade:{bpm:64,root:57,scale:[0,2,4,7,9],prog:[[0,4,7],[5,9,12],[0,4,7],[7,11,14]],lead:'sine',density:.35},
 village:{bpm:88,root:62,scale:[0,2,4,7,9],prog:[[0,4,7],[7,11,14],[9,12,16],[5,9,12]],lead:'triangle',density:.55},
 castle:{bpm:70,root:55,scale:[0,2,4,5,7,9,11],prog:[[0,4,7],[5,9,12],[2,5,9],[7,11,14]],lead:'sine',density:.42},
 adventure:{bpm:80,root:57,scale:[0,2,3,5,7,9,10],prog:[[0,3,7],[-2,2,5],[3,7,10],[-4,0,3]],lead:'triangle',density:.45},
 pond:{bpm:96,root:62,scale:[0,2,4,7,9],prog:[[0,4,7],[5,9,12],[7,11,14],[5,9,12]],lead:'triangle',density:.6},
 forest:{bpm:100,root:57,scale:[0,3,5,7,10],prog:[[0,3,7],[5,8,12],[3,7,10],[7,10,14]],lead:'triangle',density:.6},
 marsh:{bpm:72,root:53,scale:[0,2,3,7,9],prog:[[0,3,7],[-2,2,5],[0,3,7],[5,8,12]],lead:'sine',density:.35},
 crystal:{bpm:84,root:64,scale:[0,2,4,6,7,11],prog:[[0,4,7],[2,6,9],[-1,4,7],[0,4,7]],lead:'sine',density:.5,sparkle:.5},
 night:{bpm:60,root:52,scale:[0,2,3,7,8],prog:[[0,3,7],[-4,0,3],[-2,2,5],[0,3,7]],lead:'sine',density:.3,sparkle:.4},
 sea:{bpm:70,root:55,scale:[0,2,4,7,9],prog:[[0,4,7],[9,12,16],[5,9,12],[7,11,14]],lead:'sine',density:.4},
 clouds:{bpm:78,root:65,scale:[0,2,4,7,9,11],prog:[[0,4,7,11],[5,9,12,16],[2,5,9,12],[7,11,14,17]],lead:'triangle',density:.45,sparkle:.3},
 winter:{bpm:68,root:62,scale:[0,2,4,7,9],prog:[[0,4,7],[-3,0,4],[-5,-1,2],[0,4,7]],lead:'sine',density:.38,sparkle:.6},
 festival:{bpm:104,root:60,scale:[0,2,4,5,7,9],prog:[[0,4,7],[5,9,12],[7,11,14],[0,4,7]],lead:'square',density:.7}
};
let musicWanted='meadow',musicPlaying=null,musicTimer=null,musicStep=0,musicNext=0,musicMotif=[],musicStarted=false;

function seeded(text){let h=2166136261;for(const c of text)h=Math.imul(h^c.charCodeAt(0),16777619);return()=>{h=Math.imul(h^h>>>15,2246822507);h=Math.imul(h^h>>>13,3266489909);return((h^=h>>>16)>>>0)/4294967296}}
function makeMotif(name,theme){const rnd=seeded(name);let deg=2;return Array.from({length:16},(_,i)=>{if(i%8!==0&&rnd()>theme.density)return null;deg=Math.max(0,Math.min(theme.scale.length*2-1,deg+Math.round((rnd()-.5)*4)));return deg})}
const midi=n=>440*Math.pow(2,(n-69)/12);

function musicVoice(freq,at,dur,type,vol,attack=.02){
 const o=audioCtx.createOscillator(),g=audioCtx.createGain();o.type=type;o.frequency.value=freq;
 g.gain.setValueAtTime(.0001,at);g.gain.exponentialRampToValueAtTime(vol,at+attack);g.gain.exponentialRampToValueAtTime(.0001,at+dur);
 o.connect(g);g.connect(musicBus);o.start(at);o.stop(at+dur+.05);
}
function scheduleMusic(){
 if(!musicPlaying||!audioCtx)return;
 const th=musicThemes[musicPlaying],eighth=30/th.bpm;
 while(musicNext<audioCtx.currentTime+.5){
  const s=musicStep,at=musicNext,chord=th.prog[Math.floor(s/8)%th.prog.length];
  if(s%8===0){
   chord.forEach(n=>{musicVoice(midi(th.root+n),at,eighth*8+1.2,'sine',.022,.7);musicVoice(midi(th.root+n)*1.003,at,eighth*8+1.2,'triangle',.01,.9)});
   musicVoice(midi(th.root-12+chord[0]),at,eighth*3.5,'sine',.06,.03);
  }
  if(s%8===4)musicVoice(midi(th.root-12+chord[0]+(chord[2]-chord[0])),at,eighth*3,'sine',.035,.03);
  const deg=musicMotif[s%16];
  if(deg!==null&&deg!==undefined){
   const oct=Math.floor(deg/th.scale.length),note=th.root+12+th.scale[deg%th.scale.length]+oct*12;
   musicVoice(midi(note),at,eighth*2.4,th.lead,th.lead==='square'?.018:.045,.012);
  }
  if(th.sparkle&&s%4===2&&seeded(musicPlaying+s)()<th.sparkle)musicVoice(midi(th.root+24+th.scale[(s/2)%th.scale.length|0]),at,.9,'sine',.012,.01);
  musicStep++;musicNext+=eighth;
  // Every eight bars the motif varies a little so it never loops too obviously.
  if(musicStep%64===0)musicMotif=makeMotif(musicPlaying+(musicStep/64|0)%3,th);
 }
 musicTimer=setTimeout(scheduleMusic,120);
}
function playTheme(name){
 if(!audioCtx||!musicThemes[name])return;
 const t=audioCtx.currentTime;
 musicBus.gain.cancelScheduledValues(t);musicBus.gain.setValueAtTime(musicBus.gain.value,t);
 if(musicPlaying===name){musicBus.gain.linearRampToValueAtTime(1,t+.6);return}
 const switching=musicPlaying!==null;
 musicBus.gain.linearRampToValueAtTime(0,t+(switching?.7:.01));
 clearTimeout(musicTimer);
 setTimeout(()=>{
  if(musicWanted!==name||state.music===false||musicHidden())return;
  musicPlaying=name;musicStep=0;musicNext=audioCtx.currentTime+.1;musicMotif=makeMotif(name,musicThemes[name]);
  const now=audioCtx.currentTime;musicBus.gain.cancelScheduledValues(now);musicBus.gain.setValueAtTime(0,now);musicBus.gain.linearRampToValueAtTime(1,now+2.5);
  clearTimeout(musicTimer);scheduleMusic();
 },switching?750:20);
}
function stopMusic(fade=.6){
 clearTimeout(musicTimer);
 if(audioCtx&&musicBus){const t=audioCtx.currentTime;musicBus.gain.cancelScheduledValues(t);musicBus.gain.setValueAtTime(musicBus.gain.value,t);musicBus.gain.linearRampToValueAtTime(0,t+fade)}
 musicPlaying=null;
}
function musicHidden(){return typeof document!=='undefined'&&document.visibilityState==='hidden'}
function setMusic(name){musicWanted=name;if(!musicStarted||state.music===false)return;playTheme(name)}
function startMusicSoon(){if(musicStarted||state.music===false)return;if(!audio())return;musicStarted=true;playTheme(musicWanted)}
function setMusicEnabled(on){state.music=on;save();if(on){musicStarted=false;startMusicSoon()}else{musicStarted=false;stopMusic()}}

// The first tap anywhere unlocks audio; hidden tabs go quiet.
if(typeof document!=='undefined'&&document.addEventListener){
 document.addEventListener('pointerdown',()=>startMusicSoon());
 document.addEventListener('visibilitychange',()=>{if(musicHidden())stopMusic(.3);else if(musicStarted&&state.music!==false)playTheme(musicWanted)});
}
