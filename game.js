// Good sources
// https://developer.mozilla.org/en-US/docs/Games/Techniques/Control_mechanisms/Desktop_with_mouse_and_keyboard

// TODO

// Collision
// Physics
// Animations
// Levels
// Life
// Power-ups
// Sound

const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");

const gravity = 1;
class Player {
  constructor() {
    this.name = "Player 1";
    this.image = new Image();
    this.image.src = "spritesheet.png";
    this.tick = 0;
    this.frame = 0;
    this.x = 51;
    this.y = 20;
    this.dy = 0;
    this.dx = 0;
    this.ticksToNextFrame = 16;
    this.speed = 2;
    this.states = ["skating", "jumping"];
    this.state = this.states[0];
  }
  update() {
    p.tick = (p.tick + 1) % p.ticksToNextFrame; // 1, 0, 1, 0 etc...

    if (p.y <= 64) {
      p.y = Math.round(p.y + gravity);
    }
    if (p.y === 64) {
      p.state = p.states[0];
    }

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

const p = new Player();

const tile = new Tile();

function update() {
  p.update();

  tile.tick = Math.round((tile.tick + p.speed) % 34);
}

function draw() {
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

  if (p.state === "skating") {
    if (p.frame === 0) {
      context.drawImage(p.image, 0, 0, 26, 35, p.x, p.y, 26, 35);
    } else {
      context.drawImage(p.image, 26, 0, 26, 35, p.x, p.y, 26, 35);
    }
  }
  if (p.state === "jumping") {
    context.drawImage(p.image, 52, 0, 26, 40, p.x, p.y - 3, 26, 40);
  }
}

document.addEventListener("keyup", (event) => {
  if (event.keyCode === 39) {
    p.speed = 1;
  }
  if (event.keyCode === 37) {
    p.speed = 2;
    p.state = p.states[0];
  }
});

document.addEventListener("keydown", (event) => {
  if (event.keyCode === 38) {
    if (p.state === "skating") {
      p.dy = 1;
      p.state = p.states[1];
      p.y = p.y - 40;
    }
  }
  if (event.keyCode === 39) {
    p.speed = 3;
  }
  if (event.keyCode === 37) {
    p.speed = 1;
    p.state = p.states[1];
  }
});

function isColliding(a, b) {}

function loop() {
  update();
  draw();
  window.requestAnimationFrame(loop);
}

window.requestAnimationFrame(loop);
