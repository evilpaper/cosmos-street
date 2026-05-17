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

  const initialPosition = findAngelPositionOnTile(tiles, spawnOptions);

  // If no position if found we return nothing. This means that whatever called createAngel need to handle retry.
  if (initialPosition === null) {
    return;
  }

  x = initialPosition.x;
  y = initialPosition.y;

  return {
    x: x,
    y: y,
    width: WIDTH,
    height: HEIGHT,
    state: STATES.idle,

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
      this.x -= scrollSpeed;
      tick += 1;
      this.y = Math.round(
        initialPosition.y +
          Math.sin(tick * OSCILLATION_SPEED) * OSCILLATION_AMPLITUDE,
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

function createCompanionAngel({
  initialTick = 0, // The tick of the angel that was picked up. Tick is used to animate the angel's oscillation.
  startX: pickupX = 0, // The x position of the angel that was picked up.
  startY: pickupY = 0, // The y position of the angel that was picked up.
} = {}) {
  const WIDTH = 16;
  const HEIGHT = 16;
  const OSCILLATION_AMPLITUDE = 2;
  const OSCILLATION_SPEED = 0.1;
  const ANCHOR_OFFSET_X = -16;
  const ANCHOR_OFFSET_Y = -16;
  const INTRO_DURATION_FRAMES = 30;
  const DEPART_SPEED = 2;
  const STATES = ["approach", "follow", "leave"];

  let tick = initialTick;
  let introProgress = 0;

  return {
    x: pickupX,
    y: pickupY,
    width: WIDTH,
    height: HEIGHT,
    state: STATES[0],

    beginSacrifice() {
      this.state = "leave";
    },

    hasLeftScreen() {
      return this.y + HEIGHT <= -40;
    },

    update(player) {
      if (this.state === "leave") {
        this.y = Math.round(this.y - DEPART_SPEED);
        this.x = Math.round(this.x + 1);
        return;
      }

      const targetX = player.x + ANCHOR_OFFSET_X;
      const targetY = player.y + ANCHOR_OFFSET_Y;

      // Intro phase: Ease in to the target position.
      // Basically for INTRO_DURATION_FRAMES amount of frames, move the angel towards the the position.
      if (this.state === "approach") {
        introProgress = Math.min(1, introProgress + 1 / INTRO_DURATION_FRAMES);
        const eased = 1 - (1 - introProgress) ** 3;
        this.x = Math.round(pickupX + (targetX - pickupX) * eased);
        this.y = Math.round(pickupY + (targetY - pickupY) * eased);
        if (introProgress >= 1) {
          this.state = "follow";
        }
        return; // Exit the function early if we are still in the intro phase.
      }

      if (this.state !== "follow") return;

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
