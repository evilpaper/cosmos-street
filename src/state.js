function createGame() {
  let state = null;

  return {
    get state() {
      return state;
    },

    setState(newState) {
      if (!newState) {
        return;
      }
      const previousState = state;
      state?.exit?.(this, newState);
      state = newState;
      state.enter?.(this, previousState);
    },

    update() {
      state?.update?.(this);
    },

    draw(screen) {
      state?.draw?.(this, screen);
    },
  };
}
