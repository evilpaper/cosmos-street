/**
 * Define global variables
 *
 * The game state object is used to control the current state of the game.
 * The paused flag simple cause an early return in the update function.
 * Effectively freezing the game.
 */

let gravity;
let friction;
let stars;
let platforms;
let title;
let gameState;
/**
 * Ideas in time.
 * Time is a global variable that is used to track the time elapsed since the game started.
 * Time is used to track the time elapsed since the game started.
 * Time starts when the game state is set to "playing".
 * Time resets when the game state is set to "idle".
 * Time is used to animate the title sliding out of the screen.
 */
let time;

const p = new Player();

// const character = createCharacter();

/**
 * Creates objects used in the game.
 *
 * This use factories, that is, functions that return objects.
 */

// Work in progress...see if it make sense to replace player class with this.

// function createCharacter() {
//   const image = new Image();
//   image.src = "./images/player-sprite-sheet.png";

//   const frame = 0;
//   const width = 26;
//   const height = 35;
//   let x = 50;
//   let y = 50;

//   return {
//     image,
//     frame,
//     width,
//     height,
//     x,
//     y,

//     update() {
//       x = x + 1;
//     },

//     draw(screen) {
//       screen.drawImage(
//         image,
//         frame * width,
//         0,
//         width,
//         height,
//         x,
//         y,
//         width,
//         height
//       );
//     },
//   };
// }

function createStar(options = {}) {
  const { small = false } = options;

  // Constants. These are the same for all stars.
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

  // Constants. These are different for each star.
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

    update(playerSpeed) {
      // 1) advance animation tick
      animationTick = (animationTick + 1) % ticksPerFrame;

      // 2) move left
      x -= dx + playerSpeed * 0.2;

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
      this.x = this.x - p.dx;
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

/**
 * Creates platforms object.
 *
 * The platforms object is used to store the tiles that make up the platforms.
 * The tiles are created using the createTile function.
 * The tiles are updated using the update function.
 * The tiles are drawn using the draw function.
 *
 * @param {*} amount
 * @returns Platforms object
 */

function createPlatforms(amount) {
  let tiles = [];

  for (let i = 0; i < amount; i++) {
    tiles.push(
      createTile({
        x: 8 + i * 16,
        y: 160,
      })
    );
  }

  return {
    tiles: tiles, // Direct property

    update() {
      // Update all tiles
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

function createTitle() {
  const image = new Image();
  image.src = "./images/title.png";

  return {
    name: "title",
    image: image,
  };
}

/**
 * Checks for collision between two objects.
 *
 * @param {*} a
 * @param {*} b
 * @returns true if collision has happened, false otherwise. Need to think about this.
 *
 * This is AABB (Axis-Aligned Bounding Box) collision detection with Minimum Translation Vector (MTV) resolution.
 * Detection: compares the distance between centers to the combined half-widths and half-heights to detect overlap.
 * Resolution: computes overlap on both axes and resolves along the axis with the smallest overlap (MTV).
 */

function checkCollision(a, b) {
  // Calculate the overlap on both X and Y axes
  // Use the difference (d) to compare againt the combined with and height

  const dx = Math.floor(a.x + a.width / 2 - (b.x + b.width / 2));
  const dy = Math.floor(a.y + a.height / 2 - (b.y + b.height / 2));

  const combinedHalfWidths = (a.width + b.width) / 2;
  const combinedHalfHeights = (a.height + b.height) / 2;

  // Check for collision
  // If the difference in x and y is less than the combined halfs we have an overlap.
  if (Math.abs(dx) < combinedHalfWidths && Math.abs(dy) < combinedHalfHeights) {
    // Get a number on the overlap
    const overlapX = combinedHalfWidths - Math.abs(dx);
    const overlapY = combinedHalfHeights - Math.abs(dy);

    return {
      collided: true,
      overlapX,
      overlapY,
      directionX: dx > 0 ? 1 : dx < 0 ? -1 : 0,
      directionY: dy > 0 ? 1 : dy < 0 ? -1 : 0,
    };
  }

  return {
    collided: false,
  };
}

/**
 * Game functions.
 *
 * init is called once when the game starts.
 * update and draw are called once per frame.
 *
 * Default frame rate is 60 times per second.
 */

function init() {
  /**
   * Initialize global variables
   *
   * The game state object is used to control the current state of the game.
   * The paused flag simple cause an early return in the update function.
   * Effectively freezing the game.
   */
  gravity = 0.1;
  friction = 0.4;
  stars = createStars(30);
  platforms = createPlatforms(30);
  title = createTitle();
  gameState = {
    status: "idle",
    paused: false,
    showPressPrompt: true,
  };
  p.reset();
}

function update() {
  if (gameState.paused) {
    return;
  }

  for (const star of stars) {
    star.update(p.dx);
  }

  if (gameState.status === "playing") {
    time += 1;
    p.update(platforms.tiles);

    if (
      (time > 8 && time < 16) ||
      (time > 24 && time < 36) ||
      (time > 48 && time < 56)
    ) {
      showPressPrompt = true;
    } else {
      showPressPrompt = false;
    }

    platforms.update();

    if (p.y > 500) {
      // We could call init() here but that would restart the game.
      // For now, we just reset the player to the start position.
      p.reset();
    }
  }

  if (gameState.status === "idle") {
    time = 0;

    if (input.left || input.right || input.up) {
      // Reset the input flags to prevent any button clicked in the idle state
      // too "bleed" into the playing state. Without this, the player would start
      // moving cause the button state is still set to true.
      input.left = false;
      input.right = false;
      input.up = false;
      gameState.status = "playing";
    }
  }
}

function draw(screen) {
  // Clear the screen
  screen.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

  // Draw the stars
  stars.forEach((s) => s.draw(screen));

  if (gameState.status === "idle") {
    screen.drawImage(title.image, 64, 64, 128, 48);

    print("Press ← or → or ↑", "center", 156);
    print("arrow key to start", "center", 168);
  }

  if (gameState.status === "playing") {
    if (time > 80) {
      platforms.draw(screen);
      p.draw(screen);
    }

    // Continue sliding out as time progresses.
    if (time < 80) {
      screen.drawImage(title.image, 64, 64 - time, 128, 48);
    }
    if (showPressPrompt) {
      print("Press ← or → or ↑", "center", 156);
      print("arrow key to start", "center", 168);
    }

    if (time > 80) {
      print(`Time:${Math.floor(time / 60)}`, "center", 36);
    }
  }
}
