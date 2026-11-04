/**
 * exit and enter run once, at this switch: clear the old state, prepare the new one.
 * The new state's update starts on the next update() call, then every frame it stays there.
 */
function changePlayerState(player, next) {
  if (player.state === next) {
    return;
  }
  playerStates[player.state]?.exit?.(player);
  player.state = next;
  playerStates[next].enter?.(player);
}

function setSkating(player) {
  player.totalFrames = 2;
  player.ticksPerFrame = 16;
  player.ground = "skating";
  scrollSpeed = SCROLL_SPEED_SKATING;
}

function setBraking(player) {
  player.totalFrames = 1;
  player.ground = "braking";
  scrollSpeed = SCROLL_SPEED_BRAKING;
}

function setSpeeding(player) {
  player.totalFrames = 2;
  player.ticksPerFrame = 8;
  player.ground = "speeding";
  scrollSpeed = SCROLL_SPEED_SPEEDING;
}

function setObliterating(player) {
  player.totalFrames = 6;
  player.ticksPerFrame = 6;
  player.dy = 0;
  scrollSpeed = 0;
}

function drawSkating(player, screen) {
  if (player.animationFrameIndex === 0) {
    screen.drawImage(
      player.image,
      0,
      0,
      26,
      35,
      o(player.x),
      o(player.y),
      26,
      35,
    );
  } else {
    screen.drawImage(
      player.image,
      26,
      0,
      26,
      35,
      o(player.x),
      o(player.y),
      26,
      35,
    );
  }
}

function drawCrouched(player, screen) {
  screen.drawImage(
    player.image,
    52,
    0,
    26,
    35,
    o(player.x),
    o(player.y),
    26,
    35,
  );
}

function drawObliterating(player, screen) {
  if (player.isDead) {
    return;
  }
  screen.drawImage(
    player.image,
    player.animationFrameIndex * 40,
    35,
    40,
    40,
    o(player.x),
    o(player.y),
    40,
    40,
  );
}

const playerStates = {
  skating: {
    enter: setSkating,
    update(player) {
      setSkating(player);
      if (btn(BUTTONS.LEFT)) {
        return changePlayerState(player, "braking");
      }
      if (btn(BUTTONS.UP)) {
        return player.jump(player.jumpStrength);
      }
      if (btn(BUTTONS.RIGHT)) {
        return changePlayerState(player, "speeding");
      }
      if (player.dy > 1) {
        return changePlayerState(player, "jumping");
      }
    },
    draw: drawSkating,
  },

  jumping: {
    enter(player) {
      player.totalFrames = 1;
      // A LEFT still held from braking must be released before the jetpack fires.
      player.jetpackLocked = btn(BUTTONS.LEFT);
      player.jetpackTicks = 0;
    },
    update(player) {
      player.totalFrames = 1;
      if (btnp(BUTTONS.UP)) {
        player.tryAirJump();
      }
      player.updateJetpack();
    },
    draw: drawCrouched,
  },

  braking: {
    enter: setBraking,
    update(player) {
      setBraking(player);
      if (!btn(BUTTONS.LEFT)) {
        return changePlayerState(player, "skating");
      }
      if (btn(BUTTONS.UP)) {
        return player.jump(player.jumpStrengthBraking);
      }
    },
    draw: drawCrouched,
  },

  speeding: {
    enter: setSpeeding,
    update(player) {
      setSpeeding(player);
      if (!btn(BUTTONS.RIGHT)) {
        return changePlayerState(player, "skating");
      }
      if (btn(BUTTONS.LEFT)) {
        return changePlayerState(player, "braking");
      }
      if (btn(BUTTONS.UP)) {
        return player.jump(player.jumpStrengthSpeeding);
      }
    },
    draw: drawSkating,
  },

  obliterating: {
    enter: setObliterating,
    update: setObliterating,
    draw: drawObliterating,
  },
};

