# 🎨 SpriteGen

Procedural pixel art sprite generator for 2D games. Generate characters, monsters, buildings, vehicles, plants, items, and props with animation frames.

## Features

- **9 sprite categories** with 10+ variants each
- **Animation frame generation** — walk cycles, idle bounce, wing flaps
- **Spritesheet export** — combine frames into game-ready sheets
- **Phaser 4 integration** — one-line sprite/animation creation
- **Standalone** — no dependencies, pure Canvas 2D
- **Randomized palettes** — 12 color themes, infinite combinations

## Quick Start

```html
<script type="module">
import { SpriteGen } from './src/spritegen.js';

const gen = new SpriteGen();

// Generate a single sprite
const canvas = gen.generate('char_side', { variant: 'warrior' });
document.body.appendChild(canvas);

// Generate animation frames
const frames = gen.generateAnimFrames('char_side', { variant: 'ninja', frames: 4 });
const sheet = gen.createSpritesheet(frames);
document.body.appendChild(sheet);
</script>
```

## Categories

| Category | Size | Variants |
|----------|------|----------|
| `char_side` | 32×48 | warrior, wizard, archer, ninja, robot, alien, viking, pirate, knight, cyborg |
| `char_top` | 32×32 | adventurer, mage, ranger, thief, cleric, merchant, noble, farmer, bard, monk |
| `monster_side` | 40×40 | slime, dragon, skeleton, goblin, ghost, spider, bat, golem, demon, plant |
| `monster_top` | 40×40 | blob, spider, hydra, serpent, mushroom, crab, wasp, worm, eye, fungus |
| `building` | 48×48 | house, castle, tower, shop, barn, temple, hut, windmill, lighthouse, factory |
| `vehicle` | 48×32 | car, truck, tank, spaceship, boat, motorcycle, helicopter, sub, mech, train |
| `plant` | 32×48 | tree, pine, palm, flower, bush, cactus, mushroom, vine, seaweed, crystal |
| `item` | 24×24 | sword, axe, bow, staff, shield, potion, gem, key, ring, scroll, coin, heart |
| `prop` | 32×32 | chest, barrel, crate, torch, fence, sign, rock, well, campfire, tombstone |

## Phaser 4 Integration

```javascript
import { SpriteGen } from './spritegen.js';

const gen = new SpriteGen();

// In your Phaser scene:
class GameScene extends Phaser.Scene {
  create() {
    // Static sprite
    const warrior = gen.toPhaserSprite(this, 100, 200, 'char_side', { variant: 'warrior' });
    
    // Animated sprite (walk cycle)
    gen.toPhaserAnimSheet(this, 'ninja_walk', 'char_side', { variant: 'ninja', frames: 4 });
    const ninja = this.add.sprite(200, 200, 'ninja_walk');
    ninja.play('ninja_walk_walk');
    
    // Monster with bounce animation
    gen.toPhaserAnimSheet(this, 'slime_bounce', 'monster_side', { variant: 'slime', frames: 6 });
    const slime = this.add.sprite(300, 200, 'slime_bounce');
    slime.play('slime_bounce_walk');
  }
}
```

## API

### `new SpriteGen()`
Create a new generator instance.

### `gen.generate(category, opts)`
Generate a single sprite canvas.
- `category` — one of the 9 categories
- `opts.variant` — specific variant (or random if omitted)
- `opts.palette` — array of 2-3 hex colors
- `opts.skin` — skin color hex
- Returns `HTMLCanvasElement`

### `gen.generateAnimFrames(category, opts)`
Generate animation frames.
- `opts.frames` — number of frames (default: 4)
- Returns `HTMLCanvasElement[]`

### `gen.createSpritesheet(frames, padding)`
Combine frames into a single spritesheet canvas.
- Returns `HTMLCanvasElement`

### `gen.toPhaserSprite(scene, x, y, category, opts)`
Create a Phaser sprite directly.
- Returns `Phaser.GameObjects.Sprite`

### `gen.toPhaserAnimSheet(scene, key, category, opts)`
Create animated Phaser spritesheet texture + animation.
- `opts.frameRate` — animation speed (default: 8)
- Returns texture key string

### `gen.categories()`
List all available categories.

### `gen.variants(category)`
List variants for a category.

### `gen.size(category)`
Get `[width, height]` for a category.

## Animation Types

| Category | Animation |
|----------|-----------|
| `char_side` | Walk cycle (leg swing, arm swing, body bob) |
| `char_top` | Walk cycle (arm swing) |
| `monster_side` | Bounce / wing flap (bat) |
| `monster_top` | Subtle movement |
| `building` | Static |
| `vehicle` | Static |
| `plant` | Static |
| `item` | Static |
| `prop` | Static |

## License

MIT
