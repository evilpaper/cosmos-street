const plumeSpriteSheet = loadOnce("./images/plume-sprite-sheet.png");

/**
 * Jetpack exhaust. Starts when the jetpack fires and repeats while it stays on.
 * Once the jetpack stops, the current cycle still plays to its last frame.
 */
function makePlume() {
  const FRAME_WIDTH = 16;
  const FRAME_HEIGHT = 25;
  const TOTAL_FRAMES = 6;
  const TICKS_PER_FRAME = 3;

  let animationTick = 0;
  let animationFrameIndex = 0;
  let playing = false;

  return {
    width: FRAME_WIDTH,

    update(jetpackOn) {
      if (!playing) {
        if (!jetpackOn) {
          return;
        }
        playing = true;
        animationTick = 0;
        animationFrameIndex = 0;
        return;
      }

      animationTick += 1;
      if (animationTick >= TICKS_PER_FRAME) {
        animationTick = 0;
        animationFrameIndex += 1;
        if (animationFrameIndex >= TOTAL_FRAMES) {
          animationFrameIndex = 0;
          playing = jetpackOn;
        }
      }
    },

    draw(screen, x, y) {
      if (!playing) {
        return;
      }

      screen.drawImage(
        plumeSpriteSheet,
        animationFrameIndex * FRAME_WIDTH,
        0,
        FRAME_WIDTH,
        FRAME_HEIGHT,
        Math.round(x),
        Math.round(y),
        FRAME_WIDTH,
        FRAME_HEIGHT,
      );
    },
  };
}
