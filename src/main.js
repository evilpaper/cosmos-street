/**
 * Globals
 */

/**
 * Constants
 */

const GRAVITY = 0.058;
const FRICTION = 0.32; // A value between 0 and 1 that determines how much friction slows down the player.
const SCROLL_SPEED_BREAKING = 0.3;
const SCROLL_SPEED_SKATING = 1.6;
const SCROLL_SPEED_SPEEDING = 2.4;

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
let lastPausedForAudio = false;
let time = 0;
let stars;
let platforms;
let angels;
let eggs;
let sparkles;
let electricExplosions;
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
 * Leave PLAYING for GAME_OVER (fall off screen or player death).
 * @param {{ playDropSound?: boolean }} [options]
 */
function enterGameOverFromPlaying({ playDropSound = false } = {}) {
  if (playDropSound) {
    sfx(sounds.drop);
  }
  resetInput();
  scrollSpeed = 0;
  game.setState(states[GAME_STATE.GAME_OVER]);
}

function hasPassedLeftEdge(entity) {
  const MIN_DISTANCE_AFTER_EDGE = -100;
  if (entity.x + entity.width < MIN_DISTANCE_AFTER_EDGE) {
    return true;
  }
  return false;
}

function hasPassedTopEdge(entity) {
  const MIN_DISTANCE_AFTER_EDGE = -100;
  if (entity.y + entity.height < MIN_DISTANCE_AFTER_EDGE) {
    return true;
  }
  return false;
}

function updateUI() {
  title.slideOut();
}

function updateEntities() {
  platforms.update();

  player.update(platforms.tiles, time);

  for (const angel of angels) {
    angel.update(player);
  }
  angels = angels.filter(
    (angel) => !(hasPassedLeftEdge(angel) || hasPassedTopEdge(angel)),
  );

  for (const egg of eggs) {
    egg.update();
  }
  eggs = eggs.filter(
    (egg) => !(hasPassedLeftEdge(egg) || hasPassedTopEdge(egg)),
  );

  for (const enemy of enemies) {
    enemy.update();
  }
}

function updateInteractions() {
  handleEnemyEncounters();
  collectAngels();
  collectEggs();
}

function updateVisualEffects() {
  for (const sparkle of sparkles) {
    sparkle.update();
  }
  sparkles = sparkles.filter((sparkle) => !sparkle.isDone());

  for (const explosion of electricExplosions) {
    explosion.update();
  }
  electricExplosions = electricExplosions.filter(
    (explosion) => !explosion.isDone(),
  );

  if (player.pickup === "egg") {
    skateboardSparkle.update();
  }
}

function drawWorld(screen) {
  platforms.draw(screen);

  for (const enemy of enemies) {
    enemy.draw(screen);
  }

  for (const sparkle of sparkles) {
    sparkle.draw(screen);
  }

  player.draw(screen);

  for (const angel of angels) {
    angel.draw(screen);
  }

  for (const egg of eggs) {
    egg.draw(screen);
  }

  for (const explosion of electricExplosions) {
    explosion.draw(screen);
  }

  if (player.state !== "obliterating" && player.pickup === "egg") {
    skateboardSparkle.draw(screen);
  }
}

/**
 * PLAYING-only rules
 */

function ensureCollectibles() {
  if (angels.length === 0) {
    angels.push(createAngel(platforms.tiles));
  }

  if (eggs.length === 0) {
    eggs.push(createEgg(platforms.tiles, 1));
  }
}

function dismissCompanionAngel(player, angels) {
  if (player.pickup !== "angel") return false;

  player.pickup = null;

  const following = angels.find(
    (c) => c.state === "follow" || c.state === "approach",
  );

  if (following) {
    following.state = "leave";
  }

  return true;
}

function consumeEgg(player) {
  if (player.pickup !== "egg") {
    return;
  }

  player.pickup = null;

  return true;
}

function collectAngels() {
  for (let i = angels.length - 1; i >= 0; i--) {
    const angel = angels[i];
    if (angel.state !== "idle") {
      return;
    }

    if (checkCollision(player, angel.getHitbox())) {
      // sparkles.push(createSparkle(angel.x, angel.y - 8));
      if (player.pickup !== "angel") {
        player.pickup = "angel";
        angel.pickedUpX = angel.x;
        angel.pickedUpY = angel.y;
        angel.state = "approach";
      }
      score += scoreIncrement;
      scoreIncrement += 1;
      sfx(sounds.angel);

      if (score > highScore) {
        highScore = score;
        highScoreUpdated = true;
      }
    }
  }
}

function collectEggs() {
  for (let i = eggs.length - 1; i >= 0; i--) {
    const egg = eggs[i];
    if (checkCollision(player, egg.getHitbox())) {
      sparkles.push(createSparkle(egg.x, egg.y - 8));
      eggs.splice(i, 1);
      sfx(sounds.egg);
      dismissCompanionAngel(player, angels);
      player.pickup = "egg";
    }
  }
}

