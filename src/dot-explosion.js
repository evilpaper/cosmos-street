/**
 * Dot explosion — short burst of circfill dots from a point.
 *
 * options.cycleColors:
 *   false (default) — each dot keeps one palette color for the whole effect
 *   true — each dot steps through palette colors every frame
 */
function createDotExplosion(x, y, options = {}) {
  const { cycleColors = false } = options;

  const TOTAL_FRAMES = 40;
  // Distance scale only — ease runs over TOTAL_FRAMES so dots keep drifting.
  const TRAVEL_FRAMES = 12;
  const DOT_COUNT = 16;
  // Skip void — invisible on the clear background.
  const DOT_COLORS = [1, 2, 3];

  const originX = x;
  const originY = y;

  const dots = [];
  let prevColorIndex = -1;
  for (let i = 0; i < DOT_COUNT; i++) {
    const angle = (Math.PI * 2 * i) / DOT_COUNT + (Math.random() - 0.5) * 0.6;
    const speed = 3 + Math.random() * 2;
    const startRadius = 8 + Math.random() * 3.5;
    // Never the same palette color as the previous dot.
    let colorIndex;
    do {
      colorIndex = Math.floor(Math.random() * DOT_COLORS.length);
    } while (colorIndex === prevColorIndex);
    prevColorIndex = colorIndex;
    const startX = originX + (Math.random() - 0.5) * 3;
    const startY = originY + (Math.random() - 0.5) * 3;

    dots.push({
      startX,
      startY,
      endOffsetX: Math.cos(angle) * speed * TRAVEL_FRAMES,
      endOffsetY: Math.sin(angle) * speed * TRAVEL_FRAMES,
      x: startX,
      y: startY,
      startRadius,
      radius: startRadius,
      colorIndex,
      col: DOT_COLORS[colorIndex],
    });
  }

  let age = 0;
  let done = false;
  // World scroll accumulated so eased local motion stays parented to the world.
  let scrollOffsetX = 0;

  return {
    isDone() {
      return done;
    },

    update() {
      if (done) {
        return;
      }

      age += 1;
      scrollOffsetX -= scrollSpeed;

      // t: progress through the effect, 0 → 1. Raising TOTAL_FRAMES makes the
      // same motion (and shrink) take more frames; lowering makes it snappier.
      const t = age / TOTAL_FRAMES;
      // easeOut: quadratic ease-out of t. Starts fast, flattens near the end.
      // Stronger curve (e.g. cube: (1-t)^3) = more punch then harder slowdown.
      const easeOut = 1 - Math.pow(1 - t, 4);
      // eased: blend of linear (t) and easeOut. Weights must sum to 1.
      // More weight on t → steadier drift, less slowdown.
      // More weight on easeOut → bigger burst then stronger coast.
      const eased = t * 0.3 + easeOut * 0.7;
      // life: remaining size factor, 1 → 0. Radius = startRadius * life, so
      // dots shrink in lockstep with t (same duration as TOTAL_FRAMES).
      const life = 1 - t;

      for (const dot of dots) {
        dot.x = dot.startX + dot.endOffsetX * eased + scrollOffsetX;
        dot.y = dot.startY + dot.endOffsetY * eased;

        dot.radius = dot.startRadius * Math.max(0, life);

        if (cycleColors) {
          dot.col = DOT_COLORS[(dot.colorIndex + age) % DOT_COLORS.length];
        }
      }

      if (age >= TOTAL_FRAMES) {
        done = true;
      }
    },

    draw() {
      if (done) {
        return;
      }

      for (const dot of dots) {
        if (dot.radius < 0.5) {
          continue;
        }
        const type = Math.random() < 0.5;
        if (type) {
          circ(dot.x, dot.y, dot.radius, dot.col);
        } else {
          circfill(dot.x, dot.y, dot.radius, dot.col);
        }
      }
    },
  };
}
