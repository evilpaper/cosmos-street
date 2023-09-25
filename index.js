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
    this.width = 26;
    this.height = 36;
    this.x = 51;
    this.y = 20;
    this.dy = 0;
    this.speed = 2;
    this.states = ["skating", "jumping", "breaking"];
    this.state = this.states[1];
    this.p = this;
  }

  update() {
    console.log(`p.x: ${p.x}`);
    console.log(`p.y: ${p.y}`);
    if (p.state === "skating") {
      p.speed = 2;
      if (controller.left) {
        p.state = p.states[2];
      }
      if (controller.up) {
        p.dy = -8;
        p.state = p.states[1];
      }
      if (controller.right) {
        p.speed = 3;
      }
    }

    if (p.state === "jumping") {
      p.dy += gravity;
      p.dy += friction;
      p.y = Math.floor(p.y + p.dy);
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

    if (collision(p.x, p.y, p.width, p.height)) {
      
      // Get the blocks within the same x range
      // Check if any of these blocks intersect
      // If it intersect, return that block
      // Set player y to same as block y

      const blockY = getYFromBlockBelowPlayer(p.x);
      console.log("p.y ", p.y);
      console.log("blockY ", blockY);

      p.y = blockY ? blockY - 35 : p.y;

      p.dy = 0;
      if (p.state === p.states[2]) {
        p.state = p.states[2];
      } else {
        p.state = p.states[0];
      }
    } else {
      p.state = p.states[1];
    }

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


const getYFromBlockBelowPlayer = (playerX) => {
  console.log("playerX ", playerX);
  const tilesWithinX = level.filter((tile) => {
    console.log("tile.x ", tile.x);
    return tile.x >= playerX && tile.x <= playerX + 16;
  });

  const y = tilesWithinX[0]?.y;
  return y;
};

const collide = (currentPosition, nextPosition, level) => {
  // New collide function
  // If any tile is within currentPosition and nextPosition we have a collision
  // nextPosition should be adjusted to y of the colliding tile
  console.log("player ", player);
  console.log("level ", level);
};

const collision = (x, y, width, height) => {
  let result = false;

  // Get only the blocks within same x range here

  level.forEach((block) => {
    if (
      Math.floor(block.x) > Math.floor(x) &&
      Math.floor(block.x) < Math.floor(x + width)
    ) {
      if (
        Math.floor(block.y) < Math.floor(y + height + 3) &&
        Math.floor(block.y) > Math.floor(y)
      ) {
        result = true;
      }
    }
  });
  return result;
};

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

const p = new Player();
const tile = new Tile();
const stars = createStars(10);

function update() {
  p.update();
  for (const star of stars) {
    star.update();
  }
  for (let i = 0; i < level.length; i++) {
    level[i].x = level[i].x - p.speed;

    const outsideScreen = -20;

    if (level[i].x < outsideScreen) {
      // const item = { ...level[i] };
      level[i].x = level[i].x + 17 * 16;
      // level.shift();
      // level.push(item);
    }
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
  // Draw a green hitbox around the player
  // context.lineWidth = 2;
  // context.strokeStyle = "green";
  // context.strokeRect(p.x, p.y, p.width, p.height);
}

document.addEventListener("keyup", (event) => {
  controller.keyListener(event);
});

document.addEventListener("keydown", (event) => {
  controller.keyListener(event);
});

// Used to step through each step with the enter key
// Remember to comment out window.requestAnimationFrame before use
document.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    loop();
  }
});

function loop() {
  update();
  draw();
  window.requestAnimationFrame(loop);
}

window.onload = window.requestAnimationFrame(loop);

// Debug, use this to step through the code.
// document.addEventListener("keydown", (event) => {
//   if (event.keyCode === 13) {
//     loop();
//   }
// });
