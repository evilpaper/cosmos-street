// Good sources
// https://developer.mozilla.org/en-US/docs/Games/Techniques/Control_mechanisms/Desktop_with_mouse_and_keyboard
// https://blog.jvscott.net/post/129647814999/holding-state

// TODO

// Decide canvas size that is a grid to make room for levels
// Add continuos integration so I can keep pushing things to portfolio
// Add proper levels
// Add proper collision
// Add game States (start, game, end)
// Add game over
// Add sound

const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");
const controller = new Controller();

const gravity = 0.1;
const friction = 0.4;

const level = [
  -17,
  0,
  17,
  34,
  51,
  68,
  85,
  102,
  119,
  136,
  170,
  187,
  204,
  238,
  255,
  272,
  306,
  323,
  340,
  374,
  391,
  408,
  442,
  459,
  476,
  493,
];
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

    // Collision
    if (p.y > 65) {
      p.state = p.states[0];
      p.dy = 0;
      p.y = 65;
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

function Tile(x = 0) {
  this.name = "tile";
  this.image = new Image();
  this.image.src = "spritesheet.png";
  this.tick = 0;
  this.x = x;
  this.update = function () {
    this.x = this.x - p.speed;
    // if (this.x <= -17) {
    //   this.x = 238;
    // }
  };
}

function Star() {
  this.name = "star";
  this.image = new Image();
  this.image.src = "star-1.png";
  this.blinking = Math.random() >= 0.8;
  this.tick = 0;
  this.frame = Math.floor(Math.random() * 6);
  this.ticksToNextFrame = 16;
  this.x = Math.floor(Math.random() * 190);
  this.y = Math.floor(Math.random() * 124);
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

function createTiles(level) {
  const result = level.map((part) => new Tile(part));
  return result;
}

function createStars(amount) {
  const result = [];
  for (let i = 0; i < amount; i++) {
    result.push(new Star());
  }
  return result;
}

const p = new Player();
const tiles = createTiles(level);
const stars = createStars(10);

function update() {
  p.update();
  stars.forEach((star) => star.update());
  tiles.forEach((tile) => tile.update());
}

function o(value) {
  return Math.round(value);
}

function draw() {
  context.clearRect(0, 0, 256, 256);

  stars.forEach((s) => {
    context.drawImage(s.image, 0 + s.frame * 7, 0, 7, 7, o(s.x), s.y, 7, 7);
  });
  tiles.forEach((t) => {
    context.drawImage(t.image, 0, 35, 16, 16, t.x, 100, 16, 16);
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

window.requestAnimationFrame(loop);
