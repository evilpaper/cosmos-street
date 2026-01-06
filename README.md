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

The game restart automatically when the player fall off the screen.

That's it!

## Some features

- CSS Clip Path to get the shape of the screen
- CRT/Scanline effect with CSS Keyframes
- Keyboard and touch controls

## Roadmap

- [x] Start screen
- [x] Variation (platform distribution)
- [x] Power ups (air jump) - incl. spawn logic and visual pickup, possession and usage feedback
- [ ] Change player x position based on state (break,regular,speeding)
- [ ] Feedback particles. Break, landing, speeding.
- [ ] Enemies
- [ ] Death
- [ ] Score
- [ ] Session high score
- [ ] Ending
- [ ] Better start screen (more interesting, show player in the middle maybe, shine effect on title)
- [ ] Restart
- [ ] SFX
- [ ] Music
- [ ] Sound controls
- [ ] Increased difficulty (harder and harder)
- [ ] Dynamic, vibrant space background, make it more interesting.
- [ ] How to play - desktop (keyboard)
- [ ] How to play - mobile
- [x] favicon (sparkle)
- [ ] itch.io game page. Maybe.

## Known Issues

- [ ] Player state handling can be better. For example, sometimes when speeding and jumping the speed halt to skating.

## Under the Hood

The game uses a limited palette of four colors. Inspired by the original Game Boy and tweak for a distinct look.
The game use a CRT effect created with CSS.
The game runs an update() loop at a fixed 60 frames per second. The frame rate is not configurable, which means the game logic is entirely frame-rate dependent and does not require handling deltaTime.

Font used is [Highway Chase / Data East / 1980](https://arcade.itch.io/arcade-game-typography-fonts/devlog/611049/highway-chase-data-east-1980)

## Running Locally

No need to install anything. Just open index.html in your web browser of choice and game along.

If you have cloned the repo you can run it from your shell with the open command, something like this:

```sh
open -a "Google Chrome" index.html
```

## License

Licensed under the MIT license.
