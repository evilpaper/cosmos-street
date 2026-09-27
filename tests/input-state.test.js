const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

function loadInputState() {
  const source = fs.readFileSync(
    path.join(__dirname, "../src/input-state.js"),
    "utf8",
  );

  return vm.runInNewContext(
    `${source}\n({ INPUT_ACTIONS, createInputState });`,
  );
}

test("a released press remains visible for one update", () => {
  const { INPUT_ACTIONS, createInputState } = loadInputState();
  const input = createInputState();

  input.press(INPUT_ACTIONS.JUMP, "touch");
  input.release(INPUT_ACTIONS.JUMP, "touch");
  input.beginFrame();

  assert.equal(input.isDown(INPUT_ACTIONS.JUMP), false);
  assert.equal(input.wasPressed(INPUT_ACTIONS.JUMP), true);
  assert.equal(input.isActive(INPUT_ACTIONS.JUMP), true);

  input.endFrame();
  input.beginFrame();
  assert.equal(input.wasPressed(INPUT_ACTIONS.JUMP), false);
});

test("held actions remain active across updates without repeating presses", () => {
  const { INPUT_ACTIONS, createInputState } = loadInputState();
  const input = createInputState();

  input.press(INPUT_ACTIONS.RIGHT, "touch");
  input.beginFrame();
  assert.equal(input.wasPressed(INPUT_ACTIONS.RIGHT), true);
  assert.equal(input.isDown(INPUT_ACTIONS.RIGHT), true);
  input.endFrame();

  input.beginFrame();
  assert.equal(input.wasPressed(INPUT_ACTIONS.RIGHT), false);
  assert.equal(input.isActive(INPUT_ACTIONS.RIGHT), true);
});

test("consuming a press clears its edge without releasing the hold", () => {
  const { INPUT_ACTIONS, createInputState } = loadInputState();
  const input = createInputState();

  input.press(INPUT_ACTIONS.JUMP, "keyboard");
  input.beginFrame();
  input.consumePress(INPUT_ACTIONS.JUMP);

  assert.equal(input.wasPressed(INPUT_ACTIONS.JUMP), false);
  assert.equal(input.isDown(INPUT_ACTIONS.JUMP), true);
});

test("each quick tap is latched for a separate update", () => {
  const { INPUT_ACTIONS, createInputState } = loadInputState();
  const input = createInputState();

  input.press(INPUT_ACTIONS.JUMP, "touch");
  input.release(INPUT_ACTIONS.JUMP, "touch");
  input.press(INPUT_ACTIONS.JUMP, "touch");
  input.release(INPUT_ACTIONS.JUMP, "touch");

  input.beginFrame();
  assert.equal(input.wasPressed(INPUT_ACTIONS.JUMP), true);
  input.endFrame();

  input.beginFrame();
  assert.equal(input.wasPressed(INPUT_ACTIONS.JUMP), true);
  input.endFrame();

  input.beginFrame();
  assert.equal(input.wasPressed(INPUT_ACTIONS.JUMP), false);
});

test("releasing one source preserves another source holding the action", () => {
  const { INPUT_ACTIONS, createInputState } = loadInputState();
  const input = createInputState();

  input.press(INPUT_ACTIONS.LEFT, "keyboard");
  input.press(INPUT_ACTIONS.LEFT, "touch");
  input.release(INPUT_ACTIONS.LEFT, "touch");

  assert.equal(input.isDown(INPUT_ACTIONS.LEFT), true);

  input.release(INPUT_ACTIONS.LEFT, "keyboard");
  assert.equal(input.isDown(INPUT_ACTIONS.LEFT), false);
});

test("reset clears held and latched input", () => {
  const { INPUT_ACTIONS, createInputState } = loadInputState();
  const input = createInputState();

  input.press(INPUT_ACTIONS.LEFT, "keyboard");
  input.press(INPUT_ACTIONS.JUMP, "touch");
  input.release(INPUT_ACTIONS.JUMP, "touch");
  input.reset();
  input.beginFrame();

  assert.equal(input.isActive(INPUT_ACTIONS.LEFT), false);
  assert.equal(input.wasPressed(INPUT_ACTIONS.JUMP), false);
});
