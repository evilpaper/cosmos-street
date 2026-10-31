const compulsionSpriteSheet = loadOnce("./images/compulsion-sprite-sheet.png");

function makeCompulsion(x, y) {
  const FRAME_WIDTH = 16;
  const FRAME_HEIGHT = 25;
  const TOTAL_FRAMES = 6;
  const TICKS_PER_FRAME = 6;

  let animationTick = 0;
  let animationFrameIndex = 0;
  let posX = x;
  let posY = y;
  let done = false;

  return {
    isDone() {
      return done;
    },

    update() {
      if (done) {
        return;
      }

      posX -= scrollSpeed;

      animationTick += 1;
      if (animationTick >= TICKS_PER_FRAME) {
        animationTick = 0;
        animationFrameIndex += 1;
        if (animationFrameIndex >= TOTAL_FRAMES) {
          done = true;
        }
      }
    },

    draw(screen) {
      if (done) {
        return;
      }

      const spriteFrameX = animationFrameIndex * FRAME_WIDTH;
      const drawX = Math.round(posX);
      const drawY = Math.round(posY);

      screen.drawImage(
        compulsionSpriteSheet,
        spriteFrameX,
        0,
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
