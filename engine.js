// Bootstrapping the loop
function start() {
  const canvas = document.querySelector("canvas");
  const ctx = canvas.getContext("2d");

  if (init) {
    init();
  }

  const fps = 60;
  const frameDuration = 1000 / fps;

  function loop() {
    if (update && draw) {
      update();
      draw(ctx);
    }
  }

  // Call loop at ~60 fps
  setInterval(loop, frameDuration);
}

window.onload = start;
