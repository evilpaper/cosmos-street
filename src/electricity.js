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
  const TICKS_PER_FRAME = 4;

  const OFFSET_X = (target.width - FRAME_WIDTH) / 2;
  const OFFSET_Y = (target.height - FRAME_HEIGHT) / 2;

  // Mutable state (closure)
  let animationTick = 0;
  let animationFrameIndex = 0;
  let done = false;

  function reset() {
    animationTick = 0;
    animationFrameIndex = 0;
    done = false;
  }

  return {
    width: FRAME_WIDTH,
    height: FRAME_HEIGHT,

    update() {
      if (done) {
        return;
      }

      // Advance animation tick
      animationTick += 1;

      // Advance frame when tick threshold reached
      if (animationTick >= TICKS_PER_FRAME) {
        animationTick = 0;
        animationFrameIndex += 1;

        // Non-looping animation: stop after last frame.
        if (animationFrameIndex >= TOTAL_FRAMES - 1) {
          animationFrameIndex = TOTAL_FRAMES - 1;
          done = true;
        }
      }
    },

    isDone() {
      return done;
    },

    reset,

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
