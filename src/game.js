/**
 * Constants
 */

const GRAVITY = 0.05;
const FRICTION = 0.36; // A value between 0 and 1 that determines how much friction slows down the player.
const SCROLL_SPEED_BRAKING = 0.2;
const SCROLL_SPEED_SKATING = 1.8;
const SCROLL_SPEED_SPEEDING = 2.6;
const PLAYTIME_IN_SECONDS = 30;
const PLAYING_TIME = 60 * PLAYTIME_IN_SECONDS; // First number is ticks. Remember, we do 60 times per second

/**
 * Play HUD timing (ticks).
 */
const HINT_BLINK_RANGES = [
  [6, 12],
  [16, 20],
  [24, 30],
];
const START_MESSAGE_START = 24;
const START_MESSAGE_END = 64;
const SCORE_VISIBLE_AFTER = 10;

/**
 * HUD layout (pixels). Banner lines sit around vertical middle.
 */
const BANNER_GAP = 4;
const BANNER_TITLE_Y = SCREEN_HEIGHT / 2 - FONT_HEIGHT - BANNER_GAP;
const BANNER_SUBTITLE_Y = SCREEN_HEIGHT / 2 + BANNER_GAP;
const HUD_START_HINT_Y = 130;
const HUD_SOUND_HINT_Y = 210;
const HUD_SOUND_STATUS_Y = 188;
const HUD_TITLE_HIGH_SCORE_Y = 44;
const HUD_SCORE_PLAY_Y = 12;
const HUD_SCORE_ENDING_Y = 36;
const HUD_END_PROMPT_Y = 186;
const HUD_END_TITLE_PROMPT_Y = 202;

/**
 * TILE_WIDTH AND TILE_HEIGHT are shared between the functions makeTile() and makePlatforms()
 * Therefore defined as global constants.
 * The natural would otherwise be to define them inside the makeTile() and makePlatforms() functions.
 */

const TILE_WIDTH = 16;
const TILE_HEIGHT = 16;

/**
 * Mutables
 */

let paused = false;
let titleShown = false;
let titleTime = 0;
let pendingRunTime = 0;
let stars;
let platforms;
let scrollSpeed = SCROLL_SPEED_SKATING;
let startMessage;
let deadTimer;

const scene = makeScene();
const states = {};

/**
 * General utilities
 */

function inRanges(value, ranges) {
  for (const [start, end] of ranges) {
    if (value > start && value < end) {
      return true;
    }
  }
  return false;
}

function makeStars(amount) {
  const result = [];

  for (let i = 0; i < amount / 2; i++) {
    result.push(makeStar());
  }

  for (let i = 0; i < amount; i++) {
    result.push(makeStar({ small: true }));
  }

  return result;
}

/**
 * Checks for collision between two objects.
 *
 * @param {*} a
 * @param {*} b
 * @returns true if collision has happened, false otherwise.
 *
 * This is AABB (Axis-Aligned Bounding Box) collision. Also known as Rectangle–rectangle overlap test.
 * Detection: compares the distance between centers to the combined half-widths and half-heights to detect overlap.
 */

function checkCollision(a, b) {
  const dx = a.x + a.width / 2 - (b.x + b.width / 2);
  const dy = a.y + a.height / 2 - (b.y + b.height / 2);

  const combinedHalfWidths = (a.width + b.width) / 2;
  const combinedHalfHeights = (a.height + b.height) / 2;

  return (
    Math.abs(dx) < combinedHalfWidths && Math.abs(dy) < combinedHalfHeights
  );
}

/**
 * Returns a random integer between min and max (inclusive).
 */
