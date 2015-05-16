//Bind the joystick events to control the drone
function app_initJoystick() {
	stickJS.init(attachJoystickEvents);

	function attachJoystickEvents() {
		stickJS.GAMEPAD_0.on("start", onStartPress);
		stickJS.GAMEPAD_0.on("left", onLeftPress);
		stickJS.GAMEPAD_0.on("up", onUpPress);
		stickJS.GAMEPAD_0.on("right", onRightPress);
		stickJS.GAMEPAD_0.on("down", onDownPress);
		stickJS.GAMEPAD_0.on("button2", flyUp);
		stickJS.GAMEPAD_0.on("button3", flyDown);
	};
	
};

function onStartPress() {
	//drone wake up
	sendEvent("/wakeUp");
};
function onLeftPress() {
	console.log("Left");
	sendEvent("/rotateLeft");
};
function onUpPress() {
	console.log("Up");
	sendEvent("/forward");
};
function onRightPress() {
	console.log("Right");
	sendEvent("/rotateRight");
};
function onDownPress() {
	console.log("Down");
	sendEvent("/backward");
};
function flyUp() {
	//go up
	console.log("Fly up");
	sendEvent("/flyUp");
};
function flyDown() {
	//go down
	console.log("Fly down");
	sendEvent("/flyDown");
};
