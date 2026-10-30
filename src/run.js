/**
 * One Run: the lists and the frame order for a single play.
 * Playing, Game over, and Ending all call step().
 */

const COLLECTIBLE_SPAWN_COOLDOWN = 3 * 60;

const DIFFICULTY_STAGES = [
  {
    time: 0,
    gapMin: 40,
    gapMax: 64,
    tilesMin: 4,
    tilesMax: 14,
    platformYMin: 80,
    platformYRange: 120,
    eggBudget: 1,
    angelsMaxPerStage: 3,
    angelsMaxActive: 2,
    relicTelliesMin: 1,
    relicTellySpeedBonus: 0,
    electricityChance: 0.015,
  },
  {
    time: 6 * 60,
    gapMin: 48,
    gapMax: 72,
    tilesMin: 3,
    tilesMax: 12,
    platformYMin: 80,
    platformYRange: 120,
    eggBudget: 1,
    angelsMaxPerStage: 3,
    angelsMaxActive: 2,
    relicTelliesMin: 1,
    relicTellySpeedBonus: 0.15,
    electricityChance: 0.02,
  },
  {
    time: 12 * 60,
    gapMin: 56,
    gapMax: 80,
    tilesMin: 2,
    tilesMax: 10,
    platformYMin: 80,
    platformYRange: 120,
    eggBudget: 1,
    angelsMaxPerStage: 4,
    angelsMaxActive: 3,
    relicTelliesMin: 2,
    relicTellySpeedBonus: 0.3,
    electricityChance: 0.025,
  },
  {
    time: 18 * 60,
    gapMin: 64,
    gapMax: 96,
    tilesMin: 2,
    tilesMax: 8,
    platformYMin: 80,
    platformYRange: 120,
    eggBudget: 2,
    angelsMaxPerStage: 4,
    angelsMaxActive: 3,
    relicTelliesMin: 3,
    relicTellySpeedBonus: 0.5,
    electricityChance: 0.03,
  },
  {
    time: 24 * 60,
    gapMin: 72,
    gapMax: 104,
    tilesMin: 1,
    tilesMax: 6,
    platformYMin: 80,
    platformYRange: 120,
    eggBudget: 2,
    angelsMaxPerStage: 1,
    angelsMaxActive: 1,
    relicTelliesMin: 4,
    relicTellySpeedBonus: 0.75,
    electricityChance: 0.035,
  },
];

let time = 0;
let highScore = 0;
let run = null;

function getDifficulty() {
  let current = DIFFICULTY_STAGES[0];
  for (const stage of DIFFICULTY_STAGES) {
    if (time >= stage.time) {
      current = stage;
    }
  }
  return current;
}

const MIN_DISTANCE_AFTER_EDGE = -100;
const RELIC_TELLY_SPAWN_X = SCREEN_WIDTH + 12;
const RELIC_TELLY_SPAWN_Y_MIN = 48;
const RELIC_TELLY_SPAWN_Y_MAX = 164;
const RELIC_TELLY_SPAWN_GAP_MIN = 80;
const RELIC_TELLY_SPAWN_GAP_MAX = 140;

function hasPassedLeftEdge(entity) {
  return entity.x + entity.width < MIN_DISTANCE_AFTER_EDGE;
}

function hasPassedTopEdge(entity) {
  return entity.y + entity.height < MIN_DISTANCE_AFTER_EDGE;
}

function overlapsPlayfield(entity) {
  return (
    entity.x < SCREEN_WIDTH &&
    entity.x + entity.width > 0 &&
    entity.y < SCREEN_HEIGHT &&
    entity.y + entity.height > 0
  );
}

