const angelSpriteSheet = loadOnce("./images/collectibles-sprite-sheet.png");

const ANGEL_WIDTH = 16;
const ANGEL_HEIGHT = 16;
const ANGEL_HITBOX_WIDTH = 8;
const ANGEL_HITBOX_HEIGHT = 8;
const ANGEL_APPROACH_FRAMES = 75;
const ANGEL_APPROACH_ARC = 14;
/**
 * Follower ease towards the one in front of them.
 */
const ANGEL_FOLLOW_LERP = 0.1;
const ANGEL_DEPART_SPEED = 2;
const ANGEL_FLOAT_HEIGHT = 10;

/**
 * One table for every Astro Angel. enter runs on the transition;
 * update runs on the next update() call.
 */
function changeAngelState(angel, next) {
  if (angel.state === next) {
    return;
  }
  angelStates[angel.state]?.exit?.(angel);
  angel.state = next;
  angelStates[next].enter?.(angel);
}

function angelBob(angel) {
  return Math.sin(angel.tick * angel.bobSpeed) * angel.bobAmount;
}

function slotBehind(angel, leader) {
  return {
    x: leader.x - ANGEL_WIDTH + angel.offsetX,
    y: leader.y + angel.offsetY,
  };
}

const angelStates = {
  idle: {
    update(angel) {
      angel.x -= scrollSpeed;
      angel.tick += 1;
      angel.y = Math.round(angel.anchorY + angelBob(angel));
    },
  },

  approach: {
    enter(angel) {
      angel.approachStartX = angel.x;
      angel.approachStartY = angel.y;
      angel.approachProgress = 0;
    },
    update(angel, leader) {
      angel.approachStartX -= scrollSpeed;
      angel.approachProgress = Math.min(
        1,
        angel.approachProgress + 1 / ANGEL_APPROACH_FRAMES,
      );
      const t = angel.approachProgress;
      const eased = 1 - (1 - t) ** 3;
      const slot = slotBehind(angel, leader);
      const arc = Math.sin(Math.PI * t) * ANGEL_APPROACH_ARC;

      angel.x = angel.approachStartX + (slot.x - angel.approachStartX) * eased;
      angel.y =
        angel.approachStartY + (slot.y - angel.approachStartY) * eased - arc;

      if (t >= 1) {
        changeAngelState(angel, "follow");
      }
    },
  },

  follow: {
    update(angel, leader) {
      angel.tick += 1;
      const slot = slotBehind(angel, leader);
      angel.x += (slot.x - angel.x) * ANGEL_FOLLOW_LERP;
      angel.y += (slot.y + angelBob(angel) - angel.y) * ANGEL_FOLLOW_LERP;
    },
  },

  dispatch: {
    update(angel) {
      angel.y = Math.round(angel.y - ANGEL_DEPART_SPEED);
      angel.x = Math.round(angel.x + 1);
    },
  },
};

function createAngel(tiles, occupiedSpots = []) {
  const initialPosition = findSpreadCollectiblePosition(tiles, occupiedSpots, {
    spriteWidth: ANGEL_WIDTH,
    spriteHeight: ANGEL_HEIGHT,
    floatHeight: ANGEL_FLOAT_HEIGHT,
  });

  if (initialPosition === null) {
    return;
  }

  return {
    x: initialPosition.x,
    y: initialPosition.y,
    width: ANGEL_WIDTH,
    height: ANGEL_HEIGHT,
    state: "idle",
    anchorY: initialPosition.y,
    tick: 0,
    bobAmount: 2 + Math.random() * 2,
    bobSpeed: 0.1 + Math.random() * 0.07,
    offsetX: randomInRange(-2, 2),
    offsetY: randomInRange(-3, 3),
    approachStartX: 0,
    approachStartY: 0,
    approachProgress: 0,

    getHitbox() {
      return {
        x: this.x + (ANGEL_WIDTH - ANGEL_HITBOX_WIDTH) / 2,
        y: this.y + (ANGEL_HEIGHT - ANGEL_HITBOX_HEIGHT) / 2,
        width: ANGEL_HITBOX_WIDTH,
        height: ANGEL_HITBOX_HEIGHT,
      };
    },

    beginApproach() {
      changeAngelState(this, "approach");
    },

    dispatch() {
      changeAngelState(this, "dispatch");
    },

    update(leader) {
      angelStates[this.state].update(this, leader);
    },

    draw(screen) {
      const drawX = Math.round(this.x);
      const drawY = Math.round(this.y);

      screen.drawImage(
        angelSpriteSheet,
        0,
        0,
        ANGEL_WIDTH,
        ANGEL_HEIGHT,
        drawX,
        drawY,
        ANGEL_WIDTH,
        ANGEL_HEIGHT,
      );
    },
  };
}
