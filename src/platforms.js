const tileSpriteSheet = loadOnce("./images/tiles-sheet.png");

function createTile(options = {}) {
  const { x = 0, y = 0, width = TILE_WIDTH, height = TILE_HEIGHT } = options;

  return {
    name: "tile",
    x: x,
    y: y,
    targetY: y,
    width,
    height,

    update() {
      this.x = this.x - scrollSpeed;
    },

    draw(screen) {
      // Round positions here to keep integer pixels
      const drawX = Math.floor(this.x);
      const drawY = Math.floor(this.y);

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

  const MIN_RUNWAY_RIGHT_EDGE_X = SCREEN_WIDTH + TILE_WIDTH * 4;
  const INTRO_SPEED_Y = 6;
  const INTRO_START_Y = SCREEN_HEIGHT + TILE_HEIGHT;

  let tiles = [];
  let mode = "playing";

  for (let i = 0; i < amount; i++) {
    tiles.push(
      createTile({
        x: i * TILE_WIDTH,
        y: 160,
      }),
    );
  }

  function scrollTiles() {
    for (const tile of tiles) {
      tile.update();
    }
  }

  function removeOffscreenTiles() {
    for (const tile of tiles) {
      const isOffscreenLeft = tile.x <= 0;
      if (isOffscreenLeft) {
        tiles.splice(tiles.indexOf(tile), 1);
      }
    }
  }

  function slideTilesUpIntoViewport(speed) {
    let allTilesAtTarget = true;

    for (const tile of tiles) {
      const nextY = tile.y - speed;
      tile.y = Math.max(tile.targetY, nextY);

      if (tile.y > tile.targetY) {
        allTilesAtTarget = false;
      }
    }

    return allTilesAtTarget;
  }

  function needsMorePlatformsAhead() {
    const rightmostTileX = Math.floor(tiles[tiles.length - 1].x);
    return rightmostTileX < MIN_RUNWAY_RIGHT_EDGE_X;
  }

  function spawnRandomPlatformSegment() {
    const rightmostTileX = Math.floor(tiles[tiles.length - 1].x);
    const diff = getDifficulty();
    const segmentY = randomInRange(
      diff.platformYMin,
      diff.platformYMin + diff.platformYRange,
    );
    const segmentLength = randomInRange(diff.tilesMin, diff.tilesMax);
    const rightEdgeX = rightmostTileX + randomInRange(diff.gapMin, diff.gapMax);

    for (let i = 0; i < segmentLength; i++) {
      tiles.push(
        createTile({
          x: rightEdgeX + i * TILE_WIDTH,
          y: segmentY,
        }),
      );
    }
  }

  function spawnFlatPlatformSegment() {
    const rightmostTileX = Math.floor(tiles[tiles.length - 1].x);
    const gap = TILE_WIDTH * 4;

    const segementLength = 64;
    const startX = rightmostTileX + gap;

    for (let i = 0; i < segementLength; i++) {
      tiles.push(
        createTile({
          x: startX + i * TILE_WIDTH,
          y: 160,
        }),
      );
    }
  }

  function ensureRunwayAhead() {
    if (!needsMorePlatformsAhead()) {
      return;
    }

    if (mode === "ending") {
      spawnFlatPlatformSegment();
      return;
    }

    spawnRandomPlatformSegment();
  }

  function setMode(nextMode) {
    mode = nextMode;

    if (mode === "intro") {
      for (const tile of tiles) {
        tile.targetY = tile.y;
        tile.y = INTRO_START_Y;
      }
    }
    // "playing" — no setup
    // "ending" — no setup
  }

  function updateIntro() {
    slideTilesUpIntoViewport(INTRO_SPEED_Y);
  }

  function updatePlaying() {
    scrollTiles();
    removeOffscreenTiles();
    ensureRunwayAhead();
  }

  function updateEnding() {
    scrollTiles();
    removeOffscreenTiles();
    ensureRunwayAhead();
  }

  return {
    tiles: tiles,

    update() {
      if (mode === "intro") {
        updateIntro();
        return;
      }

      if (mode === "playing") {
        updatePlaying();
        return;
      }

      if (mode === "ending") {
        updateEnding();
        return;
      }
    },

    draw(screen) {
      for (const tile of tiles) {
        tile.draw(screen);
      }
    },

    setMode,
  };
}
