# Physics & collisions

- Default to axis-aligned bounding box (AABB) collision detection (use pixel-perfect only if needed).
- For collision resolution, use previous-position history to classify collisions:
  - If the player was above a tile in the previous frame, treat it as a landing.
  - Otherwise treat it as a wall/side collision.

