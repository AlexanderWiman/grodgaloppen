// Validation checks for the leaderboard API (no database needed).
process.env.NODE_ENV='test';
const {validScore,TRACKS}=await import('./index.js');
import assert from 'node:assert/strict';
const ok={player:'abcdefghijkl1234',track:'pond',adj:'Modiga',noun:'Näckros',time:21.4};
assert.equal(validScore(ok),null);
assert.equal(validScore({...ok,time:5}),'bad time');
assert.equal(validScore({...ok,time:NaN}),'bad time');
assert.equal(validScore({...ok,adj:'Elaka'}),'bad name');
assert.equal(validScore({...ok,noun:'<script>'}),'bad name');
assert.equal(validScore({...ok,track:'mars'}),'bad track');
assert.equal(validScore({...ok,player:'X'}),'bad player');
assert(TRACKS.includes('crystal'));
console.log('PASS: leaderboard validation (time range, word lists, tracks, player id).');
process.exit(0);
