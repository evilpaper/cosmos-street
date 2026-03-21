// No need to load the sprite sheet multiple times.
const starSpriteSheet = loadOnce("./images/star-sprite-sheet.png");

function createStar(options = {}) {
  const { small = false } = options;

  const FRAME_WIDTH = 7;
  const FRAME_HEIGHT = 7;
  const TOTAL_FRAMES = 6;
  const TICKS_PER_FRAME = 10; // Animation speed in frames.
  const BLINK_PROBABILITY = 0.8;
  const LAST_X = -10; // The last x value before the star is wrapped around to the left side of the screen.
  const RESPAWN_X = SCREEN_WIDTH + 10; // The x value where the star re-enters the right side of the screen.

  // Different values for each star to make a more dynamic and interesting.
  const blinking = small ? false : Math.random() < BLINK_PROBABILITY;

  // Small stars move slower than big stars to give more depth to the background.
  const speedFactor = small
    ? Math.random() * 0.02 + 0.01
    : Math.random() * 0.2 + 0.1;

  // Mutable variables
  let animationTick = 0;
  // Small stars have a fixed frame, just a tiny 1 px square.
  let animationFrameIndex = small
    ? 7
    : Math.floor(Math.random() * TOTAL_FRAMES);

  // Randomly position the star on the screen.
  let x = Math.floor(Math.random() * SCREEN_WIDTH);
  let y = Math.floor(Math.random() * SCREEN_HEIGHT);

  return {
    name: "star",

    /**
     * Since update only works on local variables we rely on closure.
     * No need for the "this" keyword.
     */

    update() {
      // 1) animate blinking star
      if (blinking) {
        animationTick += 1;
        if (animationTick >= TICKS_PER_FRAME) {
          animationTick = 0;
          animationFrameIndex += 1;
          if (animationFrameIndex >= TOTAL_FRAMES) {
            animationFrameIndex = 0;
          }
        }
      }

      // 2) move left
      x -= scrollSpeed
        ? scrollSpeed * speedFactor
        : SCROLL_SPEED_BREAKING * speedFactor;

      // 3) move to right side of the screen after it has scrolled off the left side
      if (x < LAST_X) {
        x = RESPAWN_X;
      }
    },

    draw(screen) {
      const spriteFrameX = animationFrameIndex * FRAME_WIDTH;
      const spriteFrameY = 0;

      // Round positions here to keep integer pixels
      const drawX = Math.round(x);
      const drawY = Math.round(y);

      screen.drawImage(
        starSpriteSheet,
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
