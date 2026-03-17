/**
 * Game state: State Pattern (Nystrom-style) for main scenes.
 * Factory functions + composition, no classes.
 * States: INSERT_COIN, PRESS_START, PLAYING, GAME_OVER.
 */

/**
 * Returns a state machine that delegates update/draw to the current state.
 * On transition: onExit(ctx, nextName), set current, onEnter(ctx, fromName).
 *
 * @param {Record<string, { name: string, update: (ctx) => string|void, draw: (ctx, screen) => void, onEnter?: (ctx, fromName?) => void, onExit?: (ctx, nextName?) => void }>} states - name -> state object
 * @param {string} initialStateName
 * @param {object} ctx - context passed to every state method (refs to globals / game objects)
 * @returns {{ update(): void, draw(screen: CanvasRenderingContext2D): void, setState(name: string): void, getStateName(): string }}
 */
function createGameStateMachine(states, initialStateName, ctx) {
  let current = states[initialStateName];
  if (!current) throw new Error("Unknown initial state: " + initialStateName);

  function setState(name) {
    const next = states[name];
    if (!next) return;
    if (current.onExit) current.onExit(ctx, name);
    const fromName = current.name;
    current = next;
    if (current.onEnter) current.onEnter(ctx, fromName);
  }

  return {
    update() {
      const next = current.update(ctx);
      if (next && next !== current.name) setState(next);
    },

    draw(screen) {
      current.draw(ctx, screen);
    },

    setState,
    getStateName() {
      return current ? current.name : null;
    },
  };
}

/**
 * Composes multiple behavior objects into a single state.
 * update: runs each behavior's update in order; returns first non-undefined return value (for transition).
 * draw: runs each behavior's draw in order.
 *
 * @param {string} name - state name
 * @param {Array<{ update?: (ctx) => string|void, draw?: (ctx, screen) => void }>} behaviors
 * @returns {{ name: string, update(ctx): string|void, draw(ctx, screen): void }}
 */
function composeBehaviors(name, behaviors) {
  return {
    name,
    update(ctx) {
      for (const b of behaviors) {
        if (!b.update) continue;
        const next = b.update(ctx);
        if (next !== undefined) return next;
      }
    },
    draw(ctx, screen) {
      for (const b of behaviors) {
        if (b.draw) b.draw(ctx, screen);
      }
    },
  };
}

/**
 * INSERT_COIN: wait for interaction (e.g. to unlock audio), then transition to PRESS_START.
 */
function createInsertCoinState() {
  return {
    name: "INSERT_COIN",
    update(ctx) {
      ctx.time += 1;
      ctx.title.flash();
      if (ctx.input.left || ctx.input.right || ctx.input.up)
        return "PRESS_START";
    },
    draw(ctx, screen) {
      ctx.title.draw(screen);
      ctx.print("Press ←,→ or ↑", "center", 144);
      ctx.print("key to play", "center", 160);
    },
  };
}

/**
 * PRESS_START: title screen; key -> PLAYING.
 */
function createPressStartState() {
  return {
    name: "PRESS_START",
    onEnter(ctx, fromName) {
      ctx.time = 0;
      if (fromName === "INSERT_COIN") {
        ctx.title.y = 64;
        ctx.resetInput();
        ctx.unlockAudio();
      } else if (fromName === "GAME_OVER") {
        ctx.title.y = 64;
        ctx.resetInput();
        ctx.highScoreUpdated = false;
        ctx.init();
      }
    },
    update(ctx) {
      ctx.time += 1;
      ctx.title.flash();
      if (ctx.input.left || ctx.input.right || ctx.input.up) return "PLAYING";
    },
    draw(ctx, screen) {
      ctx.platforms.draw(screen);
      ctx.title.draw(screen);
      ctx.print("←,→,↑ to start", "center", 186);
      ctx.print("S to toggle sound", "center", 202);
    },
  };
}

/**
 * PLAYING: main game loop; death -> GAME_OVER.
 */
