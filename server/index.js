// Leaderboard API for The Big Frog Race.
// Stores each player's best time per track. Names are built from fixed word lists,
// so no free text from players ever reaches the list.
import http from 'node:http';
import {readFileSync} from 'node:fs';
import pg from 'pg';

const names=JSON.parse(readFileSync(new URL('./names.json',import.meta.url)));
export const TRACKS=['pond','forest','marsh','crystal','castle','sea','clouds','night','winter'];
const MIN_TIME=12,MAX_TIME=180;
const ORIGINS=(process.env.ALLOWED_ORIGINS||'https://alexanderwiman.github.io,http://localhost:8765').split(',');
const PORT=process.env.PORT||3000;

const pool=process.env.DATABASE_URL?new pg.Pool({connectionString:process.env.DATABASE_URL,ssl:process.env.PGSSL==='1'?{rejectUnauthorized:false}:false,max:5}):null;
async function migrate(){if(!pool)return;await pool.query(`create table if not exists scores(
  player text not null, track text not null, adj text not null, noun text not null,
  time real not null, updated timestamptz not null default now(), primary key(player,track))`);
 await pool.query('create index if not exists scores_track_time on scores(track,time)')}

// A short public tag tells apart two players with the same name, without revealing the player id.
function tag(player){let h=0;for(const c of player)h=(h*31+c.charCodeAt(0))>>>0;return String(h%90+10)}

export function validScore(b){
 if(!b||typeof b!=='object')return 'bad body';
 if(typeof b.player!=='string'||!/^[a-z0-9]{12,40}$/.test(b.player))return 'bad player';
 if(!TRACKS.includes(b.track))return 'bad track';
 if(!names.adj.includes(b.adj)||!names.noun.includes(b.noun))return 'bad name';
 if(typeof b.time!=='number'||!Number.isFinite(b.time)||b.time<MIN_TIME||b.time>MAX_TIME)return 'bad time';
 return null;
}

// Simple per-address limit: 20 submissions per 10 minutes.
const hits=new Map();
function limited(ip){const now=Date.now(),list=(hits.get(ip)||[]).filter(t=>now-t<600000);list.push(now);hits.set(ip,list);return list.length>20}

function send(res,status,body,origin){
 const headers={'content-type':'application/json; charset=utf-8','cache-control':'no-store'};
 if(ORIGINS.includes(origin)){headers['access-control-allow-origin']=origin;headers['vary']='Origin'}
 res.writeHead(status,headers);res.end(JSON.stringify(body));
}
function readBody(req){return new Promise((ok,fail)=>{let d='';req.on('data',c=>{d+=c;if(d.length>2000){fail(new Error('too big'));req.destroy()}});req.on('end',()=>{try{ok(JSON.parse(d||'{}'))}catch(e){fail(e)}})})}

async function top(track,player){
 const {rows}=await pool.query('select player,adj,noun,time from scores where track=$1 order by time asc, updated asc limit 10',[track]);
 let me=null;
 if(player){const r=await pool.query(`select time,(select count(*)+1 from scores s2 where s2.track=$1 and s2.time<s.time)::int as rank from scores s where track=$1 and player=$2`,[track,player]);if(r.rows[0])me={rank:r.rows[0].rank,time:r.rows[0].time}}
 const total=(await pool.query('select count(*)::int as n from scores where track=$1',[track])).rows[0].n;
 return {track,total,top:rows.map((r,i)=>({rank:i+1,name:r.adj+' '+r.noun,tag:tag(r.player),time:Math.round(r.time*10)/10,me:r.player===player})),me};
}

const server=http.createServer(async(req,res)=>{
 const origin=req.headers.origin||'',url=new URL(req.url,'http://x');
 try{
  if(req.method==='OPTIONS'){res.writeHead(204,ORIGINS.includes(origin)?{'access-control-allow-origin':origin,'access-control-allow-methods':'GET,POST','access-control-allow-headers':'content-type','access-control-max-age':'86400',vary:'Origin'}:{});return res.end()}
  if(url.pathname==='/health')return send(res,200,{ok:true,db:!!pool},origin);
  if(url.pathname==='/api/names')return send(res,200,names,origin);
  if(!pool)return send(res,503,{error:'no database'},origin);
  if(req.method==='GET'&&url.pathname==='/api/top'){
   const track=url.searchParams.get('track'),player=url.searchParams.get('player')||'';
   if(!TRACKS.includes(track))return send(res,400,{error:'bad track'},origin);
   return send(res,200,await top(track,/^[a-z0-9]{12,40}$/.test(player)?player:''),origin);
  }
  if(req.method==='POST'&&url.pathname==='/api/score'){
   const ip=(req.headers['x-forwarded-for']||req.socket.remoteAddress||'').split(',')[0].trim();
   if(limited(ip))return send(res,429,{error:'slow down'},origin);
   const b=await readBody(req),bad=validScore(b);
   if(bad)return send(res,400,{error:bad},origin);
   await pool.query(`insert into scores(player,track,adj,noun,time) values($1,$2,$3,$4,$5)
     on conflict(player,track) do update set time=least(scores.time,excluded.time),adj=excluded.adj,noun=excluded.noun,updated=now()`,[b.player,b.track,b.adj,b.noun,b.time]);
   return send(res,200,await top(b.track,b.player),origin);
  }
  send(res,404,{error:'not found'},origin);
 }catch(e){console.error(e);send(res,500,{error:'server error'},origin)}
});

if(process.env.NODE_ENV!=='test')migrate().then(()=>server.listen(PORT,()=>console.log('Leaderboard listening on '+PORT))).catch(e=>{console.error('Migration failed',e);process.exit(1)});
