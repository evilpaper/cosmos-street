const input = createInputState();

const KEY_ACTIONS = {
  ArrowLeft: INPUT_ACTIONS.LEFT,
  ArrowRight: INPUT_ACTIONS.RIGHT,
  ArrowUp: INPUT_ACTIONS.JUMP,
  KeyS: INPUT_ACTIONS.SOUND_TOGGLE,
};

const breakButton = document.getElementById("break");
const speedUpButton = document.getElementById("speed-up");
const jumpButton = document.getElementById("jump");
const soundToggleButton = document.getElementById("sound-toggle");

const controls = [
  { action: INPUT_ACTIONS.LEFT, button: breakButton },
  { action: INPUT_ACTIONS.RIGHT, button: speedUpButton },
  { action: INPUT_ACTIONS.JUMP, button: jumpButton },
  { action: INPUT_ACTIONS.SOUND_TOGGLE, button: soundToggleButton },
];
const controlsByAction = new Map(
  controls.map((control) => [control.action, control]),
);

const KEYBOARD_SOURCE = "keyboard";
const TOUCH_SOURCE = "touch";
let activeTouchActions = new Set();

function updatePressedClass(control) {
  if (input.isDown(control.action)) {
    control.button.classList.add("pressed");
  } else {
    control.button.classList.remove("pressed");
  }
}

function updateAllPressedClasses() {
  for (const control of controls) {
    updatePressedClass(control);
  }
}

function setKeyboardAction(code, isPressed) {
  const action = KEY_ACTIONS[code];
  if (!action) {
    return;
  }

  if (isPressed) {
    input.press(action, KEYBOARD_SOURCE);
  } else {
    input.release(action, KEYBOARD_SOURCE);
  }

  updatePressedClass(controlsByAction.get(action));
}

function touchHitsControl(touch, control) {
  const rect = control.button.getBoundingClientRect();
  return (
    touch.clientX >= rect.left &&
    touch.clientX < rect.right &&
    touch.clientY >= rect.top &&
    touch.clientY < rect.bottom
  );
}

function getActiveTouchActions(touches) {
  const actions = new Set();

  for (const touch of Array.from(touches)) {
    for (const control of controls) {
      if (touchHitsControl(touch, control)) {
        actions.add(control.action);
      }
    }
  }

  return actions;
}

function reconcileTouches(touches) {
  const nextTouchActions = getActiveTouchActions(touches);

  for (const control of controls) {
    const wasActive = activeTouchActions.has(control.action);
    const isActive = nextTouchActions.has(control.action);

    if (isActive && !wasActive) {
      input.press(control.action, TOUCH_SOURCE);
    } else if (!isActive && wasActive) {
      input.release(control.action, TOUCH_SOURCE);
    }
  }

  activeTouchActions = nextTouchActions;
  updateAllPressedClasses();
}

function handleTouchEvent(event) {
  event.preventDefault();
  reconcileTouches(event.touches || []);
}

window.addEventListener(
  "keydown",
  (event) => setKeyboardAction(event.code, true),
  { passive: true },
);
window.addEventListener(
  "keyup",
  (event) => setKeyboardAction(event.code, false),
  { passive: true },
);

for (const eventType of [
  "touchstart",
  "touchmove",
  "touchend",
  "touchcancel",
]) {
  window.addEventListener(eventType, handleTouchEvent, { passive: false });
}

function resetInput() {
  input.reset();
  activeTouchActions.clear();
  updateAllPressedClasses();
}
