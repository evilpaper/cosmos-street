const input = {};

// Key code constants for better readability
const KEY_CODES = {
  UP: "ArrowUp",
  RIGHT: "ArrowRight",
  LEFT: "ArrowLeft",
  SOUND_TOGGLE: "KeyS",
};

const breakButton = document.getElementById("break");
const speedUpButton = document.getElementById("speed-up");
const jumpButton = document.getElementById("jump");
const soundToggleButton = document.getElementById("sound-toggle");

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
    case KEY_CODES.SOUND_TOGGLE:
      input.soundToggle = eventType;
      // Toggle pressed state for sound-toggle button
      if (eventType) {
        soundToggleButton.classList.add("pressed");
      } else {
        soundToggleButton.classList.remove("pressed");
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

// Touch events
// preventDefault() prevents scrolling, zooming, and touch delays
// ensuring responsive game controls

function setTouchAction(code, isActive) {
  input.keyListener({
    code,
    type: isActive ? "keydown" : "keyup",
  });
}

const TOUCH_CONTROLS = [
  { button: breakButton, code: KEY_CODES.LEFT },
  { button: jumpButton, code: KEY_CODES.UP },
  { button: speedUpButton, code: KEY_CODES.RIGHT },
  { button: soundToggleButton, code: KEY_CODES.SOUND_TOGGLE },
];

let activeTouchCodes = new Set();

function touchHitsButton(touch, button) {
  const rect = button.getBoundingClientRect();

  return (
    touch.clientX >= rect.left &&
    touch.clientX < rect.right &&
    touch.clientY >= rect.top &&
    touch.clientY < rect.bottom
  );
}

function getActiveTouchCodes(touches) {
  const activeCodes = new Set();

  for (const touch of Array.from(touches)) {
    for (const control of TOUCH_CONTROLS) {
      if (touchHitsButton(touch, control.button)) {
        activeCodes.add(control.code);
      }
    }
  }

  return activeCodes;
}

function reconcileTouchCodes(nextActiveCodes) {
  for (const control of TOUCH_CONTROLS) {
    const wasActive = activeTouchCodes.has(control.code);
    const isActive = nextActiveCodes.has(control.code);

    if (wasActive === isActive) {
      continue;
    }

    setTouchAction(control.code, isActive);
  }

  activeTouchCodes = nextActiveCodes;
}

function handleTouchEvent(event) {
  event.preventDefault();
  const nextActiveCodes = getActiveTouchCodes(event.touches);
  reconcileTouchCodes(nextActiveCodes);
}

function createTouchHandlers(button) {
  button.addEventListener("touchstart", handleTouchEvent, {
    passive: false,
  });
  button.addEventListener("touchend", handleTouchEvent, {
    passive: false,
  });
  button.addEventListener("touchmove", handleTouchEvent, {
    passive: false,
  });
  button.addEventListener("touchcancel", handleTouchEvent, {
    passive: false,
  });
}

for (const control of TOUCH_CONTROLS) {
  createTouchHandlers(control.button);
}

function hasAnyDirectionInput() {
  return input.left || input.right || input.up;
}

function resetInput() {
  input.left = false;
  input.right = false;
  input.up = false;
}
