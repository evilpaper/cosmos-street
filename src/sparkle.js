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
