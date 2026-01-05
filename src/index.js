/**
 * Global constants
 */
const GRAVITY = 0.08;
const FRICTION = 0.4;
const SCROLL_SPEED_SKATING = 1.6;
const SCROLL_SPEED_BREAKING = 0.4;
const SCROLL_SPEED_SPEEDING = 2.2;
const TILE_WIDTH = 16; // Shared between createTile() and createPlatforms()
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
 * Global variables
 */
let paused = false;
let time = 0;
let stars;
let platforms;
let angel;
let sparkles;
let scrollSpeed = SCROLL_SPEED_SKATING;

/**
 *  player is defined in player.js file.
 *  title is defined in title.js file.
 *  Follow the "Object literal for one, factory for many" principle.
 */

/**
 * Factories for creating objects that appear as multiple instances (stars, platforms, etc.).
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

function createSparkle(x, y) {
  // Constants
  const FRAME_WIDTH = 20;
  const FRAME_HEIGHT = 20;
  const TOTAL_FRAMES = 7;
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

function createSkateboardSparkle(x, y) {
  // Constants
  const FRAME_WIDTH = 36;
  const FRAME_HEIGHT = 16;
  const TOTAL_FRAMES = 10;
  const TICKS_PER_FRAME = 6;

  const image = new Image();
  image.src = "./images/skateboard-sparkle-sprite-sheet.png";

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

function createAngel(tiles) {
  const WIDTH = 16;
  const HEIGHT = 16;
  const HITBOX_WIDTH = 8;
  const HITBOX_HEIGHT = 8;
  const OSCILLATION_AMPLITUDE = 2;
  const OSCILLATION_SPEED = 0.1;
  const FLOAT_HEIGHT = 5;

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
        this.x,
        this.y,
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
  angel = createAngel(platforms.tiles);
  sparkles = [];
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
      angel.respawn(platforms.tiles);
    }

    // Power-up collection (uses centered 8x8 hitbox)
    if (checkCollision(player, angel.getHitbox())) {
      // Spawn sparkle at angel position before respawn
      sparkles.push(createSparkle(angel.x, angel.y - 8));
      player.airJumps += 1;
      angel.respawn(platforms.tiles);
    }

    // Update sparkles and remove finished ones
    for (const sparkle of sparkles) {
      sparkle.update();
    }
    sparkles = sparkles.filter((sparkle) => !sparkle.isDone());

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

    print("Press ←,→ or ↑", "center", 186);
    print("key to start", "center", 198);
  }

  if (isPlaying()) {
    player.draw(screen);
    title.draw(screen);
    angel.draw(screen);

    for (const sparkle of sparkles) {
      sparkle.draw(screen);
    }

    if ((time > 6 && time < 12) || (time > 18 && time < 24)) {
      print("Press ←,→ or ↑", "center", 186);
      print("key to start", "center", 198);
    }

    if (time > 80) {
      print(`Time ${Math.floor(time / 60)}`, "center", 36);
      print(`Angels ${player.airJumps}`, "center", 216);
    }
  }
}
