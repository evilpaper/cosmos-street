# One state machine per entity

**Status:** Accepted
**Date:** 2026-10-24

The Player, each Enemy, and each Astro Angel keep one state machine in their own file. Use that same machine when creating an entity, and when adding or changing a state on an existing one.

A state is a stretch of behavior with its own movement, picture, or ending: skating, Zapping, Approach, Dispatch. A thing with only one behavior, such as the Cosmic Egg, stays a single `update`. Give it a state machine when a second state appears.

The screen flow — title, play, over, ending — is a separate machine in `src/game.js`. Leave it there.

## Pattern

One state machine per kind, next to the factory or the single object. Every instance shares it. Data that differs per instance (position, bob, animation tick, the explosion) sits on the object, so the states can read the instance they are given.

Each key is the state name. Each value has:

- `update` — what this state does on a frame that belongs to it
- `enter` — setup, when a transition has any (record Approach's start, spawn the explosion, zero `dy`)
- `exit` — teardown, when leaving the state needs it
- `draw` — only when the picture changes with the state. The Astro Angel draws one sprite in every state, so `draw` stays on the object

`update()` calls the active state and no other. Switching state runs `exit` of the current one and `enter` of the next one immediately. The new state's `update` waits until the next `update()` call. Switching into the state the entity is already in does nothing.

The Run may read `state`. It does not assign it. A transition that sets something up is a method on the entity — `obliterate`, `explode`, `beginApproach`, `dispatch` — so `enter` runs.

Each file owns its change-state function. These scripts share one global scope, so the names stay unique: `changePlayerState`, `changeEnemyState`, `changeAngelState`.

Enemy shaking, when it is built, is a state between roaming and zapping.

## Why this shape

A frame should be readable: one state. The Player used to run every matching branch in one frame, so skating into braking applied braking immediately, and speeding into braking waited a frame. The state machine makes those the same.

A shared lookup module was set aside. The Player's frame needs tiles and time, the Astro Angel's needs a leader, and the Enemy's needs neither. The states are the behavior. A module that only dispatched would be another surface to learn, and deleting it would leave the three state machines in place.

Parallel fields updated together — a locomotion slot, an action slot, and a life slot — were set aside. A hit replaces skating. Dispatch replaces follow. Zapping replaces roaming. One state name covers that. The Player remembers the ground state it left so a landing can return to braking or speeding. `scrollSpeed` stays the world's speed.
