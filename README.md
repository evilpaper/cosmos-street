# Cosmos Street

A nostalgic skate ride inspired by Wonder Boy’s legendary runs on the Sega Master System.

[> You can try it out here <](https://evilpaper.github.io/cosmos-street/)

> **Warning**
> This game is a work in progress.

## About this project

Cosmos Street is an old-school auto-runner, heavily inspired by the skateboard sequences from Wonder Boy on the Sega Master System. It is made for fun, and as an experiment in exploring the creative limits of traditional video games.

The game runs right in your browser, built with just plain HTML, CSS, and JavaScript, no frameworks, no build tools, nothing fancy. Just simple, direct, classic game development.

The game uses a limited palette of four colors, inspired by the original Game Boy.
The game use a CRT effect created with CSS.
The game runs an update() loop at a fixed 60 frames per second. The frame rate is not configurable, which means the game logic is entirely frame-rate dependent and does not require handling deltaTime.

## How to play

Jump = Arrow Up
Slow down = Arrow Left
Speed up = Arrow Right

The game restart automatically when the player fall off the screen.

That's it!

## Features

- CSS Clip Path to get the shape of the screen
- CRT/Scanline effect with CSS Keyframes
- Mini traditional video Game Engine with Update and Draw methods

## Roadmap

- [x] Start screen
- [ ] Ending
- [ ] Restart
- [ ] SFX
- [ ] Music
- [x] Touch controls
- [ ] Score
- [ ] Session high score
- [x] Speed up
- [x] Use a separate animation for speed up state
- [x] Scroll stars according to player speed
- [ ] Implement better collision
- [ ] Enemies (ufo's)
- [ ] Power ups (apples, bananas etc.) Give air jump.
- [ ] How to play - desktop (keyboard)
- [ ] How to play - mobile

## Known Issues

## Running Locally

No need to install anything. Just open index.html in your web browser of choice and game along.

If you have cloned the repo you can run it from your shell with the open command, something like this:

```sh
open -a "Google Chrome" index.html
```

## License

Licensed under the MIT license.
