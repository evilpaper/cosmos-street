# Cosmos Street

A side-scrolling skate through an asteroid belt. The player collects companions and pickups while escaping alien machines.

## Language

**Angel**:
A companion the player carries in a line. Each angel is one air jump.
_Avoid_: shield, Astro Angel

**Air jump**:
A jump the player makes while already airborne, including during a dive, on a new press. Each one spends the closest angel still in line.
_Avoid_: double jump

**Line**:
The angels the player is carrying, ordered along the path the player has already traveled. The closest angel is the one in the first step behind the player. A newly collected angel joins the far end at the moment it is collected.
_Avoid_: tow, queue

**Egg**:
A score pickup. Collecting one leaves the line unchanged.
_Avoid_: Cosmic Egg

**Dispatch**:
The closest angel leaving the line by flying up off the screen. The angels behind it step forward.
_Avoid_: leave, dismiss

**Step**:
The gap between neighboring angels along the path, about one angel width.
_Avoid_: offset, slot
