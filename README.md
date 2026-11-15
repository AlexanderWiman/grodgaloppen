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

The village map (`villageMapHTML` in `dist/village.js`) is a little storybook map: dirt paths run from the square to every place, and each place is a real `<button>` with a wooden SVG signpost beside it. Tap the square to scroll down to the square's stalls and festival, a house to talk to that neighbour, an empty plot to see who may move in, the shop to go to Butiken, and the signpost "Till gläntan" to walk home. Places sit at `villageSpots` (desktop) and `villageSpotsPhone` (a taller map under 550px), and the paths are drawn from the same numbers. `node tests/villagemap.cjs`.

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

## The fairy's look
- She sits upright with level shoulders, small puff sleeves and a short neck. Both arms start at the shoulders: one hand rests on the frog's back and the other on its head (the fishing rod sits in that hand). All outfits in `outfitShape()` use the same torso.
- **Hair has two layers:**
  - `hairBackShape()` is drawn behind the neck and shoulders, so long hair falls down both sides of the back.
  - `hairShape()` is drawn in front: a side-parted fringe, locks that frame the face, shine and shadow strands, and eyebrows.
  - Short hair shows the ears.
- **Eyes** (`eyeShape()`) have a white, an iris with a pupil and catch-light, an upper lid line and a lash. The iris colour is `state.eyeColor` (default brown).
- **Hairstyles:** short, long, curly, braid, ponytail, pigtails, bun, two braids, afro puffs, straight bob and long wavy. Each one is a back layer and a front layer, and `mirrorX` mirrors the side pieces.
- **Hair ties and clips:** ties and bands follow `state.hairBand`, which is the outfit colour, none, or one of five colours (`hairBandColour()`). Styles without ties get a little bow clip once a colour is chosen.
- **Eyes and mouths:**
  - Eyes: winking, glancing sideways and long lashes join round, almond and happy.
  - Mouths: cheeky grin, tongue out, cat mouth and gap-toothed join the old four.
  - Eye colour: six to choose from (`state.eyeColor`).

## Jul i Älvbyn (survey 4, step 1)
Christmas lives in `dist/jul.js` and runs from 1 December to 6 January (`holidays` list, `holidayFor()`). Christmas belongs to the year it started (`julYear()`), so each Christmas starts fresh in `state.jul[year]`.
- **Advent calendar** (in the glade): 24 doors in a mixed-up order (`adventOrder`).
  - Today's door and every earlier door can be opened; doors for later days stay shut (`julToday()`, `julCanOpen()`). Missing a day costs nothing.
  - Each door gives a bauble for the tree and dewdrops, berries or a sticker (`adventGifts`).
  - Door 13 (Lucia) gives the fairy a Lucia crown (`state.headwearOwned`). Door 24 gives the star for the tree and a Santa hat for the frog.
- **Christmas tree:** it stands in the glade and is decorated in its own card under the calendar. Choose a bauble, then tap one of 12 places (`julHang`, `julTakeDown`). Ten baubles the first time give 50 dewdrops and a tomte for the glade to keep (`julTreeCheck`).
- **Skogsdrottningen:** her first visit at Christmas brings a winter coat for the fairy (`outfit-winter`, a gift item in `wardrobe` that cannot be bought).
- **Look and sound:**
  - Lights under the header, over the glade and on the village square, and snow on the glade's hills (`body[data-holiday="jul"]`, `julSnowHTML`).
  - A Christmas tune (`musicThemes.jul`) plays in the glade, the village and the meadow when the music follows the place. It is also in the music picker.
- A banner on the race page points to today's door.
- **Sleeping frogs:** all year, when it is night in the glade, the frogs sleep in beds in the cottage (`sleepingFrogsHTML`). The cottage has its own Godnatt / God morgon button.
- **Trying Christmas before December:** on a local preview, `?datum=2026-12-13` pretends it is another day (`gameDate()` in seasons.js). It only works on localhost; tests set `gameClock`.
- Christmas is open to everyone with a hatched frog. It is a time of year, not a milestone.

## The fairy's wardrobe and sticker memory (survey 4, step 2)
- **She sits on the frog:** `fairyFrontShape()` in seasons.js is drawn after the frog's body (only when there is a rider). It holds her lap, the near leg hanging down the frog's side with its shoe, the hand resting on the frog's back, and her bag. Before this she sank into the frog's back and her legs never showed.
  - The ball gown gets a wider lap. Overalls give trousers. The winter coat keeps its white trim.
