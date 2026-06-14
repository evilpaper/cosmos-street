const collectibleSpriteSheet = loadOnce(
  "./images/collectibles-sprite-sheet.png",
);

function createEgg(tiles, existingBoxes = []) {
  const WIDTH = 16;
  const HEIGHT = 16;
  const HITBOX_WIDTH = 8;
  const HITBOX_HEIGHT = 8;
  const SPRITE_SHEET_FRAME_X = 32;
  const SPRITE_SHEET_FRAME_Y = 0;

  const position = findSpreadCollectiblePosition(tiles, existingBoxes, {
    spriteWidth: WIDTH,
    spriteHeight: HEIGHT,
  });

  if (position === null) {
    return null;
  }

  return {
    x: position.x,
    y: position.y,
    width: WIDTH,
    height: HEIGHT,
    active: true,

    getHitbox() {
      return {
        x: this.x + (WIDTH - HITBOX_WIDTH) / 2,
        y: this.y + (HEIGHT - HITBOX_HEIGHT) / 2,
        width: HITBOX_WIDTH,
        height: HITBOX_HEIGHT,
      };
    },

    update() {
      this.x -= scrollSpeed;
    },

    draw(screen) {
      const spriteFrameX = SPRITE_SHEET_FRAME_X;
      const spriteFrameY = SPRITE_SHEET_FRAME_Y;

      const drawX = Math.round(this.x);
      const drawY = Math.round(this.y);

      screen.drawImage(
        collectibleSpriteSheet,
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
