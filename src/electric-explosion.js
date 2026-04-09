const electricExplosionSpriteSheet = loadOnce(
  "./images/electric-explosion-sprite-sheet.png",
);

function createElectricExplosion(x, y) {
  const FRAME_WIDTH = 35;
  const FRAME_HEIGHT = 35;
  const TOTAL_FRAMES = 4;
  const TICKS_PER_FRAME = 8;

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
      posX -= scrollSpeed;
      posY -= 0.2;

      animationTick += 1;

      if (animationTick >= TICKS_PER_FRAME) {
        animationTick = 0;
        animationFrameIndex += 1;

        if (animationFrameIndex >= TOTAL_FRAMES) {
          done = true;
        }
      }

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
