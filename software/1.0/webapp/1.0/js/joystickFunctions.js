//Bind the joystick events to control the drone
var motorId = 0;
function app_initJoystick() {
	stickJS.init(attachJoystickEvents);
	function attachJoystickEvents() {		
		stickJS.GAMEPAD_0.on("idle", onIDLE);
		stickJS.GAMEPAD_0.on("left", onLeft);
		stickJS.GAMEPAD_0.on("right", onRight);
		stickJS.GAMEPAD_0.on("up", onUp);
		stickJS.GAMEPAD_0.on("down", onDown);
		stickJS.GAMEPAD_0.on("button2", onFlyUp);
		stickJS.GAMEPAD_0.on("button3", onFlyDown);
	};
	
};
function onFlyUp() { sendEvent("/flyUp"); };
function onFlyDown() { sendEvent("/flyDown"); };
function onIDLE() { sendEvent("/idle"); };

function onLeft() { sendEvent("/rotateLeft"); };
function onRight() { sendEvent("/rotateRight"); };
function onUp() { sendEvent("/forward"); };
function onDown() { sendEvent("/backward"); };