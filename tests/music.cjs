// Background music: plays every theme with a fake Web Audio context and checks it is soft
// (no high "plinky" notes), keeps its main tune and varies the other phrases.
const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const started=[];
const param=()=>({value:0,setValueAtTime(){},exponentialRampToValueAtTime(){},linearRampToValueAtTime(){},cancelScheduledValues(){}});
const node=extra=>({connect(){},...extra});
class FakeAudio{constructor(){this.currentTime=0;this.sampleRate=8000;this.state='running';this.destination=node()}
 createGain(){return node({gain:param()})}
 createBiquadFilter(){return node({type:'',frequency:param(),Q:param()})}
 createDelay(){return node({delayTime:param()})}
 createOscillator(){const o=node({type:'sine',frequency:param(),start(){started.push({freq:o.frequency.value,type:o.type})},stop(){}});return o}
 createBuffer(ch,len){const d=new Float32Array(len);return{getChannelData:()=>d}}
 createBufferSource(){return node({start(){},stop(){}})}
 resume(){}}
const c=vm.createContext({console,Math,Object,Array,Float32Array,state:{music:true},save(){},AudioContext:FakeAudio,setTimeout:()=>0,clearTimeout(){}});
vm.runInContext(fs.readFileSync('dist/audio.js','utf8'),c);
const run=s=>vm.runInContext(s,c);
run('audio()');
const themes=run('Object.keys(musicThemes)');
for(const name of themes){
 started.length=0;
 // 48 bars: three rounds of the 16-bar form.
 run(`musicPlaying=${JSON.stringify(name)};musicStep=0;musicNext=0;musicMotifs=null;for(let t=0;t<200;t+=.25){audioCtx.currentTime=t;scheduleMusic();if(musicStep>=8*48)break}`);
 assert(run('musicStep')>=8*48,name+' plays on');
 const lead=started.filter(n=>n.freq>0);
 assert(lead.length>200,name+' has notes');
 const top=Math.max(...lead.map(n=>n.freq));
 assert(top<1000,`${name}: highest note ${top.toFixed(0)} Hz should stay below 1000 Hz`);
 assert(!started.some(n=>n.type==='square'),name+' uses no harsh square wave');
 // The main tune is the same every round; the other phrases change every other round.
 const m0=run(`JSON.stringify(makeMotifs(${JSON.stringify(name)},0,musicThemes[${JSON.stringify(name)}]))`),m2=run(`JSON.stringify(makeMotifs(${JSON.stringify(name)},2,musicThemes[${JSON.stringify(name)}]))`);
 assert.equal(JSON.parse(m0).a.join(),JSON.parse(m2).a.join());
 assert.notEqual(JSON.stringify(JSON.parse(m0).c),JSON.stringify(JSON.parse(m2).c),name+' varies between rounds');
 // Phrases fill exactly two bars and end on the home note.
 for(const phrase of Object.values(JSON.parse(m0))){let len=0;phrase.forEach((n,i)=>{if(n)len=Math.max(len,i+n.len)});assert(len<=16);const last=[...phrase].reverse().find(Boolean);assert([0,run(`musicThemes[${JSON.stringify(name)}].scale.length`)].includes(last.deg),name+' phrase ends at home')}
}
// The music picker: a chosen song wins over the place's own theme; "follow the place" clears it.
run("musicWanted='meadow';state.musicChoice='winter'");assert.equal(run('musicTheme()'),'winter');run("state.musicChoice='nope'");assert.equal(run('musicTheme()'),'meadow','unknown songs are ignored');run('state.musicChoice=null');assert.equal(run('musicTheme()'),'meadow');
assert.deepEqual(Object.keys(run('musicNames')).sort(),themes.slice().sort(),'every theme has a name in the picker');
console.log(`PASS: ${themes.length} music themes play soft, varied and below 1000 Hz.`);
