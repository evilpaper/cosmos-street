const gravity = 0.1;
const friction = 0.4;

/**
 * A note on the game state object.
 *
 * The game state object is used to control the current state of the game.
 *
 * status: "idle", "playing", "gameover"
 * paused: boolean
 *
 * The paused flag simple cause an early return in the update function.
 * Effectively freezing the game.
 */

const gameState = {
  status: "idle",
  paused: false,
};

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
    this.speed = 0.8;
    this.states = ["skating", "airborne", "breaking"];
    this.state = this.states[0];
    this.p = this;
  }

  reset() {
    p.tick = 0;
    p.frame = 0;
    p.x = 50;
    p.y = 125;
    p.dy = 0;
    p.speed = 0.8;
    p.state = "skating";
  }

  update() {
    if (p.state === "skating") {
      p.speed = 1;
      if (input.left) {
        p.state = p.states[2];
      }
      if (input.up) {
        p.dy = -8;
        p.state = p.states[1];
      }
      if (input.right) {
        p.x = 51;
        p.speed = 2;
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
        p.dy = -6;
        p.state = p.states[1];
      }
    }

    p.dy += gravity;
    p.dy += friction;
    p.y = Math.floor(p.y + p.dy);

    platforms.forEach((block) => {
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

function updatePlatforms() {
  // Move all platforms to the left
  for (let i = 0; i < platforms.length; i++) {
    platforms[i].x = platforms[i].x - p.speed;
  }
  // If a platform is off the screen, remove it
  platforms = platforms.filter((platform) => platform.x > -16);

  const lastPlatformX = Math.floor(platforms[platforms.length - 1].x);

  if (lastPlatformX < 256 + 16 * 4) {
    const y = Math.floor(Math.random() * 30) + 130;
    const gap = Math.floor(Math.random() * 48) + 32;
    const numberOfPlatforms = Math.floor(Math.random() * 4) + 2;

    // Add the new platforms to the platforms array
    for (let i = 0; i < numberOfPlatforms; i++) {
      platforms.push({
        x: lastPlatformX + i * 16 + gap,
        y: y,
        width: 16,
        height: 16,
        tile: createTile(),
      });
    }
  }
}

function createTile() {
  const image = new Image();
  image.src = "./images/tiles-sheet.png";

  return {
    name: "tile",
    image: image,
  };
}

function Star() {
  const image = new Image();
  image.src = "./images/star-sprite-sheet.png";

  const blinking = Math.random() >= 0.6;
  let tick = 0;
  let frame = Math.floor(Math.random() * 6);
  const ticksToNextFrame = 16;
  let x = Math.floor(Math.random() * 288);
  let y = Math.floor(Math.random() * 256);
  const speed = Math.random() * 0.2;

  return {
    name: "star",
    image: image,
    blinking: blinking,
    get tick() {
      return tick;
    },
    get frame() {
      return frame;
    },
    get x() {
      return x;
    },
    get y() {
      return y;
    },
    get speed() {
      return speed;
    },
    update() {
      tick = (tick + 1) % ticksToNextFrame; // 1, 0, 1, 0 etc...

      x = x - speed;
      if (x < -10) {
        x = 200;
      }
      if (blinking) {
        if (tick === 0) {
          frame = (frame + 1) % 6;
        }
      }
    },
  };
}

function createStars(amount) {
  const result = [];
  for (let i = 0; i < amount; i++) {
    result.push(new Star());
  }
  return result;
}

function createTitle() {
  const image = new Image();
  image.src = "./images/title.png";

  return {
    name: "title",
    image: image,
  };
}

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

// Initialize on first render
const p = new Player();
const stars = createStars(20);
let x = 0;
let platforms = [];

const title = createTitle();

// Populate platforms on first load
for (let i = 0; i < 25; i++) {
  platforms.push({
    x: 64 + i * 16,
    y: 160,
    width: 16,
    height: 16,
    tile: createTile(),
  });
}

/**
 * Special game functions.
 *
 * Init is called once when the game starts.
 * Update and draw are called by the system.js file every frame.
 */

function init() {
  p.reset();

  platforms = [];

  for (let i = 0; i < 30; i++) {
    platforms.push({
      x: 8 + i * 16,
      y: 160,
      width: 16,
      height: 16,
      tile: createTile(),
    });
  }

  x = 0;
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

    updatePlatforms();

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
      gameState.status = "playing";
    }
  }
}

function draw(screen) {
  screen.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

  stars.forEach((s) => {
    screen.drawImage(s.image, 0 + s.frame * 7, 0, 7, 7, o(s.x), s.y, 7, 7);
  });

  if (gameState.status === "idle") {
    screen.drawImage(title.image, 64, 64, 128, 48);
    print("Press left, right, or", center("Press left, right, or"), 156);
    print(" up key to start", center("up key to start"), 168);
  }

  if (gameState.status === "playing") {
    platforms.forEach((item) => {
      screen.drawImage(item.tile.image, 0, 0, 16, 16, item.x, item.y, 16, 16);
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

  // Draw a green hitbox around the player
  // screen.lineWidth = 2;
  // screen.strokeStyle = "green";
  // screen.strokeRect(p.x, p.y, p.width, p.height);
}

/**
 * The following listener is used to step through each step with the enter key when debugging.
 * Remember to comment out setInterval inside loop before use.
 */

// document.addEventListener("keydown", (event) => {
//   if (event.key === "Enter") {
//     update();
//     draw();
//   }
// });

/**
 * Top level event listeners. Mostly for debugging.
 */

document.addEventListener("keydown", (event) => {
  // If space is pressed, pause the game
  if (event.key === " ") {
    if (gameState.paused) {
      gameState.paused = false;
    } else {
      gameState.paused = true;
    }
  }
});
