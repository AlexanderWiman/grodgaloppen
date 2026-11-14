# The Big Frog Race

Buildless browser game in Swedish. Serve `dist/` with a static HTTP server.

## Playing
- Hatch the mystery egg with five clicks, then customize the fairy.
- Race using Space or the jump button when the next platform glows green.
- Complete Astrid's two adventures under Äventyr. Each has six successful landings, checkpoint saving and a unique decoration reward.
- Grodvän lets you name, feed, pet and play with your frog. Friendship never decays. Activities refresh after a completed race.
- Mästerskap unlocks after three races and one adventure. Three rounds award 10/7/4/2 points. Tied champions share victory. Winners unlock a wearable wreath and a trophy.
- Gläntan has three decoration slots, earned gifts and a currency shop.

## Persistence and validation
Progress stays in this browser's `grodgaloppen` localStorage entry. New defaults merge into existing saves; existing coins, appearance and equipment are preserved. Adventure rewards are one-time; cups save between races.

Run `node tests/progression.cjs` from this directory. Covers quest rewards, duplicate protection, care, shops, ownership, save reloads, playable adventure completion/pause and three-round cup progression.

Files: app.js (character/editor/base state), race.js (shared hopping engine), astrid.js (trust and regular quests), world.js (adventures, care, cup and home).
