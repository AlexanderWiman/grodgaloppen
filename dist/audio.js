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
   const tone=audioCtx.createBiquadFilter();tone.type='lowpass';tone.frequency.value=1800;
   const delay=audioCtx.createDelay(1),feedback=audioCtx.createGain(),echo=audioCtx.createGain(),damp=audioCtx.createBiquadFilter();
   delay.delayTime.value=.38;feedback.gain.value=.18;echo.gain.value=.18;damp.type='lowpass';damp.frequency.value=1200;
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
// Each place has a small theme: tempo, key, chord loop, melody scale and a lead voice.
// The family found the old music "too plinky", so the lead plays low and soft (slow attack,
// a little vibrato), there are no high sparkle notes, and the echo is quieter.
// For variety every theme follows a 16-bar form: A, A', bridge (other chords, broken chords,
// a second voice), A and a breath at the end. Its main tune stays, the other phrases change
// every other round.
const musicThemes={
 meadow:{bpm:76,root:60,scale:[0,2,4,7,9],prog:[[0,4,7],[-3,0,4],[5,9,12],[7,11,14]],voice:'flute',bass:'walk',density:.5,brush:.2},
 glade:{bpm:64,root:57,scale:[0,2,4,7,9],prog:[[0,4,7],[5,9,12],[0,4,7],[7,11,14]],voice:'flute',bass:'root',density:.35,air:.5},
 village:{bpm:88,root:62,scale:[0,2,4,7,9],prog:[[0,4,7],[7,11,14],[9,12,16],[5,9,12]],voice:'reed',bass:'pulse',density:.55,brush:.35},
 castle:{bpm:70,root:55,scale:[0,2,4,5,7,9,11],prog:[[0,4,7],[5,9,12],[2,5,9],[7,11,14]],voice:'reed',bass:'root',density:.42},
 adventure:{bpm:80,root:57,scale:[0,2,3,5,7,9,10],prog:[[0,3,7],[-2,2,5],[3,7,10],[-4,0,3]],voice:'reed',bass:'walk',density:.45},
 pond:{bpm:96,root:60,scale:[0,2,4,7,9],prog:[[0,4,7],[5,9,12],[7,11,14],[5,9,12]],voice:'flute',bass:'pulse',density:.6,brush:.45},
 forest:{bpm:100,root:57,scale:[0,3,5,7,10],prog:[[0,3,7],[5,8,12],[3,7,10],[7,10,14]],voice:'reed',bass:'pulse',density:.6,brush:.45},
 marsh:{bpm:72,root:53,scale:[0,2,3,7,9],prog:[[0,3,7],[-2,2,5],[0,3,7],[5,8,12]],voice:'hum',bass:'root',density:.38},
 crystal:{bpm:84,root:59,scale:[0,2,4,6,7,11],prog:[[0,4,7],[2,6,9],[-1,4,7],[0,4,7]],voice:'flute',bass:'walk',density:.5,air:.6},
 night:{bpm:60,root:52,scale:[0,2,3,7,8],prog:[[0,3,7],[-4,0,3],[-2,2,5],[0,3,7]],voice:'flute',bass:'root',density:.32,air:.5},
 sea:{bpm:70,root:55,scale:[0,2,4,7,9],prog:[[0,4,7],[9,12,16],[5,9,12],[7,11,14]],voice:'flute',bass:'walk',density:.42,air:.3},
 clouds:{bpm:78,root:60,scale:[0,2,4,7,9,11],prog:[[0,4,7,11],[5,9,12,16],[2,5,9,12],[7,11,14,17]],voice:'whistle',bass:'walk',density:.45,air:.5},
 winter:{bpm:68,root:60,scale:[0,2,4,7,9],prog:[[0,4,7],[-3,0,4],[-5,-1,2],[0,4,7]],voice:'flute',bass:'root',density:.38,air:.7},
 festival:{bpm:104,root:60,scale:[0,2,4,5,7,9],prog:[[0,4,7],[5,9,12],[7,11,14],[0,4,7]],voice:'reed',bass:'pulse',density:.68,brush:.55}
};
// Lead voices. All start softly; "hum" plays an octave lower.
const leadVoices={flute:{type:'sine',vol:.042,attack:.07,vibrato:.005},reed:{type:'triangle',vol:.05,attack:.05,filter:950},hum:{type:'sine',vol:.055,attack:.1,octave:-12,vibrato:.003},whistle:{type:'sine',vol:.03,attack:.09,vibrato:.007}};
// Which two-bar phrase plays in each of the 8 phrase slots of the 16-bar form; slots 4–5 are the bridge.
const musicForm=['a','c','a','d','b','e','a','c'];
let musicWanted='meadow',musicPlaying=null,musicTimer=null,musicStep=0,musicNext=0,musicMotifs=null,musicStarted=false,noiseBuffer=null;

