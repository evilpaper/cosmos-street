class Player {
  constructor() {
    this.image = new Image();
    this.image.src = "./images/player-sprite-sheet.png";
    this.ticksToNextFrame = 16;
    this.tick = 0;
    this.frame = 0;
    this.width = 26;
    this.height = 36;
    this.x = 50;
    this.y = 125;
    this.dx = 0.6;
    this.dy = 0;
    this.states = ["skating", "airborne", "breaking", "speeding"];
    this.state = this.states[0];
    this.p = this;
  }

  reset() {
    p.tick = 0;
    p.frame = 0;
    p.x = 50;
    p.y = 0;
    p.dy = 0;
    p.dx = 1.2;
    p.state = "skating";
  }

  jump() {
    p.dy = -8;
    p.state = p.states[1]; // airborne
  }

  speedUp() {
    p.dx = 2;
    p.state = p.states[3];
    p.ticksToNextFrame = 8;
  }

  update(collidables, time) {
    if (time < 160) {
      return;
    }

    if (p.state === "skating") {
      p.ticksToNextFrame = 16;
      p.dx = 1.2;

      if (input.left) {
        p.state = p.states[2]; // skating -> breaking
      }
      if (input.up) {
        p.jump();
      }
      if (input.right) {
        p.speedUp();
      }
      if (p.dy > 1) {
        p.state = p.states[1]; // skating -> airborne. This happens when user fall of a platform.
      }
    }

    if (p.state === "airborne") {
      // Do airborne stuff here...
    }

    if (p.state === "breaking") {
      p.dx = 0.5;

      if (!input.left) {
        p.state = p.states[0]; // Only stay in breaking state if left arrow is pressed
      }
      if (input.up) {
        p.jump();
      }
    }

    if (p.state === "speeding") {
      if (!input.right) {
        p.state = p.states[0]; // -> Only stay in speeding state if right arrow is pressed
      }
      if (input.left) {
        p.state = p.states[2]; // -> breaking
      }
      if (input.up) {
        p.jump();
      }
    }

    p.dy += gravity;
    p.dy += friction;

    // Make sure always an integer
    p.y = Math.floor(p.y + p.dy);
    p.x = Math.floor(p.x);

    // Collision

    // Collect all collisions first
    const collisions = [];

    collidables.forEach((tile) => {
      const collision = checkCollision(p, tile);
      if (collision.collided) {
        collisions.push(collision);
      }
    });

    // Resolve collisions: prioritize Y-axis (ground) when falling
    // This prevents the X-axis bug when landing on platform edges
    let resolvedY = false;
    let resolvedX = false;

    // First pass: resolve Y-axis collisions if falling (dy > 0)
    if (p.dy > 0) {
      for (const collision of collisions) {
        if (!resolvedY && collision.overlapY > 0) {
          // Resolve Y collision (ground)
          if (collision.directionY > 0) {
            p.y += collision.overlapY;
          } else {
            p.y -= collision.overlapY;
          }

          p.dy = 0;

          resolvedY = true;

          // Update state when landing
          if (p.state === p.states[2]) {
            p.state = p.states[2];
          } else {
            p.state = p.states[0];
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
            p.x += collision.overlapX;
          } else {
            p.x -= collision.overlapX;
          }

          p.dx = 0;

          resolvedX = true;
        }
      }
    }

    // Animation
    p.tick = (p.tick + 1) % p.ticksToNextFrame; // 1, 0, 1, 0 etc...

    if (p.tick === 0) {
      p.frame = p.frame + 1;
      if (p.frame >= 2) {
        p.frame = 0;
      }
    }
  }

  draw(screen) {
    if (p.state === "skating" || p.state === "speeding") {
      if (p.frame === 0) {
        screen.drawImage(p.image, 0, 0, 26, 35, o(p.x), o(p.y), 26, 35);
      } else {
        screen.drawImage(p.image, 26, 0, 26, 35, o(p.x), o(p.y), 26, 35);
      }
    }
    if (p.state === "airborne" || p.state === "breaking") {
      screen.drawImage(p.image, 52, 0, 26, 40, o(p.x), o(p.y - 3), 26, 40);
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
    // screen.strokeRect(p.x, p.y, p.width, p.height);
  }
}
