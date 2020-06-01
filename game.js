// Good sources
// https://developer.mozilla.org/en-US/docs/Games/Techniques/Control_mechanisms/Desktop_with_mouse_and_keyboard

// TODO

// Remove p.x change on speed up
// Implement landscape mode
// Implement portrait mode (rotate or get a real screen)
// Touch controlls
// Continues integration
// Collision
// Game States (start, game, end)
// Levels
// Life
// Power-ups
// Sound

const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");

const controller = {
  left: false,
  up: false,
  right: false,
  keyListener: function (event) {
    const eventType = event.type === "keydown" ? true : false;
    switch (event.keyCode) {
      case 37:
        controller.left = eventType;
        break;
      case 38:
        controller.up = eventType;
        break;
      case 39:
        controller.right = eventType;
        break;
    }
  },
};

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

    // Collision
    if (p.y > 64) {
      p.state = p.states[0];
      p.dy = 0;
      p.y = 64;
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

function Tile() {
  this.name = "tile";
  this.image = new Image();
  this.image.src = "spritesheet.png";
  this.tick = 0;
}

function Star() {
  this.name = "star";
  this.image = new Image();
  this.image.src = "star-1.png";
  this.tick = 0;
  this.frame = 0;
  this.ticksToNextFrame = 16;
  this.update = function () {
    this.tick = (this.tick + 1) % this.ticksToNextFrame; // 1, 0, 1, 0 etc...

    if (this.tick === 0) {
      this.frame = this.frame + 1;
      if (this.frame >= 6) {
        this.frame = 0;
      }
    }
  };
}

const p = new Player();
const tile = new Tile();
const star1 = new Star();

function update() {
  p.update();
  star1.update();
  tile.tick = Math.round((tile.tick + p.speed) % 34);
}

function draw() {
  // console.log(p.state);
  context.clearRect(0, 0, 256, 256);
  context.drawImage(tile.image, 0, 35, 16, 16, -17 - tile.tick, 100, 16, 16);
  context.drawImage(tile.image, 0, 35, 16, 16, 0 - tile.tick, 100, 16, 16);
  context.drawImage(tile.image, 0, 35, 16, 16, 17 - tile.tick, 100, 16, 16);
  context.drawImage(tile.image, 0, 35, 16, 16, 34 - tile.tick, 100, 16, 16);
  context.drawImage(tile.image, 0, 35, 16, 16, 51 - tile.tick, 100, 16, 16);
  context.drawImage(tile.image, 0, 35, 16, 16, 68 - tile.tick, 100, 16, 16);
  context.drawImage(tile.image, 0, 35, 16, 16, 85 - tile.tick, 100, 16, 16);
  context.drawImage(tile.image, 0, 35, 16, 16, 17 - tile.tick, 100, 16, 16);
  context.drawImage(tile.image, 0, 35, 16, 16, 102 - tile.tick, 100, 16, 16);
  context.drawImage(tile.image, 0, 35, 16, 16, 119 - tile.tick, 100, 16, 16);
  context.drawImage(tile.image, 0, 35, 16, 16, 136 - tile.tick, 100, 16, 16);
  context.drawImage(tile.image, 0, 35, 16, 16, 153 - tile.tick, 100, 16, 16);
  context.drawImage(tile.image, 0, 35, 16, 16, 170 - tile.tick, 100, 16, 16);
  context.drawImage(tile.image, 0, 35, 16, 16, 187 - tile.tick, 100, 16, 16);
  context.drawImage(tile.image, 0, 35, 16, 16, 204 - tile.tick, 100, 16, 16);
  context.drawImage(tile.image, 0, 35, 16, 16, 221 - tile.tick, 100, 16, 16);
  context.drawImage(star1.image, 0 + star1.frame * 7, 0, 7, 7, 100, 34, 7, 7);

  if (p.state === "skating" || p.state === "speeding") {
    if (p.frame === 0) {
      context.drawImage(
        p.image,
        0,
        0,
        26,
        35,
        Math.round(p.x),
        Math.round(p.y),
        26,
        35
      );
    } else {
      context.drawImage(
        p.image,
        26,
        0,
        26,
        35,
        Math.round(p.x),
        Math.round(p.y),
        26,
        35
      );
    }
  }
  if (p.state === "jumping" || p.state === "breaking") {
    context.drawImage(
      p.image,
      52,
      0,
      26,
      40,
      Math.round(p.x),
      Math.round(p.y - 3),
      26,
      40
    );
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
