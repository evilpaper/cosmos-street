const angelSpriteSheet = loadOnce("./images/collectibles-sprite-sheet.png");

const ANGEL_WIDTH = 16;
const ANGEL_HEIGHT = 16;
const ANGEL_BASE_GAP = 16;
const ANGEL_CHASE = 0.2;
const ANGEL_JITTER = 3;
const ANGEL_APPROACH_FRAMES = 75;
const ANGEL_APPROACH_ARC = 14;

function createAngel(tiles, existingBoxes = []) {
  const HITBOX_WIDTH = 8;
  const HITBOX_HEIGHT = 8;
  const OSCILLATION_AMPLITUDE = 2 + Math.random() * 2;
  const OSCILLATION_SPEED = 0.1 + Math.random() * 0.07;
  const FLOAT_HEIGHT = 10;
  const DEPART_SPEED = 2;

  const initialPosition = findSpreadCollectiblePosition(tiles, existingBoxes, {
    spriteWidth: ANGEL_WIDTH,
    spriteHeight: ANGEL_HEIGHT,
    floatHeight: FLOAT_HEIGHT,
  });

  if (initialPosition === null) {
    return;
  }

  let tick = 0;
  const jitterX = randomInRange(-ANGEL_JITTER, ANGEL_JITTER);
  const jitterY = randomInRange(-ANGEL_JITTER, ANGEL_JITTER);

  function slotBehind(leader) {
    return {
      x: leader.x - ANGEL_BASE_GAP + jitterX,
      y: leader.y + jitterY,
    };
  }

  function updateIdle(angel) {
    angel.x -= scrollSpeed;
    tick += 1;
    angel.y = Math.round(
      initialPosition.y +
        Math.sin(tick * OSCILLATION_SPEED) * OSCILLATION_AMPLITUDE,
    );
  }

  function updateApproach(angel, leader) {
    angel.approachStartX -= scrollSpeed;
    angel.approachProgress = Math.min(
      1,
      angel.approachProgress + 1 / ANGEL_APPROACH_FRAMES,
    );
    const t = angel.approachProgress;
    const eased = 1 - (1 - t) ** 3;
    const slot = slotBehind(leader);
    const arc = Math.sin(Math.PI * t) * ANGEL_APPROACH_ARC;

    angel.x = angel.approachStartX + (slot.x - angel.approachStartX) * eased;
    angel.y =
      angel.approachStartY + (slot.y - angel.approachStartY) * eased - arc;

    if (t >= 1) {
      angel.state = "follow";
    }
  }

  function updateFollow(angel, leader) {
    tick += 1;
    const slot = slotBehind(leader);
    const oscillation =
      Math.sin(tick * OSCILLATION_SPEED) * OSCILLATION_AMPLITUDE;
    angel.x += (slot.x - angel.x) * ANGEL_CHASE;
    angel.y += (slot.y + oscillation - angel.y) * ANGEL_CHASE;
  }

  function updateDispatch(angel) {
    angel.y = Math.round(angel.y - DEPART_SPEED);
    angel.x = Math.round(angel.x + 1);
  }

  const updateByState = {
    idle: updateIdle,
    approach: updateApproach,
    follow: updateFollow,
    dispatch: updateDispatch,
  };

  return {
    x: initialPosition.x,
    y: initialPosition.y,
    width: ANGEL_WIDTH,
    height: ANGEL_HEIGHT,
    state: "idle",
    approachStartX: 0,
    approachStartY: 0,
    approachProgress: 0,

    getHitbox() {
      return {
        x: this.x + (ANGEL_WIDTH - HITBOX_WIDTH) / 2,
        y: this.y + (ANGEL_HEIGHT - HITBOX_HEIGHT) / 2,
        width: HITBOX_WIDTH,
        height: HITBOX_HEIGHT,
      };
    },

    getTick() {
      return tick;
    },

    update(leader) {
      updateByState[this.state]?.(this, leader);
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