function makeRun(playingTicks, startTime = 0) {
  let angels = [];
  let carriedAngels = [];
  let eggs = [];
  let sparkles = [];
  let dotExplosions = [];
  let relicTellies = [];
  let score = 0;
  let highScoreUpdated = false;
  let collectibleStageIndex = 0;
  let eggsSpawnedInStage = 0;
  let angelsSpawnedInStage = 0;
  let lastEggSpawnTime = -COLLECTIBLE_SPAWN_COOLDOWN;
  let lastAngelSpawnTime = -COLLECTIBLE_SPAWN_COOLDOWN;
  let over = false;
  let fell = false;
  let timeUp = false;

  time = startTime;
  scrollSpeed = SCROLL_SPEED_SKATING;
  player.reset();
  platforms.setMode("playing");
  relicTellies.push(makeRelicTelly(SCREEN_WIDTH * 2, 72));

  function updateEntities() {
    platforms.update();
    player.update(platforms.tiles, time);

    for (const angel of angels) {
      if (!carriedAngels.includes(angel)) {
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

    for (const relicTelly of relicTellies) {
      relicTelly.update();
    }
    relicTellies = relicTellies.filter((relicTelly) => !relicTelly.isDone());
  }

  function draw(screen) {
    platforms.draw(screen);

    for (const relicTelly of relicTellies) {
      relicTelly.draw(screen);
    }

    for (const sparkle of sparkles) {
      sparkle.draw(screen);
    }

    for (const explosion of dotExplosions) {
      explosion.draw();
    }

    for (const angel of angels) {
      angel.draw(screen);
    }

    player.draw(screen);

    for (const egg of eggs) {
      egg.draw(screen);
    }
  }

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

  function stageMidpointReached() {
    const start = DIFFICULTY_STAGES[collectibleStageIndex].time;
    const next = DIFFICULTY_STAGES[collectibleStageIndex + 1];
    const end = next ? next.time : playingTicks;
    return time >= start + (end - start) / 2;
  }

  function occupiedCollectibleSpots() {
    const spots = [];
    for (const egg of eggs) {
      spots.push({ x: egg.x, y: egg.y, width: egg.width, height: egg.height });
    }
    for (const angel of angels) {
      if (angel.state !== "idle") continue;
      spots.push({
        x: angel.x,
        y: angel.y,
        width: angel.width,
        height: angel.height,
      });
    }
    return spots;
  }

  function ensureCollectibles() {
    resetCollectibleBudgetOnStageChange();
    const diff = getDifficulty();
    let occupiedSpots = occupiedCollectibleSpots();

    const idleAngels = angels.filter((angel) => angel.state === "idle");

    if (
      idleAngels.length < diff.angelsMaxActive &&
      angelsSpawnedInStage < diff.angelsMaxPerStage &&
      time - lastAngelSpawnTime >= COLLECTIBLE_SPAWN_COOLDOWN
    ) {
      const angel = makeAngel(platforms.tiles, occupiedSpots);
      if (angel) {
        angels.push(angel);
        occupiedSpots.push({
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
      angelsSpawnedInStage >= 1 &&
      stageMidpointReached() &&
      eggsSpawnedInStage < diff.eggBudget &&
      time - lastEggSpawnTime >= COLLECTIBLE_SPAWN_COOLDOWN
    ) {
      const egg = makeEgg(platforms.tiles, occupiedSpots);
      if (egg) {
        eggs.push(egg);
        eggsSpawnedInStage += 1;
        lastEggSpawnTime = time;
      }
    }
  }

  function relicTellyYIsTaken(y) {
    return relicTellies.some(
      (relicTelly) =>
        relicTelly.x + relicTelly.width > 0 && Math.abs(relicTelly.y - y) < relicTelly.height,
    );
  }

  function rollRelicTellyY() {
    for (let attempt = 0; attempt < 8; attempt++) {
      const y = randomInRange(RELIC_TELLY_SPAWN_Y_MIN, RELIC_TELLY_SPAWN_Y_MAX);
      if (!relicTellyYIsTaken(y)) {
        return y;
      }
    }
    return randomInRange(RELIC_TELLY_SPAWN_Y_MIN, RELIC_TELLY_SPAWN_Y_MAX);
  }

  function relicTellySpawnX() {
    const gap = randomInRange(RELIC_TELLY_SPAWN_GAP_MIN, RELIC_TELLY_SPAWN_GAP_MAX);
    const rightmost = relicTellies.reduce((max, relicTelly) => Math.max(max, relicTelly.x), 0);
    return Math.max(RELIC_TELLY_SPAWN_X, rightmost + gap);
  }

  function spawnRelicTelly() {
    relicTellies.push(makeRelicTelly(relicTellySpawnX(), rollRelicTellyY()));
  }

  function ensureRelicTellies() {
    if (relicTellies.length < getDifficulty().relicTelliesMin) {
      spawnRelicTelly();
    }
  }

  function updateVisualEffects() {
    for (const sparkle of sparkles) {
      sparkle.update();
    }
    sparkles = sparkles.filter((sparkle) => !sparkle.isDone());

    for (const explosion of dotExplosions) {
      explosion.update();
    }
    dotExplosions = dotExplosions.filter((explosion) => !explosion.isDone());
  }

  function spendAirJump() {
    const angel = carriedAngels.shift();
    if (!angel) {
      return false;
    }
    angel.dispatch();
    return true;
  }

  function addScore(points) {
    score += points;
    if (score > highScore) {
      highScore = score;
      highScoreUpdated = true;
    }
  }

  function collectAngel(angel) {
    angel.beginApproach();
    carriedAngels.push(angel);
    addScore(carriedAngels.length);
    sfx(sounds.angel);
  }

  function collectAngels() {
    for (const angel of angels) {
      if (angel.state !== "idle") continue;
      if (!checkCollision(player, angel.getHitbox())) continue;
      collectAngel(angel);
      sparkles.push(makeSparkle(angel.x, angel.y - 8));
    }
  }

  function destroyOnScreenRelicTellies() {
    let destroyed = 0;
    for (const relicTelly of relicTellies) {
      if (relicTelly.state === "exploding") {
        continue;
      }
      if (!overlapsPlayfield(relicTelly)) {
        continue;
      }
      relicTelly.explode();
      destroyed += 1;
    }
    return destroyed;
  }

  function collectEgg(index) {
    const egg = eggs[index];
    eggs.splice(index, 1);
    sfx(sounds.egg);
    dotExplosions.push(
      makeDotExplosion(egg.x + egg.width / 2, egg.y + egg.height / 2, {
        cycleColors: false,
      }),
    );

    if (destroyOnScreenRelicTellies() > 0) {
      sfx(sounds.relicTellyKill);
    }
  }

  function collectEggs() {
    for (let i = eggs.length - 1; i >= 0; i--) {
      if (checkCollision(player, eggs[i].getHitbox())) {
        collectEgg(i);
      }
    }
  }

  function respawnRelicTelly(relicTelly) {
    relicTellies.splice(relicTellies.indexOf(relicTelly), 1);

    if (timeUp) {
      return;
    }

    spawnRelicTelly();
  }

  function handleRelicTellyEncounters() {
    for (let i = relicTellies.length - 1; i >= 0; i--) {
      const relicTelly = relicTellies[i];
      if (
        relicTelly.state !== "exploding" &&
        checkCollision(player, relicTelly.getHitbox())
      ) {
        if (player.state !== "obliterating") {
          sfx(sounds.crash);
        }
        player.obliterate();
      }

      if (relicTelly.x + relicTelly.width < 0) {
        if (relicTelly.state === "exploding") {
          relicTellies.splice(i, 1);
        } else {
          respawnRelicTelly(relicTelly);
        }
      }
    }
  }

  function updateInteractions() {
    collectAngels();
    collectEggs();
    handleRelicTellyEncounters();
  }

  function playerHasFallenOffScreen() {
    return player.y > 500;
  }

  function isGameOver() {
    return playerHasFallenOffScreen() || player.isDead;
  }

  function flatTileReached() {
    return platforms.tiles.some((tile) => tile.type === "flat" && tile.x < 24);
  }

  function skatedOff() {
    return player.x > 256;
  }

  function latchOver() {
    over = true;
    fell = playerHasFallenOffScreen();
    scrollSpeed = 0;
  }

  function stepPlaying() {
    ensureCollectibles();
    ensureRelicTellies();
    updateEntities();
    updateInteractions();
    updateVisualEffects();

    if (isGameOver()) {
      latchOver();
      return;
    }

    if (time > playingTicks) {
      timeUp = true;
      platforms.setMode("ending");
    }
  }

  function stepGameOver() {
    scrollSpeed = 0;
    updateEntities();
    updateVisualEffects();
  }

  function stepEnding() {
    if (isGameOver()) {
      latchOver();
      return;
    }

    if (flatTileReached()) {
      scrollSpeed = 0;
      player.dx = 1.8;
    }

    if (!skatedOff()) {
      updateEntities();
      updateInteractions();
    }

    updateVisualEffects();
  }

  function step() {
    time += 1;

    if (over) {
      stepGameOver();
    } else if (timeUp) {
      stepEnding();
    } else {
      stepPlaying();
    }

    return report();
  }

  function report() {
    return {
      time,
      score,
      over,
      fell,
      timeUp,
      flatTile: flatTileReached(),
      skatedOff: skatedOff(),
      highScoreUpdated,
      failed: isGameOver(),
    };
  }

  run = {
    step,
    draw,
    spendAirJump,
    get report() {
      return report();
    },
  };

  return run;
}
