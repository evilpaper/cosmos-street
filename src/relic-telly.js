const relicTellySpriteSheet = loadOnce("./images/relic-telly-sprite-sheet.png");

const RELIC_TELLY_WIDTH = 16;
const RELIC_TELLY_HEIGHT = 25;
const RELIC_TELLY_TICKS_PER_FRAME = 8;
const RELIC_TELLY_TOTAL_FRAMES = 10;
const RELIC_TELLY_HITBOX_WIDTH = 8;
const RELIC_TELLY_HITBOX_HEIGHT = 16;
const RELIC_TELLY_SPEED_MIN = 0.25;
const RELIC_TELLY_SPEED_MAX = 1;
const RELIC_TELLY_SHAKE_DISTANCE_MIN = 1;
const RELIC_TELLY_SHAKE_DISTANCE_MAX = 1;
const RELIC_TELLY_SHAKE_DURATION_MIN = 15;
const RELIC_TELLY_SHAKE_DURATION_MAX = 25;
const RELIC_TELLY_SHAKE_TICKS_PER_POSITION = 3;

/**
 * exit and enter run once, at this switch: clear the old state, prepare the new one.
 * The new state's update starts on the next update() call, then every frame it stays there.
 */
function changeRelicTellyState(relicTelly, next) {
  if (relicTelly.state === next) {
    return;
  }
  relicTellyStates[relicTelly.state]?.exit?.(relicTelly);
  relicTelly.state = next;
  relicTellyStates[next].enter?.(relicTelly);
}

/**
 * One step left: world scroll, plus this Relic Telly's own speed.
 */
function moveRelicTellyLeft(relicTelly) {
  const diff = getDifficulty();
  relicTelly.x -= scrollSpeed + relicTelly.speed + diff.relicTellySpeedBonus;
}

function shakeAmount() {
  const distance = randomInRange(
    RELIC_TELLY_SHAKE_DISTANCE_MIN,
    RELIC_TELLY_SHAKE_DISTANCE_MAX,
  );
  const direction = Math.random() < 0.5 ? -1 : 1;
  return distance * direction;
}

/**
 * Same distance, opposite direction from the last step.
 * y is the original position plus that amount.
 */
function shake(relicTelly) {
  if (relicTelly.shakeStepTick <= 0) {
    relicTelly.shakeY =
      relicTelly.shakeY === 0 ? shakeAmount() : -relicTelly.shakeY;
    relicTelly.shakeStepTick = RELIC_TELLY_SHAKE_TICKS_PER_POSITION;
  }
  relicTelly.shakeStepTick -= 1;
  relicTelly.y = relicTelly.originY + relicTelly.shakeY;
}

/**
 * Put the Relic Telly back on its original y and forget the shake.
 */
function stopShake(relicTelly) {
  relicTelly.y = relicTelly.originY;
  relicTelly.shakeY = 0;
  relicTelly.shakeStepTick = 0;
}

function advanceRelicTellySprite(relicTelly) {
  relicTelly.animationTick += 1;

  if (relicTelly.animationTick >= RELIC_TELLY_TICKS_PER_FRAME) {
    relicTelly.animationTick = 0;
    relicTelly.animationFrameIndex += 1;

    if (relicTelly.animationFrameIndex >= RELIC_TELLY_TOTAL_FRAMES) {
      relicTelly.animationFrameIndex = 0;
    }
  }
}

function drawRelicTellySprite(relicTelly, screen) {
  const spriteFrameX = relicTelly.animationFrameIndex * RELIC_TELLY_WIDTH;
  const drawX = Math.round(relicTelly.x);
  const drawY = Math.round(relicTelly.y);

  /**
   * Draw the Relic Telly hitbox. For debugging purposes.
   */

  // screen.lineWidth = 1;
  // screen.strokeStyle = "magenta";
  // screen.strokeRect(relicTelly.getHitbox().x, relicTelly.getHitbox().y, relicTelly.getHitbox().width, relicTelly.getHitbox().height);

  /**
   * End of debugging code.
   */

  screen.drawImage(
    relicTellySpriteSheet,
    spriteFrameX,
    0,
    RELIC_TELLY_WIDTH,
    RELIC_TELLY_HEIGHT,
    drawX,
    drawY,
    RELIC_TELLY_WIDTH,
    RELIC_TELLY_HEIGHT,
  );
}

