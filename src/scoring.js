const SCORING = {
  pointsForStreak: (n) => n,
  maxStreak: 3,
};

function createScoring(config = SCORING) {
  let streakType = null;
  let streakCount = 0;

  return {
    get streakType() {
      return streakType;
    },
    get streakCount() {
      return streakCount;
    },
    award(type) {
      if (streakType === type) {
        streakCount = Math.min(streakCount + 1, config.maxStreak);
      } else {
        streakType = type;
        streakCount = 1;
      }

      return config.pointsForStreak(streakCount);
    },
    reset() {
      streakType = null;
      streakCount = 0;
    },
  };
}
