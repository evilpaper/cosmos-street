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
let twin;

class Player {
  constructor() {
    this.image = new Image();
    this.image.src = "./images/player-sprite-sheet.png";
    this.ticksToNextFrame = 16;
    this.tick = 0;
    this.frame = 0;
    this.width = 26;
    this.height = 35;
    this.x = 50;
    this.y = 125;
    this.dy = 0;
    this.speed = 0.6;
    this.states = ["skating", "airborne", "breaking"];
    this.state = this.states[0];
    this.p = this;
  }

  reset() {
    p.tick = 0;
    p.frame = 0;
    p.x = 50;
    p.y = 0;
    p.dy = 0;
    p.speed = 0.6;
    p.state = "skating";
  }

  update() {
    if (p.state === "skating") {
      p.speed = 1.4;
      if (input.left) {
        p.state = p.states[2];
      }
      if (input.up) {
        p.dy = -8;
        p.state = p.states[1];
      }
      if (p.dy > 1) {
        p.state = p.states[1];
      }
    }

    if (p.state === "airborne") {
      // Do airborne stuff here...
    }

    if (p.state === "breaking") {
      p.speed = 0.5;
      p.x = 51;
      if (!input.left) {
        p.state = p.states[0];
      }
      if (input.up) {
        p.dy = -8;
        p.state = p.states[1];
      }
    }

    p.dy += gravity;
    p.dy += friction;
    p.y = Math.floor(p.y + p.dy);

    platforms.platforms.forEach((block) => {
      checkCollision(p, block);
    });

    // Animation
    p.tick = (p.tick + 1) % p.ticksToNextFrame; // 1, 0, 1, 0 etc...

    if (p.tick === 0) {
      p.frame = p.frame + 1;
      if (p.frame >= 2) {
        p.frame = 0;
      }
    }

    // Make sure p.y is always an integer
    p.x = Math.floor(p.x);
    p.y = Math.floor(p.y);
  }
}

/**
 *
 * Factories (functions that return objects)
 *
 * Creates objects used in the game.
 *
 */

function createStar() {
  // Constants. These are the same for all stars.
  const totalFrames = 6;
  const ticksPerFrame = 30;
  const blinkProbability = 0.6;
  const spawnWidth = SCREEN_WIDTH; // initial spawn area
  const spawnHeight = SCREEN_HEIGHT;
  const wrapMargin = 10; // allowed off-screen before wrap
  const resetX = SCREEN_WIDTH + 32; // where the star re-enters
  const minSpeed = 0.05;
  const maxSpeed = 0.2;
  const image = new Image();
  image.src = "./images/star-sprite-sheet.png";

  // Constants. These are different for each star.
  const blinking = Math.random() < blinkProbability;
  const speed = Math.random() * (maxSpeed - minSpeed) + minSpeed;

  // Mutables
  let animationTick = 0;
  let frame = Math.floor(Math.random() * totalFrames);
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

      // keep exposed coords integers for downstream code expectations
      this.x = Math.floor(x);
      this.y = Math.floor(y);
      this.frame = frame;
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
  for (let i = 0; i < amount; i++) {
    result.push(createStar());
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

function createPlatform(options = {}) {
  const { x = 0, y = 0, width = 16, height = 16 } = options;

  const tile = createTile();

  // Mutable state
  let platformX = x;
  let platformY = y;

  return {
    name: "platform",
    x: Math.floor(platformX),
    y: Math.floor(platformY),
    width,
    height,
    tile,

    update() {
      // Move platform to the left based on player speed
      platformX -= p.speed;

      // Keep exposed coords integers for downstream code expectations
      this.x = Math.floor(platformX);
      this.y = Math.floor(platformY);
    },

    draw(screen) {
      // Round positions here to keep integer pixels
      const dx = Math.round(platformX);
      const dy = Math.round(platformY);

      screen.drawImage(tile.image, 0, 0, width, height, dx, dy, width, height);
    },
  };
}

function createPlatforms(amount) {
  const platforms = [];

  for (let i = 0; i < amount; i++) {
    platforms.push(
      createPlatform({
        x: 8 + i * 16,
        y: 160,
      })
    );
  }

  return {
    platforms,

    update() {
      // Update all platforms
      this.platforms.forEach((platform) => {
        platform.update();
      });

      // If a platform is off the screen, remove it
      this.platforms = this.platforms.filter((platform) => platform.x > -16);

      const lastPlatformX = Math.floor(
        this.platforms[this.platforms.length - 1].x
      );

      if (lastPlatformX < 256 + 16 * 4) {
        const y = Math.floor(Math.random() * 30) + 130;
        const gap = Math.floor(Math.random() * 48) + 32;
        const numberOfPlatforms = Math.floor(Math.random() * 4) + 2;

        // Add the new platforms to the platforms array
        for (let i = 0; i < numberOfPlatforms; i++) {
          this.platforms.push(
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

// TODO: Refcator to factory function and move this to top. Classes aren't hoisted but functions are.
const p = new Player();

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
  stars = createStars(20);
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

  if (gameState.status === "playing") {
    p.update();

    platforms.update();

    if (p.y > 500) {
      init();
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
  screen.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

  stars.forEach((s) => s.draw(screen));

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

    if (p.state === "skating" || p.state === "speeding") {
      if (p.frame === 0) {
        screen.drawImage(p.image, 0, 0, 26, 35, o(p.x), o(p.y), 26, 35);
      } else {
        screen.drawImage(p.image, 26, 0, 26, 35, o(p.x), o(p.y), 26, 35);
      }
    }
    if (p.state === "airborne" || p.state === "breaking") {
      screen.drawImage(p.image, 52, 0, 26, 40, o(p.x), o(p.y - 3), 26, 40);
    }
  }

  /**
   * Draw a green hitbox around the player
   */

  // screen.lineWidth = 2;
  // screen.strokeStyle = "green";
  // screen.strokeRect(p.x, p.y, p.width, p.height);
}
