# Topplista – API

Node 20 + Postgres on Railway. Endpoints:

- `GET /health`
- `GET /api/names` – the word lists players pick names from
- `GET /api/top?track=pond&player=<id>` – top 10, total and the player's own rank
- `POST /api/score {player, track, adj, noun, time}` – keeps the best time per player and track

`node test.js` checks validation without a database. Deploy: `railway up -s api` from this folder.
