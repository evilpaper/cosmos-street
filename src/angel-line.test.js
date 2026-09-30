const assert = require("node:assert/strict");
const { advanceAngelLine } = require("./angel-line.js");

const STEP = 16;
const HALF_STEP = 8;

function near(actual, expected, tolerance, message) {
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `${message}: expected ${expected} ± ${tolerance}, got ${actual}`,
  );
}

function follower(index) {
  return {
    state: "follow",
    trailDistance: (index + 1) * STEP,
    trailVelocity: 0,
  };
}

// How far this angel sits behind a step from the one in front.
function stretch(line, index) {
  const ahead = index === 0 ? 0 : line[index - 1].trailDistance;
  return line[index].trailDistance - (ahead + STEP);
}

function standingJumpMoves() {
  let y = 100;
  let dy = -7.2;
  const start = y;
  const moves = [];
  for (let frame = 0; frame < 90; frame++) {
    const previous = y;
    dy += 0.058 + 0.32;
    y = Math.floor(y + dy);
    moves.push(y - previous);
    if (frame > 2 && y >= start) {
      moves[moves.length - 1] = start - previous;
      break;
    }
  }
  return moves;
}

const resting = [0, 1, 2].map(follower);
for (let frame = 0; frame < 30; frame++) {
  advanceAngelLine(resting, 0);
}
near(resting[0].trailDistance, STEP, 0.001, "grounded lead stays one step back");
near(
  resting[1].trailDistance,
  resting[0].trailDistance + STEP,
  0.001,
  "grounded second stays one step behind the lead",
);
near(
  resting[2].trailDistance,
  resting[1].trailDistance + STEP,
  0.001,
  "grounded third stays one step behind the second",
);

const pushed = [0, 1, 2, 3, 4].map(follower);
advanceAngelLine(pushed, -9);
for (let index = 0; index < 3; index++) {
  assert.ok(
    stretch(pushed, index + 1) > stretch(pushed, index),
    `angel ${index + 2} stretches more than angel ${index + 1}`,
  );
}
assert.ok(
  stretch(pushed, 4) <= stretch(pushed, 3),
  "the fifth angel does not stretch more than the fourth",
);

const jumping = [0, 1, 2, 3].map(follower);
let followedThrough = false;
for (const move of standingJumpMoves()) {
  advanceAngelLine(jumping, move);
  for (let index = 0; index < jumping.length; index++) {
    const ahead = index === 0 ? 0 : jumping[index - 1].trailDistance;
    assert.ok(
      jumping[index].trailDistance >= ahead + HALF_STEP - 0.001,
      `angel ${index + 1} stays at least half a step behind the one in front`,
    );
    if (index === 0 && jumping[index].trailDistance < STEP - 0.2) {
      followedThrough = true;
    }
  }
}
assert.ok(followedThrough, "the lead passes its step, then settles");
for (let index = 0; index < jumping.length; index++) {
  const ahead = index === 0 ? 0 : jumping[index - 1].trailDistance;
  near(
    jumping[index].trailDistance,
    ahead + STEP,
    1,
    `angel ${index + 1} is back in its step on landing`,
  );
}
near(jumping[0].trailDistance, STEP, 1, "the lead lands one step behind the player");

const stepping = [
  { state: "follow", trailDistance: STEP * 2, trailVelocity: 0 },
  { state: "follow", trailDistance: STEP * 3, trailVelocity: 0 },
];
for (let frame = 0; frame < 40; frame++) {
  advanceAngelLine(stepping, 0);
}
near(stepping[0].trailDistance, STEP, 0.05, "after a dispatch the new lead reaches the first step");
near(
  stepping[1].trailDistance,
  stepping[0].trailDistance + STEP,
  0.05,
  "after a dispatch the tail closes to one step behind",
);

const lead = follower(0);
const pickup = { state: "approach", trailDistance: null, trailVelocity: 0 };
const collecting = [lead, pickup];
advanceAngelLine(collecting, 12);
assert.equal(
  pickup.trailDistance,
  lead.trailDistance + STEP,
  "a pickup aims one step behind where the tail is now",
);

console.log("angel line tests passed");
