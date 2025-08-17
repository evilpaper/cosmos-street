const controller = {};

const breakButton = document.getElementById("break");
const speedUpButton = document.getElementById("speed-up");
const jumpButton = document.getElementById("jump");

controller.keyListener = function (event) {
  const eventType = event.type === "keydown" ? true : false;
  switch (event.keyCode) {
    case 37:
      controller.left = eventType;
      break;
    case 38:
      controller.up = eventType;
      break;
    case 39:
      controller.right = eventType;
      break;
  }
};

// Listen for button events. Should have "hold" button behavior.

// Keyboard events
document.addEventListener("keydown", (event) => {
  controller.keyListener(event);
});

document.addEventListener("keyup", (event) => {
  controller.keyListener(event);
});

// Touch events
// preventDefault() prevents scrolling, zooming, and touch delays
// ensuring responsive game controls

// Helper function to create touch event handlers for a button
function createTouchHandlers(button, keyCode) {
  button.addEventListener("touchstart", (event) => {
    event.preventDefault();
    controller.keyListener({ keyCode, type: "keydown" });
  });

  button.addEventListener("touchend", (event) => {
    event.preventDefault();
    controller.keyListener({ keyCode, type: "keyup" });
  });

  button.addEventListener("touchcancel", (event) => {
    event.preventDefault();
    controller.keyListener({ keyCode, type: "keyup" });
  });
}

// Apply touch handlers to all buttons
createTouchHandlers(breakButton, 37); // Left arrow
createTouchHandlers(jumpButton, 38); // Up arrow
createTouchHandlers(speedUpButton, 39); // Right arrow
