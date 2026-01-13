## Plan Mode

- Make the plan extremely concise. Sacrifice grammar for the sake of concision.
- At the end of each plan, give me a list of unresolved questions to answer, if any.

## General coding style

- Always write modern, clean, and readable JavaScript (ES6+).
- Only plain JavaScript (ES6+). No frameworks or external dependencies.
- Use Factory Functions over Classes.
- Use Literals for one, Factories for many.
- Use UPPERCASE_SNAKE_CASE for local constants (e.g., TOTAL_FRAMES, TICKS_PER_FRAME) and camelCase for mutable state variables in Factories.
- Avoid magic numbers: Name things like 6 (frames), 16 (ticks per frame), -10 (left wrap margin), 200 (reset x) and reference SCREEN_WIDTH/HEIGHT.
- Strive for a clear and minimal API: Prefer plain fields over getters unless you need to enforce read-only or compute values.
- Group config and state: Separate constants (config) from mutable state; name them clearly.

## Game loop & rendering

- Like most game engines, use an update() loop, running 60 times per second.
- The framerate is fixed and not changeable. The game is entirely frame-rate dependent, omitting the need to handle deltaTime and instead, working with number of frames directly (if you have ever used Pico-8, you'd get the idea).
- Update logic is separated from render logic. Encourage the separation.
- The game is renderd using HTML canvas.
- The game is rendered in pixels. Each pixel is a distinct thing and has integers values as x and y. No overlaps with decimal numbers are allowed.
- Use integer rendering: Keep sub-pixel for movement for smoother motion, but ensure integer coordinates when drawing.
- Use a deterministic update order: Tick, move, wrap, animate — keep this order obvious.

## Physics & collisions

- Use axis-aligned bounding box (AABB) collision detection unless pixel-perfect collisions are needed.
- For collision resolution, use previous position history to determine collision type: if the player was above the tile before the frame, it's a landing; otherwise it's a wall collision.

## AI help behavior

- When asked for code, provide self-contained working examples that can run directly in the browser.
- Explain the reasoning behind any complex code suggestions.
- When providing new game features, ensure compatibility with existing HTML/CSS/JS structure.
- Do not suggest unrelated frameworks or libraries unless explicitly requested.

## Style

- Follow consistent indentation (2 spaces).
- Write comments for all non-trivial code blocks explaining what they do.
