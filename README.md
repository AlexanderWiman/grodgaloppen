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

## Several frogs
`frogs.js`: hatch up to six frogs (an egg costs 200 drops or comes as a reward), pick who races, frogs grow through four stages (Liten → Ung → Stor → Magisk groda) from races, adventures and care. Each stage adds stats, colours and a stronger ability. Personalities (Modig, Sömnig, Busig, Nyfiken, Glad) each give an ability through `frogAbilityMods()`. Friendship unlocks five short stories per personality. The active frog is mirrored into the old single-frog fields and synced back in `save()`. `node tests/frogs.cjs`.

## The Star Crown saga, album, medals and stickers
`saga.js` owns the Äventyr tab (sub-tabs Sagan, Småäventyr, Album, Medaljer). Five chapters (`sagaChapters`): read the intro → six-hop adventure in a new place (opens its track via `placeOpen`, gives an egg and a garden decoration) → finish one race on that track → chapter done. After all five: the coronation epilogue. Album pictures are drawn from `albumEntries` with the player's own frog and fairy. Medals (`medals`) are checked after races and chapters; stickers drop after races (40 %, 60 % on a win) and always after an adventure. New tracks: Slottsträdgården (royal), Undervattensriket (current), Molnriket (wind), Nattskogen (dark), Vintervärlden (ice). `node tests/saga.cjs`.

## Seasons, festivals, wardrobe and the daily surprise
`seasons.js`: the season follows the calendar (spring Mar–May, summer Jun–Aug, autumn Sep–Nov, winter Dec–Feb) and tints the garden, village and hero, with falling petals/leaves/snow. Each season Älvbyn prepares a festival (three tasks → celebration → a seasonal garden thing). Once a calendar day the frog has a small gift (no streaks, nothing lost by skipping). Wardrobe: fairy wings and clothes, frog hats and jewels (per frog). Ten new garden things. `node tests/seasons.cjs`.