function respawnEnemy(enemy) {
  enemies.splice(enemies.indexOf(enemy), 1);
  enemies.push(createEnemy(SCREEN_WIDTH + 12, randomInRange(48, 164)));
}

function handleEnemyEncounters() {
  for (const enemy of enemies) {
    if (checkCollision(player, enemy.getHitbox())) {
      if (dismissCompanionAngel(player, angels)) {
        electricExplosions.push(
          createElectricExplosion(
            enemy.x + (enemy.width - 35) / 2,
            enemy.y + (enemy.height - 35) / 2,
          ),
        );
        respawnEnemy(enemy);
        sfx(sounds.enemyKill);
      } else {
        if (player.state !== "obliterating") {
          sfx(sounds.crash);
        }
        player.state = "obliterating";
        scrollSpeed = 0;
        player.dy = 0;
      }
    }

    if (enemy.x + enemy.width < 0) {
      respawnEnemy(enemy);
    }
  }
}

function isGameOver() {
  return playerHasFallenOffScreen() || player.isDead;
}

function gameOverOptions() {
  return playerHasFallenOffScreen() ? { playDropSound: true } : {};
}

/**
 * States
 */

states[GAME_STATE.INSERT_COIN] = {
  name: GAME_STATE.INSERT_COIN,
  exit() {
    unlockAudio().then(() => {
      music(songs.theme, 0.5);
    });
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
    print("Press any", "center", 132);
    print("←,→,↑ keys to play", "center", 148);
  },
};

states[GAME_STATE.PRESS_START] = {
  name: GAME_STATE.PRESS_START,
  enter() {
    time = 0;
    title.y = 64;
    resetStateInput();
    platforms.startIntroSlideIn();
  },
  update() {
    time += 1;

    // UI
    title.update();

    // Phase 1: Update all entities
    platforms.updateIntro();

    // What should I call this?
    const canStart = isAudioReady() || isAudioInitFailed();
    if (canStart && (input.left || input.right || input.up)) {
      startGame();
    }
  },
  draw(_, screen) {
    platforms.draw(screen);
    title.draw(screen);
    if (isAudioInitializing()) {
      print("Initializing audio", "center", 132);
    } else {
      print("←,→,↑ to start", "center", 132);
      if (audioEnabled) {
        print("Audio ON", "center", 186);
        print("Press S to toggle", "center", 202);
      } else {
        print("Audio OFF", "center", 186);
        print("Press S to toggle", "center", 202);
      }
    }
  },
};

states[GAME_STATE.PLAYING] = {
  name: GAME_STATE.PLAYING,
  enter() {
    time = 0;
    resetStateInput();
    stopMusic();
    music(songs.theme, 0.5);
  },
  update() {
    time += 1;

    ensureCollectibles();

    // UI: tell the title to do its thing — it decides internally whether to move
    updateUI();

    // Phase 1: tell every entity to tick — each owns its own logic
    updateEntities();

    // Phase 2: tell interaction handlers to run — each owns its own conditions
    // (e.g. updateSkateboardSparkle checks player.pickup === "egg" internally)
    updateInteractions();

    // Phase 2b: tell visual effects to update — same principle, they own their conditions
    updateVisualEffects();

    // Phase 3: the game state's own responsibility — asking whether to exit.
    // This is NOT tell-don't-ask territory: control flow (return) must stay visible
    // here so it's obvious what can end this state and when.
    // State transitions stay in the state (not buried in helpers).
    if (isGameOver()) {
      enterGameOverFromPlaying(gameOverOptions());
      return;
    }
  },
  draw(_, screen) {
    drawWorld(screen);

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

    if (input.left || input.right) {
      restartGame();
      return;
    }

    if (input.up) {
      resetGame();
      return;
    }

    updateEntities();
  },
  draw(_, screen) {
    drawWorld(screen);

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

/**
 * State transition functions
 */

function resetStateInput() {
  // Reset input flags to prevent bleed between states.
  input.left = false;
  input.right = false;
  input.up = false;
}

function insertCoin() {
  game.setState(states[GAME_STATE.PRESS_START]);
}

function startGame() {
  game.setState(states[GAME_STATE.PLAYING]);
}

function resetGame() {
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
  angels = [];
  eggs = [];
  skateboardSparkle = createSkateboardSparkle(player);
  sparkles = [];
  electricExplosions = [];
  enemies = [];
  scrollSpeed = SCROLL_SPEED_SKATING;
  player.reset();
  enemies.push(createEnemy(SCREEN_WIDTH * 2, 72));
  startMessage = getStartMessage();
  deadTimer = 0;
  score = 0;
  scoreIncrement = 1;
  highScoreUpdated = false;

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

  if (paused !== lastPausedForAudio) {
    syncAudioWithGamePaused(paused);
    lastPausedForAudio = paused;
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

function playerHasFallenOffScreen() {
  return player.y > 500;
}
