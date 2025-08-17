const controller = {};

const breakButton = document.getElementById("break");
const speedUpButton = document.getElementById("speed-up");
const jumpButton = document.getElementById("jump");

controller.keyListener = function (event) {
  console.log(event);
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

breakButton.addEventListener("touchstart", (event) => {
  event.preventDefault();
  controller.keyListener({ keyCode: 37, type: "keydown" });
});

breakButton.addEventListener("touchend", (event) => {
  event.preventDefault();
  controller.keyListener({ keyCode: 37, type: "keyup" });
});

// Also handle touch cancel (when touch is interrupted)
breakButton.addEventListener("touchcancel", (event) => {
  event.preventDefault();
  controller.keyListener({ keyCode: 37, type: "keyup" });
});

jumpButton.addEventListener("touchstart", (event) => {
  event.preventDefault();
  controller.keyListener({ keyCode: 38, type: "keydown" });
});

jumpButton.addEventListener("touchend", (event) => {
  event.preventDefault();
  controller.keyListener({ keyCode: 38, type: "keyup" });
});

// Also handle touch cancel (when touch is interrupted)
jumpButton.addEventListener("touchcancel", (event) => {
  event.preventDefault();
  controller.keyListener({ keyCode: 38, type: "keyup" });
});

speedUpButton.addEventListener("touchstart", (event) => {
  event.preventDefault();
  controller.keyListener({ keyCode: 39, type: "keydown" });
});

speedUpButton.addEventListener("touchend", (event) => {
  event.preventDefault();
  controller.keyListener({ keyCode: 39, type: "keyup" });
});

// Also handle touch cancel (when touch is interrupted)
speedUpButton.addEventListener("touchcancel", (event) => {
  event.preventDefault();
  controller.keyListener({ keyCode: 39, type: "keyup" });
});
