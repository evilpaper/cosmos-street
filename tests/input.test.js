const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

class FakeButton {
  constructor(left) {
    this.rect = { left, right: left + 50, top: 0, bottom: 50 };
    this.classes = new Set();
    this.classList = {
      add: (name) => this.classes.add(name),
      remove: (name) => this.classes.delete(name),
    };
  }

  getBoundingClientRect() {
    return this.rect;
  }
}

function createHarness() {
  const buttons = {
    break: new FakeButton(0),
    "speed-up": new FakeButton(60),
    jump: new FakeButton(120),
    "sound-toggle": new FakeButton(180),
  };
  const listeners = new Map();
  const window = {
    addEventListener(type, handler, options) {
      listeners.set(type, { handler, options });
    },
  };
  const document = {
    getElementById: (id) => buttons[id],
  };
  const context = vm.createContext({ document, window });
  const inputStateSource = fs.readFileSync(
    path.join(__dirname, "../src/input-state.js"),
    "utf8",
  );
  const inputSource = fs.readFileSync(
    path.join(__dirname, "../src/input.js"),
    "utf8",
  );

  vm.runInContext(inputStateSource, context);
  const api = vm.runInContext(
    `${inputSource}\n({ input, resetInput, INPUT_ACTIONS });`,
    context,
  );

  function dispatch(type, touches = []) {
    let defaultPrevented = false;
    listeners.get(type).handler({
      touches,
      preventDefault() {
        defaultPrevented = true;
      },
    });
    return defaultPrevented;
  }

  return { ...api, buttons, dispatch, listeners };
}

function touch(x, y = 25) {
  return { clientX: x, clientY: y };
}

test("global touch listeners are non-passive and prevent browser gestures", () => {
  const { dispatch, listeners } = createHarness();

  for (const type of ["touchstart", "touchmove", "touchend", "touchcancel"]) {
    assert.equal(listeners.get(type).options.passive, false);
    assert.equal(dispatch(type), true);
  }
});

test("a tap ending before an update remains latched", () => {
  const { input, INPUT_ACTIONS, dispatch } = createHarness();

  dispatch("touchstart", [touch(145)]);
  dispatch("touchend", []);
  input.beginFrame();

  assert.equal(input.isDown(INPUT_ACTIONS.JUMP), false);
  assert.equal(input.wasPressed(INPUT_ACTIONS.JUMP), true);
});

test("touch movement reconciles the complete active touch set", () => {
  const { input, INPUT_ACTIONS, dispatch } = createHarness();

  dispatch("touchstart", [touch(25), touch(145)]);
  input.beginFrame();
  assert.equal(input.isDown(INPUT_ACTIONS.LEFT), true);
  assert.equal(input.isDown(INPUT_ACTIONS.JUMP), true);
  input.endFrame();

  dispatch("touchmove", [touch(85), touch(145)]);
  input.beginFrame();

  assert.equal(input.isDown(INPUT_ACTIONS.LEFT), false);
  assert.equal(input.isDown(INPUT_ACTIONS.RIGHT), true);
  assert.equal(input.isDown(INPUT_ACTIONS.JUMP), true);
  assert.equal(input.wasPressed(INPUT_ACTIONS.RIGHT), true);
  assert.equal(input.wasPressed(INPUT_ACTIONS.JUMP), false);
});

test("touchend keeps controls with remaining active touches held", () => {
  const { input, INPUT_ACTIONS, dispatch } = createHarness();

  dispatch("touchstart", [touch(25), touch(145)]);
  dispatch("touchend", [touch(25)]);

  assert.equal(input.isDown(INPUT_ACTIONS.LEFT), true);
  assert.equal(input.isDown(INPUT_ACTIONS.JUMP), false);
});

test("touchcancel releases touch controls", () => {
  const { input, INPUT_ACTIONS, dispatch } = createHarness();

  dispatch("touchstart", [touch(85)]);
  dispatch("touchcancel", []);

  assert.equal(input.isDown(INPUT_ACTIONS.RIGHT), false);
});

test("keyboard repeat does not create repeated press edges", () => {
  const { input, INPUT_ACTIONS, listeners } = createHarness();
  const keydown = listeners.get("keydown").handler;

  keydown({ code: "ArrowUp" });
  keydown({ code: "ArrowUp", repeat: true });
  input.beginFrame();
  assert.equal(input.wasPressed(INPUT_ACTIONS.JUMP), true);
  input.endFrame();

  input.beginFrame();
  assert.equal(input.wasPressed(INPUT_ACTIONS.JUMP), false);
  assert.equal(input.isDown(INPUT_ACTIONS.JUMP), true);
});
