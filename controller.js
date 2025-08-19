const controller = {};

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
 * code = KeyboardEvent: code property, a string
 * type = KeyboardEvent: type property, a string
 */
controller.keyListener = function ({ code, type }) {
  const eventType = type === "keydown" ? true : false;
  console.log("code", code);
  switch (code) {
    case KEY_CODES.LEFT:
      controller.left = eventType;
      // Toggle pressed state for break button
      if (eventType) {
        breakButton.classList.add("pressed");
      } else {
        breakButton.classList.remove("pressed");
      }
      break;
    case KEY_CODES.UP:
      controller.up = eventType;
      // Toggle pressed state for jump button
      if (eventType) {
        jumpButton.classList.add("pressed");
      } else {
        jumpButton.classList.remove("pressed");
      }
      break;
    case KEY_CODES.RIGHT:
      controller.right = eventType;
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
document.addEventListener("keydown", (event) => {
  const code = event.code;
  controller.keyListener({ code, type: "keydown" });
});

document.addEventListener("keyup", (event) => {
  const code = event.code;
  controller.keyListener({ code, type: "keyup" });
});

// Touch events
// preventDefault() prevents scrolling, zooming, and touch delays
// ensuring responsive game controls

// Helper function to create touch event handlers for a button
function createTouchHandlers(button, code) {
  button.addEventListener("touchstart", (event) => {
    event.preventDefault();
    controller.keyListener({ code, type: "keydown" });
  });

  button.addEventListener("touchend", (event) => {
    event.preventDefault();
    controller.keyListener({ code, type: "keyup" });
  });

  button.addEventListener("touchcancel", (event) => {
    event.preventDefault();
    controller.keyListener({ code, type: "keyup" });
  });
}

// Apply touch handlers to all buttons
createTouchHandlers(breakButton, KEY_CODES.LEFT); // Left arrow
createTouchHandlers(jumpButton, KEY_CODES.UP); // Up arrow
createTouchHandlers(speedUpButton, KEY_CODES.RIGHT); // Right arrow
