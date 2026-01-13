/**
 * Global Constants
 */
const GRAVITY = 0.08;
const FRICTION = 0.4;
const SCROLL_SPEED_SKATING = 1.4;
const SCROLL_SPEED_BREAKING = 0.4;
const SCROLL_SPEED_SPEEDING = 2.0;
// TILE_WIDTH AND TILE_HEIGHT are shared between the functions createTile() and createPlatforms()
// We therefore define them as global constants.
// The natural would otherwise be to define them inside the createTile() and createPlatforms() functions.
const TILE_WIDTH = 16;
const TILE_HEIGHT = 16;
const DIFFICULTY_STAGES = [
  {
    time: 0,
    gapMin: 32,
    gapMax: 48,
    tilesMin: 2,
    tilesMax: 14,
    platformYMin: 80,
    platformYRange: 120,
  },
  {
    time: 5 * 60,
    gapMin: 40,
    gapMax: 64,
    tilesMin: 3,
    tilesMax: 16,
    platformYMin: 80,
    platformYRange: 120,
  },
  {
    time: 10 * 60,
    gapMin: 48,
    gapMax: 80,
    tilesMin: 2,
    tilesMax: 12,
    platformYMin: 80,
    platformYRange: 120,
  },
  {
    time: 15 * 60,
    gapMin: 56,
    gapMax: 64,
    tilesMin: 2,
    tilesMax: 16,
    platformYMin: 80,
    platformYRange: 120,
  },
  {
    time: 20 * 60,
    gapMin: 64,
    gapMax: 96,
    tilesMin: 1,
    tilesMax: 10,
    platformYMin: 80,
    platformYRange: 120,
  },
];

/**
 * Global Mutable Variables
 */
let paused = false;
let time = 0;
let stars;
let platforms;
let angel;
let sparkles;
let skateboardSparkle;
let scrollSpeed = SCROLL_SPEED_SKATING;

/**
 *  Note, also global but defined in other files...
 *  - The player variable is defined in player.js file.
 *  - The title variable is defined in title.js file.
 *  Why? Because of the "object literal for one, factory for many" principle.
 */

/**
 * Global Factory Functions
 *
 * Create objects that appear as multiple instances (stars, platforms, etc.).
 *
 * Some words about the ideas used in our factory functions:
 *
 * The Parameter Object Pattern is used to make the functions more flexible and easier to read.
 * This gives us:
 * - Self-documenting call sites. The meaning of the parameters in function calls becomes obvious.
 * - Optional parameters become trivial. No more null, null, undefined, undefined.
 * - Stable APIs over time. You can add new options without breaking callers.
 * - Named arguments (in languages that lack them). JavaScript doesn’t have named parameters — this pattern emulates them.
 * Why? Our factory functions don't have optional fields which could be a reason to use it.
 * Instead, we use it because we expect them to evolve over time and want it to be easy to call them.
 */

// No need to load the sprite sheet multiple times.
const starSpriteSheet = loadOnce("./images/star-sprite-sheet.png");

