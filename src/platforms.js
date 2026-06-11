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
  const INTRO_SPEED_Y = 6;
  const INTRO_START_Y = SCREEN_HEIGHT + TILE_HEIGHT;

  let tiles = [];
  let mode = "playing";
  let introComplete = false;

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

  function lerpTilesTowardTargetY(speed) {
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

  function setMode(nextMode) {
    mode = nextMode;

    if (mode === "intro") {
      for (const tile of tiles) {
        tile.targetY = tile.y;
        tile.y = INTRO_START_Y;
      }
    }
    if (mode === "ending") {
      // for (const tile of tiles) {
      //   tile.targetY = endingY; // when you add flatten setup
      // }
    }
    // "playing" — no setup
  }

  function updateIntro() {
    if (introComplete) {
      return;
    }

    if (lerpTilesTowardTargetY(INTRO_SPEED_Y)) {
      introComplete = true;
    }
  }

  function updatePlaying() {
    moveTiles();
    removeTilesOffscreen();
    addTilesIfNeeded();
  }

  function updateEnding() {
    moveTiles();
    removeTilesOffscreen();
    addTilesIfNeeded();
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
