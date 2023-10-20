/**
 * When you call a function expression with the new keyword in JavaScript, you are creating an instance of an object, and the function becomes a constructor function. This process is known as constructor invocation.
 */

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