- **New wardrobe items** (bought with dewdrops, `wardrobe` in seasons.js):
  - Clothes: tunic with belt, flower dress and knitted jumper (`outfitShape()`).
  - Shoes: slippers (free), red shoes, wellies, ballet shoes, winter boots and sparkly shoes.
  - Glasses (`glassesShape()`, over the eyes): round, sunglasses, heart and star.
  - Bags: flower basket, shoulder bag and pearl bag.
- **Wardrobe layout:** the buttons sit side by side, and a small picture of the fairy and frog stays at the top of the wardrobe while scrolling (`.wardrobePreview`).
- **Sticker memory** (`dist/memory.js`, tab Gläntan → Memory):
  - It opens after 8 stickers (milestone `memory`).
  - There are 6 or 8 pairs, built from the player's own stickers first.
  - Dewdrops: 6 per pair minus 2 for each extra turn, at least 10, at most 40 a day.
  - The fewest turns for each size is kept as a record.

## The secret forest, Stora Gorm, more Astrid stories, the rose garden and the kitchen garden (survey 4, step 3)
- **The secret forest** (`dist/skogen.js`, Äventyr → Hemliga skogen) opens after 25 won races (milestone `secretforest`).
  - Ugglan Hedvig asks one riddle a day (`owlRiddles`, 12 in turn). Wrong answers can be tried again. The first try gives 25 dewdrops, a later try 10.
  - Räven Ruska hides in one of six places in the picture (`foxSpots`). Find him in three tries for 20 dewdrops.
  - Each success gives a heart. At five hearts the animal moves a home into the glade (Hedvigs uggleholk, Ruskas lya).
- **Stora Gorm** (milestone `challenger`: 3 wins on Mästare, counted in `state.masterWins`):
  - A card on the race page starts a race where Gorm takes Mossa's place (`activeRun={kind:'challenge'}`, `challengeRivals()`).
  - He races at Mästare speed with a steady pace of 1.15 (`gormDifficulty` is kept out of `difficulties`, so it never shows in the picker).
  - The first win gives 150 dewdrops and Gorms pokal for the glade.
  - Measured with the race bot (60 races each):
    - Skilled timing alone wins about 1 in 20.
    - Skilled timing with all equipment wins about 40 %.
    - A strong, fully equipped frog wins about 50 %.
- **Astrid stories:** six more (14 in all). The story book still comes after eight.
- **The rose garden** at the castle: water one of five bushes a day. Three waterings make a bloom (30 dewdrops), and five blooms give Smaragdrosen for the glade.
- **The kitchen garden** (`dist/tradgard.js`, Gläntan → Trädgården) opens with 6 pieces of furniture in the cottage (milestone `yard`).
  - It has six beds. Tap to plant the chosen crop, tap to water it, and tap to harvest when it is ripe (`yardTap`).
  - Crops: carrots 3 min, strawberries 5 min (4 berries), sunflowers 10 min, pumpkins 20 min.
  - Ten harvests give a scarecrow for the glade.
- **Frogs play in the glade:** with more than one frog, the others hop around the glade. Tap one and it plays with your frog. Once a day per frog, that gives +2 friendship to the other frog and +1 to yours (`frogPlay`).

## A more useful garden (survey 5)
The family asked for everything they grow to be usable. Harvests now go into the **pantry** (`state.yard.pantry`) instead of turning straight into dewdrops.
- **More crops:**
  - Radishes are there from the start.
  - Peas open after 3 harvests and potatoes after 6 (`yardCrops[...].from`). The four old crops stay open.
  - Each harvest gives 1–4 of the crop (`yield`).
- **Quick buttons:** Skörda allt, Vattna allt and Plantera i alla tomma (`yardAll`).
- **The kitchen** sits in the cottage, under the room. It has seven dishes (`yardDishes`): radish salad, carrot soup, pea soup, pumpkin soup, pancakes with strawberries, strawberry cake and sunflower cookies.
  - Food can be shared with the frog for +6 friendship (`feedFrog`).
- **The shop** sells straight from the pantry:
  - `shopHave`, `shopTake`, `shopGive` and `shopGoodArt` are wrapped for goods marked `pantry`.
  - Customers have new favourites.
  - Village orders can ask for garden food (`yardOrderGoods`).
- **Neighbours:**
  - One gift a day to each neighbour who lives in the village (`giveNeighbour`).
  - Cooked food gives 3 friendship, a favourite 2 and anything else 1, plus 10 dewdrops as thanks.
- **Animals** open after 8 harvests (milestone `yardanimals`):
  - The hen house costs 150 dewdrops. It lays an egg every 15 minutes, with at most 4 waiting.
  - The rabbit Nos costs 120 dewdrops. Nos gets one carrot a day, which moves every growing bed 3 minutes closer to ripe (`feedRabbit`).

## Trips, berry picking, birthdays and New Year (survey 5)

