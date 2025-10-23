/**
 * Constants
 */
const canvas = document.querySelector("canvas");
const screen = canvas.getContext("2d");
const fps = 60;
const frameDuration = 1000 / fps;
// TODO: Change this
const CONSTANTS = {
  SCREEN_WIDTH: 256,
  SCREEN_HEIGHT: 256,
};

/**
 * Start the game loop
 */
function start() {
  if (init) {
    init();
  }

  setInterval(() => {
    if (update) {
      update();
    }
  }, frameDuration);

  setInterval(() => {
    if (draw) {
      draw(screen);
    }
  }, frameDuration);
}

window.onload = start;

/**
 * Custom font
 */
function fontImage() {
  let image = new Image();
  image.src = "./images/font.png";
  return { image };
}

const characters = fontImage();

/**
 * A map of characters to their x and y coordinates on the font image
 */
const letters = {
  a: {
    x: 0,
    y: 0,
  },
  b: {
    x: 8,
    y: 0,
  },
  c: {
    x: 16,
    y: 0,
  },
  d: {
    x: 24,
    y: 0,
  },
  e: {
    x: 32,
    y: 0,
  },
  f: {
    x: 40,
    y: 0,
  },
  g: {
    x: 48,
    y: 0,
  },
  h: {
    x: 56,
    y: 0,
  },
  i: {
    x: 64,
    y: 0,
  },
  j: {
    x: 72,
    y: 0,
  },
  k: {
    x: 80,
    y: 0,
  },
  l: {
    x: 88,
    y: 0,
  },
  m: {
    x: 96,
    y: 0,
  },
  n: {
    x: 0,
    y: 8,
  },
  o: {
    x: 8,
    y: 8,
  },
  p: {
    x: 16,
    y: 8,
  },
  q: {
    x: 24,
    y: 8,
  },
  r: {
    x: 32,
    y: 8,
  },
  s: {
    x: 40,
    y: 8,
  },
  t: {
    x: 48,
    y: 8,
  },
  u: {
    x: 56,
    y: 8,
  },
  v: {
    x: 64,
    y: 8,
  },
  w: {
    x: 72,
    y: 8,
  },
  x: {
    x: 80,
    y: 8,
  },
  y: {
    x: 88,
    y: 8,
  },
  z: {
    x: 96,
    y: 8,
  },
};

/**
 * Print a string to the screen
 */

function print(str, x = 0, y = 0) {
  const allLowerCaseString = str.toLowerCase();
  const width = 8;
  const height = 8;
  for (let i = 0; i < allLowerCaseString.length; i++) {
    if (allLowerCaseString[i] === " ") {
      continue;
    }

    const letterCharacter = allLowerCaseString[i];

    screen.drawImage(
      characters.image,
      letters[letterCharacter].x,
      letters[letterCharacter].y,
      width,
      height,
      x + i * 8,
      y,
      width,
      height
    );
  }
}

/**
 * Mobile browsers often show/hide the address bar, so 100vh can be unreliable.
 * To get a truly fullscreen canvas, set its size with JS on resize:
 */
function resizeCanvas() {
  const body = document.querySelector("body");
  body.width = window.innerWidth;
  body.height = window.innerHeight;

  // Handle mobile landscape mode - set canvas height to 96% of body height
  if (window.innerWidth <= 960 && window.innerHeight < window.innerWidth) {
    const canvas = document.getElementById("canvas");
    const bodyHeight = window.innerHeight;
    const canvasHeight = bodyHeight * 0.96; // 96% of body height

    // Set canvas height while maintaining aspect ratio
    canvas.style.height = `${canvasHeight}px`;
    canvas.style.width = `${canvasHeight}px`; // Keep it square
  }
}

window.addEventListener("resize", resizeCanvas);
window.addEventListener("orientationchange", resizeCanvas);

// Call once on load
resizeCanvas();

/**
 * Round a value to the nearest integer
 */
function o(value) {
  return Math.round(value);
}

/**
 * Center a string horizontally on the screen
 */
function hcenter(s) {
  // screen center minus the
  // string length times the
  // pixels in a char's width cut in half
  return 128 - (s.length * 8) / 2;
}