function seeded(text){let h=2166136261;for(const c of text)h=Math.imul(h^c.charCodeAt(0),16777619);return()=>{h=Math.imul(h^h>>>15,2246822507);h=Math.imul(h^h>>>13,3266489909);return((h^=h>>>16)>>>0)/4294967296}}
// A two-bar phrase: 16 eighth-note slots holding {deg,len} notes or rests. Mostly stepwise
// movement and some long notes; the phrase ends on the home note or its octave.
function makeMotif(seed,theme){
 const rnd=seeded(seed),n=theme.scale.length,top=Math.round(n*1.6),out=Array(16).fill(null);
 let deg=Math.floor(n/2),i=0;
 while(i<16){
  if(i%4!==0&&rnd()>theme.density){i++;continue}
  const step=rnd()<.72?(rnd()<.5?-1:1):Math.round((rnd()-.5)*5);
  deg=Math.max(0,Math.min(top,deg+step));
  let len=[1,2,2,3,4][Math.floor(rnd()*5)];if(theme.density<.45&&len<2)len=2;len=Math.min(len,16-i);
  out[i]={deg,len};i+=len;
 }
 const last=[...out].reverse().find(Boolean);if(last)last.deg=last.deg>n*.7?n:0;
 return out;
}
function makeMotifs(name,round,theme){const v=Math.floor(round/2)%4;return Object.fromEntries(['a','b','c','d','e'].map(k=>[k,makeMotif(k==='a'?name:name+k+v,theme)]))}
const bridgeProg=th=>[th.prog[2],th.prog[3],th.prog[0],th.prog[3]];
const midi=n=>440*Math.pow(2,(n-69)/12);
function leadFreq(th,m){const n=th.scale.length,v=leadVoices[th.voice]||leadVoices.flute;return midi(th.root+th.scale[m.deg%n]+12*Math.floor(m.deg/n)+(v.octave||0))}

function musicVoice(freq,at,dur,{type='sine',vol=.03,attack=.05,vibrato=0,filter=0}={}){
 const o=audioCtx.createOscillator(),g=audioCtx.createGain();o.type=type;o.frequency.value=freq;
 const a=Math.min(attack,dur*.5);
 g.gain.setValueAtTime(.0001,at);g.gain.exponentialRampToValueAtTime(vol,at+a);g.gain.exponentialRampToValueAtTime(.0001,at+dur);
 let out=o;if(filter){const f=audioCtx.createBiquadFilter();f.type='lowpass';f.frequency.value=filter;o.connect(f);out=f}
 out.connect(g);g.connect(musicBus);
 if(vibrato){const l=audioCtx.createOscillator(),lg=audioCtx.createGain();l.frequency.value=4.8;lg.gain.value=freq*vibrato;l.connect(lg);lg.connect(o.frequency);l.start(at);l.stop(at+dur+.05)}
 o.start(at);o.stop(at+dur+.05);
}
// A very soft shaker on off-beats for the livelier themes.
function musicBrush(at){
 if(!noiseBuffer){noiseBuffer=audioCtx.createBuffer(1,Math.floor(audioCtx.sampleRate*.15),audioCtx.sampleRate);const d=noiseBuffer.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1}
 const src=audioCtx.createBufferSource(),f=audioCtx.createBiquadFilter(),g=audioCtx.createGain();src.buffer=noiseBuffer;f.type='bandpass';f.frequency.value=2800;f.Q.value=.8;
 g.gain.setValueAtTime(.0001,at);g.gain.exponentialRampToValueAtTime(.01,at+.01);g.gain.exponentialRampToValueAtTime(.0001,at+.08);
 src.connect(f);f.connect(g);g.connect(musicBus);src.start(at);src.stop(at+.12);
}
function musicBass(th,chord,pos,at,eighth){
 const low=n=>midi(th.root-12+n);
 if(th.bass==='walk'){if(pos%2===0)musicVoice(low(chord[[0,1,2,1][pos/2]]),at,eighth*1.8,{vol:.045,attack:.03})}
 else if(th.bass==='pulse'){if(pos===0||pos===3||pos===6)musicVoice(low(chord[0]),at,eighth*1.5,{vol:.05,attack:.02})}
 else{if(pos===0)musicVoice(low(chord[0]),at,eighth*3.5,{vol:.055,attack:.03});if(pos===4)musicVoice(low(chord[2]),at,eighth*3,{vol:.035,attack:.03})}
}
function scheduleMusic(){
 if(!musicPlaying||!audioCtx)return;
 const th=musicThemes[musicPlaying],eighth=30/th.bpm;
 while(musicNext<audioCtx.currentTime+.5){
  const s=musicStep,at=musicNext,bar=Math.floor(s/8),pos=s%8,slot=Math.floor(bar/2)%8,bridge=slot===4||slot===5;
  if(s%128===0)musicMotifs=makeMotifs(musicPlaying,s/128,th);
  const chord=(bridge?bridgeProg(th):th.prog)[bar%4];
  if(!bridge&&pos===0)chord.forEach(n=>musicVoice(midi(th.root+n),at,eighth*8+1,{vol:.016,attack:.8}));
  if(bridge&&pos%2===0)musicVoice(midi(th.root+chord[(pos/2)%chord.length]),at,eighth*2.2,{vol:.022,attack:.05,filter:1300});
  if(bridge&&pos===0)musicVoice(midi(th.root+chord[1]),at,eighth*7.5,{vol:.016,attack:.5,vibrato:.004});
  musicBass(th,chord,pos,at,eighth);
  const m=musicMotifs[musicForm[slot]][s%16],breath=slot===7&&bar%2===1&&pos>=4;
  if(m&&!breath)musicVoice(leadFreq(th,m),at,eighth*(m.len+.6),leadVoices[th.voice]||leadVoices.flute);
  if(th.brush&&pos%2===1&&seeded(musicPlaying+s)()<th.brush)musicBrush(at);
  if(th.air&&s%32===0)musicVoice(midi(th.root+12+chord[0]),at,eighth*30,{vol:.009*th.air,attack:2.5,vibrato:.003});
  musicStep++;musicNext+=eighth;
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
  musicPlaying=name;musicStep=0;musicNext=audioCtx.currentTime+.1;musicMotifs=null;
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
