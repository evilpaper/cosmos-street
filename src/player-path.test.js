const assert = require("node:assert/strict");
const { createPlayerPath } = require("./player-path.js");

function approx(actual, expected, message) {
  assert.ok(
    Math.abs(actual - expected) < 0.001,
    `${message}: expected ${expected}, got ${actual}`,
  );
}

const path = createPlayerPath(64);

path.record(50, 100, 0);
const atStart = path.pointAt(0);
approx(atStart.x, 50, "newest point x");
approx(atStart.y, 100, "newest point y");

path.record(50, 100, 16);
const oneStepBack = path.pointAt(16);
approx(oneStepBack.x, 34, "one step back x");
approx(oneStepBack.y, 100, "one step back y");

path.record(50, 80, 0);
const alongArc = path.pointAt(10);
approx(alongArc.x, 50, "vertical step keeps x");
approx(alongArc.y, 90, "vertical step is halfway up the arc");

const beyond = path.pointAt(1000);
approx(beyond.y, 100, "past the end stays on the oldest point");

const trimmed = createPlayerPath(20);
trimmed.record(0, 0, 0);
trimmed.record(0, 0, 16);
trimmed.record(0, 0, 16);
trimmed.record(0, 0, 16);
const kept = trimmed.pointAt(16);
approx(kept.x, -16, "trim keeps the recent path");
const dropped = trimmed.pointAt(48);
approx(dropped.x, -16, "trim drops path older than the max length");

console.log("player path tests passed");
