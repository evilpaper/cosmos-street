/**
 * One table for the Player. enter runs on the transition;
 * update runs on the next update() call.
 */
function changePlayerState(player, next) {
  if (player.state === next) {
    return;
  }
  playerStates[player.state]?.exit?.(player);
  player.state = next;
  playerStates[next].enter?.(player);
}

function holdSkating(player) {
  player.totalFrames = 2;
  player.ticksPerFrame = 16;
  player.ground = "skating";
  scrollSpeed = SCROLL_SPEED_SKATING;
}

function holdBreaking(player) {
  player.totalFrames = 1;
  player.ground = "breaking";
  scrollSpeed = SCROLL_SPEED_BREAKING;
}

function holdSpeeding(player) {
  player.totalFrames = 2;
  player.ticksPerFrame = 8;
  player.ground = "speeding";
  scrollSpeed = SCROLL_SPEED_SPEEDING;
}

function holdObliterating(player) {
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
    enter: holdSkating,
    update(player) {
      holdSkating(player);
      if (input.left) {
        return changePlayerState(player, "breaking");
      }
      if (input.up) {
        return player.jump(player.jumpStrength);
      }
      if (input.right) {
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
    },
    update(player) {
      player.totalFrames = 1;
      if (input.upJustPressed) {
        player.tryAirJump();
      }
    },
    draw: drawCrouched,
  },

  breaking: {
    enter: holdBreaking,
    update(player) {
      holdBreaking(player);
      if (!input.left) {
        return changePlayerState(player, "skating");
      }
      if (input.up) {
        return player.jump(player.jumpStrengthBreaking);
      }
    },
    draw: drawCrouched,
  },

  speeding: {
    enter: holdSpeeding,
    update(player) {
      holdSpeeding(player);
      if (!input.right) {
        return changePlayerState(player, "skating");
      }
      if (input.left) {
        return changePlayerState(player, "breaking");
      }
      if (input.up) {
        return player.jump(player.jumpStrengthSpeeding);
      }
    },
    draw: drawSkating,
  },

  obliterating: {
    enter: holdObliterating,
    update: holdObliterating,
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
  jumpStrengthBreaking: 7.6,
  jumpStrengthSpeeding: 7.8,
  state: "skating",
  ground: "skating",
  isDead: false,

  reset() {
    this.animationTick = 0;
    this.animationFrameIndex = 0;
    this.x = 50;
    this.y = 0 - this.height; // Out of screen, please
    this.dy = 0;
    this.dx = 0;
    this.isDead = false;
    this.state = "skating";
    playerStates.skating.enter(this);
  },

  jump(jumpStrength) {
    this.dy = -jumpStrength;
    // Consume input to require fresh key press for next jump
    input.up = false;
    input.upJustPressed = false;
    sfx(sounds.jump, 0.8);
    changePlayerState(this, "jumping");
  },

  tryAirJump() {
    if (!input.upJustPressed) {
      return;
    }
    input.upJustPressed = false;
    if (run?.spendAirJump()) {
      this.jump(this.jumpStrength);
    }
  },

  obliterate() {
    changePlayerState(this, "obliterating");
  },

  update(tiles, time) {
    // Just a short delay before we introduce the player.
    if (time < 40) {
      return;
    }

    playerStates[this.state].update(this);

    // Store previous position BEFORE movement
    // Used to determine collision type (landing vs wall)
    const prevY = this.y;

    this.dy += GRAVITY;
    this.dy += FRICTION;

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
