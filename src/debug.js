/**
 * Tools to help with debugging.
 */

/**
 * Pause and resume the game with the space bar.
 */

document.addEventListener("keydown", (event) => {
  if (event.key === " ") {
    if (gameState.paused) {
      gameState.paused = false;
    } else {
      gameState.paused = true;
    }
  }
});

/**
 * Step through each step with the enter key when debugging.
 * Remember to comment out setInterval inside loop before use.
 */

// document.addEventListener("keydown", (event) => {
//   if (event.key === "Enter") {
//     update();
//     draw();
//   }
// });