The family asked to see the journey between places instead of landing in the shop straight from the cottage. They also asked for birthday parties in the glade, more holidays and a berry-picking game on a timer.

- **Trips between places** (`resor.js`, loaded after `app.js` because it wraps `render()`): when the fairy moves between the glade, the cottage, the garden, the pond, Bärbacken, Älvbyn, the shop, the castle or the secret forest, the frog hops along a path for 1.1–2 seconds.
  - Tapping skips the trip.
  - Trips can be turned off with "Visa inte resor" or in the 🎵 menu.
  - They are skipped when the device asks for reduced motion.
  - Tabs that are not places, such as races and the wardrobe, keep the fairy where she was.
- **Berry picking** (`kalas.js`, tab "Bärplockning" in the glade) opens after **5 won races** (milestone `berries`). Berries pop up on nine bushes for 30 seconds:
  - Blue berries give 1 point and golden berries 3. Green berries are not ripe.
  - Points become dewdrops, at most 30 a round and 40 a day.
  - The berries go to the pantry, and the kitchen can bake a blueberry pie with them.
- **Birthdays:** under "🎂 Födelsedagar" in the glade, up to 8 names and dates can be added. 29 February is celebrated on the 28th in other years.
  - On the day, the glade has bunting, balloons, a cake and the neighbours.
  - "Sjung för …" gives 50 dewdrops once a year per person.
  - The first party ever also gives the frog a party hat and the glade a birthday cake.
- **New Year** (31 December–1 January, on top of Christmas): tap the sky in the glade to shoot fireworks. Twelve rockets give 50 dewdrops and a star fountain, once a year.

To test the dates locally, open `http://localhost:8765/?datum=2026-12-31`. Tests: `tests/kalas.cjs`.

## Shading on phones

The gradients that every frog picture shares are also kept in a zero-size picture at the top of the page. Without that copy, browsers drew them as nothing whenever the first frog picture was hidden, which happens on phones because the sidebar is hidden there.

The family tried a paper-craft redesign of the fairy and the frog (#29). They then asked for both to get their old look back (#31), so only this fix remains from that work.

## Festival scenes

The family said the festival only showed a mouse and their own figure hopping back and forth. Each season's festival now has its own painted paper-craft scene, made with Higgsfield in the same style as the fairy:

- Spring: Blomsterfesten.
- Summer: Sommarmarknaden.
- Autumn: Lyktfesten.
- Winter: Snöstjärnefesten.

All four scenes show the whole village by the pond: Tagge, Tilda, Mira, Vide and the frogs. The pictures are `dist/assets/fest/<season>.webp`, about 110 kB each, and they are cached for offline play.

**In the game**
- The player's own fairy and frog (`frog()`) stand on the empty path in front.
- Small lights twinkle in the scene.
- After the festival, "Titta på festen" in the village shows the scene again, with no new rewards.

**Code**
- `festSceneHTML()` builds the scene and `showFestivalScene(r)` shows it, both in `seasons.js`.
- Tests are in `tests/fest.cjs`.

**Festival films:** Lyktfesten also has a 30-second film made with Higgsfield (Seedance 2.5, 480p, about 1.7 MB) at `dist/assets/fest/autumn.mp4`. It is listed in `festFilms` in `seasons.js`.
- The still picture is the poster, so the scene shows at once and also works without internet.
- The film plays muted in a loop. 🔈 turns on its sound and pauses the game music, and tapping the film shows it full screen.
- `sw.js` lets `.mp4` files and range requests go straight to the network, because the cache cannot store films that are loaded in parts.

## Grodornas sovrum

The mushroom cottage has a bedroom with a little bed for every frog (`dist/sovrum.js`). It opens when the family has **two frogs** (milestone `bedroom`). A "Sovrummet" button sits next to the floor buttons.

- **Night** (☾ Godnatt, the same night as in the glade): the frogs sleep in their beds wearing nightcaps, and "z" floats up from them. Tapping a sleeping frog tucks it in, which gives +1 friendship once a day per frog.
- **Day** (☀ God morgon): the beds are made and the frogs sit on them. Tapping a frog makes it bounce on the bed.
- Once the bedroom is open, the frogs no longer sleep downstairs.

Tests are in `tests/sovrum.cjs`.
## Taking frog gear off

Gear the family has bought in the gear shop can be taken off and put on again. A worn item shows "✓ På · Ta av", and one that is off shows "Sätt på". Only gear that is on gives its bonus and shows on the frog (goggles, scarf). The game saves which items are off in `state.gearOff`, and `gearOn(id)` and `toggleGear(id)` are in `app.js`. Tests are in `tests/gear.cjs`.
