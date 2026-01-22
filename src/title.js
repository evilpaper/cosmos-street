const title = {
  name: "title",
  image: (() => {
    const img = new Image();
    img.src = "./images/title-spritesheet.png";
    return img;
  })(),
  y: 64,
  frameWidth:128,
  frameHeight: 48,
  totalFrames: 9,
  ticksPerFrame: 6,
  x: 64,
  animationTick: 0,
  animationFrameIndex: 0,
  animationDone: false,

  flash() {
    if (this.animationDone) {
      return;
    }

    // Advance animation tick
    this.animationTick += 1;

    // Advance frame when tick threshold reached
    if (this.animationTick >= this.ticksPerFrame) {
      this.animationTick = 0;
      this.animationFrameIndex += 1;

       // Loop animation
      if (this.animationFrameIndex >= this.totalFrames) {
        this.animationFrameIndex = 0;
        this.animationDone = true;
      }
    }
  },

  slideOut() {
    this.y = lerp(this.y, -32, 0.08);    
  },

  draw(screen) {
    const spriteFrameX = this.animationFrameIndex * this.frameWidth;
    const spriteFrameY = 0;

    screen.drawImage(this.image, spriteFrameX, spriteFrameY, this.frameWidth, this.frameHeight, this.x, this.y, this.frameWidth, this.frameHeight);
  },
};

/**
 * Utility functions
 */

function lerp(from, to, weight) {
  const dist = to - from;

  // If we are "close enough" to the target, return the target.
  if (Math.abs(dist) < 0.2) {
    return to;
  }

  // Otherwise, move a little bit towards the target.
  return from + dist * weight;
}
