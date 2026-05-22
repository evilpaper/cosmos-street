const angelSpriteSheet = loadOnce("./images/collectibles-sprite-sheet.png");

function findAngelPositionOnTile(
  tiles,
  { screenWidth, spriteWidth, spriteHeight, floatHeight },
) {
  const eligibleTiles = tiles.filter((tile) => tile.x > screenWidth);

  if (eligibleTiles.length > 0) {
    const tile =
      eligibleTiles[Math.floor(Math.random() * eligibleTiles.length)];
    return {
      x: tile.x + tile.width / 2 - spriteWidth / 2,
      y: tile.y - spriteHeight - floatHeight,
    };
  }

  return null;
}

function createAngel(tiles) {
  const WIDTH = 16;
  const HEIGHT = 16;
  const HITBOX_WIDTH = 8;
  const HITBOX_HEIGHT = 8;
  const OSCILLATION_AMPLITUDE = 2;
  const OSCILLATION_SPEED = 0.1;
  const ANCHOR_OFFSET_X = -16;
  const ANCHOR_OFFSET_Y = -16;
  const INTRO_DURATION_FRAMES = 30;
  const FLOAT_HEIGHT = 10;
  const DEPART_SPEED = 2;

  const STATES = ["idle", "approach", "follow", "leave"];

  const spawnOptions = {
    screenWidth: SCREEN_WIDTH, // Use the global SCREEN_WIDTH constant.
    spriteWidth: WIDTH,
    spriteHeight: HEIGHT,
    floatHeight: FLOAT_HEIGHT,
  };

  // Mutable state (closure)
  let tick = 0;
  let x;
  let y;
  let introProgress = 0;

  const initialPosition = findAngelPositionOnTile(tiles, spawnOptions);

  // If no position if found we return nothing. This means that whatever called createAngel need to handle retry.
  if (initialPosition === null) {
    return;
  }

  x = initialPosition.x;
  y = initialPosition.y;

  function updateIdle(angel) {
    angel.x -= scrollSpeed;
    tick += 1;
    angel.y = Math.round(
      initialPosition.y +
        Math.sin(tick * OSCILLATION_SPEED) * OSCILLATION_AMPLITUDE,
    );
  }

  function updateApproach(angel, player) {
    const { x: targetX, y: targetY } = anchorFor(player);
    introProgress = Math.min(1, introProgress + 1 / INTRO_DURATION_FRAMES);
    const eased = 1 - (1 - introProgress) ** 3;
    angel.x = Math.round(angel.pickedUpX + (targetX - angel.pickedUpX) * eased);
    angel.y = Math.round(angel.pickedUpY + (targetY - angel.pickedUpY) * eased);
    if (introProgress >= 1) {
      angel.state = "follow";
    }
  }

  function updateFollow(angel, player) {
    const { x: targetX, y: targetY } = anchorFor(player);

    tick += 1;
    angel.x = Math.round(targetX);
    angel.y = Math.round(
      targetY + Math.sin(tick * OSCILLATION_SPEED) * OSCILLATION_AMPLITUDE,
    );
  }

  function updateLeave(angel) {
    angel.y = Math.round(angel.y - DEPART_SPEED);
    angel.x = Math.round(angel.x + 1);
  }

  function anchorFor(player) {
    return {
      x: player.x + ANCHOR_OFFSET_X,
      y: player.y + ANCHOR_OFFSET_Y,
    };
  }

  const updateByState = {
    idle: updateIdle,
    approach: updateApproach,
    follow: updateFollow,
    leave: updateLeave,
  };

  return {
    x: x,
    y: y,
    width: WIDTH,
    height: HEIGHT,
    state: STATES[0],

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
