const input = {
  upJustPressed: false,
};

let upHeld = false;

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
const soundToggleButton = document.getElementById("toggle-sound");

/**
 * code: string
 * type: string
 */
input.keyListener = function ({ code, type, repeat = false }) {
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
      if (eventType) {
        if (!upHeld) {
          input.upJustPressed = true;
        }
        upHeld = true;
        input.up = true;
      } else {
        upHeld = false;
        input.up = false;
        input.upJustPressed = false;
      }
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
      // Only a new press toggles; update() clears the flag once handled.
      if (eventType && !repeat) {
        input.soundToggle = true;
      }
      // Toggle pressed state for toggle-sound button
      if (eventType) {
        soundToggleButton.classList.add("pressed");
      } else {
        soundToggleButton.classList.remove("pressed");
      }
      break;
  }
};

// Keyboard events

document.addEventListener(
  "keydown",
  (event) => {
    const code = event.code;
    input.keyListener({ code, type: "keydown", repeat: event.repeat });
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

// Recalculate control state from every currently active touch.
// Browser gestures are disabled so touches remain dedicated to the game.

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

const TOUCH_EVENT_TYPES = [
  "touchstart",
  "touchmove",
  "touchend",
  "touchcancel",
];

for (const eventType of TOUCH_EVENT_TYPES) {
  window.addEventListener(eventType, handleTouchEvent, {
    passive: false,
  });
}

// Helper functions

function hasAnyDirectionInput() {
  return input.left || input.right || input.up;
}

function resetInput() {
  input.left = false;
  input.right = false;
  input.up = false;
  input.upJustPressed = false;
  upHeld = false;
}
