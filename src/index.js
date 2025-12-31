/**
 * Global variables
 */

/**
 * Constants
 */
const gravity = 0.1;
const friction = 0.4;

// Scroll speed constants for different player states
const SCROLL_SPEED_SKATING = 1.2;
const SCROLL_SPEED_BREAKING = 0.5;
const SCROLL_SPEED_SPEEDING = 2;

/**
 * Mutable
 */
let paused = false;
let time = 0;
let stars;
let platforms;
let scrollSpeed = SCROLL_SPEED_SKATING;

/**
 *  player is defined in player.js file.
 *  title is defined in title.js file.
 */

/**
 * Factories
 *
 * Used to create objects that appear as multiple instances (stars, platforms, etc.).
 */

function createStar(options = {}) {
  const { small = false } = options;

  // Constants. Same for all stars.
  const totalFrames = 6;
  const ticksPerFrame = 30;
  const blinkProbability = 0.6;
  const spawnWidth = SCREEN_WIDTH; // initial spawn area
  const spawnHeight = SCREEN_HEIGHT;
  const wrapMargin = 10; // allowed off-screen before wrap
  const resetX = SCREEN_WIDTH + 32; // where the star re-enters
  const minSpeed = 0.05;
  const maxSpeed = 0.1;
  const image = new Image();
  image.src = "./images/star-sprite-sheet.png";

  // Constant for the star instance but but different for each star.
  const blinking = small ? false : Math.random() < blinkProbability;
  const dx = small
    ? Math.random() * (0.1 - 0.02) + 0.02
    : Math.random() * (maxSpeed - minSpeed) + minSpeed;

  // Mutables
  let animationTick = 0;
  let frame = small ? 7 : Math.floor(Math.random() * totalFrames);
  let x = Math.floor(Math.random() * spawnWidth);
  let y = Math.floor(Math.random() * spawnHeight);

  return {
    image,
    frame,
    x,
    y,

    /**
     * Since update only works on local variables we rely on closure to keep the state.
     * No need for the this keyword.
     */

    update() {
      // 1) advance animation tick
      animationTick = (animationTick + 1) % ticksPerFrame;

      // 2) move left based on global scroll speed
      x -= dx + scrollSpeed * 0.2;

      // 3) wrap when fully off-screen (with margin)
      if (x < -wrapMargin) {
        x = resetX;
      }

      // 4) advance frame on blink cadence
      if (blinking && animationTick === 0) {
        frame = (frame + 1) % totalFrames;
      }
    },

    draw(screen) {
      const FRAME_W = 7;
      const FRAME_H = 7;
      const sx = frame * FRAME_W; // sprite x
      const sy = 0; // single row

      // Round positions here to keep integer pixels
      const dx = Math.round(x);
      const dy = Math.round(y);

      screen.drawImage(
        image,
        sx,
        sy,
        FRAME_W,
        FRAME_H,
        dx,
        dy,
        FRAME_W,
        FRAME_H
      );
    },
  };
}

function createStars(amount) {
  const result = [];

  for (let i = 0; i < amount / 2; i++) {
    result.push(createStar());
  }

  for (let i = 0; i < amount; i++) {
    result.push(createStar({ small: true }));
  }

  return result;
}

function createTile(options = {}) {
  const { x = 0, y = 0, width = 16, height = 16 } = options;

  const image = new Image();
  image.src = "./images/tiles-sheet.png";

  return {
    name: "tile",
    image: image,
    x: x,
    y: y,
    width,
    height,

    update() {
      this.x = this.x - scrollSpeed;
    },

    draw(screen) {
      const dx = Math.round(this.x);
      const dy = Math.round(this.y);
      screen.drawImage(image, 0, 0, width, height, dx, dy, width, height);

      /**
       * Draw a cyan hitbox around the tile. For debugging purposes.
       */
      // screen.lineWidth = 1;
      // screen.strokeStyle = "cyan";
      // screen.strokeRect(dx, dy, width, height);
    },
  };
}

