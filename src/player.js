const player = {
  // Constants
  image: (() => {
    const img = new Image();
    img.src = "./images/player-sprite-sheet.png";
    return img;
  })(),
  states: ["skating", "airborne", "breaking", "speeding"],
  width: 26,
  height: 36,

  // Mutables
  ticksToNextFrame: 16,
  tick: 0,
  frame: 0,
  x: 50,
  y: 125,
  dx: 0.6,
  dy: 0,
  state: "skating", // Initial state is "skating" (this.states[0])

  reset() {
    this.tick = 0;
    this.frame = 0;
    this.x = 50;
    this.y = 0;
    this.dy = 0;
    this.dx = 1.2;
    this.state = this.states[0];
  },

  jump() {
    this.dy = -8;
    this.state = this.states[1]; // airborne
  },

  speedUp() {
    this.dx = 2;
    this.state = this.states[3];
    this.ticksToNextFrame = 8;
  },

  update(collidables, time) {
    // Just a short delay before we introduce the player.
    if (time < 20) {
      return;
    }

    if (this.state === "skating") {
      this.ticksToNextFrame = 16;
      this.dx = 1.2;

      if (input.left) {
        this.state = this.states[2]; // skating -> breaking
      }
      if (input.up) {
        this.jump();
      }
      if (input.right) {
        this.speedUp();
      }
      if (this.dy > 1) {
        this.state = this.states[1]; // skating -> airborne. This happens when user fall of a platform.
      }
    }

    if (this.state === "airborne") {
      // Do airborne stuff here...
    }

    if (this.state === "breaking") {
      this.dx = 0.5;

      if (!input.left) {
        this.state = this.states[0]; // Only stay in breaking state if left arrow is pressed
      }
      if (input.up) {
        this.jump();
      }
    }

    if (this.state === "speeding") {
      if (!input.right) {
        this.state = this.states[0]; // -> Only stay in speeding state if right arrow is pressed
      }
      if (input.left) {
        this.state = this.states[2]; // -> breaking
      }
      if (input.up) {
        this.jump();
      }
    }

    this.dy += gravity;
    this.dy += friction;

    // Make sure always an integer
    this.y = Math.floor(this.y + this.dy);
    this.x = Math.floor(this.x);

    // Collision

    // Collect all collisions first
    const collisions = [];

    collidables.forEach((tile) => {
      const collision = checkCollision(this, tile);
      if (collision.collided) {
        collisions.push(collision);
      }
    });

    // Resolve collisions: prioritize Y-axis (ground) when falling
    // This prevents the X-axis bug when landing on platform edges
    let resolvedY = false;
    let resolvedX = false;

    // First pass: resolve Y-axis collisions if falling (dy > 0)
    if (this.dy > 0) {
      for (const collision of collisions) {
        if (!resolvedY && collision.overlapY > 0) {
          // Resolve Y collision (ground)
          if (collision.directionY > 0) {
            this.y += collision.overlapY;
          } else {
            this.y -= collision.overlapY;
          }

          this.dy = 0;

          resolvedY = true;

          // Update state when landing
          if (this.state === this.states[2]) {
            this.state = this.states[2];
          } else {
            this.state = this.states[0];
          }
        }
      }
    }

    // Second pass: resolve X-axis collisions (walls)
    if (!resolvedY) {
      for (const collision of collisions) {
        if (!resolvedX && collision.overlapX > 0) {
          // Resolve X collision (wall)
          if (collision.directionX > 0) {
            this.x += collision.overlapX;
          } else {
            this.x -= collision.overlapX;
          }

          this.dx = 0;

          resolvedX = true;
        }
      }
    }

    // Animation
    this.tick = (this.tick + 1) % this.ticksToNextFrame; // 1, 0, 1, 0 etc...

    if (this.tick === 0) {
      this.frame = this.frame + 1;
      if (this.frame >= 2) {
        this.frame = 0;
      }
    }
  },

  draw(screen) {
    if (this.state === "skating" || this.state === "speeding") {
      if (this.frame === 0) {
        screen.drawImage(
          this.image,
          0,
          0,
          26,
          35,
          o(this.x),
          o(this.y),
          26,
          35
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
          35
        );
      }
    }
    if (this.state === "airborne" || this.state === "breaking") {
      screen.drawImage(
        this.image,
        52,
        0,
        26,
        40,
        o(this.x),
        o(this.y - 3),
        26,
        40
      );
    }

    /**
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
     * Draw a green hitbox around the player. For debugging purposes.
     */
    // screen.lineWidth = 1;
    // screen.strokeStyle = "green";
    // screen.strokeRect(this.x, this.y, this.width, this.height);
  },
};
