const angelSpriteSheet = loadOnce("./images/collectibles-sprite-sheet.png");

function createAngel(tiles, existingBoxes = []) {
  const WIDTH = 16;
  const HEIGHT = 16;
  const HITBOX_WIDTH = 8;
  const HITBOX_HEIGHT = 8;
  const OSCILLATION_AMPLITUDE = 2;
  const OSCILLATION_SPEED = 0.1;
  const INTRO_DURATION_FRAMES = 30;
  const FLOAT_HEIGHT = 10;
  const DEPART_SPEED = 2;

  const STATES = ["idle", "approach", "follow", "dispatch"];

  const initialPosition = findSpreadCollectiblePosition(tiles, existingBoxes, {
    spriteWidth: WIDTH,
    spriteHeight: HEIGHT,
    floatHeight: FLOAT_HEIGHT,
  });

  if (initialPosition === null) {
    return;
  }

  let tick = 0;
  let x = initialPosition.x;
  let y = initialPosition.y;
  let introProgress = 0;

  function updateIdle(angel) {
    angel.x -= scrollSpeed;
    tick += 1;
    angel.y = Math.round(
      initialPosition.y +
        Math.sin(tick * OSCILLATION_SPEED) * OSCILLATION_AMPLITUDE,
    );
  }

  function updateApproach(angel) {
    angel.pickedUpX -= frameScroll;
    introProgress = Math.min(1, introProgress + 1 / INTRO_DURATION_FRAMES);
    const eased = 1 - (1 - introProgress) ** 3;
    angel.x = Math.round(
      angel.pickedUpX + (angel.slotX - angel.pickedUpX) * eased,
    );
    angel.y = Math.round(
      angel.pickedUpY + (angel.slotY - angel.pickedUpY) * eased,
    );
    if (introProgress >= 1) {
      angel.state = "follow";
    }
  }

  function updateFollow(angel) {
    tick += 1;
    angel.x = Math.round(angel.slotX);
    angel.y = Math.round(
      angel.slotY + Math.sin(tick * OSCILLATION_SPEED) * OSCILLATION_AMPLITUDE,
    );
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
    x: x,
    y: y,
    width: WIDTH,
    height: HEIGHT,
    state: STATES[0],
    slotX: x,
    slotY: y,
    trailDistance: null,

    getHitbox() {
      return {
        x: this.x + (WIDTH - HITBOX_WIDTH) / 2,
        y: this.y + (HEIGHT - HITBOX_HEIGHT) / 2,
        width: HITBOX_WIDTH,
        height: HITBOX_HEIGHT,
      };
    },

    getTick() {
      return tick;
    },

    update(player) {
      updateByState[this.state]?.(this, player);
    },

    draw(screen) {
      const spriteFrameX = 0;
      const spriteFrameY = 0;

      const drawX = Math.round(this.x);
      const drawY = Math.round(this.y);

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
  };
}
