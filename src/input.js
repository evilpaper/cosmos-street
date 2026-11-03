/**
 * Input works like PICO-8's btn and btnp.
 *
 * Keyboard and touch events only record which buttons are held.
 * pollInput() copies that into a snapshot, and the game reads only the snapshot:
 * btn is true while a button is down, btnp only on the poll where it went down.
 */
const BUTTONS = {
  LEFT: "left",
  RIGHT: "right",
  UP: "up",
  SOUND: "sound",
  RESET: "reset",
  PAUSE: "pause",
  FRAME_STEP: "frameStep",
  CONTINUE: "continue",
};

const KEY_TO_BUTTON = {
  ArrowLeft: BUTTONS.LEFT,
  ArrowRight: BUTTONS.RIGHT,
  ArrowUp: BUTTONS.UP,
  KeyS: BUTTONS.SOUND,
  KeyR: BUTTONS.RESET,
  KeyP: BUTTONS.PAUSE,
  KeyF: BUTTONS.FRAME_STEP,
  KeyC: BUTTONS.CONTINUE,
};

const BUTTON_ELEMENTS = {
  [BUTTONS.LEFT]: document.getElementById("break"),
  [BUTTONS.UP]: document.getElementById("jump"),
  [BUTTONS.RIGHT]: document.getElementById("speed-up"),
  [BUTTONS.SOUND]: document.getElementById("toggle-sound"),
  [BUTTONS.RESET]: document.getElementById("reset"),
  [BUTTONS.PAUSE]: document.getElementById("pause"),
};

const heldButtons = new Set();
// A press and release between two polls still counts as down on the next poll.
const buttonsPressedSincePoll = new Set();

const currentButtons = {};
const previousButtons = {};

for (const button of Object.values(BUTTONS)) {
  currentButtons[button] = false;
  previousButtons[button] = false;
}

function pressButton(button) {
  heldButtons.add(button);
  buttonsPressedSincePoll.add(button);
  BUTTON_ELEMENTS[button]?.classList.add("pressed");
}

function releaseButton(button) {
  heldButtons.delete(button);
  BUTTON_ELEMENTS[button]?.classList.remove("pressed");
}

/**
 * Take a new snapshot of the given buttons. The old snapshot becomes previous,
 * so btnp is measured against the last poll of that same button.
 */
function pollInput(buttons) {
  for (const button of buttons) {
    previousButtons[button] = currentButtons[button];
    currentButtons[button] =
      heldButtons.has(button) || buttonsPressedSincePoll.has(button);
    buttonsPressedSincePoll.delete(button);
  }
}

function btn(button) {
  return currentButtons[button];
}

function btnp(button) {
  return currentButtons[button] && !previousButtons[button];
}

// Keyboard events

document.addEventListener(
  "keydown",
  (event) => {
    const button = KEY_TO_BUTTON[event.code];
    if (button) {
      pressButton(button);
    }
  },
  { passive: true },
);

document.addEventListener(
  "keyup",
  (event) => {
    const button = KEY_TO_BUTTON[event.code];
    if (button) {
      releaseButton(button);
    }
  },
  { passive: true },
);

// Touch events

// Recalculate control state from every currently active touch.
// Browser gestures are disabled so touches remain dedicated to the game.

const TOUCH_CONTROLS = Object.entries(BUTTON_ELEMENTS).map(
  ([button, element]) => ({ button, element }),
);

let activeTouchButtons = new Set();

function touchHitsElement(touch, element) {
  const rect = element.getBoundingClientRect();

  return (
    touch.clientX >= rect.left &&
    touch.clientX < rect.right &&
    touch.clientY >= rect.top &&
    touch.clientY < rect.bottom
  );
}

function getActiveTouchButtons(touches) {
  const activeButtons = new Set();

  for (const touch of Array.from(touches)) {
    for (const control of TOUCH_CONTROLS) {
      if (touchHitsElement(touch, control.element)) {
        activeButtons.add(control.button);
      }
    }
  }

  return activeButtons;
}

function reconcileTouchButtons(nextActiveButtons) {
  for (const { button } of TOUCH_CONTROLS) {
    const wasActive = activeTouchButtons.has(button);
    const isActive = nextActiveButtons.has(button);

    if (wasActive === isActive) {
      continue;
    }

    if (isActive) {
      pressButton(button);
    } else {
      releaseButton(button);
    }
  }

  activeTouchButtons = nextActiveButtons;
}

function handleTouchEvent(event) {
  event.preventDefault();
  reconcileTouchButtons(getActiveTouchButtons(event.touches));
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
