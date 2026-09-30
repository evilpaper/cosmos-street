const ANGEL_STEP = 16;
const ANGEL_HALF_STEP = ANGEL_STEP / 2;
const ANGEL_DRAG_SHARE = 1 / 3;
const ANGEL_DRAG_LIMIT = 4;
// A standing jump stretches the tail and is back in its steps on landing.
// Follow-through stays inside half a step.
const ANGEL_SPRING_STIFFNESS = 0.77;
const ANGEL_SPRING_DAMPING = 0.55;

function advanceAngelLine(line, verticalMove) {
  const drag = Math.abs(verticalMove);
  let previousDistance = 0;

  for (let index = 0; index < line.length; index++) {
    const angel = line[index];
    const rest = previousDistance + ANGEL_STEP;

    if (angel.state === "approach") {
      angel.trailDistance = rest;
      angel.trailVelocity = 0;
      previousDistance = rest;
      continue;
    }

    if (angel.trailDistance == null) {
      angel.trailDistance = rest;
    }
    if (angel.trailVelocity == null) {
      angel.trailVelocity = 0;
    }

    const shares = Math.min(index + 1, ANGEL_DRAG_LIMIT);
    angel.trailDistance += shares * ANGEL_DRAG_SHARE * drag;

    const displacement = rest - angel.trailDistance;
    angel.trailVelocity =
      (angel.trailVelocity + displacement * ANGEL_SPRING_STIFFNESS) *
      ANGEL_SPRING_DAMPING;
    angel.trailDistance += angel.trailVelocity;

    const minDistance = previousDistance + ANGEL_HALF_STEP;
    if (angel.trailDistance < minDistance) {
      angel.trailDistance = minDistance;
      if (angel.trailVelocity < 0) {
        angel.trailVelocity = 0;
      }
    }

    previousDistance = angel.trailDistance;
  }
}

if (typeof module !== "undefined") {
  module.exports = { advanceAngelLine };
}
