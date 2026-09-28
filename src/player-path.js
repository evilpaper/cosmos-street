function createPlayerPath(maxDistance) {
  const points = [];

  function distance(start, end) {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    return Math.hypot(dx, dy);
  }

  function trim() {
    let length = 0;
    const segments = [];
    for (let i = 0; i < points.length - 1; i++) {
      const segment = distance(points[i], points[i + 1]);
      segments.push(segment);
      length += segment;
    }

    while (points.length > 2 && length > maxDistance) {
      length -= segments.pop();
      points.pop();
    }
  }

  return {
    reset() {
      points.length = 0;
    },

    record(x, y, scroll) {
      for (const point of points) {
        point.x -= scroll;
      }
      points.unshift({ x, y });
      trim();
    },

    pointAt(travel) {
      if (points.length === 0) {
        return null;
      }

      let remaining = travel;
      for (let i = 0; i < points.length - 1; i++) {
        const start = points[i];
        const end = points[i + 1];
        const segment = distance(start, end);
        if (segment === 0) {
          continue;
        }
        if (remaining <= segment) {
          const t = remaining / segment;
          return {
            x: start.x + (end.x - start.x) * t,
            y: start.y + (end.y - start.y) * t,
          };
        }
        remaining -= segment;
      }

      const oldest = points[points.length - 1];
      return { x: oldest.x, y: oldest.y };
    },
  };
}

if (typeof module !== "undefined") {
  module.exports = { createPlayerPath };
}
