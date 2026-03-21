const sparkleSpriteSheet = loadOnce("./images/sparkle-sprite-sheet.png");

function createSparkle(x, y) {
  const FRAME_WIDTH = 20;
  const FRAME_HEIGHT = 20;
  const TOTAL_FRAMES = 8;
  const TICKS_PER_FRAME = 6;

  let animationTick = 0;
  let animationFrameIndex = 0;
  let posX = x;
  let posY = y;
  let done = false;

  return {
    x: posX,
    y: posY,
    width: FRAME_WIDTH,
    height: FRAME_HEIGHT,

    isDone() {
      return done;
    },

    update() {
      // Scroll with platforms
      posX -= scrollSpeed;

      // Move sparkle upward
      posY -= 0.2;

      // Advance animation tick
      animationTick += 1;

      // Advance frame when tick threshold reached
      if (animationTick >= TICKS_PER_FRAME) {
        animationTick = 0;
        animationFrameIndex += 1;

        // Signal done when animation completes
        if (animationFrameIndex >= TOTAL_FRAMES) {
          done = true;
        }
      }

      // Update exposed position
      this.x = posX;
      this.y = posY;
    },

    draw(screen) {
      if (done) return;

      const spriteFrameX = animationFrameIndex * FRAME_WIDTH;
      const spriteFrameY = 0;

      const drawX = Math.round(posX);
      const drawY = Math.round(posY);

      screen.drawImage(
        sparkleSpriteSheet,
        spriteFrameX,
        spriteFrameY,
        FRAME_WIDTH,
        FRAME_HEIGHT,
        drawX,
        drawY,
        FRAME_WIDTH,
        FRAME_HEIGHT,
      );
    },
  };
}

const skateboardSparkleSpriteSheet = loadOnce(
  "./images/skateboard-sparkle-sprite-sheet.png",
);

function createSkateboardSparkle(target) {
  if (!target) {
    return;
  }

  const FRAME_WIDTH = 36;
  const FRAME_HEIGHT = 16;
  const TOTAL_FRAMES = 10;
  const TICKS_PER_FRAME = 6;
  // Offset to center sparkle on skateboard (bottom of player)
  const OFFSET_X = (target.width - FRAME_WIDTH) / 2; // Center horizontally
  const OFFSET_Y = target.height - FRAME_HEIGHT; // Align to bottom

  // Mutable state (closure)
  let animationTick = 0;
  let animationFrameIndex = 0;

  return {
    width: FRAME_WIDTH,
    height: FRAME_HEIGHT,

    update() {
      // Advance animation tick
      animationTick += 1;

      // Advance frame when tick threshold reached
      if (animationTick >= TICKS_PER_FRAME) {
        animationTick = 0;
        animationFrameIndex += 1;

        // Loop animation
        if (animationFrameIndex >= TOTAL_FRAMES) {
          animationFrameIndex = 0;
        }
      }
    },

    draw(screen) {
      const spriteFrameX = animationFrameIndex * FRAME_WIDTH;
      const spriteFrameY = 0;

      const drawX = Math.round(target.x + OFFSET_X);
      const drawY = Math.round(target.y + OFFSET_Y);

      screen.drawImage(
        skateboardSparkleSpriteSheet,
        spriteFrameX,
        spriteFrameY,
        FRAME_WIDTH,
        FRAME_HEIGHT,
        drawX,
        drawY,
        FRAME_WIDTH,
        FRAME_HEIGHT,
      );
    },
  };
}
