const angelSpriteSheet = loadOnce("./images/collectibles-sprite-sheet.png");

function createAngel(tiles) {
  const WIDTH = 16;
  const HEIGHT = 16;
  const HITBOX_WIDTH = 8;
  const HITBOX_HEIGHT = 8;
  const OSCILLATION_AMPLITUDE = 2;
  const OSCILLATION_SPEED = 0.1;
  const FLOAT_HEIGHT = 10;

  // Mutable state (closure)
  let tick = 0;
  let x;
  let y;
  let initial;

  function findPositionOnTile(tiles) {
    const eligibleTiles = tiles.filter((tile) => tile.x > SCREEN_WIDTH);

    if (eligibleTiles.length > 0) {
      const tile =
        eligibleTiles[Math.floor(Math.random() * eligibleTiles.length)];
      return {
        x: tile.x + tile.width / 2 - WIDTH / 2,
        y: tile.y - HEIGHT - FLOAT_HEIGHT,
      };
    }

    return null;
  }

  const initialPosition = findPositionOnTile(tiles);
  let active = initialPosition !== null;

  if (active) {
    initial = initialPosition;
    x = initialPosition.x;
    y = initialPosition.y;
  } else {
    initial = null;
    x = 0;
    y = 0;
  }

  return {
    x: x,
    y: y,
    width: WIDTH,
    height: HEIGHT,
    active: active,

    getHitbox() {
      return {
        x: this.x + (WIDTH - HITBOX_WIDTH) / 2,
        y: this.y + (HEIGHT - HITBOX_HEIGHT) / 2,
        width: HITBOX_WIDTH,
        height: HITBOX_HEIGHT,
      };
    },

    update() {
      // Auto-respawn if inactive and tiles become available
      if (!active) {
        const newPosition = findPositionOnTile(tiles);
        if (newPosition !== null) {
          this.respawn(tiles);
        }
        return;
      }

      this.x -= scrollSpeed;
      tick += 1;
      this.y = Math.round(
        initial.y + Math.sin(tick * OSCILLATION_SPEED) * OSCILLATION_AMPLITUDE,
      );
    },

    draw(screen) {
      if (!active) {
        return;
      }

      const spriteFrameX = 0;
      const spriteFrameY = 0;

      const drawX = Math.round(this.x);
      const drawY = Math.round(this.y);

      /**
       * Draw enemy hitbox. For debugging purposes.
       */
      // screen.fillStyle = "cyan";
      // screen.fillRect(this.getHitbox().x, this.getHitbox().y, this.getHitbox().width, this.getHitbox().height);

      screen.drawImage(
        angelSpriteSheet,
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

    respawn(tiles) {
      const newPosition = findPositionOnTile(tiles);
      if (newPosition !== null) {
        this.x = newPosition.x;
        this.y = newPosition.y;
        initial = newPosition;
        tick = 0;
        active = true;
        this.active = true;
      } else {
        active = false;
        this.active = false;
      }
    },
  };
}
