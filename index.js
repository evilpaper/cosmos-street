const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");

const gravity = 0.1;
const friction = 0.4;

function getPlatforms(level) {
  const result = [];
  const cleaned = level
    .trim()
    .split("\n")
    .map((l) => [...l]);
  cleaned.forEach((row, y) => {
    row.forEach((ch, x) => {
      if (ch === "#") {
        result.push({
          x: x * 16,
          y: 16 * y + 1,
          width: 16,
          height: 16,
          tile: new Tile(),
        });
      }
    });
  });

  return result;
}

let platforms = getPlatforms(level);

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
        p.dy = -8;
        p.state = p.states[1];
      }
      if (controller.right) {
        p.speed = 2;
      }
      if (p.dy > 1) {
        p.state = p.states[1];
      }
    }

    if (p.state === "airborne") {
    }

    if (p.state === "breaking") {
      p.speed = 1;
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
      checkCollisionAndResolve(p, block);
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

function checkCollisionAndResolve(a, b) {
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

function init() {
  p.reset();
  platforms = getPlatforms(level);
  x = 0;
}

function update() {
  p.update();
  for (const star of stars) {
    star.update();
  }

  for (let i = 0; i < platforms.length; i++) {
    platforms[i].x = platforms[i].x - p.speed;
  }

  if (p.y > 500) {
    init();
  }
}

function o(value) {
  return Math.round(value);
}

function draw() {
  context.clearRect(0, 0, 270, 216);

  stars.forEach((s) => {
    context.drawImage(s.image, 0 + s.frame * 7, 0, 7, 7, o(s.x), s.y, 7, 7);
  });

  platforms.forEach((item) => {
    context.drawImage(item.tile.image, 0, 35, 16, 16, item.x, item.y, 16, 16);
  });

  if (p.state === "skating" || p.state === "speeding") {
    if (p.frame === 0) {
      context.drawImage(p.image, 0, 0, 26, 35, o(p.x), o(p.y), 26, 35);
    } else {
      context.drawImage(p.image, 26, 0, 26, 35, o(p.x), o(p.y), 26, 35);
    }
  }
  if (p.state === "airborne" || p.state === "breaking") {
    context.drawImage(p.image, 52, 0, 26, 40, o(p.x), o(p.y - 3), 26, 40);
  }
  // Draw a green hitbox around the player
  // context.lineWidth = 2;
  // context.strokeStyle = "green";
  // context.strokeRect(p.x, p.y, p.width, p.height);
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

setInterval(() => {
  update();
  draw();
}, 1000 / 60);