## English
`i18n.js` translates the page live when English is chosen (EN/SV button in the header). The game is still written in Swedish; text is matched as exact phrases (`EN`), phrases with numbers (`#`), patterns with names (`EN_PATTERNS`), quotes and sentences. Character names stay Swedish. Anything inside `translate="no"` is left alone (leaderboard names must stay as the server's Swedish words). When you add Swedish text, add its English to `EN`. `node tests/i18n.cjs`.

## Menu, softer music and invites (survey 2, step 1)
- The menu has five groups (`navGroups` in app.js): Tävla (Lopp, Mästerskap), Teamet (Grodvän, Utrustning, Älvan), Äventyr (Äventyr, Drottning Astrid), Gläntan and Älvbyn. Groups with more than one page show small tabs in `#subNav`. The internal `tab` names are unchanged, and each group remembers its last open tab.
- The music is softer: low lead voices (`leadVoices`) with a slow attack, no high sparkle notes and a quieter echo. Each theme follows a 16-bar form (`musicForm`): A, A', a bridge with other chords and a second voice, A, then a short pause. The main tune stays the same, and the other phrases change every other round. `node tests/music.cjs` plays every theme with a fake audio context and checks that no note goes above 1000 Hz.
- "Bjud in en kompis" in the sidebar opens the phone's share sheet, or copies the link where sharing isn't available.
- Bump `CACHE` in sw.js whenever the HTML and scripts change together, so an old page never runs new scripts.

## Fishing, Tuss the troll and race weather (survey 2, step 2)
- **Fiska** is a tab under Gläntan (`dist/fishing.js`). You cast, wait until the float dips, press "Dra upp!" within about 1.4 s (1.1 s for the pike), then press while the fish swims through the net (`fishMeterPos`, `FISH_NET`). After three misses the fish gets away.
  - There are six kinds in `fishKinds`. The moonfish only bites at dusk, which uses the glade's day/dusk switch.
  - Each catch goes into `state.fishing.bucket` and gives 2 dewdrops. The first catch of each kind gives a bonus.
- **Tuss**, the troll under the bridge, has six wishes in `trollWishes`. Each one asks for certain fish from the bucket and gives dewdrops or a decoration for the glade (Trollsten, Brolykta and, last of all, Tuss himself). Once you are friends, he peeks out under the glade bridge.
- **Weather**: `pickWeather` sometimes adds rain or snow to a race. Rain (25 %) gives a slightly narrower green field (×0.97) and +1 drop per good hop. Snow (only in winter and on the winter track) gives a slower pointer and shorter hops, and the rivals slow down too. There is no weather in the crystal cave or under water. `weatherOverride` forces a weather in tests, and `node tests/race.cjs` checks that weather keeps races fair.

## Mushroom cottage, the village shop and twelve frogs (survey 2, step 3)
- **Svamphuset** is a tab under Gläntan, and tapping the cottage in the glade opens it too (`dist/house.js`).
  - There are 12 pieces of furniture in `houseFurniture`. You buy each once with dewdrops, then drag, resize, mirror or store it, the same way as in the glade.
  - Wall and floor colours are free.
  - The aquarium shows up to three fish kinds you have caught, and the painting shows your racing frog.
- **Butiken** is a tab under Älvbyn (`dist/shop.js`). You put fish from the bucket and berries from the glade on the shelf.
  - While the shelf has goods, a customer comes about every 40 s (`SHOP_EVERY`), also while you are away. At most three wait, and never more than there are goods.
  - Customers have favourites (`likes`) and pay 1.5× for them.
  - Every fifth sale gives a shop star and 25 dewdrops.
  - Tuss shops too once he is your friend.
  - `shopTick(now)` takes the time as a parameter so tests can fast-forward.
- **Up to twelve frogs** (`MAX_FROGS` in frogs.js).
- `node tests/home.cjs` covers furniture, the shop, stars, twelve frogs and saving.

## Skogsdrottningen – Astrid's stepmother
- She doesn't live in Älvbyn. She visits on **two random days every week** (`queenVisitDays`, which gives the same days for everyone). On those days she shows a banner on the race tab and gets her own tab under Äventyr (`dist/queen.js`, images in `assets/skogsdrottningen-*.webp`).
- **Gift:** one per visit, rotating through `queenGifts`: dewdrops, an emerald lantern and a golden mirror for the cottage, and an emerald tree for the glade.
- **Task:** one per visit (`queenTasks`), and it has to be done the same day. You win a race, catch 3 fish, sell 2 goods, make 5 perfect jumps, or care for your frog 3 times. Progress counts through the real game actions, because `afterRaceHooks` and wrappers around `fishCatch`, `shopSell` and `careAction` report to her. Each task gives +60 dewdrops, and after three tasks she gives a framed portrait of herself for the cottage.
- **Fika:** on visit days she sits in the cottage and comments on how it is furnished (`queenFikaLine`).
- Tests use `queenClock` and `queenOverride` to control the day. `node tests/queen.cjs` covers the visit days, the gift, all five tasks, the fika lines and saving.

## Skogsdrottningens slott, music picker and less scrolling (survey 3, step 1)
- **The castle** (`Äventyr › Slottet`, in `dist/queen.js`) opens the first time she invites you on a visit day ("Följ med till mitt slott"), and then stays open.
  - On the first visit she gives you **Skogsflöjten**. Blowing it makes her visit today (`state.queen.calledDay`), with a gift and a task. Afterwards the flute rests for three days (`QUEEN_FLUTE_REST`).
  - She tells one new **story about when Astrid was little** each day you visit (`astridStories`, eight in all, +15 dewdrops each). The stories you have heard can be read again, and after all eight you get *Astrids sagobok* for the cottage.
  - The castle has its own music theme, `emerald`.
- **Music picker:** the 🎵 button opens a menu with Off, Följer platsen, or any of the 15 themes (`state.musicChoice`, `musicTheme()` and `musicNames` in audio.js).
- **Phones:** on phones the race tracks and the glade and cottage collections are now swipeable rows. The race tab no longer shows the sidebar at the bottom, the rivals section folds open, and the hero image is shorter. That makes the race tab about 1,340 px instead of 4,030 px, and the glade about 1,500 px instead of 4,450 px.
- **Fishing line:** the rod sits in the fairy's hand and the line runs from its tip to the float. `fishDrawLine()` measures the real layout and runs again when the window is resized.
- On `localhost` the service worker never serves from its cache, so a local preview always shows fresh files.

## Harder races, superpowers, more weather and Tuss on adventures (survey 3, step 2)
- **Harder:** `RIVAL_BASE` went from 4.0 to 4.2, and a fourth level, **Mästare**, was added (rivals ×1.16, +50 % dewdrops). A normal player now wins about 55–60 % on Lagom instead of about 70–76 %. Månskensmyren's hop bonus went from 4 to 4.4 so it isn't the odd one out.
- **Superpowers** (`powerKinds`, `powerRate`): sometimes one waits over the next landing spot, and a good landing picks it up.
  - ⚡ **Blixtfart:** ×1.5 speed for 3 s.
  - 🫧 **Bubbelsköld:** the next miss costs no speed.
  - 🍀 **Klöverlycka:** a wider field for 3 hops.
  - 🌟 **Stjärnhopp:** the next hop is golden, without a narrower field.
- **Weather:** fog (the green field shows only up close), thunder (slippery, and lightning briefly startles the rivals) and the rare rainbow (every third hop golden, +1 drop) join rain and snow. `node tests/race.cjs` checks that every kind keeps a normal player's win rate within 20 points of normal weather.
- **Tuss on adventures:** once you have three hearts with him, he comes along on adventures. The green field is 15 % wider there, and afterwards he gives you a fish for the bucket or 15 dewdrops (`tussJoins`, `tussAdventureFind` in fishing.js).
- The **Slottet** tab now always shows. Before her first invitation it says when Skogsdrottningen comes next and how to get to the castle.

## Bug fixes: wings, frog hats and the castle picture
- The fairy's wings sit on her back. `wingShape()` moves them from head height down to the shoulders, and they are still drawn behind her.
- The frog's hat rests on its head between the eyes. `frogHatArt()` is drawn before the eyes so they peek over the brim, and the cap and beanie are lifted less than the other hats. Jewels (bow tie, pearls, bell, medallion) hang under the chin instead of across the mouth.
- The castle is a painted illustration (`assets/skogsdrottningen-slott.webp`) in the same style as Skogsdrottningen's portraits. It was made with Higgsfield (GPT Image 2.5) from a text prompt only, without uploading the portraits. The family chose it out of three options. The waterfall falls from a cliff into a pool.

## Things that unlock as you play, and a growing home (survey 3, step 3)
- **Progress** (`dist/progress.js`): new parts open one by one as you play. Once a milestone has been reached it stays open (`state.unlocked`). `checkUnlocks()` runs in `render()` and shows "Nytt i spelet!", and the glade shows the three nearest goals with progress bars (`goalsHTML`). Locked parts show what opens them (`lockedHint`).

  | Milestone | Opens when … |
  |---|---|
  | Tapetmönster | 4 furniture |
  | Grannar på fika | a table and a chair |
  | Fler möbler | 8 furniture |
  | Verkstaden | 10 shop sales |
  | Beställningar | 3 things crafted |
  | Bävrarna | 10 furniture and 3 shop stars |
  | Grodhus | 3 frogs |
  | Fler fiskar | 20 fish caught |
  | Eldflugespelet | the firefly adventure is done |

- **The cottage** (house.js):
  - Five wallpaper patterns.
  - Eight more pieces of furniture (`tier:2`).
  - Neighbours on fika: once per neighbour and day, +10 dewdrops, and they comment on the furniture they like.
  - The beavers Bo and Bea build an upper floor for 250 dewdrops in ten minutes of real time (`houseStartBuild`, `houseBuildCheck`). Items remember which floor they are on (`lvl`).
- **Frog houses:** each frog can have a house in the glade, in its own colour and with a name sign, for 60 dewdrops (`frogHouseBuild` in frogs.js). Moving it back to the collection and out again is free.
- **The shop:**
  - The workshop makes berry jam, fish pie and boot planters (`shopRecipes`).
  - Neighbours place one order a day, with at most two open at once. Orders never expire and pay about double.
- **Fish:** after 20 catches you can also get crucian carp and zander. In winter the pond freezes, and the arctic char bites through the ice hole.
- **Fånga eldflugor** (`dist/fireflies.js`) is a 20-second game.
  - Golden fireflies count three.
  - Each firefly is worth a dewdrop, at most 40 a day.
  - After 30 fireflies you get a firefly jar for the glade.
- `node tests/progress.cjs` goes through all nine unlocks and every new part.

## More detail on the frog and the fairy
- `frog()` in app.js shares a set of gradients and patterns (`frogDefs`): volume shading (`fgShade`), skin speckles (`fgDots`), a soft ground shadow, shiny eyes and a blended belly.
  - These overlays are white and dark green, so they work on every frog colour.
  - The legs are drawn behind the body, and the frog has toes, nostrils and eyebrow ridges.
- The fairy gets shading on her face and cheeks, a nose, a shine in her hair, folds and shading in her clothes, shadows on her arms, and hands. She casts a shadow on the frog's back.
- The wings have sheen and veins (`wingShape` in seasons.js).
- Frog hats are drawn over the green eye domes but under the eye whites. Each hat has its own offset (`lift` in `frogHatArt`), so its bottom rests on the head between the eyes.
- The dragonfly's front wings point up and out, and its hind wings slightly down.
- **Background texture:**
  - The start picture (`scene()`) has a tree line, sun rays, grass tufts, flowers, cattails and a fine grain (`#grain`).
  - The tracks, glade, cottage, pond, village and portrait get a soft grain and vignette from CSS (`::before`/`::after` with an inline SVG noise image).
