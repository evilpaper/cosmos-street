class Player {
  constructor() {
    this.image = new Image();
    this.image.src = "./images/player-sprite-sheet.png";
    this.ticksToNextFrame = 16;
    this.tick = 0;
    this.frame = 0;
    this.width = 26;
    this.height = 35;
    this.x = 50;
    this.y = 125;
    this.dy = 0;
    this.speed = 0.6;
    this.states = ["skating", "airborne", "breaking"];
    this.state = this.states[0];
    this.p = this;
  }

  reset() {
    p.tick = 0;
    p.frame = 0;
    p.x = 50;
    p.y = 0;
    p.dy = 0;
    p.speed = 0.6;
    p.state = "skating";
  }

  update(collidables) {
    if (p.state === "skating") {
      p.speed = 1.4;

      if (input.left) {
        p.state = p.states[2]; // skating -> breaking
      }
      if (input.up) {
        p.dy = -8;
        p.state = p.states[1]; // skating -> airborne
      }
      if (p.dy > 1) {
        p.state = p.states[1]; // skating -> airborne
      }
    }

    if (p.state === "airborne") {
      // Do airborne stuff here...
    }

    if (p.state === "breaking") {
      p.speed = 0.5;
      if (!input.left) {
        p.state = p.states[0];
      }
      if (input.up) {
        p.dy = -8;
        p.state = p.states[1];
      }
    }

    p.dy += gravity;
    p.dy += friction;

    // Make sure always an integer
    p.y = Math.floor(p.y + p.dy);
    p.x = Math.floor(p.x);

    collidables.forEach((block) => {
      checkCollision(p, block);
    });

    // Animation
    p.tick = (p.tick + 1) % p.ticksToNextFrame; // 1, 0, 1, 0 etc...

    if (p.tick === 0) {
      p.frame = p.frame + 1;
      if (p.frame >= 2) {
        p.frame = 0;
      }
    }

    // Make sure always an integer
    p.x = Math.floor(p.x);
    p.y = Math.floor(p.y);
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
