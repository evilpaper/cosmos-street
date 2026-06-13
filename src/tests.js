function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(
      `❌ ${message}\n   Expected: ${expected}\n   Got: ${actual}`,
    );
  }
  console.log(`✅ ${message}`);
}

function testScoring() {
  const scoring = createScoring();

  assertEqual(scoring.award("egg"), 1, "first pickup awards 1 point");
  assertEqual(scoring.streakCount, 1, "first pickup sets streak to 1");
  assertEqual(scoring.streakType, "egg", "first pickup sets streak type");

  assertEqual(scoring.award("egg"), 2, "second egg awards 2 points");
  assertEqual(scoring.award("egg"), 3, "third egg awards 3 points");

  let total = 1 + 2 + 3;
  assertEqual(total, 6, "three eggs in a row total 6 points");

  assertEqual(scoring.award("angel"), 1, "switching type resets to 1 point");
  assertEqual(scoring.streakType, "angel", "streak type switches to angel");

  scoring.reset();
  assertEqual(scoring.streakType, null, "reset clears streak type");
  assertEqual(scoring.streakCount, 0, "reset clears streak count");

  const mixed = createScoring();
  assertEqual(mixed.award("egg"), 1, "mixed: first egg is 1");
  assertEqual(mixed.award("egg"), 2, "mixed: second egg is 2");
  assertEqual(mixed.award("angel"), 1, "mixed: angel after eggs is 1");
  assertEqual(mixed.award("egg"), 1, "mixed: egg after angel is 1");
  assertEqual(
    1 + 2 + 1 + 1,
    5,
    "egg, egg, angel, egg totals 5 (plan example variant)",
  );

  const angelEggAngel = createScoring();
  assertEqual(angelEggAngel.award("angel"), 1, "angel-egg-angel: first angel");
  assertEqual(angelEggAngel.award("egg"), 1, "angel-egg-angel: egg");
  assertEqual(angelEggAngel.award("angel"), 1, "angel-egg-angel: second angel");
  assertEqual(1 + 1 + 1, 3, "angel, egg, angel totals 3");

  const capped = createScoring({
    pointsForStreak: (n) => n,
    maxStreak: 3,
  });
  assertEqual(capped.award("egg"), 1, "capped: streak 1");
  assertEqual(capped.award("egg"), 2, "capped: streak 2");
  assertEqual(capped.award("egg"), 3, "capped: streak 3");
  assertEqual(capped.award("egg"), 3, "capped: streak stays at max");
  assertEqual(capped.streakCount, 3, "capped: streak count capped at 3");

  const squared = createScoring({
    pointsForStreak: (n) => n * n,
    maxStreak: Infinity,
  });
  assertEqual(squared.award("egg"), 1, "custom curve: first pickup");
  assertEqual(squared.award("egg"), 4, "custom curve: second pickup");
}

function run() {
  console.log("Running tests...\n");
  testScoring();
  console.log("\nAll tests passed 🎉");
}

run();
