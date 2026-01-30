const input = {};

// Key code constants for better readability
const KEY_CODES = {
  UP: "ArrowUp",
  RIGHT: "ArrowRight",
  LEFT: "ArrowLeft",
};

const breakButton = document.getElementById("break");
const speedUpButton = document.getElementById("speed-up");
const jumpButton = document.getElementById("jump");

/**
 * code: string
 * type: string
 */
input.keyListener = function ({ code, type }) {
  const eventType = type === "keydown" ? true : false;
  switch (code) {
    case KEY_CODES.LEFT:
      input.left = eventType;
      // Toggle pressed state for break button
      if (eventType) {
        breakButton.classList.add("pressed");
      } else {
        breakButton.classList.remove("pressed");
      }
      break;
    case KEY_CODES.UP:
      input.up = eventType;
      // Toggle pressed state for jump button
      if (eventType) {
        jumpButton.classList.add("pressed");
      } else {
        jumpButton.classList.remove("pressed");
      }
      break;
    case KEY_CODES.RIGHT:
      input.right = eventType;
      // Toggle pressed state for speed-up button
      if (eventType) {
        speedUpButton.classList.add("pressed");
      } else {
        speedUpButton.classList.remove("pressed");
      }
      break;
  }
};

// Listen for button events. Should have "hold" button behavior.

// Keyboard events
document.addEventListener(
  "keydown",
  (event) => {
    const code = event.code;
    input.keyListener({ code, type: "keydown" });
  },
  { passive: true },
);

document.addEventListener(
  "keyup",
  (event) => {
    const code = event.code;
    input.keyListener({ code, type: "keyup" });
  },
  { passive: true },
);

// Touch ev ents
// preventDefault() prevents scrolling, zooming, and touch delays
// ensuring responsive game controls

// Helper function to create touch event handlers for a button
function createTouchHandlers(button, code) {
  button.addEventListener(
    "touchstart",
    (event) => {
      input.keyListener({ code, type: "keydown" });
    },
    { passive: true },
  );

  button.addEventListener(
    "touchend",
    (event) => {
      input.keyListener({ code, type: "keyup" });
    },
    { passive: true },
  );

  button.addEventListener(
    "touchcancel",
    (event) => {
      event.preventDefault();
      input.keyListener({ code, type: "keyup" });
    },
    { passive: true },
  );
}

// Apply touch handlers to all buttons
createTouchHandlers(breakButton, KEY_CODES.LEFT); // Left arrow
createTouchHandlers(jumpButton, KEY_CODES.UP); // Up arrow
createTouchHandlers(speedUpButton, KEY_CODES.RIGHT); // Right arrow

// breakButton.addEventListener("click", (event) => {
//   event.preventDefault();
//   input.keyListener({ code: KEY_CODES.LEFT, type: "keydown" });
// });
