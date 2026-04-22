/**
 * This file contains tools to help with debugging.
 */

/** Set true to always show FPS; or use `?fps` / `?debug=1` in the URL. */
const DEBUG_SHOW_FPS = true;

function isDebugFpsEnabled() {
  return DEBUG_SHOW_FPS;
}

let fpsOverlayLastSample = performance.now();
let fpsOverlayFrames = 0;
let fpsOverlayDisplayed = 0;
let fpsOverlayHasSample = false;

/**
 * Draws callback-rate FPS at the bottom of the canvas (after game content).
 * Uses global `print` and constants from system.js (SCREEN_HEIGHT, FONT_HEIGHT).
 */
function drawDebugFps() {
  if (!isDebugFpsEnabled()) {
    return;
  }

  fpsOverlayFrames += 1;
  const now = performance.now();
  const elapsed = now - fpsOverlayLastSample;

  if (elapsed >= 1000) {
    fpsOverlayDisplayed = Math.round((fpsOverlayFrames * 1000) / elapsed);
    fpsOverlayFrames = 0;
    fpsOverlayLastSample = now;
    fpsOverlayHasSample = true;
  }

  const text = fpsOverlayHasSample ? `${fpsOverlayDisplayed} fps` : "... fps";
  print(text, "center", 216);
}

/**
 * Pause and resume the game with the space bar.
 */

document.addEventListener("keydown", (event) => {
  if (event.key === " ") {
    if (paused) {
      paused = false;
    } else {
      paused = true;
    }
  }
});

/**
 * Step through each step with the enter key when debugging.
 * Remember to comment out setInterval inside the main loop before use.
 */

// console.log("Debug mode enabled");

// document.addEventListener("keydown", (event) => {
//   if (event.key === "Enter") {
//     console.log("Stepping forward one frame...");
//     update();
//     draw(screen);
//   }
// });
