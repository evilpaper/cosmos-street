# Cosmos Street

A side-scrolling skate through an asteroid belt. The player collects companions and pickups while escaping alien machines.

## Language

**Angel**:
A companion the player carries. Each angel is one air jump.
_Avoid_: shield, Astro Angel

**Air jump**:
A jump the player makes while already airborne, on a new press. Each one spends the closest carried angel (the oldest still carried).
_Avoid_: double jump

**Egg**:
A pickup. Not involved in scoring.
_Avoid_: Cosmic Egg, score pickup

**Score**:
Points added when collecting an angel, equal to how many angels are carried after that collect.

**Approach**:
The flight from pickup into place behind its leader — the player for the closest angel, the angel ahead for the rest. Slow, along a slight arc; ends when the angel reaches that place and starts following.
_Avoid_: intro, tween, lerp

**Dispatch**:
The closest carried angel leaving by flying up off the screen. The others each move one place closer.
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
A enemy. Can can be in states Roaming, Shaking (Telegraphing), Zapping (Emitting electric flashes) and Exploding (Dying)
