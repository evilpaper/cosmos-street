const tileSpriteSheet = loadOnce("./images/tiles-sheet.png");

function createTile(options = {}) {
  const { x = 0, y = 0, width = TILE_WIDTH, height = TILE_HEIGHT } = options;

  return {
    name: "tile",
    x: x,
    y: y,
    width,
    height,

    update() {
      this.x = this.x - scrollSpeed;
    },

    draw(screen) {
      // Round positions here to keep integer pixels
      const drawX = Math.round(this.x);
      const drawY = Math.round(this.y);

      screen.drawImage(
        tileSpriteSheet,
        0,
        0,
        width,
        height,
        drawX,
        drawY,
        width,
        height,
      );
    },
  };
}

function createPlatforms(options = {}) {
  const { amount = 30 } = options;

  const SPAWN_THRESHOLD_X = SCREEN_WIDTH + TILE_WIDTH * 4; // When to spawn new platforms

  let tiles = [];

  for (let i = 0; i < amount; i++) {
    tiles.push(
      createTile({
        x: i * TILE_WIDTH,
        y: 160,
      }),
    );
  }

  function moveTiles() {
    for (const tile of tiles) {
      tile.update();
    }
  }

  function removeTilesOffscreen() {
    for (const tile of tiles) {
      const isOffscreenLeft = tile.x <= 0;
      if (isOffscreenLeft) {
        tiles.splice(tiles.indexOf(tile), 1);
      }
    }
  }

  function addTilesIfNeeded() {
    const lastTileX = Math.floor(tiles[tiles.length - 1].x);
    const shouldSpawn = lastTileX < SPAWN_THRESHOLD_X;

    if (!shouldSpawn) {
      return;
    }

    const diff = getDifficulty();
    const y = randomInRange(
      diff.platformYMin,
      diff.platformYMin + diff.platformYRange,
    );
    const gap = randomInRange(diff.gapMin, diff.gapMax);
    const tileCount = randomInRange(diff.tilesMin, diff.tilesMax);

    for (let i = 0; i < tileCount; i++) {
      tiles.push(
        createTile({
          x: lastTileX + gap + i * TILE_WIDTH,
          y: y,
        }),
      );
    }
  }

  return {
    tiles: tiles,

    update() {
      moveTiles();
      removeTilesOffscreen();
      addTilesIfNeeded();
    },

    draw(screen) {
      for (const tile of tiles) {
        tile.draw(screen);
      }
    },
  };
}