function randomInRange(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getStartMessage() {
  // Random number between 1 and 10
  const randomNumber = Math.floor(Math.random() * 10) + 1;
  switch (randomNumber) {
    case 1:
      return "Go for pro!";
    case 2:
      return "Happy rolling!";
    case 3:
      return "Cruise!";
    case 4:
      return "Go!";
    case 5:
      return "Good luck!";
    case 6:
      return "Ride on!";
    case 7:
      return "Skate!";
    case 8:
      return "Cruise!";
    case 9:
      return "Charge!";
    case 10:
      return "Action!";
  }
}

/**
 * Use y position of the title to determine if it is the first time starting the game.
 */
function firstTimeStarting() {
  return title.y > 0;
}

/**
 * The theme follows the run's clock. Outside a run it starts from the beginning.
 */
function themePosition() {
  return scene.state.name === "play" ? time / FPS : 0;
}

/**
 * States
 */

states.title = {
  name: "title",
  enter() {
    titleTime = 0;
    title.y = 64;
    resetInput();
    // Platforms only slide in on first load, not when returning to the title.
    platforms.setMode("intro", { slideIn: !titleShown });
    titleShown = true;
  },
  update() {
    titleTime += 1;

    // UI
    title.update();

    platforms.update();

    if (hasAnyDirectionInput()) {
      startGame();
    }
  },
  draw(_, screen) {
    platforms.draw(screen);
    if (highScore > 0) {
      print("High Score " + highScore, "center", HUD_TITLE_HIGH_SCORE_Y);
    }
    title.draw(screen);
    print("press any ←,→,↑ to start", "center", HUD_START_HINT_Y);
    if (isSoundUnavailable()) {
      print("Sound unavailable", "center", HUD_SOUND_STATUS_Y);
    } else if (isSoundOn()) {
      print("Sound ON", "center", HUD_SOUND_STATUS_Y);
    } else {
      print("Sound OFF", "center", HUD_SOUND_STATUS_Y);
    }
    print("press S to toggle sound", "center", HUD_SOUND_HINT_Y);
  },
};

states.play = {
  name: "play",
  enter() {
    resetInput();
    playTheme();
    run = makeRun(PLAYING_TIME, pendingRunTime);
    pendingRunTime = 0;
  },
  update() {
    title.slideOut();

    const frame = run.step();
    if (frame.over) {
      enterGameOverFromPlaying({ playDropSound: frame.fell });
      return;
    }

    if (frame.timeUp) {
      scene.setState(states.ending);
    }
  },
  draw(_, screen) {
    const frame = run.report;
    run.draw(screen);

    if (firstTimeStarting()) {
      title.draw(screen);

      if (inRanges(frame.time, HINT_BLINK_RANGES)) {
        print("press any ←,→,↑ to start", "center", HUD_START_HINT_Y);
        print("press S to toggle sound", "center", HUD_SOUND_HINT_Y);
      }
    }

    if (frame.time > START_MESSAGE_START && frame.time < START_MESSAGE_END) {
      print(startMessage, "center", BANNER_TITLE_Y);
      if (highScore > 0) {
        print("High Score " + highScore, "center", BANNER_SUBTITLE_Y);
      }
    }

    if (frame.time > SCORE_VISIBLE_AFTER) {
      print("" + frame.score, "center", HUD_SCORE_PLAY_Y);
    }
  },
};

states.over = {
  name: "over",
  enter() {
    deadTimer = 0;
  },
  update() {
    deadTimer += 1;

    if (input.left || input.right) {
      restartGame();
      return;
    }

    if (input.up) {
      resetGame();
      return;
    }

    run.step();
  },
  draw(_, screen) {
    const frame = run.report;
    run.draw(screen);

    if (deadTimer > 0) {
      if (frame.highScoreUpdated) {
        print("Game Over", "center", BANNER_TITLE_Y);
        print("New high " + highScore, "center", BANNER_SUBTITLE_Y);
      } else {
        print("Game Over", "center", "middle");
      }

      print("Restart ← or →", "center", HUD_END_PROMPT_Y);
      print("Title screen ↑", "center", HUD_END_TITLE_PROMPT_Y);
    }
  },
};

states.ending = {
  name: "ending",
  enter() {
    resetInput();
    platforms.setMode("ending");
  },
  update() {
    title.slideOut();

    if (run.report.failed) {
      const frame = run.step();
      enterGameOverFromPlaying({ playDropSound: frame.fell });
      return;
    }

    if (run.report.flatTile && run.report.skatedOff) {
      if (input.left || input.right) {
        restartGame();
        return;
      }

      if (input.up) {
        resetGame();
        return;
      }
    }

    run.step();
  },
  draw(_, screen) {
    const frame = run.report;
    run.draw(screen);

    if (frame.flatTile) {
      if (frame.highScoreUpdated) {
        print("You made it!", "center", BANNER_TITLE_Y);
        print("New high " + highScore, "center", BANNER_SUBTITLE_Y);
      } else {
        print("You made it!", "center", "middle");
      }

      if (frame.skatedOff) {
        print("Play again ← or →", "center", HUD_END_PROMPT_Y);
        print("Back to title ↑", "center", HUD_END_TITLE_PROMPT_Y);
      }
    }

    print("" + frame.score, "center", HUD_SCORE_ENDING_Y);
  },
};

/**
 * State transition functions
 */

function startGame() {
  scene.setState(states.play);
}

function resetGame() {
  init();
  scene.setState(states.title);
}

function restartGame() {
  pendingRunTime = 1;
  init();
  scene.setState(states.play);
}

/**
 * Leave play or ending for over (fall off screen or player death).
 * @param {{ playDropSound?: boolean }} [options]
 */
function enterGameOverFromPlaying({ playDropSound = false } = {}) {
  if (playDropSound) {
    sfx(sounds.drop);
  }
  resetInput();
  scrollSpeed = 0;
  scene.setState(states.over);
}

/**
 * Game loop
 *
 * init is called once when the game starts.
 * update and draw are called once per frame.
 *
 * Default frame rate is 60 times per second.
 *
 * The paused flag simple cause an early return in the update function. Effectively freezing the game.
 */

/**
 * -----------------------------
 * Initialize global mutable variables, reset global objects
 * -----------------------------
 * Note: This function resets game objects but does not modify game state.
 * State transitions are handled by startGame() and resetGame() functions.
 */
function init() {
  stars = makeStars(30);
  platforms = makePlatforms(60);
  scrollSpeed = SCROLL_SPEED_SKATING;
  player.reset();
  startMessage = getStartMessage();
  deadTimer = 0;

  if (!scene.state) {
    scene.setState(states.title);
  }
}

/**
 * -----------------------------
 * Update the game state
 * -----------------------------
 */

function update() {
  if (input.soundToggle) {
    toggleSound(themePosition);
    input.soundToggle = false;
  }

  if (input.reset) {
    input.reset = false;
    resetGame();
  }

  syncAudioWithGamePaused(paused);

  if (input.pause) {
    input.pause = false;
    paused = !paused;
  }

  if (paused) {
    return;
  }

  // The stars are ever-present in the background.
  for (const star of stars) {
    star.update();
  }

  scene.update();
}

/**
 * -----------------------------
 * Draw the game state to the screen
 * -----------------------------
 *
 * Screen is 256x256 pixels. But it has a rounded mask applied to it.
 * So in essens the only visible area is about 36-212 pixels.
 */

function draw(screen) {
  // Clear the screen
  screen.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

  for (const star of stars) {
    star.draw(screen);
  }

  scene.draw(screen);
}
