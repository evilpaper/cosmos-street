const collectibleSpriteSheet = loadOnce(
  "./images/collectibles-sprite-sheet.png",
);

function createCollectible(tiles, frameNumber) {
  const WIDTH = 16;
  const HEIGHT = 16;

  // Find initial position on a tile
  function findPositionOnTile(tiles) {
    // Only spawn on tiles that are ahead of the screen
    const eligibleTiles = tiles.filter((tile) => tile.x > SCREEN_WIDTH);

    if (eligibleTiles.length > 0) {
      const tile =
        eligibleTiles[Math.floor(Math.random() * eligibleTiles.length)];
      return {
        x: tile.x + tile.width / 2 - WIDTH / 2,
        y: tile.y - HEIGHT,
      };
    }

    return null;
  }

  const position = findPositionOnTile(tiles);
  let active = position !== null;

  return {
    x: active ? position.x : 0,
    y: active ? position.y : 0,
    width: WIDTH,
    height: HEIGHT,
    active: active,

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
    },

    draw(screen) {
      if (!active) {
        return;
      }

      // first frame is 1, start at 0. Second frame is 2, start at 16. And so on.
      const spriteFrameX = (frameNumber - 1) * 16;
      const spriteFrameY = 0;

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

    respawn(tiles) {
      const pos = findPositionOnTile(tiles);
      if (pos !== null) {
        this.x = pos.x;
        this.y = pos.y;
        active = true;
        this.active = true;
      } else {
        active = false;
        this.active = false;
      }
    },
  };
}
