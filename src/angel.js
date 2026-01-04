// Define the angel object. This is a power-up that the player can collect to gain an extra jump.
const angel = {
  name: "angel",
  image: (() => {
    const img = new Image();
    img.src = "./images/collectibles-sprite-sheet.png";
    return img;
  })(),
  x: 256,
  baseY: 120, // Original Y position for oscillation
  y: 120,
  width: 16,
  height: 16,
  hitboxWidth: 8,
  hitboxHeight: 8,
  tick: 0,
  oscillationAmplitude: 2, // Pixels to move up/down
  oscillationSpeed: 0.1, // Controls the speed of oscillation
  floatHeight: 5, // Pixels above platform when spawning

  getHitbox() {
    return {
      x: this.x + this.hitboxWidth,
      y: this.y + this.hitboxHeight,
      width: this.hitboxWidth,
      height: this.hitboxHeight,
    };
  },

  update() {
    this.x -= scrollSpeed;

    // Oscillate up and down using sine wave
    this.tick += 1;
    this.y = Math.round(
      this.baseY +
        Math.sin(this.tick * this.oscillationSpeed) * this.oscillationAmplitude
    );
  },

  draw(screen) {
    screen.drawImage(
      this.image,
      0,
      0,
      this.width,
      this.height,
      this.x,
      this.y,
      this.width,
      this.height
    );
  },

  reset(tiles = []) {
    // Find platforms that are off-screen to the right
    const eligibleTiles = tiles.filter((tile) => tile.x > SCREEN_WIDTH);

    if (eligibleTiles.length > 0) {
      // Pick a random tile from eligible ones
      const tile =
        eligibleTiles[Math.floor(Math.random() * eligibleTiles.length)];
      // Center angel on the tile, floating above it
      this.x = tile.x + tile.width / 2 - this.width / 2;
      this.baseY = tile.y - this.height - this.floatHeight;
      this.y = this.baseY;
    } else {
      // Fallback: spawn ahead of screen at default height
      this.x = SCREEN_WIDTH + 64;
      this.baseY = 120;
      this.y = this.baseY;
    }

    this.tick = 0;
  },
};
