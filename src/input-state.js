const INPUT_ACTIONS = Object.freeze({
  LEFT: "left",
  RIGHT: "right",
  JUMP: "jump",
  SOUND_TOGGLE: "soundToggle",
});

function createInputState() {
  const heldSources = new Map(
    Object.values(INPUT_ACTIONS).map((action) => [action, new Set()]),
  );
  const pendingPresses = new Map();
  let framePresses = new Set();

  function sourcesFor(action) {
    return heldSources.get(action);
  }

  function press(action, source) {
    const sources = sourcesFor(action);
    if (!sources || sources.has(source)) {
      return;
    }

    const wasDown = sources.size > 0;
    sources.add(source);

    if (!wasDown) {
      const pendingCount = pendingPresses.get(action) || 0;
      pendingPresses.set(action, pendingCount + 1);
    }
  }

  function release(action, source) {
    sourcesFor(action)?.delete(source);
  }

  function beginFrame() {
    framePresses = new Set();

    for (const [action, count] of pendingPresses) {
      framePresses.add(action);
      if (count === 1) {
        pendingPresses.delete(action);
      } else {
        pendingPresses.set(action, count - 1);
      }
    }
  }

  function endFrame() {
    framePresses.clear();
  }

  function isDown(action) {
    return (sourcesFor(action)?.size || 0) > 0;
  }

  function wasPressed(action) {
    return framePresses.has(action);
  }

  function consumePress(action) {
    framePresses.delete(action);
  }

  function isActive(action) {
    return isDown(action) || wasPressed(action);
  }

  function reset() {
    for (const sources of heldSources.values()) {
      sources.clear();
    }
    pendingPresses.clear();
    framePresses.clear();
  }

  return {
    press,
    release,
    beginFrame,
    endFrame,
    isDown,
    wasPressed,
    consumePress,
    isActive,
    reset,
  };
}