const player = {
  name: "player",
  image: (() => {
    const img = new Image();
    img.src = "./images/player-sprite-sheet.png";
    return img;
  })(),
  width: 26,
  height: 36,
  totalFrames: 2, // For skating and speeding states
  ticksPerFrame: 16,
  animationTick: 0,
  animationFrameIndex: 0,
  x: 50,
  y: 125,
  dy: 0,
  dx: 0,

  jumpStrength: 7.6,
  jumpStrengthBraking: 7.6,
  jumpStrengthSpeeding: 7.8,
  state: "skating",
  ground: "skating",
  isDead: false,
  jetpackLocked: false,
  jetpackTicks: 0,
  jetpackThrust: 0,

  reset() {
    this.animationTick = 0;
    this.animationFrameIndex = 0;
    this.x = 50;
    this.y = 0 - this.height; // Out of screen, please
    this.dy = 0;
    this.dx = 0;
    this.isDead = false;
    this.jetpackLocked = false;
    this.jetpackTicks = 0;
    this.jetpackThrust = 0;
    this.plume = makePlume();
    this.state = "skating";
    playerStates.skating.enter(this);
  },

  jump(jumpStrength) {
    this.dy = -jumpStrength;
    this.jetpackTicks = 0;
    sfx(sounds.jump, 0.8);
    changePlayerState(this, "jumping");
  },

  tryAirJump() {
    if (run?.spendAirJump()) {
      this.jump(this.jumpStrength);
    }
  },

  /**
   * Sets this frame's jetpack thrust. Holding LEFT while falling slows the fall,
   * more the longer it is held. Releasing LEFT resets the build-up.
   */
  updateJetpack() {
    if (!btn(BUTTONS.LEFT)) {
      this.jetpackLocked = false;
      this.jetpackTicks = 0;
      return;
    }
    if (this.jetpackLocked || this.dy < 0) {
      return;
    }
    this.jetpackThrust = Math.min(
      JETPACK_THRUST_START + this.jetpackTicks * JETPACK_THRUST_RAMP,
      JETPACK_THRUST_MAX,
    );
    this.jetpackTicks += 1;
  },

  obliterate() {
    changePlayerState(this, "obliterating");
  },

  update(tiles, time) {
    // Just a short delay before we introduce the player.
    if (time < 40) {
      return;
    }

    this.jetpackThrust = 0;
    playerStates[this.state].update(this);

    // Store previous position BEFORE movement
    // Used to determine collision type (landing vs wall)
    const prevY = this.y;

    this.dy += GRAVITY;
    this.dy += FRICTION;

    if (this.jetpackThrust > 0) {
      // The jetpack only slows a fall: it never lifts the player or stops the fall.
      const floor = Math.min(this.dy, JETPACK_MIN_FALL_SPEED);
      this.dy = Math.max(this.dy - this.jetpackThrust, floor);
    }

    // Apply movement (ensure integer coordinates)
    this.y = Math.floor(this.y + this.dy);
    this.x = Math.floor(this.x) + this.dx;

    // Platform collision detection
    const overlappingTiles = [];

    tiles.forEach((tile) => {
      if (checkCollision(this, tile)) {
        overlappingTiles.push(tile);
      }
    });

    // Collision resolution using previous position
    // This determines collision type based on WHERE the player came from, not overlap geometry
    let landed = false;

    for (const tile of overlappingTiles) {
      // Was the player's bottom edge above the tile's top edge BEFORE this frame?
      // +1 tolerance for rounding/edge cases
      const wasAboveTile = prevY + this.height <= tile.y + 1;

      if (wasAboveTile && this.dy >= 0) {
        // Player came from above → landing
        this.y = tile.y - this.height;
        this.dy = 0;
        landed = true;

        if (this.state !== "obliterating") {
          changePlayerState(this, this.ground);
        }
      } else if (!landed) {
        // Player came from the side → wall collision
        // Push player backward (to the left of the tile)
        this.x = tile.x - this.width;
      }
    }

    this.plume.update(this.jetpackThrust > 0);

    // Advance animation tick
    this.animationTick += 1;

    // Advance frame when tick threshold reached
    if (this.animationTick >= this.ticksPerFrame) {
      this.animationTick = 0;
      this.animationFrameIndex += 1;

      // Loop animation
      if (this.animationFrameIndex >= this.totalFrames) {
        if (this.state === "obliterating") {
          this.isDead = true;
        } else {
          this.animationFrameIndex = 0;
        }
      }
    }
  },

  draw(screen) {
    this.plume.draw(
      screen,
      this.x + (this.width - this.plume.width + 2) / 2,
      this.y + this.height,
    );
    playerStates[this.state].draw(this, screen);

    /**
     *
     * Draw a green line from the player to the ground. For debugging purposes.
     */
    // screen.lineWidth = 1;
    // screen.strokeStyle = "green";
    // screen.beginPath();
    // screen.moveTo(50, 0);
    // screen.lineTo(50, 256);
    // screen.stroke();
    // screen.closePath();

    /**
     * Draw player hitbox. For debugging purposes.
     */
    // screen.lineWidth = 1;
    // screen.strokeStyle = "green";
    // screen.strokeRect(this.x, this.y, this.width, this.height);
  },
};
