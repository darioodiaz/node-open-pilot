/*! stickJS v1.0 | (C) 2015 Dario Diaz | github.com/darioodiaz/stickjs for more info */

var GamepadInstance = function(id) {
  var self  = this;
  this.id = id;
  this.ticking = false;
  this.oldAxesStatus = [];

  this.config = function(gamepad) {
    this.vendor = gamepad.vendor;
    for (var i = 0; i < gamepad.axes.length; i++) {
      this.oldAxesStatus.push(gamepad.axes[i]);
    }
    console.log("Gamepad axes loaded");
    startPolling(); 
  };
  this.connected = function() {
    return self.oldAxesStatus.length > 0;
  };
  /* Gamepads pre-configuration
  */
  this.buttonMapper = {
    /* Action Buttons */
    "_0": "button1",
    "_1": "button2",
    "_2": "button3",
    "_3": "button4",
    /* Left-Right Backbuttons */
    "_4": "l1",
    "_6": "l2",
    "_5": "r1",
    "_7": "r2",
    /* others */
    "_8": "select",
    "_9": "start",
    /* Analog stick buttons */
    "_10": "lStickButton",
    "_11": "rStickButton"
  };

  this.buttonFn = {};  
  /* GamepadInstance functions */
  this.on = function(name, fn) {
    //console.log("stickJS: handler for " + name);
    /*
    Name for directions:
    up, down, left, right

    Name for buttons:
    button1, button2, button3, button4

    Name for backButtons:
    l1, l2 
    r1, r2

    Name for axis:
    LStickX LStickY
    RStickX RStickY

    Name for special buttons:
    start, select, mode
    */
    this.buttonFn[name.toLowerCase()] = fn;
  };
  this.stopPolling = function() {
    console.log("Gamepad stopped");
    self.ticking = false;
  };

  /* GamepadInstance internal functions */
  function startPolling() {
    console.log("Gamepad controller started");
    if (!self.ticking) {
      self.ticking = true;
      tick();
    }
  };
  function tick() {
    pollStatus();
    setTimeout(intervalNextTick, GamePadController.freq);
    //scheduleNextTick();
  };
  function intervalNextTick() {
    if (self.ticking) {
      tick();
    }
  };

  function scheduleNextTick() {
    if (self.ticking) {
      if (window.requestAnimationFrame) {
        window.requestAnimationFrame(tick);
      } else if (window.webkitRequestAnimationFrame) {
        window.webkitRequestAnimationFrame(tick);
      }
    }
  };
  function pollStatus() {
    self.gamepad = navigator.getGamepads()[self.id];

    //Button mapper fn
    for (var i = 0; i < self.gamepad.buttons.length; i++) {
      if(self.gamepad.buttons[i].pressed) {
        //TODO: revisar esto!

        if (i == 0) { continue; }

        if (self.buttonFn[ self.buttonMapper["_" + i].toLowerCase() ]) {
          self.buttonFn[ self.buttonMapper["_" + i].toLowerCase() ](self.gamepad.buttons[i].value, self.gamepad);
        }
      }
    }

    //Customize for each Gamepad
    for (var i = 0; i < self.gamepad.axes.length; i++) {
      if(self.gamepad.axes[i] != self.oldAxesStatus[i]) {
        if (i == 1) {
          if (self.gamepad.axes[1] == -1) {
            //up
            if(self.buttonFn["up"]) {
              self.buttonFn["up"](self.gamepad, self.gamepad.axes[i]);
            }
            //down
          } else if (self.gamepad.axes[1] == 1) {
            if(self.buttonFn["down"]) {
              self.buttonFn["down"](self.gamepad, self.gamepad.axes[i]);
            }
          }
        } else if(i == 0) {
          if (self.gamepad.axes[0] == -1) {
            //left
            if (self.buttonFn["left"]) {
              self.buttonFn["left"](self.gamepad, self.gamepad.axes[i]);
            }
            //right
          } else if(self.gamepad.axes[0] == 1) {
            if(self.buttonFn["right"]) {
              self.buttonFn["right"](self.gamepad, self.gamepad.axes[i]);
            }
          }
        }
      }
    }

  };
};

var GamePadController = {
  ticking: false,
  gamepads: [],
  freq: 100,

  init: function(callback, freq) {
    GamePadController.freq = freq || GamePadController.freq;

    GamePadController.gamepads.push(new GamepadInstance(0));
    GamePadController.gamepads.push(new GamepadInstance(1));
    GamePadController.gamepads.push(new GamepadInstance(2));
    GamePadController.gamepads.push(new GamepadInstance(3));

    GamePadController.GAMEPAD_0 = GamePadController.gamepads[0];
    GamePadController.GAMEPAD_1 = GamePadController.gamepads[1];
    GamePadController.GAMEPAD_2 = GamePadController.gamepads[2];
    GamePadController.GAMEPAD_3 = GamePadController.gamepads[3];

    var interval;
    interval = setInterval(function() {
      var found = false;
      var where;
      console.log("Searching gamepads...");
      for (var i = 0; i < 4; i++) {
        if (navigator.getGamepads()[i]) {
          found = true;
          where = i;
          break;
        }
      }
      if (found) {
        clearInterval(interval);
        GamePadController.gamepads[i].config(navigator.getGamepads()[where]);
        console.log("Gamepad found in : ", where, ". Instance: ", GamePadController.gamepads[i]);
        callback();
        GamePadController.scheduleSearchGamepads();
      }
    }, 1000);
  },

  calibrate: function(type) {
  },

  watchNewGamepads: function() {
    if(GamePadController.gamepads[0].connected() 
      && GamePadController.gamepads[1].connected()
      && GamePadController.gamepads[2].connected()
      && GamePadController.gamepads[3].connected() ) {
      console.log("Gamepads full");
      return;
    }
    var where = -1;
    var found = false;
    for (var i = 0; i < 4; i++) {
      if (navigator.getGamepads()[i] && !GamePadController.gamepads[i].connected()) {
        found = true;
        where = i;
        break;
      }
    }
    if (found) {
      GamePadController.gamepads[where].config(navigator.getGamepads()[where]);
      console.log("Another Gamepad found in: ", where, ". Instance: ", GamePadController.gamepads[where]);
    } 
    GamePadController.scheduleSearchGamepads();
  },

  scheduleSearchGamepads: function() {
    if (window.requestAnimationFrame) {
      window.requestAnimationFrame(GamePadController.watchNewGamepads);
    } else if (window.webkitRequestAnimationFrame) {
      window.webkitRequestAnimationFrame(GamePadController.watchNewGamepads);
    }
  }

};
window.stickJS = GamePadController;