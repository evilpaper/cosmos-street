# Cosmos Street

A nostalgic skate ride inspired by Wonder Boy’s legendary runs on the Sega Master System.

[> You can try it out here <](https://evilpaper.github.io/cosmos-street/)

> **Warning**
> This game is a work in progress.

## About this project

Cosmos Street is an old-school auto-runner, heavily inspired by the skateboard sequences from Wonder Boy on the Sega Master System. It is made for fun, and as an experiment in exploring the creative limits of traditional video games.

The game runs right in your browser, built with just plain HTML, CSS, and JavaScript, no frameworks, no build tools, nothing fancy. Just simple, direct, classic game development.

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
- [ ] Use a separate animation for speed up state
- [ ] Scroll stars according to player speed
- [ ] Implement better collision
- [ ] Enemies (ufo's)
- [ ] Power ups (apples, bananas etc.) Give air jump.
- [ ] How to play - desktop (keyboard)
- [ ] How to play - mobile

## Known Issues

A list of things not working right now:

- [ ] Player sometimes move forward even though she always should stay in place. Will be fixed with a better collision detection.

## Running Locally

No need to install anything. Just open index.html in your web browser of choice and game along.

If you have cloned the repo you can run it from your shell with the open command, something like this:

```sh
open -a "Google Chrome" index.html
```

## License

Licensed under the MIT license.
