# Cosmos Street

A nostalgic skate ride inspired by Wonder Boy’s legendary runs on the Sega Master System.

[> You can try it out here <](https://evilpaper.github.io/cosmos-street/)

> **Warning**
> This game is a work in progress.

## About this project

Cosmos Street is an old-school auto-runner. Inspired by the skateboard sequences in Wonder Boy on the Sega Master System, complete with borrowed sprites. It’s made for fun and as an experiment in pushing the creative limits within the restrictions of classic video game design.

The game runs right in the browser, built with just plain HTML, CSS, and JavaScript, no frameworks, no build tools, nothing fancy.

## How to play

- Jump = Arrow Up
- Slow down = Arrow Left
- Speed up = Arrow Right

That's it! Good luck!

## Roadmap

- [x] Start screen
- [x] Variation (platform distribution)
- [x] Power up (air jump) - incl. spawn logic and visual pickup, possession and usage feedback
- [x] Enemy
- [x] Death
- [x] Restart
- [x] Fruits (did angel instead)
- [x] Score
- [x] Session high score
- [x] SFX
- [x] Music
- [x] Sound controls (on/off)
- [ ] Increase difficulty over time (harder and harder)
- [ ] Playtest, playtest, playtest, tweak, tweak and tweak again until it's fun, juicy and tight. Add visual feedback, smooth transitions etc.
- [ ] Optional - Double jump visual feedback, sparkling stars
- [ ] Optional - Electric sparks around enemy.
- [ ] Optional - Feedback particles. Break, landing, speeding.
- [ ] Optional - Change player x position based on state (break,regular,speeding)
- [ ] Optional - Dynamic, vibrant space background, make it more interesting.
- [ ] Optional - How to play - desktop (keyboard)
- [ ] Optional - How to play - mobile
- [x] favicon (sparkle)
- [ ] itch.io game page. Maybe.
- [x] Replace .cursor/rules with AGENTS.md in the root (a simple and platform independent alternative)

## Constraints and Requirements

- Limited palette. Only allowed to use four colors palette. Inspired by the original Game Boy and tweaked for a distinct vintage futuristic look. Can't remember the inspiration source.
- Small screen, 256 x 256 px. Wrapped in a CSS Clip Path to get a round-ish shape. No other reason than it's nice.
- Only use standard HTML, CSS and JavaScript. No dependecies.
- Should have Keyboard and Touch Controls.
- Create as few original assets as possible; reuse existing ones where feasible. Producing art, sound effects, and music is time-consuming. One reason modified sprites from the original Wonder Boy (Sega Master System) are used.

## Architecture notes

- The CRT effect is created with CSS. More precise CSS Keyframes.
- The game runs an update() loop at a fixed 60 frames per second. The frame rate is not configurable, which means the game logic is entirely frame-rate dependent and does not require handling deltaTime.

## On decisions and mental notes

-

## Credits

- The enemy art for Blip Blip is sourced from the image Mega Man Custom Enemies by calegaea75432, discovered online. Full credit goes to calegaea75432.
- Font used is [Highway Chase / Data East / 1980](https://arcade.itch.io/arcade-game-typography-fonts/devlog/611049/highway-chase-data-east-1980)
- Sounds Effects are taken from Wonder Boy III: The Dragon's Trap. Source[The Sounds Resource](https://sounds.spriters-resource.com/master_system/wonderboyiiithedragonstrap/asset/441223/). All credits to the original creators and The Sounds Resource for provision. I couldn't find sound effects for orginal Wonder Boy. Picked the nearest I could find. Orignal format wav, converted to ogg to reduce size.
- Music track is [Retro Platforming by David Fesliyan](https://www.fesliyanstudios.com/royalty-free-music/downloads-c/8-bit-music/6). Credit: https://www.FesliyanStudios.com Background Music

## Running Locally

No need to install anything, but, regardless how much I wan't the game to be a file a a canvas game is a web app, not a local file. Once accepted, a local dev server stops feeling like “extra tooling” and starts feeling like “The minimum environment the platform requires.”

You can run the lightest possible dev server from your terminal like this:

```sh
npx serve
```

or

```sh
python3 -m http.server
```

That’s it. No build step. No framework. No lock-in.

### Alternative approach without sound

If you are ok to run it locally without sound you can just open the index.html in your web browser of choice and game along.

If you have cloned the repo you can run it from your shell with the open command, like this:

```sh
open -a "Google Chrome" index.html
```

Sound will not work when opening this file directly (file://).
The game uses the Web Audio API, which loads audio via `fetch`,
and `fetch` must be served over http:// or https://. Otherwise,
the browser blocks the request with a CORS error.

Web Audio requires binary audio data (ArrayBuffer) that is either:

- Same-origin, or
- Explicitly allowed via CORS headers

The file:// protocol has no origin, so browsers intentionally block
access to prevent local files from being read silently. This is a
core browser security boundary.

## License

Licensed under the MIT license.
