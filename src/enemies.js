const enemySpriteSheet = loadOnce("./images/enemy-sprite-sheet.png");

const ENEMY_WIDTH = 16;
const ENEMY_HEIGHT = 25;
const ENEMY_TICKS_PER_FRAME = 8;
const ENEMY_TOTAL_FRAMES = 10;
const ENEMY_HITBOX_WIDTH = 8;
const ENEMY_HITBOX_HEIGHT = 16;
const ENEMY_SPEED_MIN = 0.25;
const ENEMY_SPEED_MAX = 1;
const ENEMY_SHAKE_MIN = 1;
const ENEMY_SHAKE_MAX = 2;
const ENEMY_SHAKE_TICKS_MIN = 10;
const ENEMY_SHAKE_TICKS_MAX = 30;
const ENEMY_SHAKE_HOLD_TICKS = 2;

/**
 * One table for every Enemy. enter runs on the transition;
 * update runs on the next update() call.
 */
function transitionEnemy(enemy, next) {
  if (enemy.state === next) {
    return;
  }
  enemyHandlers[enemy.state]?.exit?.(enemy);
  enemy.state = next;
  enemyHandlers[next].enter?.(enemy);
}

/**
 * One step left: world scroll, plus this Enemy's own speed.
 */
function moveEnemyLeft(enemy) {
  const diff = getDifficulty();
  enemy.x -= scrollSpeed + enemy.speed + diff.enemySpeedBonus;
}

function shakeAmount() {
  const distance = randomInRange(ENEMY_SHAKE_MIN, ENEMY_SHAKE_MAX);
  const direction = Math.random() < 0.5 ? -1 : 1;
  return distance * direction;
}

/**
 * Same distance, opposite direction from the last step.
 * y is the original position plus that amount.
 */
function shake(enemy) {
  if (enemy.shakeStepTick <= 0) {
    enemy.shakeY = enemy.shakeY === 0 ? shakeAmount() : -enemy.shakeY;
    enemy.shakeStepTick = ENEMY_SHAKE_HOLD_TICKS;
  }
  enemy.shakeStepTick -= 1;
  enemy.y = enemy.originY + enemy.shakeY;
}

/**
 * Put the Enemy back on its original y and forget the shake.
 */
function stopShake(enemy) {
  enemy.y = enemy.originY;
  enemy.shakeY = 0;
  enemy.shakeStepTick = 0;
}

function advanceEnemySprite(enemy) {
  enemy.animationTick += 1;

  if (enemy.animationTick >= ENEMY_TICKS_PER_FRAME) {
    enemy.animationTick = 0;
    enemy.animationFrameIndex += 1;

    if (enemy.animationFrameIndex >= ENEMY_TOTAL_FRAMES) {
      enemy.animationFrameIndex = 0;
    }
  }
}

function drawEnemySprite(enemy, screen) {
  const spriteFrameX = enemy.animationFrameIndex * ENEMY_WIDTH;
  const drawX = Math.round(enemy.x);
  const drawY = Math.round(enemy.y);

  /**
   * Draw enemy hitbox. For debugging purposes.
   */

  // screen.lineWidth = 1;
  // screen.strokeStyle = "magenta";
  // screen.strokeRect(enemy.getHitbox().x, enemy.getHitbox().y, enemy.getHitbox().width, enemy.getHitbox().height);

  screen.drawImage(
    enemySpriteSheet,
    spriteFrameX,
    0,
    ENEMY_WIDTH,
    ENEMY_HEIGHT,
    drawX,
    drawY,
    ENEMY_WIDTH,
    ENEMY_HEIGHT,
  );
}

const enemyHandlers = {
  roaming: {
    update(enemy) {
      moveEnemyLeft(enemy);
      advanceEnemySprite(enemy);

      if (Math.random() < getDifficulty().electricityChance) {
        transitionEnemy(enemy, "shaking");
      }
    },
    draw: drawEnemySprite,
  },

  shaking: {
    enter(enemy) {
      enemy.shakeTicks = randomInRange(
        ENEMY_SHAKE_TICKS_MIN,
        ENEMY_SHAKE_TICKS_MAX,
      );
    },
    update(enemy) {
      moveEnemyLeft(enemy);
      advanceEnemySprite(enemy);
      shake(enemy);

      /**
       * A frame that starts with no ticks left is Zapping,
       * and it keeps this shake.
       */
      if (enemy.shakeTicks <= 0) {
        transitionEnemy(enemy, "zapping");
        return;
      }
      enemy.shakeTicks -= 1;
    },
    draw: drawEnemySprite,
  },

  zapping: {
    enter(enemy) {
      /**
       * Only play sound if enemy is on the screen.
       */
      if (enemy.x > 20 && enemy.x < 236) {
        sfx(sounds.electrified, 1);
      }
      enemy.electricity.reset();
    },
    exit(enemy) {
      stopShake(enemy);
    },
    update(enemy) {
      moveEnemyLeft(enemy);
      advanceEnemySprite(enemy);

      // Stop after the electricity animation finishes.
      if (enemy.electricity.isDone()) {
        transitionEnemy(enemy, "roaming");
        return;
      }
      enemy.electricity.update();
      shake(enemy);
    },
    draw(enemy, screen) {
      drawEnemySprite(enemy, screen);
      enemy.electricity.draw(screen);
    },
  },

  exploding: {
    enter(enemy) {
      stopShake(enemy);
      enemy.explosion = createElectricExplosion(enemy);
    },
    update(enemy) {
      enemy.x -= scrollSpeed;
      enemy.y -= 0.2;
      enemy.explosion.update();
    },
    draw(enemy, screen) {
      enemy.explosion.draw(screen);
    },
  },
};

function createEnemy(x, y) {
  const enemy = {
    x: x,
    y: y,
    originY: y,
    width: ENEMY_WIDTH,
    height: ENEMY_HEIGHT,
    state: "roaming",
    speed:
      ENEMY_SPEED_MIN + Math.random() * (ENEMY_SPEED_MAX - ENEMY_SPEED_MIN),
    animationTick: 0,
    animationFrameIndex: 0,
    shakeY: 0,
    shakeStepTick: 0,
    shakeTicks: 0,
    explosion: null,

    getHitbox() {
      return {
        x: this.x + (ENEMY_WIDTH - ENEMY_HITBOX_WIDTH) / 2,
        y: this.y + (ENEMY_HEIGHT - ENEMY_HITBOX_HEIGHT) / 2,
        width: ENEMY_HITBOX_WIDTH,
        height: ENEMY_HITBOX_HEIGHT,
      };
    },

    explode() {
      transitionEnemy(this, "exploding");
    },

    isDone() {
      return this.state === "exploding" && this.explosion?.isDone();
    },

    update() {
      enemyHandlers[this.state].update(this);
    },

    draw(screen) {
      enemyHandlers[this.state].draw(this, screen);
    },
  };

  /**
   * createEnemyElectricity(enemy) closes over that enemy object.
   * On each frame, draw uses target.x / target.y (and width / height for offsets) so the
   * lightning follows the enemy—same idea as createSkateboardSparkle(player) following the player.
   * The factory has to receive the real enemy instance, not a copy of coordinates.
   */

  enemy.electricity = createEnemyElectricity(enemy);

  return enemy;
}
