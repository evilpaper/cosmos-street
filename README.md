# Cosmos Street

A nostalgic skate ride inspired by Wonder Boy’s legendary runs on the Sega Master System.

[> You can try it out here <](https://evilpaper.github.io/cosmos-street/)

> **Warning**
> This game is a work in progress.

## About this project

Cosmos Street is an old-school auto-runner. Inspired by the skateboard sequences in Wonder Boy on the Sega Master System, complete with borrowed sprites. It’s made for fun and as an experiment in pushing the creative limits within the restrictions of classic video game design.

The game runs right in the browser, built with just plain HTML, CSS, and JavaScript, no frameworks, no build tools, nothing fancy. Just simple, direct, classic game development.

## How to play

Jump = Arrow Up

Slow down = Arrow Left

Speed up = Arrow Right

That's it! Good luck!

## Roadmap

- [x] Start screen
- [x] Variation (platform distribution)
- [x] Power ups (air jump) - incl. spawn logic and visual pickup, possession and usage feedback
- [x] Enemy
- [x] Death
- [x] Restart
- [ ] Score
- [ ] Session high score
- [ ] Better start screen (more interesting, show player in the middle maybe, shine effect on title)
- [ ] SFX
- [ ] Music
- [ ] Sound controls (on/off)
- [ ] Increase difficulty over time (harder and harder)
- [ ] Playtest, playtest, playtest and tweaks and tweak and tweak until it's fun, juicy and tight.
- [ ] Optional - Electric sparks around enemy.
- [ ] Optional - Feedback particles. Break, landing, speeding.
- [ ] Optional - Change player x position based on state (break,regular,speeding)
- [ ] Optional - Dynamic, vibrant space background, make it more interesting.
- [ ] Optional - How to play - desktop (keyboard)
- [ ] Optional - How to play - mobile
- [x] favicon (sparkle)
- [ ] itch.io game page. Maybe.
- [ ] Replace .cursor/rules with AGENTS.md in the root (a simple and platform independent alternative)

## Known Issues

- [ ] Player state handling can be better. For example, sometimes when speeding and jumping the speed halt to skating.

## Constraints and Requirements

- Limited palette. Only allowed to use four colors palette. Inspired by the original Game Boy and tweaked for a distinct vintage futuristic look. Can't remember the inspiration source.
- Small screen, 256 x 256 px. Wrapped in a CSS Clip Path to get a round-ish shape. No other reason than it's nice.
- Only use standard HTML, CSS and JavaScript. No dependecies.
- Should have Keyboard and Touch Controls.
- Create as few original assets as possible; reuse existing ones where feasible. Producing art, sound effects, and music is time-consuming. One reason modified sprites from the original Wonder Boy (Sega Master System) are used.

## Development notes

- The CRT effect is created with CSS. More precise CSS Keyframes.
- The game runs an update() loop at a fixed 60 frames per second. The frame rate is not configurable, which means the game logic is entirely frame-rate dependent and does not require handling deltaTime.
- The enemy art for Blip Blip is sourced from the image Mega Man Custom Enemies by calegaea75432, discovered online. Full credit goes to calegaea75432.
- Font used is [Highway Chase / Data East / 1980](https://arcade.itch.io/arcade-game-typography-fonts/devlog/611049/highway-chase-data-east-1980)

## Running Locally

No need to install anything. Just open index.html in your web browser of choice and game along.

If you have cloned the repo you can run it from your shell with the open command, like this:

```sh
open -a "Google Chrome" index.html
```

## License

Licensed under the MIT license.