const relicTellyStates = {
  roaming: {
    update(relicTelly) {
      moveRelicTellyLeft(relicTelly);
      advanceRelicTellySprite(relicTelly);

      if (Math.random() < getDifficulty().electricityChance) {
        changeRelicTellyState(relicTelly, "shaking");
      }
    },
    draw: drawRelicTellySprite,
  },

  shaking: {
    enter(relicTelly) {
      relicTelly.shakeTicks = randomInRange(
        RELIC_TELLY_SHAKE_DURATION_MIN,
        RELIC_TELLY_SHAKE_DURATION_MAX,
      );
    },
    exit(relicTelly) {
      stopShake(relicTelly);
    },
    update(relicTelly) {
      moveRelicTellyLeft(relicTelly);
      advanceRelicTellySprite(relicTelly);
      shake(relicTelly);

      /**
       * A frame that starts with no ticks left is Zapping,
       * and it keeps this shake.
       */
      if (relicTelly.shakeTicks <= 0) {
        changeRelicTellyState(relicTelly, "zapping");
        return;
      }
      relicTelly.shakeTicks -= 1;
    },
    draw: drawRelicTellySprite,
  },

  zapping: {
    enter(relicTelly) {
      /**
       * Only play sound if the Relic Telly is on the screen.
       */
      if (relicTelly.x > 20 && relicTelly.x < 236) {
        sfx(sounds.electrified, 1);
      }
      relicTelly.electricity.reset();
    },
    update(relicTelly) {
      moveRelicTellyLeft(relicTelly);
      advanceRelicTellySprite(relicTelly);

      // Stop after the electricity animation finishes.
      if (relicTelly.electricity.isDone()) {
        changeRelicTellyState(relicTelly, "roaming");
        return;
      }
      relicTelly.electricity.update();
    },
    draw(relicTelly, screen) {
      drawRelicTellySprite(relicTelly, screen);
      relicTelly.electricity.draw(screen);
    },
  },

  exploding: {
    enter(relicTelly) {
      stopShake(relicTelly);
      relicTelly.explosion = makeElectricExplosion(relicTelly);
    },
    update(relicTelly) {
      relicTelly.x -= scrollSpeed;
      relicTelly.y -= 0.2;
      relicTelly.explosion.update();
    },
    draw(relicTelly, screen) {
      relicTelly.explosion.draw(screen);
    },
  },
};

function makeRelicTelly(x, y) {
  const relicTelly = {
    x: x,
    y: y,
    originY: y,
    width: RELIC_TELLY_WIDTH,
    height: RELIC_TELLY_HEIGHT,
    state: "roaming",
    speed:
      RELIC_TELLY_SPEED_MIN +
      Math.random() * (RELIC_TELLY_SPEED_MAX - RELIC_TELLY_SPEED_MIN),
    animationTick: 0,
    animationFrameIndex: 0,
    shakeY: 0,
    shakeStepTick: 0,
    shakeTicks: 0,
    explosion: null,

    getHitbox() {
      return {
        x: this.x + (RELIC_TELLY_WIDTH - RELIC_TELLY_HITBOX_WIDTH) / 2,
        y: this.y + (RELIC_TELLY_HEIGHT - RELIC_TELLY_HITBOX_HEIGHT) / 2,
        width: RELIC_TELLY_HITBOX_WIDTH,
        height: RELIC_TELLY_HITBOX_HEIGHT,
      };
    },

    explode() {
      changeRelicTellyState(this, "exploding");
    },

    isDone() {
      return this.state === "exploding" && this.explosion?.isDone();
    },

    update() {
      relicTellyStates[this.state].update(this);
    },

    draw(screen) {
      relicTellyStates[this.state].draw(this, screen);
    },
  };

  /**
   * makeRelicTellyElectricity(relicTelly) closes over that Relic Telly.
   * On each frame, draw uses target.x / target.y (and width / height for offsets) so the
   * lightning follows the Relic Telly—same idea as makeSkateboardSparkle(player) following the player.
   * The factory has to receive the real Relic Telly, not a copy of coordinates.
   */

  relicTelly.electricity = makeRelicTellyElectricity(relicTelly);

  return relicTelly;
}
