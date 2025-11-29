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

const p = new Player();

const character = createCharacter();

/**
 * Creates objects used in the game.
 *
 * This use factories, that is, functions that return objects.
 */

function createCharacter() {
  const image = new Image();
  image.src = "./images/player-sprite-sheet.png";

  const frame = 0;
  const width = 26;
  const height = 35;
  let x = 50;
  let y = 50;

  return {
    image,
    frame,
    width,
    height,
    x,
    y,

    update() {
      x = x + 1;
    },

    draw(screen) {
      screen.drawImage(
        image,
        frame * width,
        0,
        width,
        height,
        x,
        y,
        width,
        height
      );
    },
  };
}

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
  const maxSpeed = 0.4;
  const image = new Image();
  image.src = "./images/star-sprite-sheet.png";

  // Constants. These are different for each star.
  const blinking = small ? false : Math.random() < blinkProbability;
  const speed = small
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

    update() {
      // 1) advance animation tick
      animationTick = (animationTick + 1) % ticksPerFrame;

      // 2) move left
      x -= speed;

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

function createTile() {
  const image = new Image();
  image.src = "./images/tiles-sheet.png";

  return {
    name: "tile",
    image: image,
  };
}

/**
 * Creates a platform object that moves left as the player moves forward.
 *
 * @param {Object} options - Configuration options
 * @param {number} options.x - Initial x position (default: 0)
 * @param {number} options.y - Initial y position (default: 0)
 * @param {number} options.width - Platform width in pixels (default: 16)
 * @param {number} options.height - Platform height in pixels (default: 16)
 */
function createPlatform(options = {}) {
  const { x = 0, y = 0, width = 16, height = 16 } = options;

  // Create the tile image used for rendering
  const tile = createTile();

  // Mutable state: Internal variables allow sub-pixel movement for smooth scrolling
  // We keep these separate from the exposed properties to maintain precision
  let platformX = x;
  let platformY = y;

  return {
    name: "platform",
    // Exposed properties using getters: Computed on access, always returns integer
    // This ensures downstream code (like createPlatforms) gets integer coordinates
    get x() {
      return Math.floor(platformX);
    },
    get y() {
      return Math.floor(platformY);
    },

    // Constants
    width,
    height,
    tile,

    /**
     * Updates the platform position each frame.
     * Moves the platform left at the player's speed to create scrolling effect.
     */
    update() {
      // Move platform to the left based on player speed
      platformX -= p.speed;
    },

    /**
     * Draws the platform on the screen.
     * Uses rounded positions to ensure integer pixel rendering.
     *
     * @param {CanvasRenderingContext2D} screen - The canvas context to draw on
     */
    draw(screen) {
      // Round positions here to keep integer pixels
      const dx = Math.round(platformX);
      const dy = Math.round(platformY);

      screen.drawImage(tile.image, 0, 0, width, height, dx, dy, width, height);
    },
  };
}

function createPlatforms(amount) {
  // Mutable state: Internal array that gets updated
  let platforms = [];

  for (let i = 0; i < amount; i++) {
    platforms.push(
      createPlatform({
        x: 8 + i * 16,
        y: 160,
      })
    );
  }

  return {
    // Exposed property using getter: Always returns the current array
    get platforms() {
      return platforms;
    },

    update() {
      // Update all platforms
      platforms.forEach((platform) => {
        platform.update();
      });

      // If a platform is off the screen, remove it
      platforms = platforms.filter((platform) => platform.x > -16);

      const lastPlatformX = Math.floor(platforms[platforms.length - 1].x);

      if (lastPlatformX < 256 + 16 * 4) {
        const y = Math.floor(Math.random() * 30) + 130;
        const gap = Math.floor(Math.random() * 48) + 32;
        const numberOfPlatforms = Math.floor(Math.random() * 4) + 2;

        // Add the new platforms to the platforms array
        for (let i = 0; i < numberOfPlatforms; i++) {
          platforms.push(
            createPlatform({
              x: lastPlatformX + i * 16 + gap,
              y: y,
            })
          );
        }
      }
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
 * Check for collision between two objects.
 */

function checkCollision(a, b) {
  // Calculate the overlap on both X and Y axes
  // Use the difference (d) to compare againt the combined with and height
  const dx = a.x + a.width / 2 - (b.x + b.width / 2);
  const dy = a.y + a.height / 2 - (b.y + b.height / 2);
  const combinedHalfWidths = (a.width + b.width) / 2;
  const combinedHalfHeights = (a.height + b.height) / 2;

  // Check for collision
  // If the difference in x or y is less than the combined halfs we have an overlap.
  if (Math.abs(dx) < combinedHalfWidths && Math.abs(dy) < combinedHalfHeights) {
    // Get a number on the overlap
    const overlapX = combinedHalfWidths - Math.abs(dx);
    const overlapY = combinedHalfHeights - Math.abs(dy);

    // In case the overlap in x-axis is larger than overlap in y-axis
    // we conclude collision has happend in y-direction
    if (overlapX > overlapY) {
      // Resolve collision on the Y axis
      if (dy > 0) {
        a.y += overlapY;
      } else {
        a.y -= overlapY;
      }

      a.dy = 0;

      if (p.state === p.states[2]) {
        p.state = p.states[2];
      } else {
        p.state = p.states[0];
      }
    } else {
      // Resolve collision on the X axis
      if (dx > 0) {
        a.x += overlapX;
      } else {
        a.x -= overlapX;
      }
      a.dx = 0;
    }
  }
}

/**
 * Game functions.
 *
 * Init is called once when the game starts.
 * Update and draw called once per frame. Usually 60 times per second.
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
    startFrames: 0,
    blinkFrames: 0,
    showPressPrompt: true,
  };

  p.reset();
}

function update() {
  if (gameState.paused) {
    return;
  }

  for (const star of stars) {
    star.update();
  }

  character.update();

  if (gameState.status === "playing") {
    p.update(platforms.platforms);

    platforms.update();

    if (p.y > 500) {
      // We could call init() here but that would restart the game.
      // For now, we just reset the player to the start position.
      p.reset();
    }
  }

  if (gameState.status === "idle") {
    if (input.left || input.right || input.up) {
      // Reset the input flags to prevent any button clicked in the idle state
      // too "bleed" into the playing state. Without this, the player would start
      // moving cause the button state is still set to true.
      input.left = false;
      input.right = false;
      input.up = false;
      gameState.status = "starting";
      gameState.startFrames = 40;
      gameState.blinkFrames = 0;
    }
  }

  if (gameState.status === "starting") {
    // Delay the transition into the playing state for a fixed number of frames.
    gameState.startFrames -= 1;
    gameState.blinkFrames += 1;

    if (gameState.blinkFrames >= 4) {
      gameState.showPressPrompt = !gameState.showPressPrompt;
      gameState.blinkFrames = 0;
    }

    if (gameState.startFrames <= 0) {
      gameState.status = "playing";
      gameState.showPressPrompt = false;
    }
  }
}

function draw(screen) {
  // Clear the screen
  screen.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

  // Draw the stars
  stars.forEach((s) => s.draw(screen));

  // Draw the character
  character.draw(screen);

  if (gameState.status === "idle") {
    screen.drawImage(title.image, 64, 64, 128, 48);

    print("Press left or up", center("Press left or up"), 156);
    print("key to start", center("key to start"), 168);
  }

  if (gameState.status === "starting") {
    screen.drawImage(title.image, 64, 64, 128, 48);

    if (gameState.showPressPrompt) {
      print("Press left or up", center("Press left or up"), 156);
      print("key to start", center("key to start"), 168);
    }
  }

  if (gameState.status === "playing") {
    platforms.platforms.forEach((platform) => {
      platform.draw(screen);
    });

    p.draw(screen);
  }
}
