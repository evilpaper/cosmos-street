const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");

const player = new Image();
console.log({ player });
player.src = "spritesheet.png";
player.tick = 0;
player.frame = 0;
player.ticksToNextFrame = 16;
player.yy = 40;
console.log(player.tick);
console.log(player);
console.log(player.ticksToNextFrame);

const tile = new Image();
tile.src = "spritesheet.png";
tile.tick = 0;

function update() {
  player.tick = (player.tick + 1) % player.ticksToNextFrame; // 1, 0, 1, 0 etc...

  if (player.tick === 0) {
    player.frame = player.frame + 1;
    if (player.frame >= 2) {
      player.frame = 0;
    }
  }

  tile.tick = (tile.tick + 1) % 16;
}

function draw() {
  context.clearRect(0, 0, 256, 256);
  context.drawImage(tile, 0, 35, 16, 16, 131 - tile.tick, 75, 16, 16);
  context.drawImage(tile, 0, 35, 16, 16, 115 - tile.tick, 75, 16, 16);
  context.drawImage(tile, 0, 35, 16, 16, 99 - tile.tick, 75, 16, 16);
  context.drawImage(tile, 0, 35, 16, 16, 83 - tile.tick, 75, 16, 16);
  context.drawImage(tile, 0, 35, 16, 16, 67 - tile.tick, 75, 16, 16);
  context.drawImage(tile, 0, 35, 16, 16, 51 - tile.tick, 75, 16, 16);
  context.drawImage(tile, 0, 35, 16, 16, 35 - tile.tick, 75, 16, 16);
  context.drawImage(tile, 0, 35, 16, 16, 19 - tile.tick, 75, 16, 16);
  context.drawImage(tile, 0, 35, 16, 16, 3 - tile.tick, 75, 16, 16);
  context.drawImage(tile, 0, 35, 16, 16, -13 - tile.tick, 75, 16, 16);
  if (player.frame === 0) {
    context.drawImage(player, 0, 0, 26, 35, 51, player.yy, 26, 35);
  } else {
    context.drawImage(player, 26, 0, 26, 35, 51, player.yy, 26, 35);
  }
}

document.addEventListener("keydown", (event) => {
  console.log(event.keyCode);
  if (event.keyCode === 38) {
    player.yy = player.yy - 10;
  }
  if (event.keyCode === 40) {
    player.yy = player.yy + 10;
  }
});

function isColliding(a, b) {}

function loop() {
  update();
  draw();
  window.requestAnimationFrame(loop);
}

window.requestAnimationFrame(loop);
