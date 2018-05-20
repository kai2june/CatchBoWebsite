var five = require("johnny-five");
var board = new five.Board();

board.on("ready", function() {

  // Create a standard `led` component instance
  //var led = new five.Led(8);
  var relay = new five.Relay(8);
  //led.off();
  // "blink" the led in 500ms
  // on-off phase periods
  //led.blink(100000);
  relay.on();
});