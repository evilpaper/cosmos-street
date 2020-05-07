// Good sources
// https://developer.mozilla.org/en-US/docs/Games/Techniques/Control_mechanisms/Desktop_with_mouse_and_keyboard

const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");

const gravity = -1;

const p = {
  name: "Player 1",
  image: new Image(),
  tick: 0,
  frame: 0,
  x: 51,
  y: 0,
  ticksToNextFrame: 16,
  yy: 20,
  speed: 1,
  states: ["skating", "jumping"],
  state: "skating",
};

p.image.src = "spritesheet.png";

const tile = new Image();
tile.src = "spritesheet.png";
tile.tick = 0;

function update() {
  if (p.yy <= 64) {
    p.yy = p.yy - gravity;
  }

  if (p.yy === 64) {
    p.state = p.states[0];
  }

  p.tick = (p.tick + 1) % p.ticksToNextFrame; // 1, 0, 1, 0 etc...

  if (p.tick === 0) {
    p.frame = p.frame + 1;
    if (p.frame >= 2) {
      p.frame = 0;
    }
  }

  tile.tick = (tile.tick + p.speed) % 34;
}

function draw() {
  context.clearRect(0, 0, 256, 256);
  context.drawImage(tile, 0, 35, 16, 16, -17 - tile.tick, 100, 16, 16);
  context.drawImage(tile, 0, 35, 16, 16, 0 - tile.tick, 100, 16, 16);
  context.drawImage(tile, 0, 35, 16, 16, 17 - tile.tick, 100, 16, 16);
  context.drawImage(tile, 0, 35, 16, 16, 34 - tile.tick, 100, 16, 16);
  context.drawImage(tile, 0, 35, 16, 16, 51 - tile.tick, 100, 16, 16);
  context.drawImage(tile, 0, 35, 16, 16, 68 - tile.tick, 100, 16, 16);
  context.drawImage(tile, 0, 35, 16, 16, 85 - tile.tick, 100, 16, 16);
  context.drawImage(tile, 0, 35, 16, 16, 17 - tile.tick, 100, 16, 16);
  context.drawImage(tile, 0, 35, 16, 16, 102 - tile.tick, 100, 16, 16);
  context.drawImage(tile, 0, 35, 16, 16, 119 - tile.tick, 100, 16, 16);
  context.drawImage(tile, 0, 35, 16, 16, 136 - tile.tick, 100, 16, 16);
  context.drawImage(tile, 0, 35, 16, 16, 153 - tile.tick, 100, 16, 16);
  context.drawImage(tile, 0, 35, 16, 16, 170 - tile.tick, 100, 16, 16);
  context.drawImage(tile, 0, 35, 16, 16, 187 - tile.tick, 100, 16, 16);
  context.drawImage(tile, 0, 35, 16, 16, 204 - tile.tick, 100, 16, 16);
  context.drawImage(tile, 0, 35, 16, 16, 221 - tile.tick, 100, 16, 16);

  // context.drawImage(tile, 0, 35, 16, 16, 123 - tile.tick, 100, 16, 16);
  // context.drawImage(tile, 0, 35, 16, 16, 106 - tile.tick, 100, 16, 16);
  // context.drawImage(tile, 0, 35, 16, 16, 89 - tile.tick, 100, 16, 16);
  // context.drawImage(tile, 0, 35, 16, 16, 72 - tile.tick, 100, 16, 16);
  // context.drawImage(tile, 0, 35, 16, 16, 55 - tile.tick, 100, 16, 16);
  // context.drawImage(tile, 0, 35, 16, 16, 38 - tile.tick, 100, 16, 16);
  // context.drawImage(tile, 0, 35, 16, 16, 21 - tile.tick, 100, 16, 16);
  // context.drawImage(tile, 0, 35, 16, 16, 4 - tile.tick, 100, 16, 16);
  // context.drawImage(tile, 0, 35, 16, 16, -13 - tile.tick, 100, 16, 16);
  if (p.state === "skating") {
    if (p.frame === 0) {
      context.drawImage(p.image, 0, 0, 26, 35, p.x, p.yy, 26, 35);
    } else {
      context.drawImage(p.image, 26, 0, 26, 35, p.x, p.yy, 26, 35);
    }
  }
  if (p.state === "jumping") {
    context.drawImage(p.image, 52, 0, 26, 40, p.x, p.yy - 3, 26, 40);
  }
}

document.addEventListener("keyup", (event) => {
  if (event.keyCode === 39) {
    p.speed = 1;
  }
  if (event.keyCode === 37) {
    p.speed = 1;
    p.state = p.states[0];
  }
});

document.addEventListener("keydown", (event) => {
  if (event.keyCode === 38) {
    p.yy = p.yy - 40;
    p.state = p.states[1];
  }
  if (event.keyCode === 40) {
    p.yy = p.yy + 10;
    p.state = p.states[0];
  }
  if (event.keyCode === 39) {
    p.speed = 2;
  }
  if (event.keyCode === 37) {
    p.speed = 0.5;
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
