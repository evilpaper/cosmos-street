// Good sources
// https://developer.mozilla.org/en-US/docs/Games/Techniques/Control_mechanisms/Desktop_with_mouse_and_keyboard
// https://blog.jvscott.net/post/129647814999/holding-state

// TODO

// Add continuos integration so I can keep pushing things to portfolio
// Add proper collision
// Add game States (start, game, end)
// Add game over
// Add sound

const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");
const controller = new Controller();

const gravity = 0.1;
const friction = 0.4;

class Player {
  constructor() {
    this.name = "Player 1";
    this.image = new Image();
    this.image.src = "spritesheet.png";
    this.ticksToNextFrame = 16;
    this.tick = 0;
    this.frame = 0;
    this.x = 51;
    this.y = 20;
    this.dy = 0;
    this.speed = 2;
    this.states = ["skating", "jumping", "breaking"];
    this.state = this.states[1];
  }
  update() {
    if (p.state === "skating") {
      p.speed = 2;
      if (controller.left) {
        p.state = p.states[2];
      }
      if (controller.up) {
        p.dy = -6;
        p.state = p.states[1];
      }
      if (controller.right) {
        p.speed = 3;
      }
    }
    if (p.state === "jumping") {
      p.dy += gravity;
      p.dy += friction;
      p.y = p.y + p.dy;
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

    // Check if pixel below is solid
    if (isSolid(p.x, p.y)) {
      console.log("Solid ground below");
    }

    // Collision
    if (p.y > 101) {
      p.state = p.states[0];
      p.dy = 0;
      p.y = 101;
    }

    // Animation
    p.tick = (p.tick + 1) % p.ticksToNextFrame; // 1, 0, 1, 0 etc...

    if (p.tick === 0) {
      p.frame = p.frame + 1;
      if (p.frame >= 2) {
        p.frame = 0;
      }
    }
  }
}

function isSolid(x, y) {
  // Add proper collision ehere
  return false;
}

function Tile() {
  this.name = "tile";
  this.image = new Image();
  this.image.src = "spritesheet.png";
}

function Star() {
  this.name = "star";
  this.image = new Image();
  this.image.src = "star-1.png";
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

function createStars(amount) {
  const result = [];
  for (let i = 0; i < amount; i++) {
    result.push(new Star());
  }
  return result;
}

function createLevel(tiles) {
  const result = [];
  const y = 136;
  let x = 0;
  for (let i = 0; i < tiles; i++) {
    if (i % 5 === 0) {
      x = x + 51;
    } else {
      x = x + 17;
    }
    result.push({
      x: x,
      y: y,
      tile: new Tile(),
    });
  }
  return result;
}

const p = new Player();
const tile = new Tile();
const stars = createStars(10);
const level = createLevel(100);

function update() {
  p.update();
  stars.forEach((star) => star.update());
  for (let i = 0; i < level.length; i++) {
    level[i].x = level[i].x - p.speed;
  }
}

function o(value) {
  return Math.round(value);
}

function draw() {
  context.clearRect(0, 0, 288, 192);

  stars.forEach((s) => {
    context.drawImage(s.image, 0 + s.frame * 7, 0, 7, 7, o(s.x), s.y, 7, 7);
  });
  level.forEach((item) => {
    context.drawImage(item.tile.image, 0, 35, 16, 16, item.x, item.y, 16, 16);
  });

  if (p.state === "skating" || p.state === "speeding") {
    if (p.frame === 0) {
      context.drawImage(p.image, 0, 0, 26, 35, o(p.x), o(p.y), 26, 35);
    } else {
      context.drawImage(p.image, 26, 0, 26, 35, o(p.x), o(p.y), 26, 35);
    }
  }
  if (p.state === "jumping" || p.state === "breaking") {
    context.drawImage(p.image, 52, 0, 26, 40, o(p.x), o(p.y - 3), 26, 40);
  }
}

document.addEventListener("keyup", (event) => {
  controller.keyListener(event);
});

document.addEventListener("keydown", (event) => {
  controller.keyListener(event);
});

function loop() {
  update();
  draw();
  window.requestAnimationFrame(loop);
}

window.onload = window.requestAnimationFrame(loop);
