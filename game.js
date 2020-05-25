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
    this.tick = 0;
    this.frame = 0;
    this.x = 51;
    this.y = 20;
    this.dy = 0;
    this.dx = 0;
    this.ticksToNextFrame = 16;
    this.speed = 2;
    this.states = ["skating", "jumping", "breaking"];
    this.state = this.states[1];
  }
  update() {
    if (controller.left) {
      p.speed = 1;
      p.state = p.states[2];
    }
    if (controller.up) {
      if (p.state !== "jumping") {
        console.log("Jumping");
        p.dy = -6;
        // p.y = p.y - 30;
        p.state = p.states[1];
      }
    }
    if (controller.right) {
      p.speed = 3;
      p.state = p.states[0];
    }
    if (!controller.left && p.state === "breaking") {
      p.speed = 2;
      p.state = p.states[0];
    }
    if (!controller.right && p.speed === 3) {
      p.speed = 2;
    }

    p.tick = (p.tick + 1) % p.ticksToNextFrame; // 1, 0, 1, 0 etc...

    if (p.state === "jumping") {
      p.dy += gravity;
      p.y = Math.round(p.y + p.dy);
      p.dy += friction;
    }

    if (p.y < 64) {
    }

    if (p.y > 64) {
      p.state = p.states[0];
      p.dy = 0;
      p.y = 64;
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
  console.log(p.state);
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
  if (p.state === "jumping" || p.state === "breaking") {
    context.drawImage(p.image, 52, 0, 26, 40, p.x, p.y - 3, 26, 40);
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
