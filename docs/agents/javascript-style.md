# JavaScript & code style

- Use modern JavaScript (ES6+), plain browser JS only.
- No frameworks or external dependencies unless explicitly requested.

## Patterns

- Prefer **factory functions** over classes.
- “Literals for one, factories for many”: use simple object literals for singletons; factories when creating many similar entities.

## Naming

- Use `UPPERCASE_SNAKE_CASE` for local constants (e.g. `TOTAL_FRAMES`, `TICKS_PER_FRAME`).
- Use `camelCase` for mutable state inside factories.

## Numbers & configuration

- Avoid magic numbers: name values like frame counts, tick counts, wrap margins, reset positions, etc.
- Prefer shared constants such as `SCREEN_WIDTH` / `SCREEN_HEIGHT` where applicable.
- Group config and state: separate immutable config/constants from mutable state and name them clearly.

## API shape

- Prefer plain fields over getters unless enforcing read-only or computing values.
- Strive for a clear, minimal API surface.