function createPlatforms(amount) {
  let tiles = [];

  for (let i = 0; i < amount; i++) {
    tiles.push(
      createTile({
        x: 0 + i * 16,
        y: 160,
      })
    );
  }

  return {
    tiles: tiles, // Note, a direct property.

    update() {
      tiles.forEach((tile) => {
        tile.update();
      });

      // If a tiles is off the screen, remove it (mutate in place)
      // This is a more efficient way to remove tiles than using the filter method.
      // If we would use the filter method, we would create a new array and copy the tiles to it.
      // We would then have to reassign the tiles property to the new array.
      // So we do "in place" mutation.
      for (let i = tiles.length - 1; i >= 0; i--) {
        if (tiles[i].x <= -16) {
          tiles.splice(i, 1);
        }
      }

      const lastTileX = Math.floor(tiles[tiles.length - 1].x);

      if (lastTileX < 256 + 16 * 4) {
        const y = Math.floor(Math.random() * 30) + 130;
        const gap = Math.floor(Math.random() * 48) + 32;
        const numberOfTiles = Math.floor(Math.random() * 4) + 2;

        // Add the new platforms to the platforms array
        for (let i = 0; i < numberOfTiles; i++) {
          tiles.push(
            createTile({
              x: lastTileX + i * 16 + gap,
              y: y,
            })
          );
        }
      }
    },

    draw(screen) {
      tiles.forEach((tile) => {
        tile.draw(screen);
      });
    },
  };
}

/**
 * Checks for collision between two objects.
 *
 * @param {*} a
 * @param {*} b
 * @returns true if collision has happened, false otherwise. Need to think about this.
 *
 * This is AABB (Axis-Aligned Bounding Box) collision. Also known as Rectangle–rectangle overlap test.
 * Detection: compares the distance between centers to the combined half-widths and half-heights to detect overlap.
 */

function checkCollision(a, b) {
  const dx = a.x + a.width / 2 - (b.x + b.width / 2);
  const dy = a.y + a.height / 2 - (b.y + b.height / 2);

  const combinedHalfWidths = (a.width + b.width) / 2;
  const combinedHalfHeights = (a.height + b.height) / 2;

  return (
    Math.abs(dx) < combinedHalfWidths && Math.abs(dy) < combinedHalfHeights
  );
}

/**
 * Helper functions
 */

function isIdle() {
  return time === 0;
}

function isPlaying() {
  return time > 0;
}

/**
 * Game functions
 *
 * init is called once when the game starts.
 * update and draw are called once per frame.
 *
 * Default frame rate is 60 times per second.
 *
 * The time variable is used to control the state of the game.
 *
 * The paused flag simple cause an early return in the update function. Effectively freezing the game.
 */

/**
 * Initialize global variables, reset global objects
 */
function init() {
  stars = createStars(30);
  platforms = createPlatforms(30);
  scrollSpeed = SCROLL_SPEED_SKATING;
  player.reset();
}

function update() {
  if (paused) {
    return;
  }

  for (const star of stars) {
    star.update();
  }

  if (isIdle()) {
    time = 0;

    if (input.left || input.right || input.up) {
      // Reset the input flags to prevent any button clicked in the idle state
      // too "bleed" into the playing state. Without this, the player would start
      // moving cause the button state is still set to true.
      input.left = false;
      input.right = false;
      input.up = false;
      time += 1;
    }
  }

  if (isPlaying()) {
    time += 1;
    player.update(platforms.tiles, time);
    title.update();

    platforms.update();

    if (player.y > 500) {
      // We could call init() here but that would restart the game.
      // For now, we just reset the player to the start position.
      player.reset();
    }
  }
}

function draw(screen) {
  screen.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
  stars.forEach((s) => s.draw(screen));
  platforms.draw(screen);

  if (isIdle()) {
    title.draw(screen);

    print("Press ← or → or ↑", "center", 186);
    print("arrow key to start", "center", 198);
  }

  if (isPlaying()) {
    player.draw(screen);
    title.draw(screen);

    if ((time > 6 && time < 12) || (time > 18 && time < 24)) {
      print("Press ← or → or ↑", "center", 186);
      print("arrow key to start", "center", 198);
    }

    if (time > 80) {
      print(`Time:${Math.floor(time / 60)}`, "center", 36);
    }
  }
}
