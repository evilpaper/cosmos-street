# Game loop & rendering

- Use a fixed-step `update()` loop at 60 FPS.
- The game is frame-count driven: prefer “number of frames” over `deltaTime`.
- Separate update logic from render logic.
- Render via HTML canvas.

## Pixel rendering & coordinates

- Treat the game as pixel-based: when **drawing**, use integer coordinates (no subpixel canvas draws).
- You may keep sub-pixel (float) positions/velocities in simulation state for smoother motion, but **round/floor at draw time**.

## Determinism

- Keep update order obvious and consistent (e.g. tick → move → wrap → animate).

