const electricitySpriteSheet = loadOnce(
  "./images/electricity-sprite-sheet.png",
);

function createEnemyElectricity(target) {
  if (!target) {
    return;
  }

  const FRAME_WIDTH = 32;
  const FRAME_HEIGHT = 25;
  const TOTAL_FRAMES = 4;
  const TICKS_PER_FRAME = 6;

  const OFFSET_X = (target.width - FRAME_WIDTH) / 2;
  const OFFSET_Y = (target.height - FRAME_HEIGHT) / 2;

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
        electricitySpriteSheet,
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
