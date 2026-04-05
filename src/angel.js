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
  const FLOAT_HEIGHT = 10;

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
  let initial;

  const initialPosition = findAngelPositionOnTile(tiles, spawnOptions);
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

    getTick() {
      return tick;
    },

    update() {
      // Try spawn when inactive and tiles become available
      if (!active) {
        this.spawnAngel(tiles);
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
       * Draw hitbox. For debugging purposes.
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

    spawnAngel(tiles) {
      const newPosition = findAngelPositionOnTile(tiles, spawnOptions);
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

function createCompanionAngel({
  initialTick = 0,
  startX: pickupX = 0,
  startY: pickupY = 0,
} = {}) {
  const WIDTH = 16;
  const HEIGHT = 16;
  const OSCILLATION_AMPLITUDE = 2;
  const OSCILLATION_SPEED = 0.1;
  const ANCHOR_OFFSET_X = -16;
  const ANCHOR_OFFSET_Y = -16;
  const INTRO_DURATION_FRAMES = 30;

  let tick = initialTick;
  let introProgress = 0;

  return {
    x: pickupX,
    y: pickupY,
    width: WIDTH,
    height: HEIGHT,
    active: true,

    update(player) {
      const targetX = player.x + ANCHOR_OFFSET_X;
      const targetY = player.y + ANCHOR_OFFSET_Y;

      if (introProgress < 1) {
        introProgress = Math.min(1, introProgress + 1 / INTRO_DURATION_FRAMES);
        const eased = 1 - (1 - introProgress) ** 3;
        this.x = Math.round(pickupX + (targetX - pickupX) * eased);
        this.y = Math.round(pickupY + (targetY - pickupY) * eased);
        return;
      }

      tick += 1;
      this.x = Math.round(targetX);
      this.y = Math.round(
        targetY + Math.sin(tick * OSCILLATION_SPEED) * OSCILLATION_AMPLITUDE,
      );
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
