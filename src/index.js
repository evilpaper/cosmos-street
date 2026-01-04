/**
 * Global variables
 */

/**
 * Constants
 */
const gravity = 0.08;
const friction = 0.4;

// Scroll speed constants for different player states
const SCROLL_SPEED_SKATING = 1.4;
const SCROLL_SPEED_BREAKING = 0.4;
const SCROLL_SPEED_SPEEDING = 2.2;

// Difficulty stages - each stage defines platform generation parameters
// time: frame threshold to reach this stage (60 frames = 1 second)
// gapMin/gapMax: pixel range for gaps between platform groups
// tilesMin/tilesMax: number of tiles per platform group
// platformYMin/platformYRange: vertical spawn range for platforms
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

// Tile and platform constants
const TILE_WIDTH = 16;
const TILE_HEIGHT = 16;
const SPAWN_THRESHOLD_X = SCREEN_WIDTH + TILE_WIDTH * 4; // When to spawn new platforms

// Define the angel object. This is a power-up that the player can collect to gain an extra jump.
const angel = {
  name: "angel",
  image: (() => {
    const img = new Image();
    img.src = "./images/collectibles-sprite-sheet.png";
    return img;
  })(),
  x: 256,
  baseY: 120, // Original Y position for oscillation
  y: 120,
  width: 16,
  height: 16,
  // Centered 8x8 hitbox for tighter collision detection
  hitboxWidth: 8,
  hitboxHeight: 8,
  tick: 0,
  oscillationAmplitude: 2, // Pixels to move up/down
  oscillationSpeed: 0.1, // Controls the speed of oscillation
  floatHeight: 5, // Pixels above platform when spawning
  // Returns the centered hitbox coordinates for collision detection
  getHitbox() {
    return {
      x: this.x + this.hitboxWidth,
      y: this.y + this.hitboxHeight,
      width: this.hitboxWidth,
      height: this.hitboxHeight,
    };
  },

  update() {
    this.x -= scrollSpeed;

    // Oscillate up and down using sine wave
    this.tick += 1;
    this.y = Math.round(
      this.baseY +
        Math.sin(this.tick * this.oscillationSpeed) * this.oscillationAmplitude
    );
  },
  draw(screen) {
    screen.drawImage(
      this.image,
      0,
      0,
      this.width,
      this.height,
      this.x,
      this.y,
      this.width,
      this.height
    );
  },
  reset(tiles = []) {
    // Find platforms that are off-screen to the right
    const eligibleTiles = tiles.filter((tile) => tile.x > SCREEN_WIDTH);

    if (eligibleTiles.length > 0) {
      // Pick a random tile from eligible ones
      const tile =
        eligibleTiles[Math.floor(Math.random() * eligibleTiles.length)];
      // Center angel on the tile, floating above it
      this.x = tile.x + tile.width / 2 - this.width / 2;
      this.baseY = tile.y - this.height - this.floatHeight;
      this.y = this.baseY;
    } else {
      // Fallback: spawn ahead of screen at default height
      this.x = SCREEN_WIDTH + 64;
      this.baseY = 120;
      this.y = this.baseY;
    }

    this.tick = 0;
  },
};

/**
 * Mutable
 */
let paused = false;
let time = 0;
let stars;
let platforms;
let scrollSpeed = SCROLL_SPEED_SKATING;

/**
 *  player is defined in player.js file.
 *  title is defined in title.js file.
 */

/**
 * Factories
 *
 * Used to create objects that appear as multiple instances (stars, platforms, etc.).
 */

