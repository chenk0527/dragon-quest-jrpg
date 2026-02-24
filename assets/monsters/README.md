# Monster Sprites

## Asset Configuration

Edit `ASSETS.useImages` in `game.js` to enable/disable images:
- `true` = Use PNG sprites (will fall back to emoji if images fail to load)
- `false` = Use emoji only (default)

## Expected Image Files

Place PNG files in this folder with the following names:

| Monster ID | Filename | Emoji Fallback |
|------------|----------|----------------|
| slimeGreen | slime_green.png | 🟢 |
| slimeBlue | slime_blue.png | 🔵 |
| slimeRed | slime_red.png | 🔴 |
| slimeGold | slime_gold.png | 🟡 |
| undeadSkeleton | skeleton.png | 💀 |
| undeadZombie | zombie.png | 🧟 |
| undeadGhost | ghost.png | 👻 |
| beastWolf | wolf.png | 🐺 |
| beastBoar | boar.png | 🐗 |
| beastBear | bear.png | 🐻 |
| dragonWhelp | dragon_whelp.png | 🐉 |
| dragonFire | dragon_fire.png | 🔥 |
| demonImp | imp.png | 👿 |
| demonDog | hellhound.png | 🐕‍🦺 |
| bugBee | bee.png | 🐝 |
| bugAnt | ant.png | 🐜 |
| plantMushroom | mushroom.png | 🍄 |
| humanBandit | bandit.png | 🏴‍☠️ |

## Free Asset Sources

1. **OpenGameArt.org** - https://opengameart.org
   - Search for "RPG sprites", "pixel art monsters"
   - Filter by CC0 or CC-BY licenses

2. **Kenney.nl** - https://kenney.nl/assets
   - High quality free assets
   - RPG characters, monsters, UI packs

3. **Craftpix.net** - https://craftpix.net/freebies/
   - Free sprite packs
   - Check license for each pack

4. **itch.io** - https://itch.io/game-assets/free
   - Filter by "Pixel Art" tag
   - Many free RPG asset packs

## Sprite Specifications

- **Size**: 32x32 or 64x64 pixels recommended
- **Format**: PNG with transparency
- **Style**: Consistent pixel art style
- **Color**: Limit palette for retro feel (optional)

## Using Custom Sprites

1. Download or create your sprite images
2. Rename them to match the expected filenames above
3. Place them in this folder
4. Set `ASSETS.useImages = true` in `game.js`
5. Refresh the game

If an image fails to load, the game will automatically fall back to the emoji icon.
