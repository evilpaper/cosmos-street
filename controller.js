const controller = {};

controller.keyListener = function (event) {
  const eventType = event.type === "keydown" ? true : false;
  switch (event.keyCode) {
    case 37:
      controller.left = eventType;
      break;
    case 38:
      controller.up = eventType;
      break;
    case 39:
      controller.right = eventType;
      break;
  }
  console.log(controller);
};

document.addEventListener("keyup", (event) => {
  controller.keyListener(event);
});

document.addEventListener("keydown", (event) => {
  controller.keyListener(event);
});