function createStar(options = {}) {
  const { small = false } = options;

  const FRAME_WIDTH = 7;
  const FRAME_HEIGHT = 7;
  const TOTAL_FRAMES = 6;
  const TICKS_PER_FRAME = 30;
  const BLINK_PROBABILITY = 0.8;
  const LAST_X = -10; // The last x value before the star is wrapped around to the left side of the screen.
  const RESPAWN_X = SCREEN_WIDTH + 10; // The x value where the star re-enters the right side of the screen.

  // Different values for each star to make a more dynamic and interesting.
  const blinking = small ? false : Math.random() < BLINK_PROBABILITY;

  // Small stars move slower than big stars to give more depth to the background.
  const speedFactor = small
    ? Math.random() * 0.02 + 0.01
    : Math.random() * 0.2 + 0.1;

  // Mutable variables
  let animationTick = 0;
  // Small stars have a fixed frame, just a tiny 1 px square.
  let animationFrameIndex = small
    ? 7
    : Math.floor(Math.random() * TOTAL_FRAMES);
  let x = Math.floor(Math.random() * SCREEN_WIDTH);
  let y = Math.floor(Math.random() * SCREEN_HEIGHT);

  return {
    name: "star",

    /**
     * Since update only works on local variables we rely on closure.
     * No need for the "this" keyword.
     */

    update() {
      // 1) advance animation tick
      animationTick = (animationTick + 1) % TICKS_PER_FRAME;

      // 2) move left
      x -= scrollSpeed
        ? scrollSpeed * speedFactor
        : SCROLL_SPEED_BREAKING * speedFactor;

      // 3) wrap when fully off-screen (with margin)
      if (x < LAST_X) {
        x = RESPAWN_X;
      }

      // 4) advance frame if it's a blinking star
      if (blinking && animationTick === 0) {
        animationFrameIndex = (animationFrameIndex + 1) % TOTAL_FRAMES;
      }
    },

    draw(screen) {
      const spriteFrameX = animationFrameIndex * FRAME_WIDTH;
      const spriteFrameY = 0;

      // Round positions here to keep integer pixels
      const drawX = Math.round(x);
      const drawY = Math.round(y);

      screen.drawImage(
        starSpriteSheet,
        spriteFrameX,
        spriteFrameY,
        FRAME_WIDTH,
        FRAME_HEIGHT,
        drawX,
        drawY,
        FRAME_WIDTH,
        FRAME_HEIGHT
      );
    },
  };
}

function createStars(amount) {
  const result = [];

  for (let i = 0; i < amount / 2; i++) {
    result.push(createStar());
  }

  for (let i = 0; i < amount; i++) {
    result.push(createStar({ small: true }));
  }

  return result;
}

const tileSpriteSheet = loadOnce("./images/tiles-sheet.png");

function createTile(options = {}) {
  const { x = 0, y = 0, width = TILE_WIDTH, height = TILE_HEIGHT } = options;

  return {
    name: "tile",
    x: x,
    y: y,
    width,
    height,

    update() {
      this.x = this.x - scrollSpeed;
    },

    draw(screen) {
      // Round positions here to keep integer pixels
      const drawX = Math.round(this.x);
      const drawY = Math.round(this.y);

      screen.drawImage(
        tileSpriteSheet,
        0,
        0,
        width,
        height,
        drawX,
        drawY,
        width,
        height
      );
    },
  };
}

function createPlatforms(options = {}) {
  const { amount = 30 } = options;

  const SPAWN_THRESHOLD_X = SCREEN_WIDTH + TILE_WIDTH * 4; // When to spawn new platforms

  let tiles = [];

  for (let i = 0; i < amount; i++) {
    tiles.push(
      createTile({
        x: i * TILE_WIDTH,
        y: 160,
      })
    );
  }

  function moveTiles() {
    for (const tile of tiles) {
      tile.update();
    }
  }

  function removeTilesOffscreen() {
    for (const tile of tiles) {
      const isOffscreenLeft = tile.x <= 0;
      if (isOffscreenLeft) {
        tiles.splice(tiles.indexOf(tile), 1);
      }
    }
  }

  function addTilesIfNeeded() {
    const lastTileX = Math.floor(tiles[tiles.length - 1].x);
    const shouldSpawn = lastTileX < SPAWN_THRESHOLD_X;

    if (!shouldSpawn) {
      return;
    }

    const diff = getDifficulty();
    const y = randomInRange(
      diff.platformYMin,
      diff.platformYMin + diff.platformYRange
    );
    const gap = randomInRange(diff.gapMin, diff.gapMax);
    const tileCount = randomInRange(diff.tilesMin, diff.tilesMax);

    for (let i = 0; i < tileCount; i++) {
      tiles.push(
        createTile({
          x: lastTileX + gap + i * TILE_WIDTH,
          y: y,
        })
      );
    }
  }

  return {
    tiles: tiles,

    update() {
      moveTiles();
      removeTilesOffscreen();
      addTilesIfNeeded();
    },

    draw(screen) {
      for (const tile of tiles) {
        tile.draw(screen);
      }
    },
  };
}

