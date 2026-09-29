/**
 * DOM Elements
 */
const canvas = document.querySelector("canvas");
const screen = canvas.getContext("2d");

/**
 * Constants
 */

// Fixed frame rate
const FPS = 60;
const FIXED_TIMESTEP_MS = 1000 / FPS;

// Fixed screen size
const SCREEN_WIDTH = 256;
const SCREEN_HEIGHT = 256;

/**
 * Game loop with fixed frame rate
 */
function start() {
  // Run init first, only one time.
  if (init) {
    init();
  }

  let lastTime = null;
  let totalTime = 0;
  let accumulatedTime = 0;

  function loop(currentTime) {
    if (lastTime === null) lastTime = currentTime;
    const deltaTime = currentTime - lastTime;
    totalTime += deltaTime;
    accumulatedTime += deltaTime;
    lastTime = currentTime;

    while (accumulatedTime >= FIXED_TIMESTEP_MS) {
      accumulatedTime -= FIXED_TIMESTEP_MS;
      if (update) {
        update();
      }
      if (draw) {
        draw(screen);
      }
    }

    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
}

/**
 * Wait for the window to load before we start the game loop
 */
window.onload = () => {
  start();
};

/**
 * Sound
 *
 * Sound is off on every page load and only the player turns it on.
 * Browsers don't allow audio until the user has interacted with the page,
 * so the audio context is created and all audio is loaded the first time sound is turned on.
 * The game never waits for sound; anything played before loading finishes is skipped.
 */
let audioCtx;
let soundOn = false;
let soundReady = false;
let soundUnavailable = false;
let soundLoading = null;

function isSoundOn() {
  return soundOn;
}

function isSoundUnavailable() {
  return soundUnavailable;
}

function loadAudio() {
  if (!soundLoading) {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    soundLoading = Promise.all([loadSounds(), loadSongs()])
      .then(() => {
        soundReady = true;
      })
      .catch((error) => {
        soundLoading = null;
        throw error;
      });
  }
  return soundLoading;
}

/**
 * themePosition returns where in the theme (in seconds) playback should start
 * once sound is ready, so the theme can follow the run's clock.
 */
function toggleSound(themePosition) {
  soundOn = !soundOn;
  soundUnavailable = false;

  if (!soundOn) {
    stopTheme();
    return;
  }

  loadAudio()
    .then(() => {
      if (soundOn) {
        playTheme(themePosition());
      }
    })
    .catch((error) => {
      console.error("Sound failed to load:", error);
      soundOn = false;
      soundUnavailable = true;
    });
}

const sounds = {};

// Load a sound into the sounds object
async function loadSound(url) {
  const res = await fetch(url);
  const arrayBuffer = await res.arrayBuffer();
  return audioCtx.decodeAudioData(arrayBuffer);
}

// Load all sounds
async function loadSounds() {
  sounds.jump = await loadSound("audio/jump.ogg");
  sounds.crash = await loadSound("audio/fireball.ogg");
  sounds.angel = await loadSound("audio/select-cursor.ogg");
  sounds.egg = await loadSound("audio/box-get.ogg");
  sounds.drop = await loadSound("audio/fireball.ogg");
  sounds.electrified = await loadSound("audio/select-wrong.ogg");
  sounds.enemyKill = await loadSound("audio/dragon-breath.ogg");
}

// Play a sound effect
function sfx(buffer, volume = 1) {
  if (!soundOn || !soundReady || !buffer) return;

  const source = audioCtx.createBufferSource();
  const gain = audioCtx.createGain();

  source.buffer = buffer;
  gain.gain.value = volume;

  source.connect(gain);
  gain.connect(audioCtx.destination);

  source.start();
}

const songs = {};
const THEME_VOLUME = 0.5;
let themeSource = null;

// Load a song into the music object
async function loadSong(url) {
  const res = await fetch(url);
  const arrayBuffer = await res.arrayBuffer();
  return audioCtx.decodeAudioData(arrayBuffer);
}

// Load all songs
async function loadSongs() {
  songs.theme = await loadSong("audio/retro-platforming-david-fesliyan.mp3");
}

// Play the theme on a loop, starting `position` seconds in
function playTheme(position = 0) {
  stopTheme();
  const buffer = songs.theme;
  if (!soundOn || !soundReady || !buffer) return;

  const source = audioCtx.createBufferSource();
  const gain = audioCtx.createGain();

  source.buffer = buffer;
  gain.gain.value = THEME_VOLUME;
  source.loop = true;

  source.connect(gain);
  gain.connect(audioCtx.destination);

  themeSource = source;
  source.start(0, position % buffer.duration);
}

function stopTheme() {
  if (themeSource) {
    try {
      themeSource.stop();
    } catch (e) {
      // Ignore if already stopped
    }
    themeSource = null;
  }
}

function syncAudioWithGamePaused(isPaused) {
  if (!audioCtx || audioCtx.state === "closed") return;
  if (isPaused) {
    if (audioCtx.state === "running") {
      audioCtx.suspend().catch(() => {});
    }
  } else if (audioCtx.state === "suspended") {
    audioCtx.resume().catch(() => {});
  }
}
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
 * Returns true if two axis-aligned boxes are closer than gap pixels apart.
 */
function boxesTooClose(a, b, gap) {
  return !(
    a.x + a.width + gap <= b.x ||
    b.x + b.width + gap <= a.x ||
    a.y + a.height + gap <= b.y ||
    b.y + b.height + gap <= a.y
  );
}

const COLLECTIBLE_SPAWN_GAP = 96;

function findSpreadCollectiblePosition(tiles, existingBoxes, options = {}) {
  const {
    minGap = COLLECTIBLE_SPAWN_GAP,
    minX = SCREEN_WIDTH + 32,
    spriteWidth,
    spriteHeight,
    floatHeight = 0,
  } = options;

  const candidates = [];
  for (const tile of tiles) {
    if (tile.x < minX) continue;
    const box = {
      x: tile.x + tile.width / 2 - spriteWidth / 2,
      y: tile.y - spriteHeight - floatHeight,
      width: spriteWidth,
      height: spriteHeight,
    };
    const tooClose = existingBoxes.some((b) => boxesTooClose(box, b, minGap));
    if (!tooClose) candidates.push({ x: box.x, y: box.y, tileX: tile.x });
  }

  if (candidates.length === 0) return null;

  candidates.sort((a, b) => b.tileX - a.tileX);
  const farPool = candidates.slice(
    0,
    Math.max(1, Math.ceil(candidates.length / 3)),
  );
  return farPool[Math.floor(Math.random() * farPool.length)];
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

/**
 * Load an image once
 */

function loadOnce(src) {
  const img = new Image();
  img.src = src;
  return img;
}
