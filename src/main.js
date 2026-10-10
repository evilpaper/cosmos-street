/**
 * Constants
 */

const GRAVITY = 0.058;
const FRICTION = 0.34; // A value between 0 and 1 that determines how much friction slows down the player.
const SCROLL_SPEED_BREAKING = 0.2;
const SCROLL_SPEED_SKATING = 1.4;
const SCROLL_SPEED_SPEEDING = 2.6;
const PLAYTIME_IN_SECONDS = 60;
const PLAYING_TIME = 60 * PLAYTIME_IN_SECONDS; // First number is ticks. Remember, we do 60 times per second

/**
 * TILE_WIDTH AND TILE_HEIGHT are shared between the functions createTile() and createPlatforms()
 * Therefore defined as global constants.
 * The natural would otherwise be to define them inside the createTile() and createPlatforms() functions.
 */

const TILE_WIDTH = 16;
const TILE_HEIGHT = 16;

const COLLECTIBLE_SPAWN_COOLDOWN = 3 * 60;

/**
 * Difficulty stages
 */

const DIFFICULTY_STAGES = [
  {
    time: 0,
    gapMin: 24,
    gapMax: 40,
    tilesMin: 4,
    tilesMax: 14,
    platformYMin: 80,
    platformYRange: 120,
    eggsMaxPerStage: 3,
    eggsMaxActive: 2,
    angelsMaxPerStage: 3,
    angelsMaxActive: 2,
    enemiesMin: 1,
    enemySpeedBonus: 0,
    electricityChance: 0.015,
  },
  {
    time: 12 * 60,
    gapMin: 32,
    gapMax: 56,
    tilesMin: 3,
    tilesMax: 12,
    platformYMin: 80,
    platformYRange: 120,
    eggsMaxPerStage: 3,
    eggsMaxActive: 2,
    angelsMaxPerStage: 3,
    angelsMaxActive: 2,
    enemiesMin: 1,
    enemySpeedBonus: 0.15,
    electricityChance: 0.02,
  },
  {
    time: 24 * 60,
    gapMin: 40,
    gapMax: 72,
    tilesMin: 2,
    tilesMax: 10,
    platformYMin: 80,
    platformYRange: 120,
    eggsMaxPerStage: 4,
    eggsMaxActive: 3,
    angelsMaxPerStage: 4,
    angelsMaxActive: 3,
    enemiesMin: 2,
    enemySpeedBonus: 0.3,
    electricityChance: 0.025,
  },
  {
    time: 36 * 60,
    gapMin: 48,
    gapMax: 80,
    tilesMin: 2,
    tilesMax: 8,
    platformYMin: 80,
    platformYRange: 120,
    eggsMaxPerStage: 4,
    eggsMaxActive: 3,
    angelsMaxPerStage: 4,
    angelsMaxActive: 3,
    enemiesMin: 3,
    enemySpeedBonus: 0.5,
    electricityChance: 0.03,
  },
  {
    time: 48 * 60,
    gapMin: 56,
    gapMax: 96,
    tilesMin: 1,
    tilesMax: 6,
    platformYMin: 80,
    platformYRange: 120,
    eggsMaxPerStage: 1,
    eggsMaxActive: 1,
    angelsMaxPerStage: 1,
    angelsMaxActive: 1,
    enemiesMin: 4,
    enemySpeedBonus: 0.75,
    electricityChance: 0.035,
  },
];

/**
 * Mutables
 */

let paused = false;
let titleShown = false;
let time = 0;
let stars;
let platforms;
let angels;
let carriedAngels;
let eggs;
let sparkles;
let electricExplosions;
let scrollSpeed = SCROLL_SPEED_SKATING;
let startMessage;
let deadTimer;
let winTimer;
let score;
let scoring;
let highScore = 0;
let highScoreUpdated = false;
let collectibleStageIndex = 0;
let eggsSpawnedInStage = 0;
let angelsSpawnedInStage = 0;
let lastEggSpawnTime = 0;
let lastAngelSpawnTime = 0;

const GAME_STATE = {
  PRESS_START: "PRESS_START",
  PLAYING: "PLAYING",
  GAME_OVER: "GAME_OVER",
  ENDING: "ENDING",
};