function createSparkle(x, y) {
  const FRAME_WIDTH = 20;
  const FRAME_HEIGHT = 20;
  const TOTAL_FRAMES = 8;
  const TICKS_PER_FRAME = 6;

  const image = new Image();
  image.src = "./images/sparkle-sprite-sheet.png";

  // Mutable state (closure)
  let animationTick = 0;
  let frame = 0;
  let posX = x;
  let posY = y;
  let done = false;

  return {
    x: posX,
    y: posY,
    width: FRAME_WIDTH,
    height: FRAME_HEIGHT,

    isDone() {
      return done;
    },

    update() {
      // Scroll with platforms
      posX -= scrollSpeed;

      // Move sparkle upward
      posY -= 0.2;

      // Advance animation tick
      animationTick += 1;

      // Advance frame when tick threshold reached
      if (animationTick >= TICKS_PER_FRAME) {
        animationTick = 0;
        frame += 1;

        // Signal done when animation completes
        if (frame >= TOTAL_FRAMES) {
          done = true;
        }
      }

      // Update exposed position
      this.x = posX;
      this.y = posY;
    },

    draw(screen) {
      if (done) return;

      // Sprite sheet is horizontal: frames side by side
      const sx = frame * FRAME_WIDTH;
      const sy = 0;

      const dx = Math.round(posX);
      const dy = Math.round(posY);

      screen.drawImage(
        image,
        sx,
        sy,
        FRAME_WIDTH,
        FRAME_HEIGHT,
        dx,
        dy,
        FRAME_WIDTH,
        FRAME_HEIGHT
      );
    },
  };
}

function createSkateboardSparkle(target) {
  const FRAME_WIDTH = 36;
  const FRAME_HEIGHT = 16;
  const TOTAL_FRAMES = 10;
  const TICKS_PER_FRAME = 6;
  // Offset to center sparkle on skateboard (bottom of player)
  const OFFSET_X = (target.width - FRAME_WIDTH) / 2; // Center horizontally
  const OFFSET_Y = target.height - FRAME_HEIGHT; // Align to bottom

  const image = new Image();
  image.src = "./images/skateboard-sparkle-sprite-sheet.png";

  // Mutable state (closure)
  let animationTick = 0;
  let frame = 0;

  return {
    width: FRAME_WIDTH,
    height: FRAME_HEIGHT,

    update() {
      // Advance animation tick
      animationTick += 1;

      // Advance frame when tick threshold reached
      if (animationTick >= TICKS_PER_FRAME) {
        animationTick = 0;
        frame += 1;

        // Loop animation
        if (frame >= TOTAL_FRAMES) {
          frame = 0;
        }
      }
    },

    draw(screen) {
      // Sprite sheet is horizontal: frames side by side
      const sx = frame * FRAME_WIDTH;
      const sy = 0;

      // Follow target position with offset
      const dx = Math.round(target.x + OFFSET_X);
      const dy = Math.round(target.y + OFFSET_Y);

      screen.drawImage(
        image,
        sx,
        sy,
        FRAME_WIDTH,
        FRAME_HEIGHT,
        dx,
        dy,
        FRAME_WIDTH,
        FRAME_HEIGHT
      );
    },
  };
}

