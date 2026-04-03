# Cosmos Street

A nostalgic skate ride inspired by Wonder Boy’s legendary runs on the Sega Master System.

[--> Click here to play <--](https://evilpaper.github.io/cosmos-street/)

> **NOTICE**
> This game is a work in progress.

## About this project

Cosmos Street is an old-school auto-runner. Inspired by the skateboard sequences in Wonder Boy on the Sega Master System, complete with borrowed sprites. It’s made for fun and as an experiment in pushing the creative limits within the restrictions of classic video game design.

The game runs right in the browser, built with just plain HTML, CSS, and JavaScript, no frameworks, no build tools, nothing fancy.

## How to play

- Jump = Arrow Up
- Slow down = Arrow Left
- Speed up = Arrow Right
- Sound on/off = S

The game is primarily designed to be played using the left, up, and right arrow keys on a physical keyboard. The movement simply feels better this way. Virtual buttons have been added to make the game playable on touch devices, which is great, since many games aren’t, but the controls aren’t quite as tight as with physical keys.

That's it! Good luck!

### Music playback

Background music starts when you begin playing and loops continuously. Use the S key (or the sound button) to mute or unmute both music and sound effects.

## Roadmap

- [x] Start screen
- [x] Variation (platform distribution)
- [ ] 4 different power up's
- [ ] Head as favicon
- [ ] Better electric sparks, more frames, better sound.
- [x] Enemy
- [x] Death
- [x] Restart
- [x] Score
- [x] Session high score
- [x] SFX
- [x] Music
- [x] Sound controls (on/off)
- [ ] Increase difficulty over time (harder and harder)
- [ ] Playtest, playtest, playtest, tweak, tweak and tweak again until it's fun, juicy and tight.
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

## Credits

- The art for the enemy, called [Relic Telly](https://www.deviantart.com/calegaea75432/art/ye-more-megaman-custom-enemies-168698207), is made by [calegaea75432](https://www.deviantart.com/calegaea75432/gallery).
- Font is modelled after [Highway Chase / Data East / 1980](https://arcade.itch.io/arcade-game-typography-fonts/devlog/611049/highway-chase-data-east-1980) by [Void](https://arcade.itch.io/). Redrawn in Aseprite.
- Sounds Effects are taken from [Wonder Boy III: The Dragon's Trap](https://sounds.spriters-resource.com/master_system/wonderboyiiithedragonstrap/asset/441223/) and [Penguin Land](https://sounds.spriters-resource.com/master_system/penguinland/asset/404945/). Credits to the original creators and [The Spriters Resource](https://sounds.spriters-resource.com/). Couldn’t find the original Wonder Boy sound effects, so I used the closest available alternatives. They were downloaded as WAV files and converted to OGG to reduce file size.
- Music track is [Retro Platforming](https://www.fesliyanstudios.com/royalty-free-music/downloads-c/8-bit-music/6) by [David Fesliyan](https://www.fesliyanstudios.com/).

## Running Locally

No need to install anything, but being a web game you need to run a dev server.

You can run the lightest possible dev server from your terminal like this:

```sh
npx serve
```

or

```sh
python3 -m http.server
```

That’s it. No build step. No framework. No lock-in.
As much as I wanted the game to be “just a file,” it’s a canvas game, and canvas is a browser feature, not something that runs directly from a local file. Once you accept that, a local dev server stops feeling like extra tooling and starts feeling like the minimum environment the platform requires.

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
