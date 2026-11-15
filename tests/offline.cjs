// Every script and stylesheet the page loads must be in the service worker's offline list.
const fs=require('fs'),assert=require('node:assert/strict');
const idx=fs.readFileSync('dist/index.html','utf8'),sw=fs.readFileSync('dist/sw.js','utf8');
const files=[...idx.matchAll(/(?:src|href)="([a-z0-9._-]+\.(?:js|css))"/g)].map(m=>m[1]);
assert(files.length>20,'found the scripts');for(const f of files)assert(sw.includes(`'${f}'`),f+' is missing from sw.js FILES');
console.log('PASS: every script and stylesheet works offline.');