function createAngel(tiles) {
  const WIDTH = 16;
  const HEIGHT = 16;
  const HITBOX_WIDTH = 8;
  const HITBOX_HEIGHT = 8;
  const OSCILLATION_AMPLITUDE = 2;
  const OSCILLATION_SPEED = 0.1;
  const FLOAT_HEIGHT = 10;

  const image = new Image();
  image.src = "./images/collectibles-sprite-sheet.png";

  // Mutable state (closure)
  let baseY = 120;
  let tick = 0;

  // Find initial position on a tile
  function findPositionOnTile(tileList) {
    const eligibleTiles = tileList.filter((tile) => tile.x > SCREEN_WIDTH);

    if (eligibleTiles.length > 0) {
      const tile =
        eligibleTiles[Math.floor(Math.random() * eligibleTiles.length)];
      return {
        x: tile.x + tile.width / 2 - WIDTH / 2,
        y: tile.y - HEIGHT - FLOAT_HEIGHT,
      };
    }

    // Fallback: spawn ahead of screen at default height
    return {
      x: SCREEN_WIDTH + 64,
      y: 120,
    };
  }

  const initialPos = findPositionOnTile(tiles);
  baseY = initialPos.y;

  return {
    x: initialPos.x,
    y: initialPos.y,
    width: WIDTH,
    height: HEIGHT,

    getHitbox() {
      return {
        x: this.x + HITBOX_WIDTH / 2,
        y: this.y + HITBOX_HEIGHT / 2,
        width: HITBOX_WIDTH,
        height: HITBOX_HEIGHT,
      };
    },

    update() {
      this.x -= scrollSpeed;
      tick += 1;
      // Compute oscillated y and store it
      this.y = Math.round(
        baseY + Math.sin(tick * OSCILLATION_SPEED) * OSCILLATION_AMPLITUDE
      );
    },

    draw(screen) {
      screen.drawImage(
        image,
        0,
        0,
        WIDTH,
        HEIGHT,
        Math.floor(this.x),
        Math.floor(this.y),
        WIDTH,
        HEIGHT
      );
    },

    respawn(tileList) {
      const pos = findPositionOnTile(tileList);
      this.x = pos.x;
      baseY = pos.y;
      this.y = baseY;
      tick = 0;
    },
  };
}

function createEnemy(x, y) {
  const WIDTH = 16;
  const HEIGHT = 25;
  const TICKS_PER_FRAME = 8;
  const TOTAL_FRAMES = 10;

  const image = new Image();
  image.src = "./images/enemy-sprite-sheet.png";

  let animationTick = 0;
  let frame = 0;

  return {
    x: x,
    y: y,
    width: WIDTH,
    height: HEIGHT,

    update() {
      this.x -= scrollSpeed + 0.6;

      // Advance animation tick
      animationTick += 1;

      // Advance frame when tick threshold reached
      if (animationTick >= TICKS_PER_FRAME) {
        animationTick = 0;
        frame += 1;

        // Loop animation
        if (frame >= TOTAL_FRAMES) {
          frame = 0;
        }
      }
    },

    draw(screen) {
      // Sprite sheet is horizontal: frames side by side
      const sx = frame * WIDTH;
      const sy = 0;

      screen.drawImage(
        image,
        sx,
        sy,
        WIDTH,
        HEIGHT,
        Math.floor(this.x),
        Math.floor(this.y),
        WIDTH,
        HEIGHT
      );
    },
  };
}

/**
 * Checks for collision between two objects.
 *
 * @param {*} a
 * @param {*} b
 * @returns true if collision has happened, false otherwise.
 *
 * This is AABB (Axis-Aligned Bounding Box) collision. Also known as Rectangle–rectangle overlap test.
 * Detection: compares the distance between centers to the combined half-widths and half-heights to detect overlap.
 */

function checkCollision(a, b) {
  const dx = a.x + a.width / 2 - (b.x + b.width / 2);
  const dy = a.y + a.height / 2 - (b.y + b.height / 2);

  const combinedHalfWidths = (a.width + b.width) / 2;
  const combinedHalfHeights = (a.height + b.height) / 2;

  return (
    Math.abs(dx) < combinedHalfWidths && Math.abs(dy) < combinedHalfHeights
  );
}

/**
 * Helper functions
 */

function isIdle() {
  return time === 0;
}

function isPlaying() {
  return time > 0;
}

function loadOnce(src) {
  const img = new Image();
  img.src = src;
  return img;
}

/**
 * Returns a random integer between min and max (inclusive).
 */
