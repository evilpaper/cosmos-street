const enemySpriteSheet = loadOnce("./images/enemy-sprite-sheet.png");

// Cooldowns must fit within typical on-screen lifetime (~130 frames at 60fps: enemy crosses the screen).
const ELECTRICITY_COOLDOWN_TICKS_MIN = 16;
const ELECTRICITY_COOLDOWN_TICKS_MAX = 72;
const ELECTRICITY_BURST_TICKS_MIN = 36;
const ELECTRICITY_BURST_TICKS_MAX = 72;
const ELECTRICITY_BURST_CHANCE = 0.8;

function randomElectricityCooldown() {
  return (
    Math.floor(
      Math.random() *
        (ELECTRICITY_COOLDOWN_TICKS_MAX - ELECTRICITY_COOLDOWN_TICKS_MIN + 1),
    ) + ELECTRICITY_COOLDOWN_TICKS_MIN
  );
}

function randomElectricityBurst() {
  return (
    Math.floor(
      Math.random() *
        (ELECTRICITY_BURST_TICKS_MAX - ELECTRICITY_BURST_TICKS_MIN + 1),
    ) + ELECTRICITY_BURST_TICKS_MIN
  );
}

function createEnemy(x, y) {
  const WIDTH = 16;
  const HEIGHT = 25;
  const TICKS_PER_FRAME = 8;
  const TOTAL_FRAMES = 10;
  const HITBOX_WIDTH = 8;
  const HITBOX_HEIGHT = 16;

  let animationTick = 0;
  let animationFrameIndex = 0;

  let electricityCooldown = randomElectricityCooldown();
  let electricityBurstRemaining = 0;
  let electricityActive = false;

  const enemy = {
    x: x,
    y: y,
    width: WIDTH,
    height: HEIGHT,

    getHitbox() {
      return {
        x: this.x + (WIDTH - HITBOX_WIDTH) / 2,
        y: this.y + (HEIGHT - HITBOX_HEIGHT) / 2,
        width: HITBOX_WIDTH,
        height: HITBOX_HEIGHT,
      };
    },

    update() {
      this.x -= scrollSpeed + 0.6;

      // Advance animation tick
      animationTick += 1;

      // Advance frame when tick threshold reached
      if (animationTick >= TICKS_PER_FRAME) {
        animationTick = 0;
        animationFrameIndex += 1;

        // Loop animation
        if (animationFrameIndex >= TOTAL_FRAMES) {
          animationFrameIndex = 0;
        }
      }

      if (electricityActive) {
        this.electricity.update();
        electricityBurstRemaining -= 1;
        if (electricityBurstRemaining <= 0) {
          electricityActive = false;
          electricityCooldown = randomElectricityCooldown();
        }
      } else {
        electricityCooldown -= 1;
        if (electricityCooldown <= 0) {
          if (Math.random() < ELECTRICITY_BURST_CHANCE) {
            electricityActive = true;
            electricityBurstRemaining = randomElectricityBurst();
          } else {
            electricityCooldown = randomElectricityCooldown();
          }
        }
      }
    },

    draw(screen) {
      const spriteFrameX = animationFrameIndex * WIDTH;
      const spriteFrameY = 0;

      const drawX = Math.round(this.x);
      const drawY = Math.round(this.y);

      /**
       * Draw enemy hitbox. For debugging purposes.
       */
      // screen.lineWidth = 1;
      // screen.strokeStyle = "magenta";
      // screen.strokeRect(this.getHitbox().x, this.getHitbox().y, this.getHitbox().width, this.getHitbox().height);

      screen.drawImage(
        enemySpriteSheet,
        spriteFrameX,
        spriteFrameY,
        WIDTH,
        HEIGHT,
        drawX,
        drawY,
        WIDTH,
        HEIGHT,
      );

      if (electricityActive) {
        this.electricity.draw(screen);
      }
    },
  };

  enemy.electricity = createEnemyElectricity(enemy);

  return enemy;
}
