const enemySpriteSheet = loadOnce("./images/enemy-sprite-sheet.png");

// When electricity is inactive, we roll a dice each frame.
// Tune this constant to control how often bursts happen.
const ELECTRICITY_TRIGGER_CHANCE_PER_FRAME = 0.02;

function createEnemy(x, y) {
  const WIDTH = 16;
  const HEIGHT = 25;
  const TICKS_PER_FRAME = 8;
  const TOTAL_FRAMES = 10;
  const HITBOX_WIDTH = 8;
  const HITBOX_HEIGHT = 16;

  let animationTick = 0;
  let animationFrameIndex = 0;

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
      this.x -= scrollSpeed + 0.5;

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
        // Stop after the electricity animation finishes.
        if (this.electricity.isDone()) {
          electricityActive = false;
        } else {
          this.electricity.update();
        }
      } else if (Math.random() < ELECTRICITY_TRIGGER_CHANCE_PER_FRAME) {
        electricityActive = true;
        sfx(sounds.electrified, 0.3);
        this.electricity.reset();
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

  /**
   * createEnemyElectricity(enemy) closes over that enemy object.
   * On each frame, draw uses target.x / target.y (and width / height for offsets) so the
   * lightning follows the enemy—same idea as createSkateboardSparkle(player) following the player.
   * The factory has to receive the real enemy instance, not a copy of coordinates.
   */

  enemy.electricity = createEnemyElectricity(enemy);

  return enemy;
}