function createStar(options = {}) {
  const { small = false } = options;

  // Constants. Same for all stars.
  const totalFrames = 6;
  const ticksPerFrame = 30;
  const blinkProbability = 0.6;
  const spawnWidth = SCREEN_WIDTH; // initial spawn area
  const spawnHeight = SCREEN_HEIGHT;
  const wrapMargin = 10; // allowed off-screen before wrap
  const resetX = SCREEN_WIDTH + 32; // where the star re-enters
  const minSpeed = 0.05;
  const maxSpeed = 0.1;
  const image = new Image();
  image.src = "./images/star-sprite-sheet.png";

  // Constant for the star instance but but different for each star.
  const blinking = small ? false : Math.random() < blinkProbability;
  const dx = small
    ? Math.random() * (0.1 - 0.02) + 0.02
    : Math.random() * (maxSpeed - minSpeed) + minSpeed;

  // Mutables
  let animationTick = 0;
  let frame = small ? 7 : Math.floor(Math.random() * totalFrames);
  let x = Math.floor(Math.random() * spawnWidth);
  let y = Math.floor(Math.random() * spawnHeight);

  return {
    image,
    frame,
    x,
    y,

    /**
     * Since update only works on local variables we rely on closure to keep the state.
     * No need for the this keyword.
     */

    update() {
      // 1) advance animation tick
      animationTick = (animationTick + 1) % ticksPerFrame;

      // 2) move left based on global scroll speed
      x -= dx + scrollSpeed * 0.2;

      // 3) wrap when fully off-screen (with margin)
      if (x < -wrapMargin) {
        x = resetX;
      }

      // 4) advance frame on blink cadence
      if (blinking && animationTick === 0) {
        frame = (frame + 1) % totalFrames;
      }
    },

    draw(screen) {
      const FRAME_W = 7;
      const FRAME_H = 7;
      const sx = frame * FRAME_W; // sprite x
      const sy = 0; // single row

      // Round positions here to keep integer pixels
      const dx = Math.round(x);
      const dy = Math.round(y);

      screen.drawImage(
        image,
        sx,
        sy,
        FRAME_W,
        FRAME_H,
        dx,
        dy,
        FRAME_W,
        FRAME_H
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

function createTile(options = {}) {
  const { x = 0, y = 0, width = TILE_WIDTH, height = TILE_HEIGHT } = options;

  const image = new Image();
  image.src = "./images/tiles-sheet.png";

  return {
    name: "tile",
    image: image,
    x: x,
    y: y,
    width,
    height,

    update() {
      this.x = this.x - scrollSpeed;
    },

    draw(screen) {
      const dx = Math.round(this.x);
      const dy = Math.round(this.y);
      screen.drawImage(image, 0, 0, width, height, dx, dy, width, height);
    },
  };
}

function createPlatforms(amount) {
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
    // Iterate backwards to safely splice during iteration
    for (let i = tiles.length - 1; i >= 0; i--) {
      const isOffscreenLeft = tiles[i].x <= -TILE_WIDTH;
      if (isOffscreenLeft) {
        tiles.splice(i, 1);
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

/**
 * Checks for collision between two objects.
 *
 * @param {*} a
 * @param {*} b
 * @returns true if collision has happened, false otherwise. Need to think about this.
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
 * Initialize global variables, reset global objects
 */
function init() {
  stars = createStars(30);
  platforms = createPlatforms(30);
  scrollSpeed = SCROLL_SPEED_SKATING;
  player.reset();
}

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
      angel.reset(platforms.tiles);
    }

    // Power-up collection (uses centered 8x8 hitbox)
    if (checkCollision(player, angel.getHitbox())) {
      player.airJumps += 1;
      angel.reset(platforms.tiles);
    }

    if (player.y > 500) {
      // We could call init() here but that would restart the game.
      // For now, we just reset the player to the start position.
      player.reset();
    }
  }
}

function draw(screen) {
  screen.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
  stars.forEach((s) => s.draw(screen));
  platforms.draw(screen);

  if (isIdle()) {
    title.draw(screen);

    print("Press ← or → or ↑", "center", 186);
    print("arrow key to start", "center", 198);
  }

  if (isPlaying()) {
    player.draw(screen);
    title.draw(screen);
    angel.draw(screen);

    if ((time > 6 && time < 12) || (time > 18 && time < 24)) {
      print("Press ← or → or ↑", "center", 186);
      print("arrow key to start", "center", 198);
    }

    if (time > 80) {
      print(`Time:${Math.floor(time / 60)}`, "center", 36);
    }
  }
}
