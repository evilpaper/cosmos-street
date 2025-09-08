const jumpSound = document.querySelector(".jump");

const gravity = 0.1;
const friction = 0.4;

let pause = false;
let gameStarted = false;

class Player {
  constructor() {
    this.image = new Image();
    this.image.src = "spritesheet.png";
    this.ticksToNextFrame = 16;
    this.tick = 0;
    this.frame = 0;
    this.width = 26;
    this.height = 35;
    this.x = 51;
    this.y = 40;
    this.dy = 0;
    this.speed = 0.8;
    this.states = ["skating", "airborne", "breaking"];
    this.state = this.states[1];
    this.p = this;
  }

  reset() {
    p.tick = 0;
    p.frame = 0;
    p.x = 51;
    p.y = 40;
    p.dy = 0;
    p.speed = 0.8;
    p.state = "airborne";
  }

  update() {
    if (p.state === "skating") {
      p.speed = 1;
      if (controller.left) {
        p.state = p.states[2];
      }
      if (controller.up) {
        // jumpSound.play();
        p.dy = -8;
        p.state = p.states[1];
      }
      if (controller.right) {
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
      if (!controller.left) {
        p.state = p.states[0];
      }
      if (controller.up) {
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
        tile: new Tile(),
      });
    }
  }
}

function Tile() {
  this.name = "tile";
  this.image = new Image();
  this.image.src = "spritesheet.png";
}

function Star() {
  this.name = "star";
  this.image = new Image();
  this.image.src = "star-spritesheet.png";
  this.blinking = Math.random() >= 0.8;
  this.tick = 0;
  this.frame = Math.floor(Math.random() * 6);
  this.ticksToNextFrame = 16;
  this.x = Math.floor(Math.random() * 288);
  this.y = Math.floor(Math.random() * 156);
  this.speed = Math.random() * 0.1;
  this.update = function () {
    this.tick = (this.tick + 1) % this.ticksToNextFrame; // 1, 0, 1, 0 etc...

    this.x = this.x - this.speed;
    if (this.x < -10) {
      this.x = 200;
    }
    if (this.blinking) {
      if (this.tick === 0) {
        this.frame = this.frame + 1;
        if (this.frame >= 6) {
          this.frame = 0;
        }
      }
    }
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

function createStars(amount) {
  const result = [];
  for (let i = 0; i < amount; i++) {
    result.push(new Star());
  }
  return result;
}

// Initialize on first render
const p = new Player();
const tile = new Tile();
const stars = createStars(10);
let x = 0;

let platforms = [];

// Populate platforms on first load
for (let i = 0; i < 25; i++) {
  platforms.push({
    x: 64 + i * 16,
    y: 160,
    width: 16,
    height: 16,
    tile: new Tile(),
  });
}

function init() {
  p.reset();

  platforms = [];

  for (let i = 0; i < 20; i++) {
    platforms.push({
      x: 64 + i * 16,
      y: 160,
      width: 16,
      height: 16,
      tile: new Tile(),
    });
  }

  x = 0;
}

function update() {
  if (pause || !gameStarted) {
    return;
  }

  p.update();
  for (const star of stars) {
    star.update();
  }

  updatePlatforms();

  if (p.y > 500) {
    init();
  }
}

function o(value) {
  return Math.round(value);
}

const CONSTANTS = {
  SCREEN_WIDTH: 256,
  SCREEN_HEIGHT: 256,
};

function draw(screen) {
  screen.clearRect(0, 0, CONSTANTS.SCREEN_WIDTH, CONSTANTS.SCREEN_HEIGHT);

  stars.forEach((s) => {
    screen.drawImage(s.image, 0 + s.frame * 7, 0, 7, 7, o(s.x), s.y, 7, 7);
  });

  platforms.forEach((item) => {
    screen.drawImage(item.tile.image, 0, 35, 16, 16, item.x, item.y, 16, 16);
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

function startGame() {
  if (!gameStarted) {
    gameStarted = true;
    const overlay = document.getElementById("start-overlay");
    overlay.classList.add("hidden");
  }
}

document.addEventListener("click", (event) => {
  if (!gameStarted) {
    startGame();
    return;
  }
});

// Listen for any key press to start the game
document.addEventListener("keydown", (event) => {
  if (!gameStarted) {
    startGame();
    return;
  }

  // If space is pressed, pause the game
  if (event.key === " ") {
    pause = !pause;
  }
});

/**
 * Mobile browsers often show/hide the address bar, so 100vh can be unreliable.
 * To get a truly fullscreen canvas, set its size with JS on resize:
 */
function resizeCanvas() {
  const body = document.querySelector("body");
  body.width = window.innerWidth;
  body.height = window.innerHeight;

  // Handle mobile landscape mode - set canvas height to 96% of body height
  if (window.innerWidth <= 960 && window.innerHeight < window.innerWidth) {
    const canvas = document.getElementById("canvas");
    const bodyHeight = window.innerHeight;
    const canvasHeight = bodyHeight * 0.96; // 96% of body height

    // Set canvas height while maintaining aspect ratio
    canvas.style.height = `${canvasHeight}px`;
    canvas.style.width = `${canvasHeight}px`; // Keep it square
  }
}

window.addEventListener("resize", resizeCanvas);
window.addEventListener("orientationchange", resizeCanvas);

// Call once on load
resizeCanvas();
