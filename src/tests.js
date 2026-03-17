function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(
      `❌ ${message}\n   Expected: ${expected}\n   Got: ${actual}`,
    );
  }
  console.log(`✅ ${message}`);
}

function run() {
  console.log("Running tests...\n");

  assertEqual(1, 1, "1 should be equal to 1");

  console.log("\nAll tests passed 🎉");
}

run();
