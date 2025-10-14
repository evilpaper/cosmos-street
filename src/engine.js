const canvas = document.querySelector("canvas");
const screen = canvas.getContext("2d");
const fps = 60;
const frameDuration = 1000 / fps;

function start() {
  if (init) {
    init();
  }

  setInterval(() => {
    if (update) {
      update();
    }
  }, frameDuration);

  setInterval(() => {
    if (draw) {
      draw(screen);
    }
  }, frameDuration);
}

window.onload = start;
