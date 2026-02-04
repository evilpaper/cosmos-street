/**
 * DOM Elements
 */
const canvas = document.querySelector("canvas");
const screen = canvas.getContext("2d");

/**
 * Constants
 */
const FPS = 60;
const FRAME_DURATION = 1000 / FPS;
const SCREEN_WIDTH = 256;
const SCREEN_HEIGHT = 256;

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
  }, FRAME_DURATION);

  setInterval(() => {
    if (draw) {
      draw(screen);
    }
  }, FRAME_DURATION);
}
/**
 * Start when the window have loaded
 */
window.onload = start;

/**
 * Load music tracks
 */
const music = {
  retroPlatforming: new Audio(
    "music/SLOWER-TEMPO2019-12-11_-_Retro_Platforming_-_David_Fesliyan.mp3",
  ),
};

/**
 * Audio
 */
let audioCtx;

function initAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
}

function unlockAudio() {
  initAudio();
  // if (audioCtx.state === "suspended") {
  //   audioCtx.resume();
  // }
  loadSounds();
  window.removeEventListener("touchstart", unlockAudio);
  window.removeEventListener("mousedown", unlockAudio);
  window.removeEventListener("keydown", unlockAudio);
  window.removeEventListener("keyup", unlockAudio);
  window.removeEventListener("mouseup", unlockAudio);
  window.removeEventListener("mouseleave", unlockAudio);
  window.removeEventListener("mouseenter", unlockAudio);
  window.removeEventListener("mousemove", unlockAudio);
  window.removeEventListener("mouseover", unlockAudio);
  window.removeEventListener("mouseout", unlockAudio);
}

window.addEventListener("touchstart", unlockAudio);
window.addEventListener("mousedown", unlockAudio);
window.addEventListener("keydown", unlockAudio);
window.addEventListener("keyup", unlockAudio);
window.addEventListener("mouseup", unlockAudio);
window.addEventListener("mouseleave", unlockAudio);
window.addEventListener("mouseenter", unlockAudio);
window.addEventListener("mousemove", unlockAudio);
window.addEventListener("mouseover", unlockAudio);
window.addEventListener("mouseout", unlockAudio);

async function loadSound(url) {
  const res = await fetch(url);
  const arrayBuffer = await res.arrayBuffer();
  return await audioCtx.decodeAudioData(arrayBuffer);
}

const sounds = {};

async function loadSounds() {
  sounds.jump = await loadSound("audio/jump.ogg");
  sounds.crash = await loadSound("audio/fireball.ogg");
  sounds.angel = await loadSound("audio/select-cursor.ogg");
}

function playSound(buffer, volume = 1) {
  const source = audioCtx.createBufferSource();
  const gain = audioCtx.createGain();

  source.buffer = buffer;
  gain.gain.value = volume;

  source.connect(gain);
  gain.connect(audioCtx.destination);

  source.start();
}

let soundEnabled = true;

function applySoundEnabled() {
  // sfx.jump.muted = !soundEnabled;
  // sfx.crash.muted = !soundEnabled;
  // sfx.angel.muted = !soundEnabled;
  // music.retroPlatforming.muted = !soundEnabled;
}

function toggleSound() {
  soundEnabled = !soundEnabled;
  applySoundEnabled();
}

function getSoundEnabled() {
  return soundEnabled;
}

applySoundEnabled();

/**
 * Font
 */
function loadFontImage() {
  const image = new Image();
  image.src = "./images/font.png";
  return image;
}

const characters = { image: loadFontImage() };

/**
 * Font system constants
 */
const FONT_WIDTH = 8;
const FONT_HEIGHT = 8;
const CHARS_PER_ROW = 13;

/**
 * A map of characters to their x and y coordinates on the font image
 */
function createCharMap() {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789.,←↑→↓!+";
  const charMap = {};

  for (let i = 0; i < chars.length; i++) {
    const char = chars[i];
    const x = (i % CHARS_PER_ROW) * FONT_WIDTH;
    const y = Math.floor(i / CHARS_PER_ROW) * FONT_HEIGHT;
    charMap[char] = { x, y };
  }

  return charMap;
}

const letters = createCharMap();

/**
 * Get character position with validation
 */
function getCharPosition(char) {
  const lowerChar = char.toLowerCase();
  return letters[lowerChar] || null;
}

/**
 * Print a string to the screen with improved space handling
 */
function print(str, x = 0, y = 0) {
  const startX = x === "center" ? center(str) : x;
  const startY = y === "middle" ? middle() : y;

  const allLowerCaseString = str.toLowerCase();

  let cursorX = startX;
  let cursorY = startY;

  for (let i = 0; i < allLowerCaseString.length; i++) {
    const char = allLowerCaseString[i];

    // Handle spaces properly - advance position but don't draw
    if (char === " ") {
      cursorX += FONT_WIDTH;
      continue;
    }

    const charPos = getCharPosition(char);

    // Skip unknown characters but still advance position
    if (!charPos) {
      cursorX += FONT_WIDTH;
      continue;
    }

    screen.drawImage(
      characters.image,
      charPos.x,
      charPos.y,
      FONT_WIDTH,
      FONT_HEIGHT,
      cursorX,
      cursorY,
      FONT_WIDTH,
      FONT_HEIGHT,
    );

    cursorX += FONT_WIDTH;
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
  // if (window.innerWidth <= 960 && window.innerHeight < window.innerWidth) {
  //   const canvas = document.getElementById("canvas");
  //   const bodyHeight = window.innerHeight;
  //   const canvasHeight = bodyHeight * 0.96; // 96% of body height

  //   // Set canvas height while maintaining aspect ratio
  //   canvas.style.height = `${canvasHeight}px`;
  //   canvas.style.width = `${canvasHeight}px`; // Keep it square
  // }
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
function center(s) {
  // screen center minus the
  // string length times the
  // pixels in a char's width cut in half
  return 128 - (s.length * 8) / 2;
}

/**
 * Center a string vertically on the screen
 */
function middle() {
  return 128 - 8 / 2;
}
