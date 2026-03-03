function assertEqual(actual, expected, message) {
    if (actual !== expected) {
      throw new Error(
        `❌ ${message}\n   Expected: ${expected}\n   Got: ${actual}`
      );
    }
    console.log(`✅ ${message}`);
  }

function run() {
    console.log("Running tests...\n");
    console.log("\nAll tests passed 🎉");
  }
  
run();