function randomInRange(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Returns the current difficulty parameters based on game time.
 * Finds the highest stage the player has reached.
 */
function getDifficulty() {
  let current = DIFFICULTY_STAGES[0];
  for (const stage of DIFFICULTY_STAGES) {
    if (time >= stage.time) {
      current = stage;
    }
  }
  return current;
}

/**
 * Game functions
 *
 * init is called once when the game starts.
 * update and draw are called once per frame.
 *
 * Default frame rate is 60 times per second.
 *
 * The time variable is used to control the state of the game.
 *
 * The paused flag simple cause an early return in the update function. Effectively freezing the game.
 */

/**
 * -----------------------------
 * Initialize global mutable variables, reset global objects
 * -----------------------------
 */
function init() {
  stars = createStars(30);
  platforms = createPlatforms(30);
  angel = createAngel(platforms.tiles);
  skateboardSparkle = createSkateboardSparkle(player);
  sparkles = [];
  enemies = [];
  scrollSpeed = SCROLL_SPEED_SKATING;
  player.reset();
  enemies.push(createEnemy(SCREEN_WIDTH, 72));
}

/**
 * -----------------------------
 * Update the game state
 * -----------------------------
 */

function update() {
  if (paused) {
    return;
  }

  for (const star of stars) {
    star.update();
  }

  if (isIdle()) {
    time = 0;

    if (input.left || input.right || input.up) {
      // Reset the input flags to prevent any button clicked in the idle state
      // too "bleed" into the playing state. Without this, the player would start
      // moving cause the button state is still set to true.
      input.left = false;
      input.right = false;
      input.up = false;
      time += 1;
    }
  }

  if (isPlaying()) {
    time += 1;
    player.update(platforms.tiles, time);
    title.update();
    platforms.update();

    angel.update();

    // Respawn angel if it scrolled off the left side of the screen
    if (angel.x + angel.width < 0) {
      angel.respawn(platforms.tiles);
    }

    // Power-up collection (uses centered 8x8 hitbox)
    if (checkCollision(player, angel.getHitbox())) {
      // Spawn sparkle at angel position before respawn
      sparkles.push(createSparkle(angel.x, angel.y - 8));
      player.airJumps += 1;
      angel.respawn(platforms.tiles);
    }

    for (const enemy of enemies) {
      enemy.update();
      if (checkCollision(player, enemy)) {
        player.state = "obliterating";
        scrollSpeed = 0;
        player.dy = 0;
        // Restart the game
        if (player.isDead) {
          init();
        }
      }

      if (enemy.x + enemy.width < 0) {
        enemies.splice(enemies.indexOf(enemy), 1);
        enemies.push(
          createEnemy(
            SCREEN_WIDTH + 12,
            Math.floor(Math.random() * (164 - 48 + 1)) + 48
          )
        );
      }
    }

    // Update sparkles and remove finished ones
    for (const sparkle of sparkles) {
      sparkle.update();
    }
    sparkles = sparkles.filter((sparkle) => !sparkle.isDone());

    // Update skateboard sparkle when player has air jumps
    if (player.airJumps > 0) {
      skateboardSparkle.update();
    }

    if (player.y > 500) {
      init();
    }
  }
}

/**
 * -----------------------------
 * Draw the game state to the screen
 * -----------------------------
 *
 * Screen is 256x256 pixels. But it has a rounded mask applied to it.
 * So in essens the only visible area is about 36-212 pixels.
 */

function draw(screen) {
  // Clear the screen
  screen.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

  for (const star of stars) {
    star.draw(screen);
  }

  platforms.draw(screen);

  if (isIdle()) {
    title.draw(screen);
    print("Press ←,→ or ↑", "center", 186);
    print("key to start", "center", 198);
  }

  if (isPlaying()) {
    title.draw(screen);

    for (const enemy of enemies) {
      enemy.draw(screen);
    }

    for (const sparkle of sparkles) {
      sparkle.draw(screen);
    }

    player.draw(screen);
    angel.draw(screen);

    if (player.airJumps > 0) {
      skateboardSparkle.draw(screen);
    }

    if ((time > 6 && time < 12) || (time > 18 && time < 24)) {
      print("Press ←,→ or ↑", "center", 186);
      print("key to start", "center", 198);
    }
  }
}
