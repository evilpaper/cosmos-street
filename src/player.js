const player = {
  name: "player",
  image: (() => {
    const img = new Image();
    img.src = "./images/player-sprite-sheet.png";
    return img;
  })(),
  states: ["skating", "airborne", "breaking", "speeding", "obliterating"],
  width: 26,
  height: 36,
  totalFrames: 2, // For skating and speeding states
  ticksPerFrame: 16,
  animationTick: 0,
  animationFrameIndex: 0,
  x: 50,
  y: 125,
  dy: 0,
  state: "skating", // Initial state is "skating" (this.states[0])
  airJumps: 0, // Number of air jumps available (granted by collecting angels)
  isDead: false,

  reset() {
    this.totalFrames = 2;
    this.ticksPerFrame = 16;
    this.animationTick = 0;
    this.animationFrameIndex = 0;
    this.x = 50;
    this.y = 0;
    this.dy = 0;
    this.state = this.states[0];
    this.airJumps = 0;
    this.isDead = false;
  },

  jump() {
    this.dy = -8;
    this.state = this.states[1]; // airborne
    // Consume input to require fresh key press for next jump
    input.up = false;
    sfx(sounds.jump, 0.8);
  },

  speedUp() {
    scrollSpeed = SCROLL_SPEED_SPEEDING;
    this.state = this.states[3];
    this.ticksPerFrame = 8;
  },

  update(tiles, time) {
    // Just a short delay before we introduce the player.
    if (time < 40) {
      return;
    }

    if (this.state === "skating") {
      this.totalFrames = 2;
      this.ticksPerFrame = 16;
      scrollSpeed = SCROLL_SPEED_SKATING;

      if (input.left) {
        this.state = this.states[2]; // skating -> breaking
      } else if (input.up) {
        this.jump();
      } else if (input.right) {
        this.speedUp();
      } else if (this.dy > 1) {
        this.state = this.states[1]; // skating -> airborne. This happens when user fall of a platform.
      }
    }

    if (this.state === "airborne") {
      this.totalFrames = 1;
      // Air jump: use a jump charge if available
      if (input.up && this.airJumps > 0) {
        this.airJumps -= 1;
        this.jump();
      }
    }

    if (this.state === "breaking") {
      this.totalFrames = 1;
      scrollSpeed = SCROLL_SPEED_BREAKING;

      if (!input.left) {
        this.state = this.states[0]; // Only stay in breaking state if left arrow is pressed
      } else if (input.up) {
        this.jump();
      }
    }

    if (this.state === "speeding") {
      this.totalFrames = 2;
      if (!input.right) {
        this.state = this.states[0]; // -> Only stay in speeding state if right arrow is pressed
      } else if (input.left) {
        this.state = this.states[2]; // -> breaking
      } else if (input.up) {
        this.jump();
      }
    }

    if (this.state === "obliterating") {
      this.totalFrames = 6;
      this.ticksPerFrame = 6;
      this.dy = 0;
    }

    // Store previous position BEFORE movement
    // Used to determine collision type (landing vs wall)
    const prevY = this.y;

    this.dy += GRAVITY;
    this.dy += FRICTION;

    // Apply movement (ensure integer coordinates)
    this.y = Math.floor(this.y + this.dy);
    this.x = Math.floor(this.x);

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

        // Update state when landing
        if (scrollSpeed === SCROLL_SPEED_BREAKING) {
          this.state = this.states[2]; // Stay in breaking state
        } else if (scrollSpeed === SCROLL_SPEED_SPEEDING) {
          this.state = this.states[3]; // Stay in speeding state
        } else if (this.state === "obliterating") {
          this.state = this.states[4]; // Stay in obliterating state
        } else {
          this.state = this.states[0]; // Return to skating
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
    const sx = this.animationFrameIndex * 40;
    const sy = 35;

    if (this.state === "skating" || this.state === "speeding") {
      if (this.animationFrameIndex === 0) {
        screen.drawImage(
          this.image,
          0,
          0,
          26,
          35,
          o(this.x),
          o(this.y),
          26,
          35,
        );
      } else {
        screen.drawImage(
          this.image,
          26,
          0,
          26,
          35,
          o(this.x),
          o(this.y),
          26,
          35,
        );
      }
    }

    if (this.state === "airborne" || this.state === "breaking") {
      screen.drawImage(this.image, 52, 0, 26, 35, o(this.x), o(this.y), 26, 35);
    }

    if (this.state === "obliterating") {
      if (!this.isDead) {
        screen.drawImage(
          this.image,
          sx,
          sy,
          40,
          40,
          o(this.x),
          o(this.y),
          40,
          40,
        );
      }
    }

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
