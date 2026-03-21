/**
 * Globals
 */

/**
 * Constants
 */

const GRAVITY = 0.08;
const FRICTION = 0.4;
const SCROLL_SPEED_SKATING = 1.4;
const SCROLL_SPEED_BREAKING = 0.4;
const SCROLL_SPEED_SPEEDING = 2.0;

/**
 * TILE_WIDTH AND TILE_HEIGHT are shared between the functions createTile() and createPlatforms()
 * Therefore defined as global constants.
 * The natural would otherwise be to define them inside the createTile() and createPlatforms() functions.
 */

const TILE_WIDTH = 16;
const TILE_HEIGHT = 16;

/**
 * Difficulty stages
 */

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
 * Mutables
 */

let paused = false;
let time = 0;
let stars;
let platforms;
let angel;
let sparkles;
let skateboardSparkle;
let scrollSpeed = SCROLL_SPEED_SKATING;
let startMessage;
let deadTimer;
let score;
let scoreIncrement;
let highScore = 0;
let highScoreUpdated = false;

const GAME_STATE = {
  INSERT_COIN: "INSERT_COIN", // Actually more like WAITING_FOR_INTERACTION. We use it to wait for user interaction to initialize audio but INSERT_COIN sounds more fun.
  PRESS_START: "PRESS_START",
  PLAYING: "PLAYING",
  GAME_OVER: "GAME_OVER",
};
const game = createGame();
const states = {};

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
        height,
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
      }),
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
      diff.platformYMin + diff.platformYRange,
    );
    const gap = randomInRange(diff.gapMin, diff.gapMax);
    const tileCount = randomInRange(diff.tilesMin, diff.tilesMax);

    for (let i = 0; i < tileCount; i++) {
      tiles.push(
        createTile({
          x: lastTileX + gap + i * TILE_WIDTH,
          y: y,
        }),
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

const skateboardSparkleSpriteSheet = loadOnce(
  "./images/skateboard-sparkle-sprite-sheet.png",
);

function createSkateboardSparkle(target) {
  if (!target) {
    return;
  }

  const FRAME_WIDTH = 36;
  const FRAME_HEIGHT = 16;
  const TOTAL_FRAMES = 10;
  const TICKS_PER_FRAME = 6;
  // Offset to center sparkle on skateboard (bottom of player)
  const OFFSET_X = (target.width - FRAME_WIDTH) / 2; // Center horizontally
  const OFFSET_Y = target.height - FRAME_HEIGHT; // Align to bottom

  // Mutable state (closure)
  let animationTick = 0;
  let animationFrameIndex = 0;

  return {
    width: FRAME_WIDTH,
    height: FRAME_HEIGHT,

    update() {
      // Advance animation tick
      animationTick += 1;

      // Advance frame when tick threshold reached
      if (animationTick >= TICKS_PER_FRAME) {
        animationTick = 0;
        animationFrameIndex += 1;

        // Loop animation
        if (animationFrameIndex >= TOTAL_FRAMES) {
          animationFrameIndex = 0;
        }
      }
    },

    draw(screen) {
      const spriteFrameX = animationFrameIndex * FRAME_WIDTH;
      const spriteFrameY = 0;

      const drawX = Math.round(target.x + OFFSET_X);
      const drawY = Math.round(target.y + OFFSET_Y);

      screen.drawImage(
        skateboardSparkleSpriteSheet,
        spriteFrameX,
        spriteFrameY,
        FRAME_WIDTH,
        FRAME_HEIGHT,
        drawX,
        drawY,
        FRAME_WIDTH,
        FRAME_HEIGHT,
      );
    },
  };
}

const angelSpriteSheet = loadOnce("./images/collectibles-sprite-sheet.png");

function createAngel(tiles) {
  const WIDTH = 16;
  const HEIGHT = 16;
  const HITBOX_WIDTH = 8;
  const HITBOX_HEIGHT = 8;
  const OSCILLATION_AMPLITUDE = 2;
  const OSCILLATION_SPEED = 0.1;
  const FLOAT_HEIGHT = 10;

  // Mutable state (closure)
  let tick = 0;
  let x;
  let y;
  let initial;

  function findPositionOnTile(tiles) {
    const eligibleTiles = tiles.filter((tile) => tile.x > SCREEN_WIDTH);

    if (eligibleTiles.length > 0) {
      const tile =
        eligibleTiles[Math.floor(Math.random() * eligibleTiles.length)];
      return {
        x: tile.x + tile.width / 2 - WIDTH / 2,
        y: tile.y - HEIGHT - FLOAT_HEIGHT,
      };
    }

    return null;
  }

  const initialPosition = findPositionOnTile(tiles);
  let active = initialPosition !== null;

  if (active) {
    initial = initialPosition;
    x = initialPosition.x;
    y = initialPosition.y;
  } else {
    initial = null;
    x = 0;
    y = 0;
  }

  return {
    x: x,
    y: y,
    width: WIDTH,
    height: HEIGHT,
    active: active,

    getHitbox() {
      return {
        x: this.x + (WIDTH - HITBOX_WIDTH) / 2,
        y: this.y + (HEIGHT - HITBOX_HEIGHT) / 2,
        width: HITBOX_WIDTH,
        height: HITBOX_HEIGHT,
      };
    },

    update() {
      // Auto-respawn if inactive and tiles become available
      if (!active) {
        const newPosition = findPositionOnTile(tiles);
        if (newPosition !== null) {
          this.respawn(tiles);
        }
        return;
      }

      this.x -= scrollSpeed;
      tick += 1;
      this.y = Math.round(
        initial.y + Math.sin(tick * OSCILLATION_SPEED) * OSCILLATION_AMPLITUDE,
      );
    },

    draw(screen) {
      if (!active) {
        return;
      }

      const spriteFrameX = 0;
      const spriteFrameY = 0;

      const drawX = Math.round(this.x);
      const drawY = Math.round(this.y);

      /**
       * Draw enemy hitbox. For debugging purposes.
       */
      // screen.fillStyle = "cyan";
      // screen.fillRect(this.getHitbox().x, this.getHitbox().y, this.getHitbox().width, this.getHitbox().height);

      screen.drawImage(
        angelSpriteSheet,
        spriteFrameX,
        spriteFrameY,
        WIDTH,
        HEIGHT,
        drawX,
        drawY,
        WIDTH,
        HEIGHT,
      );
    },

    respawn(tiles) {
      const newPosition = findPositionOnTile(tiles);
      if (newPosition !== null) {
        this.x = newPosition.x;
        this.y = newPosition.y;
        initial = newPosition;
        tick = 0;
        active = true;
        this.active = true;
      } else {
        active = false;
        this.active = false;
      }
    },
  };
}

const collectibleSpriteSheet = loadOnce(
  "./images/collectibles-sprite-sheet.png",
);

function createCollectible(tiles, frameNumber) {
  const WIDTH = 16;
  const HEIGHT = 16;

  // Find initial position on a tile
  function findPositionOnTile(tiles) {
    // Only spawn on tiles that are ahead of the screen
    const eligibleTiles = tiles.filter((tile) => tile.x > SCREEN_WIDTH);

    if (eligibleTiles.length > 0) {
      const tile =
        eligibleTiles[Math.floor(Math.random() * eligibleTiles.length)];
      return {
        x: tile.x + tile.width / 2 - WIDTH / 2,
        y: tile.y - HEIGHT,
      };
    }

    return null;
  }

  const position = findPositionOnTile(tiles);
  let active = position !== null;

  return {
    x: active ? position.x : 0,
    y: active ? position.y : 0,
    width: WIDTH,
    height: HEIGHT,
    active: active,

    update() {
      // Auto-respawn if inactive and tiles become available
      if (!active) {
        const newPosition = findPositionOnTile(tiles);
        if (newPosition !== null) {
          this.respawn(tiles);
        }
        return;
      }

      this.x -= scrollSpeed;
    },

    draw(screen) {
      if (!active) {
        return;
      }

      // first frame is 1, start at 0. Second frame is 2, start at 16. And so on.
      const spriteFrameX = (frameNumber - 1) * 16;
      const spriteFrameY = 0;

      const drawX = Math.round(this.x);
      const drawY = Math.round(this.y);

      screen.drawImage(
        collectibleSpriteSheet,
        spriteFrameX,
        spriteFrameY,
        WIDTH,
        HEIGHT,
        drawX,
        drawY,
        WIDTH,
        HEIGHT,
      );
    },

    respawn(tiles) {
      const pos = findPositionOnTile(tiles);
      if (pos !== null) {
        this.x = pos.x;
        this.y = pos.y;
        active = true;
        this.active = true;
      } else {
        active = false;
        this.active = false;
      }
    },
  };
}

const enemySpriteSheet = loadOnce("./images/enemy-sprite-sheet.png");

function createEnemy(x, y) {
  const WIDTH = 16;
  const HEIGHT = 25;
  const TICKS_PER_FRAME = 8;
  const TOTAL_FRAMES = 10;
  const HITBOX_WIDTH = 8;
  const HITBOX_HEIGHT = 16;

  let animationTick = 0;
  let animationFrameIndex = 0;

  return {
    x: x,
    y: y,
    width: WIDTH,
    height: HEIGHT,

    getHitbox() {
      return {
        x: this.x + (WIDTH - HITBOX_WIDTH) / 2,
        y: this.y + (HEIGHT - HITBOX_HEIGHT) / 2,
        width: HITBOX_WIDTH,
        height: HITBOX_HEIGHT,
      };
    },

    update() {
      this.x -= scrollSpeed + 0.6;

      // Advance animation tick
      animationTick += 1;

      // Advance frame when tick threshold reached
      if (animationTick >= TICKS_PER_FRAME) {
        animationTick = 0;
        animationFrameIndex += 1;

        // Loop animation
        if (animationFrameIndex >= TOTAL_FRAMES) {
          animationFrameIndex = 0;
        }
      }
    },

    draw(screen) {
      const spriteFrameX = animationFrameIndex * WIDTH;
      const spriteFrameY = 0;

      const drawX = Math.round(this.x);
      const drawY = Math.round(this.y);

      /**
       * Draw enemy hitbox. For debugging purposes.
       */
      // screen.lineWidth = 1;
      // screen.strokeStyle = "magenta";
      // screen.strokeRect(this.getHitbox().x, this.getHitbox().y, this.getHitbox().width, this.getHitbox().height);

      screen.drawImage(
        enemySpriteSheet,
        spriteFrameX,
        spriteFrameY,
        WIDTH,
        HEIGHT,
        drawX,
        drawY,
        WIDTH,
        HEIGHT,
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
 * Use y position of the title to determine if it is the first time starting the game.
 */

function firstTimeStarting() {
  return title.y > 0;
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
 * State transition functions
 */

function resetStateInput() {
  // Reset input flags to prevent bleed between states.
  input.left = false;
  input.right = false;
  input.up = false;
}

/**
 * States
 */

states[GAME_STATE.INSERT_COIN] = {
  name: GAME_STATE.INSERT_COIN,
  exit() {
    unlockAudio();
  },
  update() {
    time += 1;
    title.update();
    if (input.left || input.right || input.up) {
      insertCoin();
    }
  },
  draw(_, screen) {
    title.draw(screen);
    print("Press ←,→ or ↑", "center", 144);
    print("key to play", "center", 160);
  },
};

states[GAME_STATE.PRESS_START] = {
  name: GAME_STATE.PRESS_START,
  enter() {
    time = 0;
    title.y = 64;
    resetStateInput();
  },
  update() {
    time += 1;
    title.update();
    if (input.left || input.right || input.up) {
      startGame();
    }
  },
  draw(_, screen) {
    platforms.draw(screen);
    title.draw(screen);
    print("←,→,↑ to start", "center", 186);
    print("S to toggle sound", "center", 202);
  },
};

states[GAME_STATE.PLAYING] = {
  name: GAME_STATE.PLAYING,
  enter() {
    time = 0;
    resetStateInput();
    music(songs.theme, 0.5);
  },
  update() {
    // Check for death conditions first.
    if (player.y > 500) {
      sfx(sounds.drop);
      resetInput();
      scrollSpeed = 0;
      game.setState(states[GAME_STATE.GAME_OVER]);
      return;
    }

    if (player.isDead) {
      resetInput();
      scrollSpeed = 0;
      game.setState(states[GAME_STATE.GAME_OVER]);
      return;
    }

    time += 1;
    title.slideOut();
    player.update(platforms.tiles, time);
    platforms.update();

    angel.update();
    // egg.update();

    // Respawn angel if it scrolled off the left side of the screen.
    if (angel.active && angel.x + angel.width < 0) {
      scoreIncrement = 1;
      angel.respawn(platforms.tiles);
    }

    // Power-up collection (uses centered 8x8 hitbox).
    if (angel.active && checkCollision(player, angel.getHitbox())) {
      // Spawn sparkle at angel position before respawn.
      sparkles.push(createSparkle(angel.x, angel.y - 8));
      player.airJumps += 1;
      angel.respawn(platforms.tiles);
      score += scoreIncrement;
      scoreIncrement += 1;
      sfx(sounds.angel);
      if (score > highScore) {
        highScore = score;
        highScoreUpdated = true;
      }
    }

    // if (egg.active && checkCollision(player, egg)) {
    //   egg.respawn(platforms.tiles);
    // }

    for (const enemy of enemies) {
      enemy.update();
      if (checkCollision(player, enemy.getHitbox())) {
        if (player.state !== "obliterating") {
          sfx(sounds.crash);
        }
        player.state = "obliterating";
        scrollSpeed = 0;
        player.dy = 0;
      }

      if (enemy.x + enemy.width < 0) {
        enemies.splice(enemies.indexOf(enemy), 1);
        enemies.push(
          createEnemy(
            SCREEN_WIDTH + 12,
            Math.floor(Math.random() * (164 - 48 + 1)) + 48,
          ),
        );
      }
    }

    // Update sparkles and remove finished ones.
    for (const sparkle of sparkles) {
      sparkle.update();
    }
    sparkles = sparkles.filter((sparkle) => !sparkle.isDone());

    // Update skateboard sparkle when player has air jumps.
    if (player.airJumps > 0) {
      skateboardSparkle.update();
    }
  },
  draw(_, screen) {
    platforms.draw(screen);
    if (firstTimeStarting()) {
      title.draw(screen);

      if (
        (time > 6 && time < 12) ||
        (time > 16 && time < 20) ||
        (time > 24 && time < 30)
      ) {
        print("←,→,↑ to start", "center", 186);
        print("S to toggle sound", "center", 202);
      }
    }

    for (const enemy of enemies) {
      enemy.draw(screen);
    }

    for (const sparkle of sparkles) {
      sparkle.draw(screen);
    }

    player.draw(screen);
    angel.draw(screen);
    // egg.draw(screen);

    if (player.airJumps > 0) {
      skateboardSparkle.draw(screen);
    }

    if (time > 24 && time < 64) {
      print(startMessage, "center", 128 - 4 - 8);
      if (highScore > 0) {
        print("High Score " + highScore, "center", 128 + 4);
      }
    }

    if (time > 60) {
      print("" + score, "center", 36);
    }
  },
};

states[GAME_STATE.GAME_OVER] = {
  name: GAME_STATE.GAME_OVER,
  enter() {
    deadTimer = 0;
  },
  update() {
    time += 1;
    scrollSpeed = 0;
    deadTimer += 1;

    // Restart game if user presses a key.
    if (input.left || input.right) {
      restartGame();
      return;
    }

    if (input.up) {
      resetGame();
      return;
    }

    player.update(platforms.tiles, time);
    platforms.update();
    angel.update();
    for (const enemy of enemies) {
      enemy.update();
    }
    for (const sparkle of sparkles) {
      sparkle.update();
    }
    // Remove finished sparkles.
    sparkles = sparkles.filter((sparkle) => !sparkle.isDone());
    if (player.airJumps > 0) {
      skateboardSparkle.update();
    }
  },
  draw(_, screen) {
    platforms.draw(screen);
    for (const enemy of enemies) {
      enemy.draw(screen);
    }

    for (const sparkle of sparkles) {
      sparkle.draw(screen);
    }

    player.draw(screen);
    angel.draw(screen);

    if (deadTimer > 0) {
      if (highScoreUpdated) {
        print("Game Over", "center", 128 - 4 - 8);
        print("New high " + highScore, "center", 128 + 4);
      } else {
        print("Game Over", "center", "middle");
      }

      print("Restart ← or →", "center", 186);
      print("Title screen ↑", "center", 202);
    }
  },
};

function insertCoin() {
  game.setState(states[GAME_STATE.PRESS_START]);
}

function startGame() {
  game.setState(states[GAME_STATE.PLAYING]);
}

function resetGame() {
  highScoreUpdated = false;
  init(); // Reset all game objects
  game.setState(states[GAME_STATE.PRESS_START]);
}

function restartGame() {
  init(); // Reset all game objects
  game.setState(states[GAME_STATE.PLAYING]);
  time = 1; // Keep current behavior where restart begins at 1.
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
 * Note: This function resets game objects but does not modify game state.
 * State transitions are handled by startGame() and resetGame() functions.
 */
function init() {
  stars = createStars(30);
  platforms = createPlatforms(30);
  angel = createAngel(platforms.tiles);
  // egg = createCollectible(platforms.tiles, 2);
  skateboardSparkle = createSkateboardSparkle(player);
  sparkles = [];
  enemies = [];
  scrollSpeed = SCROLL_SPEED_SKATING;
  player.reset();
  enemies.push(createEnemy(SCREEN_WIDTH, 72));
  startMessage = getStartMessage();
  deadTimer = 0;
  score = 0;
  scoreIncrement = 1;

  if (!game.state) {
    game.setState(states[GAME_STATE.INSERT_COIN]);
  }
}

/**
 * -----------------------------
 * Update the game state
 * -----------------------------
 */

function update() {
  if (input.soundToggle) {
    toggleAudio();
    input.soundToggle = false;
  }

  if (paused) {
    return;
  }

  for (const star of stars) {
    star.update();
  }
  game.update();
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
  game.draw(screen);
}

function getStartMessage() {
  // Random number between 1 and 10
  const randomNumber = Math.floor(Math.random() * 10) + 1;
  // a switch statement would be better here
  switch (randomNumber) {
    case 1:
      return "Go for pro!";
    case 2:
      return "Happy rolling!";
    case 3:
      return "Cruise!";
    case 4:
      return "Go!";
    case 5:
      return "Good luck!";
    case 6:
      return "Ride on!";
    case 7:
      return "Skate!";
    case 8:
      return "Cruise!";
    case 9:
      return "Charge!";
    case 10:
      return "Action!";
  }
}
