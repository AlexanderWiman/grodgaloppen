# The Big Frog Race

Buildless browser game in Swedish. Serve `dist/` with a static HTTP server.

## Playing
- Hatch the mystery egg with five clicks, then customize the fairy.
- Race using Space or the jump button when the next platform glows green. Fart widens the green window, Hopp lengthens each hop, Uthållighet softens misses. Rhythm varies and speeds up in the final stretch. Each track has a twist: drifting lily pads (green window moves), golden mushrooms every fourth hop (narrow window, double hop), fluttering firefly (pointer changes speed). Rivals Klöver, Mossa and Pärla have their own pace and appear on track. Three hits in a row give Grodflow. Sound can be muted in the header. Rival speed is `RIVAL_BASE` in race.js.
- Complete Astrid's two adventures under Äventyr. Each has six successful landings, checkpoint saving and a unique decoration reward.
- Grodvän lets you name, feed, pet and play with your frog. Friendship never decays. Activities refresh after a completed race.
- Mästerskap unlocks after three races and one adventure. Three rounds award 10/7/4/2 points. Tied champions share victory. Winners unlock a wearable wreath and a trophy.
- Gläntan is a large day/dusk garden with a pond, bridge, mushroom cottage and fireflies. Up to 24 decorations can be dragged, rotated, resized or moved with arrow keys. Legacy slots migrate automatically. Plant and water berries, harvest after one minute, feed the frog, or invite Astrid.

## Persistence and validation
Progress stays in this browser's `grodgaloppen` localStorage entry. New defaults merge into existing saves; existing coins, appearance and equipment are preserved. Adventure rewards are one-time; cups save between races.

Run `node tests/progression.cjs` from this directory. Covers quest rewards, duplicate protection, care, shops, ownership, save reloads, playable adventure completion/pause and three-round cup progression.

Files: audio.js (sound effects and generative background music), app.js (character/editor/base state), race.js (shared hopping engine), astrid.js (trust and regular quests), world.js (adventures, care, cup and home).

Garden checks: `node tests/garden.cjs` covers migration, ownership, bounds, collection preservation, planting, growth, feeding and saving.

## Älvbyn
Mira (fairy) and Tagge (hedgehog) are initial neighbours. Help one neighbour to invite Tilda (mouse), and three to invite Vide (fairy). Each has a conversation and one-time quest. The square sells berries and welcomes Astrid. Village progress is stored with the existing save. Run `node tests/village.cjs` for unlocking, quest prerequisites, consumption and duplicate reward checks.

## Race balance
Run `node tests/race.cjs` to play the real engine with simulated players (`N=30 node tests/race.cjs` prints the table without assertions while tuning).

## Publishing
Pushing to `main` runs all tests and deploys `dist/` to GitHub Pages via `.github/workflows/pages.yml`.

## Music, difficulty and home screen
- Background music is generated live with Web Audio (no files). Each place has a theme in `musicThemes` (audio.js); `setMusic(name)` crossfades. Music and sound effects have separate toggles in the header.
- Difficulty (Lätt/Lagom/Svår) only scales rival speed (`difficulties` in race.js); Svår pays 25 % more. `node tests/race.cjs` checks the ordering.
- `manifest.webmanifest` + `sw.js` make the game installable and playable offline. The service worker serves from cache and refreshes in the background, so a new deploy shows on the next start. Add new files to `FILES` in sw.js.

## Tracks, rivals and leaderboard
- Tracks are data in `trackWorlds` (race.js): pad style, twist (`twistRules`), music, surprise obstacle and optional `unlock`. Keep the order stable – saves store best times by index.
- Surprise obstacles appear now and then in races (narrower window, bonus drops when cleared, a longer bump when missed).
- Rivals Klöver, Mossa and Pärla have pace curves, lines during the race and a head-to-head record (`state.rivalRecord`).
- Online leaderboard: `server/` is a small Node + Postgres API on Railway (project `grodgaloppen-topplista`, service `api`). Names come only from `server/names.json` (copied in `dist/leaderboard.js`); the server rejects anything else, times under 12 s and more than 20 submissions per 10 minutes. Deploy with `cd server && railway up -s api`. Allowed origins: `ALLOWED_ORIGINS`.