function createPlayingState() {
  const behaviors = [
    {
      update(ctx) {
        if (ctx.player.y > 500) {
          ctx.sfx(ctx.sounds.drop);
          return "GAME_OVER";
        }
        if (ctx.player.isDead) return "GAME_OVER";
      },
    },
    {
      update(ctx) {
        ctx.time += 1;
        ctx.title.slideOut();
        ctx.player.update(ctx.platforms.tiles, ctx.time);
        ctx.platforms.update();

        ctx.angel.update();
        if (ctx.angel.active && ctx.angel.x + ctx.angel.width < 0) {
          ctx.scoreIncrement = 1;
          ctx.angel.respawn(ctx.platforms.tiles);
        }

        if (
          ctx.angel.active &&
          ctx.checkCollision(ctx.player, ctx.angel.getHitbox())
        ) {
          ctx.sparkles.push(ctx.createSparkle(ctx.angel.x, ctx.angel.y - 8));
          ctx.player.airJumps += 1;
          ctx.angel.respawn(ctx.platforms.tiles);
          ctx.score += ctx.scoreIncrement;
          ctx.scoreIncrement += 1;
          ctx.sfx(ctx.sounds.angel);
          if (ctx.score > ctx.highScore) {
            ctx.highScore = ctx.score;
            ctx.highScoreUpdated = true;
          }
        }

        const enemies = ctx.enemies;
        for (const enemy of enemies) {
          enemy.update();
          if (ctx.checkCollision(ctx.player, enemy.getHitbox())) {
            if (ctx.player.state !== "obliterating") ctx.sfx(ctx.sounds.crash);
            ctx.player.state = "obliterating";
            ctx.scrollSpeed = 0;
            ctx.player.dy = 0;
          }
          if (enemy.x + enemy.width < 0) {
            enemies.splice(enemies.indexOf(enemy), 1);
            enemies.push(
              ctx.createEnemy(
                ctx.SCREEN_WIDTH + 12,
                Math.floor(Math.random() * (164 - 48 + 1)) + 48,
              ),
            );
          }
        }

        for (const sparkle of ctx.sparkles) sparkle.update();
        ctx.sparkles = ctx.sparkles.filter((s) => !s.isDone());

        if (ctx.player.airJumps > 0) ctx.skateboardSparkle.update();
      },
    },
  ];

  return {
    name: "PLAYING",
    onEnter(ctx, fromName) {
      ctx.resetInput();
      if (fromName === "PRESS_START") {
        ctx.time = 0;
      } else if (fromName === "GAME_OVER") {
        ctx.time = 1;
        ctx.init();
      }
      if (ctx.songs.theme) ctx.music(ctx.songs.theme, 0.5);
    },
    update(ctx) {
      for (const b of behaviors) {
        const next = b.update(ctx);
        if (next !== undefined) return next;
      }
    },
    draw(ctx, screen) {
      ctx.platforms.draw(screen);
      if (ctx.firstTimeStarting()) {
        ctx.title.draw(screen);
        if (
          (ctx.time > 6 && ctx.time < 12) ||
          (ctx.time > 16 && ctx.time < 20) ||
          (ctx.time > 24 && ctx.time < 30)
        ) {
          ctx.print("←,→,↑ to start", "center", 186);
          ctx.print("S to toggle sound", "center", 202);
        }
      }
      for (const enemy of ctx.enemies) enemy.draw(screen);
      for (const sparkle of ctx.sparkles) sparkle.draw(screen);
      ctx.player.draw(screen);
      ctx.angel.draw(screen);
      if (ctx.player.airJumps > 0) ctx.skateboardSparkle.draw(screen);
      if (ctx.time > 24 && ctx.time < 64) {
        ctx.print(ctx.startMessage, "center", 128 - 4 - 8);
        if (ctx.highScore > 0)
          ctx.print("High Score " + ctx.highScore, "center", 128 + 4);
      }
      if (ctx.time > 60) ctx.print("" + ctx.score, "center", 36);
    },
  };
}

/**
 * GAME_OVER: restart (-> PLAYING) or reset (-> PRESS_START).
 */
function createGameOverState() {
  return {
    name: "GAME_OVER",
    onEnter(ctx) {
      ctx.resetInput();
      ctx.scrollSpeed = 0;
    },
    update(ctx) {
      ctx.time += 1;
      ctx.scrollSpeed = 0;
      ctx.deadTimer += 1;

      if (ctx.input.left || ctx.input.right) return "PLAYING";
      if (ctx.input.up) return "PRESS_START";

      ctx.player.update(ctx.platforms.tiles, ctx.time);
      ctx.platforms.update();
      ctx.angel.update();
      for (const enemy of ctx.enemies) enemy.update();
      for (const sparkle of ctx.sparkles) sparkle.update();
      ctx.sparkles = ctx.sparkles.filter((s) => !s.isDone());
      if (ctx.player.airJumps > 0) ctx.skateboardSparkle.update();
    },
    draw(ctx, screen) {
      ctx.platforms.draw(screen);
      for (const enemy of ctx.enemies) enemy.draw(screen);
      for (const sparkle of ctx.sparkles) sparkle.draw(screen);
      ctx.player.draw(screen);
      ctx.angel.draw(screen);
      if (ctx.deadTimer > 0) {
        if (ctx.highScoreUpdated) {
          ctx.print("Game Over", "center", 128 - 4 - 8);
          ctx.print("New high " + ctx.highScore, "center", 128 + 4);
        } else {
          ctx.print("Game Over", "center", "middle");
        }
        ctx.print("Restart ← or →", "center", 186);
        ctx.print("Title screen ↑", "center", 202);
      }
    },
  };
}
