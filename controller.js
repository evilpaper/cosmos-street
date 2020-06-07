const Controller = function () {
  this.left = false;
  this.up = false;
  this.right = false;

  this.keyListener = function (event) {
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
  };
};
