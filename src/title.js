const title = {
  name: "title",
  image: (() => {
    const img = new Image();
    img.src = "./images/title.png";
    return img;
  })(),
  y: 64,

  update() {
    this.y = lerp(this.y, -32, 0.06);
  },

  draw(screen) {
    screen.drawImage(this.image, 64, this.y, 128, 48);
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

  // Otherwise, lerp between the from and to values.
  return from + dist * weight;
}
