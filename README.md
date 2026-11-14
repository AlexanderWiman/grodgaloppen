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

Files: app.js (character/editor/base state), race.js (shared hopping engine), astrid.js (trust and regular quests), world.js (adventures, care, cup and home).

Garden checks: `node tests/garden.cjs` covers migration, ownership, bounds, collection preservation, planting, growth, feeding and saving.

## Älvbyn
Mira (fairy) and Tagge (hedgehog) are initial neighbours. Help one neighbour to invite Tilda (mouse), and three to invite Vide (fairy). Each has a conversation and one-time quest. The square sells berries and welcomes Astrid. Village progress is stored with the existing save. Run `node tests/village.cjs` for unlocking, quest prerequisites, consumption and duplicate reward checks.

## Race balance
Run `node tests/race.cjs` to play the real engine with simulated players (`N=30 node tests/race.cjs` prints the table without assertions while tuning).

## Publishing
Pushing to `main` runs all tests and deploys `dist/` to GitHub Pages via `.github/workflows/pages.yml`.