const game = createGame();
const states = {};

/**
 * General utilities
 */

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

/**
 * Shared world (PLAYING + GAME_OVER)
 */

const MIN_DISTANCE_AFTER_EDGE = -100;

function hasPassedLeftEdge(entity) {
  return entity.x + entity.width < MIN_DISTANCE_AFTER_EDGE;
}

function hasPassedTopEdge(entity) {
  return entity.y + entity.height < MIN_DISTANCE_AFTER_EDGE;
}

function updateEntities() {
  platforms.update();
  player.update(platforms.tiles, time);

  for (const angel of angels) {
    if (angel.state === "idle" || angel.state === "dispatch") {
      angel.update();
    }
  }
  for (let i = 0; i < carriedAngels.length; i++) {
    const leader = i === 0 ? player : carriedAngels[i - 1];
    carriedAngels[i].update(leader);
  }
  angels = angels.filter(
    (angel) => !(hasPassedLeftEdge(angel) || hasPassedTopEdge(angel)),
  );
  carriedAngels = carriedAngels.filter((angel) => angels.includes(angel));

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

function drawWorld(screen) {
  platforms.draw(screen);

  for (const enemy of enemies) {
    enemy.draw(screen);
  }

  for (const sparkle of sparkles) {
    sparkle.draw(screen);
  }

  for (const angel of angels) {
    angel.draw(screen);
  }

  player.draw(screen);

  for (const egg of eggs) {
    egg.draw(screen);
  }

  for (const explosion of electricExplosions) {
    explosion.draw(screen);
  }
}

/**
 * PLAYING-only
 */

// Spawning

function getCollectibleStageIndex() {
  let idx = 0;
  for (let i = 0; i < DIFFICULTY_STAGES.length; i++) {
    if (time >= DIFFICULTY_STAGES[i].time) {
      idx = i;
    }
  }
  return idx;
}

function resetCollectibleBudgetOnStageChange() {
  const idx = getCollectibleStageIndex();
  if (idx !== collectibleStageIndex) {
    collectibleStageIndex = idx;
    eggsSpawnedInStage = 0;
    angelsSpawnedInStage = 0;
    lastEggSpawnTime = time - COLLECTIBLE_SPAWN_COOLDOWN;
    lastAngelSpawnTime = time - COLLECTIBLE_SPAWN_COOLDOWN;
  }
}

function collectiblesSpawnBoxes() {
  const boxes = [];
  for (const egg of eggs) {
    boxes.push({ x: egg.x, y: egg.y, width: egg.width, height: egg.height });
  }
  for (const angel of angels) {
    if (angel.state !== "idle") continue;
    boxes.push({
      x: angel.x,
      y: angel.y,
      width: angel.width,
      height: angel.height,
    });
  }
  return boxes;
}

function ensureCollectibles() {
  resetCollectibleBudgetOnStageChange();
  const diff = getDifficulty();
  let existingBoxes = collectiblesSpawnBoxes();

  const idleAngels = angels.filter((angel) => angel.state === "idle");
  const activeEggs = eggs.filter((egg) => egg.active);

  if (
    idleAngels.length < diff.angelsMaxActive &&
    angelsSpawnedInStage < diff.angelsMaxPerStage &&
    time - lastAngelSpawnTime >= COLLECTIBLE_SPAWN_COOLDOWN
  ) {
    const angel = createAngel(platforms.tiles, existingBoxes);
    if (angel) {
      angels.push(angel);
      existingBoxes.push({
        x: angel.x,
        y: angel.y,
        width: angel.width,
        height: angel.height,
      });
      angelsSpawnedInStage += 1;
      lastAngelSpawnTime = time;
    }
  }

  if (
    activeEggs.length < diff.eggsMaxActive &&
    eggsSpawnedInStage < diff.eggsMaxPerStage &&
    time - lastEggSpawnTime >= COLLECTIBLE_SPAWN_COOLDOWN
  ) {
    const egg = createEgg(platforms.tiles, existingBoxes);
    if (egg) {
      eggs.push(egg);
      eggsSpawnedInStage += 1;
      lastEggSpawnTime = time;
    }
  }
}

function ensureEnemies() {
  if (enemies.length < getDifficulty().enemiesMin) {
    enemies.push(createEnemy(SCREEN_WIDTH + 12, randomInRange(48, 164)));
  }
}

// Orchestration

function updateUI() {
  title.slideOut();
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
}

// Rules

function spendAngelForAirJump() {
  const angel = carriedAngels.shift();
  if (!angel) {
    return false;
  }
  angel.state = "dispatch";
  return true;
}

function collectAngel(angel) {
  angel.approachStartX = angel.x;
  angel.approachStartY = angel.y;
  angel.approachProgress = 0;
  angel.state = "approach";
  carriedAngels.push(angel);
  addScore(scoring.award("angel"));
  sfx(sounds.angel);
}

function addScore(points) {
  score += points;
  if (score > highScore) {
    highScore = score;
    highScoreUpdated = true;
  }
}

function collectAngels() {
  for (const angel of angels) {
    if (angel.state !== "idle") continue;
    if (!checkCollision(player, angel.getHitbox())) continue;
    collectAngel(angel);
  }
}

function collectEgg(index) {
  const egg = eggs[index];
  sparkles.push(createSparkle(egg.x, egg.y - 8));
  eggs.splice(index, 1);
  sfx(sounds.egg);
  addScore(scoring.award("egg"));
}

function collectEggs() {
  for (let i = eggs.length - 1; i >= 0; i--) {
    if (checkCollision(player, eggs[i].getHitbox())) {
      collectEgg(i);
    }
  }
}

function respawnEnemy(enemy) {
  enemies.splice(enemies.indexOf(enemy), 1);

  if (game.state?.name === GAME_STATE.ENDING) {
    return; // remove only — no new enemy
  }

  enemies.push(createEnemy(SCREEN_WIDTH + 12, randomInRange(48, 164)));
}

function handleEnemyEncounters() {
  for (const enemy of enemies) {
    if (checkCollision(player, enemy.getHitbox())) {
      if (player.state !== "obliterating") {
        sfx(sounds.crash);
      }
      player.state = "obliterating";
      scrollSpeed = 0;
      player.dy = 0;
    }

    if (enemy.x + enemy.width < 0) {
      respawnEnemy(enemy);
    }
  }
}

// Exit

function playerHasFallenOffScreen() {
  return player.y > 500;
}

function isGameOver() {
  return playerHasFallenOffScreen() || player.isDead;
}

function gameOverOptions() {
  return playerHasFallenOffScreen() ? { playDropSound: true } : {};
}

// Winning

// Once the player has entered "ending" state we start to check for these conditions to orchestrate the game ending.

function playerHasReachedFlatTileSegement() {
  return platforms.tiles.some((tile) => tile.type === "flat" && tile.x < 24);
}

function playerHasSkatedOffInTheSunset() {
  return player.x > 256;
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

// Draw helper

/**
 * Use y position of the title to determine if it is the first time starting the game.
 */
function firstTimeStarting() {
  return title.y > 0;
}

/**
 * The theme follows the run's clock. Outside a run it starts from the beginning.
 */
function themePosition() {
  return game.state.name === GAME_STATE.PLAYING ? time / FPS : 0;
}

/**
 * States
 */

states[GAME_STATE.PRESS_START] = {
  name: GAME_STATE.PRESS_START,
  enter() {
    time = 0;
    title.y = 64;
    resetInput();
    // Platforms only slide in on first load, not when returning to the title.
    platforms.setMode("intro", { slideIn: !titleShown });
    titleShown = true;
  },
  update() {
    time += 1;

    // UI
    title.update();

    platforms.update();

    if (hasAnyDirectionInput()) {
      startGame();
    }
  },
  draw(_, screen) {
    platforms.draw(screen);
    if (highScore > 0) {
      print("High Score " + highScore, "center", 44);
    }
    title.draw(screen);
    print("press any ←,→,↑ to start", "center", 130);
    if (isSoundUnavailable()) {
      print("Sound unavailable", "center", 188);
    } else if (isSoundOn()) {
      print("Sound ON", "center", 188);
    } else {
      print("Sound OFF", "center", 188);
    }
    print("press S to toggle sound", "center", 210);
  },
};

states[GAME_STATE.PLAYING] = {
  name: GAME_STATE.PLAYING,
  enter() {
    time = 0;
    resetInput();
    platforms.setMode("playing");
    playTheme();
  },
  update() {
    time += 1;

    updateUI();
    ensureCollectibles();
    ensureEnemies();
    updateEntities();
    updateInteractions();
    updateVisualEffects();

    // State transitions stay in the state (not buried in helpers).
    if (isGameOver()) {
      enterGameOverFromPlaying(gameOverOptions());
      return;
    }

    if (time > PLAYING_TIME) {
      game.setState(states[GAME_STATE.ENDING]);
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
        print("press any ←,→,↑ to start", "center", 130);
        print("press S to toggle sound", "center", 210);
      }
    }

    if (time > 24 && time < 64) {
      print(startMessage, "center", 128 - 4 - 8);
      if (highScore > 0) {
        print("High Score " + highScore, "center", 128 + 4);
      }
    }

    if (time > 10) {
      print("" + score, "center", 12);
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
    updateVisualEffects();
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

states[GAME_STATE.ENDING] = {
  name: GAME_STATE.ENDING,
  enter() {
    // time = 0; // Not needed, continue from where we left off.
    winTimer = 0;
    resetInput();
    platforms.setMode("ending");
  },
  update() {
    time += 1;
    winTimer += 1;

    updateUI();

    if (isGameOver()) {
      enterGameOverFromPlaying(gameOverOptions());
      return;
    }

    if (playerHasReachedFlatTileSegement()) {
      scrollSpeed = 0;
      player.dx = 1.8;

      if (playerHasSkatedOffInTheSunset()) {
        if (input.left || input.right) {
          restartGame();
          return;
        }

        if (input.up) {
          resetGame();
          return;
        }
      }
    }

    if (!playerHasSkatedOffInTheSunset()) {
      updateEntities();
      updateInteractions();
    }

    updateVisualEffects();
  },
  draw(_, screen) {
    drawWorld(screen);

    if (playerHasReachedFlatTileSegement()) {
      if (highScoreUpdated) {
        print("You made it!", "center", 128 - 4 - 8);
        print("New high " + highScore, "center", 128 + 4);
      } else {
        print("You made it!", "center", "middle");
      }

      if (playerHasSkatedOffInTheSunset()) {
        print("Play again ← or →", "center", 186);
        print("Back to title ↑", "center", 202);
      }
    }

    print("" + score, "center", 36);
  },
};

/**
 * State transition functions
 */

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
 * Game loop
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
  platforms = createPlatforms(60);
  angels = [];
  carriedAngels = [];
  eggs = [];
  sparkles = [];
  electricExplosions = [];
  enemies = [];
  scrollSpeed = SCROLL_SPEED_SKATING;
  player.reset();
  enemies.push(createEnemy(SCREEN_WIDTH * 2, 72));
  startMessage = getStartMessage();
  deadTimer = 0;
  winTimer = 0;
  score = 0;
  scoring = createScoring();
  highScoreUpdated = false;
  collectibleStageIndex = 0;
  eggsSpawnedInStage = 0;
  angelsSpawnedInStage = 0;
  lastEggSpawnTime = -COLLECTIBLE_SPAWN_COOLDOWN;
  lastAngelSpawnTime = -COLLECTIBLE_SPAWN_COOLDOWN;

  if (!game.state) {
    game.setState(states[GAME_STATE.PRESS_START]);
  }
}

/**
 * -----------------------------
 * Update the game state
 * -----------------------------
 */

function update() {
  if (input.soundToggle) {
    toggleSound(themePosition);
    input.soundToggle = false;
  }

  if (input.reset) {
    input.reset = false;
    resetGame();
  }

  syncAudioWithGamePaused(paused);

  if (input.pause) {
    input.pause = false;
    paused = !paused;
  }

  if (paused) {
    return;
  }

  // The stars are ever-present in the background.
  // A more fitting place would maybe be to update them in the updateEntities() function.
  // But leave them here for now.
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
