# Cosmos Street

Grab your board and blast off into a wild ride across the galaxy! There's no telling where the next stretch of road will take you. But watch out! You are not alone.

Seek out the legendary Astro Angels and the rare Cosmic Eggs to turn the tables on your antagonists. The galaxy is your playground, but there's no time to waste!

LACE UP. POWER UP. SKATE TO SURVIVE!

[--> Click here to play <--](https://evilpaper.github.io/cosmos-street/)

## About this project

Cosmos Street is an old-school auto-runner inspired by the skateboard sequences in Wonder Boy, complete with borrowed sprites and reused sound effects. Made purely for fun.

The game runs right in the browser, just plain HTML, CSS, and JavaScript, no frameworks, no build tools, nothing fancy.

## How to play

- Jump = Arrow Up
- Slow down = Arrow Left
- Speed up = Arrow Right
- Sound on/off = S

- Each carried Astro Angel grants you an air jump. Use it wisely.

The game is primarily designed to be played using the left, up, and right arrow keys on a physical keyboard. The movement simply feels better this way. Virtual buttons have been added to make the game playable on touch devices, which is great, since many games aren’t, but the controls aren’t quite as tight as with physical keys.

That's it! Good luck!

## About

Cosmos Street was built around a few simple ideas: work with what exists, embrace limitations, and keep things small.

### Reuse, don't reinvent

Creating art, sound effects, and music takes time. Rather than making everything from scratch, I wanted to see what I could build by piecing together existing assets. The main character uses skateboard sprites from the original Wonder Boy. I love how expressive the art is, and how much personality a handful of animation frames can convey.

### Four colors, no more

The entire game uses a four-color palette, inspired by the original Game Boy and tweaked to give it a distinct, retro-futuristic feel. A small palette is a constraint, but also an opportunity to create a strong visual identity.

### Small screen, big atmosphere

The game runs at just 256 × 256 pixels. No deeper reason, it just looks good.

### No dependencies

Just standard HTML, CSS, and JavaScript. No frameworks, no libraries, no fuss.

### Play your way

Supports both keyboard and touch controls, so you can play on a desktop or a mobile device.

## Architecture notes

The CRT effect is created with CSS. More precise CSS Keyframes.

The game runs an update() loop at a fixed 60 frames per second. The frame rate is not configurable, which means the game logic is entirely frame-rate dependent and does not require handling deltaTime.

An entity that changes behavior over time uses one state machine. That is the pattern for creating or modifying the Player, an Enemy, an Astro Angel, or any new entity that grows a second state. See [One state machine per entity](docs/adr/0001-one-state-machine-per-entity.md).

## Credits

Enemy art is made by [calegaea75432](https://www.deviantart.com/calegaea75432/gallery). Slightly modifed. Orignal name [Relic Telly](https://www.deviantart.com/calegaea75432/art/ye-more-megaman-custom-enemies-168698207).

Music track is [Retro Platforming](https://www.fesliyanstudios.com/royalty-free-music/downloads-c/8-bit-music/6) by [David Fesliyan](https://www.fesliyanstudios.com/). Lovely tune.

Font is modelled after [Highway Chase / Data East / 1980](https://arcade.itch.io/arcade-game-typography-fonts/devlog/611049/highway-chase-data-east-1980) by [Void](https://arcade.itch.io/). Redrawn in Aseprite.

Sound effects, all credits to the original creators and [The Spriters Resource](https://sounds.spriters-resource.com/) for providing. The following sound effects are used.

[Wonder Boy III: The Dragon's Trap](https://sounds.spriters-resource.com/master_system/wonderboyiiithedragonstrap/asset/441223/)

- dragon-breath.wav
- box-get.wav
- enemy-hurt.wav
- fireball.wav
- jump.wav
- select-cursor.wav
- select-wrong.wav

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

## Future Plans

- Let the Astro Angels start chatting and singing together.
- Make enemies shake before they zap off their electricity. Add a shaking state between roaming and zapping.
- Add stuff in the background.
- Refactor collision. Allow player to jump through platforms.

## License

Licensed under the MIT license.
