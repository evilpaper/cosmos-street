# Poll input once per frame, read it with btn and btnp

**Status:** Accepted
**Date:** 2026-11-03

Input works like PICO-8. Keyboard and touch events only record which buttons are held. Once per frame, `pollInput()` takes a snapshot, and the game reads only the snapshot:

- `btn(button)` — the button is down this frame
- `btnp(button)` — the button is down this frame and was not down at the previous poll

Game code never clears or consumes input. A button is a game input (`BUTTONS.LEFT`, `BUTTONS.UP`, `BUTTONS.PAUSE`), not a key. `KEY_TO_BUTTON` and the touch controls map onto the same buttons.

## Two poll points

Control buttons (sound, reset, pause, frame step, continue) are polled at the top of every `update()`, because they must work during Freeze. Play buttons (left, right, up) are polled only on frames the game runs. Polling them during Freeze would use up a press before the stepped frame, so a jump could never be stepped through.

## Which reads use btn and which use btnp

- Braking, speeding and ground jumps use `btn`. A ground jump that only fired on `btnp` would drop the press on the frame the player lands, or when up is pressed in the same frame as left or right. Holding up jumps again on landing, as keyboard repeat already did.
- The air jump uses `btnp`. It needs a new press.
- Starting from the title, and the choices on Over and the Ending, use `btnp`. A key still held from the previous screen does not choose for the player.

## Why

The old `keyListener` used a different technique per key: a held flag, a just-pressed flag guarded by a private variable, and flags that `update()` cleared after reading. Each key had to be read to know what it did. A press could also land in the middle of a frame, and the game had to remember to clear input when switching scenes.

With one snapshot per frame, every read in a frame sees the same input, and one comparison (`down now && not down last poll`) replaces the per-key bookkeeping.
