const electricExplosionSpriteSheet = loadOnce(
  "./images/electric-explosion-sprite-sheet.png",
);

/**
 * Death explosion drawn on a Relic Telly while it is Exploding.
 * Follows target.x / target.y (centered), same idea as makeRelicTellyElectricity.
 */
function makeElectricExplosion(target) {
  const FRAME_WIDTH = 35;
  const FRAME_HEIGHT = 35;
  const TOTAL_FRAMES = 4;
  const TICKS_PER_FRAME = 6;

  const OFFSET_X = (target.width - FRAME_WIDTH) / 2;
  const OFFSET_Y = (target.height - FRAME_HEIGHT) / 2;

  let animationTick = 0;
  let animationFrameIndex = 0;
  let done = false;

  return {
    isDone() {
      return done;
    },

    update() {
      if (done) {
        return;
      }

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
      const spriteFrameY = 0;

      const drawX = Math.round(target.x + OFFSET_X);
      const drawY = Math.round(target.y + OFFSET_Y);

      screen.drawImage(
        electricExplosionSpriteSheet,
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
