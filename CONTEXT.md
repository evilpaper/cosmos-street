# Cosmos Street

A side-scrolling 2D skateboard auto-runner in space. The player lasts as long as possible.

## Language

**Astro Angel**:
A companion the player carries. Each Astro Angel is one air jump.
_Avoid_: companion, shield

**Air jump**:
A jump the player makes while already airborne, on a new press. Each one spends the closest carried Astro Angel (the oldest still carried).
_Avoid_: double jump

**Cosmic Egg**:
A pickup. Collecting one destroys every enemy overlapping the playfield. Not involved in scoring.
_Avoid_: score pickup

**Score**:
Points added when collecting an Astro Angel, equal to how many Astro Angels are carried after that collect.

**Approach**:
The flight from pickup into place behind its leader — the player for the closest Astro Angel, the Astro Angel ahead for the rest. Slow, along a slight arc; ends when the Astro Angel reaches that place and starts following.
_Avoid_: intro, tween, lerp

**Dispatch**:
The closest carried Astro Angel leaving by flying up off the screen. The others each move one place closer.
_Avoid_: leave, dismiss

**Run**:
One play from the moment the player starts until game over or the ending.

**Sound**:
The single on/off switch for everything the player hears, the theme and all sound effects. Off on every page load; only the player turns it on.
_Avoid_: audio, mute

**Theme**:
The level's song. It starts over at the beginning of every run and follows the run's clock, so turning sound on mid-run joins the song where it would be. Outside a run it simply loops.
_Avoid_: music, soundtrack

**Sound effect**:
A short one-off sound tied to a game event, such as a jump or a crash.
_Avoid_: sfx

**Enemy**:
An alien machine that threatens the player. States: Roaming, Shaking (telegraphing), Zapping (emitting electric flashes), and Exploding (dying — owns its death animation, inert to the player).
_Avoid_: antagonist, Relic Telly, robot

**Palette**:
The four colors allowed on the playfield, ordered dark to light: void, purple, magenta, light. Anything drawn on the canvas uses only these.
_Avoid_: theme colors, CSS variables, Game Boy greens

**Dot explosion**:
A short burst of filled circles from a point — large in the center, then outward and smaller until they stop and vanish. Palette colors only; may keep one color or cycle colors each frame.
_Avoid_: particle system, VFX, circfill burst
