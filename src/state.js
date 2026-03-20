function createGame() {
  let state = null;

  return {
    setState(newState) {
      if (state?.exit) state.exit(this);
      state = newState;
      state.enter?.(this);
    },

    update() {
      state?.update?.(this);
    },

    render(ctx) {
      state?.render?.(this, ctx);
    },

    handleInput(event) {
      state?.handleInput?.(this, event);
    },
  };
}

const game = createGame();
console.log("Game is created");
game.setState(GAME_STATE.INSERT_COIN);
console.log("Game state is set to INSERT_COIN");
game.update();
console.log("Game is updated");
game.render(screen);
console.log("Game is rendered");
game.handleInput(event);
console.log("Game is handled");
