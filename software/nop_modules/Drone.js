var drone = { 
	pitchSpeed: 5, rollSpeed: 5, yawSpeed: 25, 
	flySpeed: 3, calibrated: false, motorSpeed: [] 
};
var settingsBackup, calibrationBackup, bayeuxCli;

var j5 = require("johnny-five"),
	IMU_Helper = require("./IMU_Helper")();
	commandServerModule = require("./CommandServer")();

function create() {
	drone.IMU = IMU_Helper.getIMU(j5);

	drone.pitchMotors = [];
	drone.rollMotors = [];

	/*      PITCH axis
			
		   	   (7) Front
				 ||
	Left   (3)----------(5) Right  ROLL axis
			     ||
	   	      (9) Rear

	*/

	//Left-Right
	drone.rollMotors.push( new j5.Motor({ pin: 3 }) );	
	drone.rollMotors.push( new j5.Motor({ pin: 5 }) );

	//Front-Rear
	drone.pitchMotors.push( new j5.Motor({ pin: 7 }) );
	drone.pitchMotors.push( new j5.Motor({ pin: 9 }) );

	drone.rollMotors[0].motorId = 0;
	drone.pitchMotors[0].motorId = 1;
	drone.rollMotors[1].motorId = 2;
	drone.pitchMotors[1].motorId = 3;

	drone.yawMotors = drone.rollMotors.concat(drone.pitchMotors);
};

function initDrone() {
	bayeuxCli = commandServerModule.startFayeServer();
	IMU_Helper.startIMU(onIMUCallback);
};

function onIMUCallback(data, cancelCallback) {
	calibrate();
	cancelCallback();
};

function onWakeUp() {
	drone.motorSpeed = [0, 0, 0, 0];
	drone.yawMotors.forEach(function(motor) {
		motor.start(drone.yawSpeed);
		drone.motorSpeed[motor.motorId] = drone.yawSpeed;
	});
	bayeuxCli.publish("/j5_motorSpeed", drone.motorSpeed);
};

function onFlyUp() {
	drone.yawSpeed += drone.flySpeed;
	drone.yawMotors.forEach(function(motor) {
		if (drone.yawSpeed >= 255) {
			drone.yawSpeed = 255;
		}
		drone.motorSpeed[motor.motorId] = drone.yawSpeed;
		motor.fwd(drone.yawSpeed);
	});
	bayeuxCli.publish("/j5_motorSpeed", drone.motorSpeed);
};
function onFlyDown() {
	drone.yawSpeed -= drone.flySpeed * 3;
	drone.yawMotors.forEach(function(motor) {
		if (drone.yawSpeed <= 0) {
			drone.yawSpeed = 0;
		}
		drone.motorSpeed[motor.motorId] = drone.yawSpeed;
		motor.fwd(drone.yawSpeed);
	});
	bayeuxCli.publish("/j5_motorSpeed", drone.motorSpeed);
};

function onRotateRight() {
	var leftMotor = drone.rollMotors[0];
	var rightMotor = drone.rollMotors[1];
	var Lspeed = leftMotor.currentSpeed + drone.pitchSpeed;
	var Rspeed = rightMotor.currentSpeed - drone.pitchSpeed;

	Lspeed = (Lspeed >= 255 ? 255 : Lspeed);
	Rspeed = (Rspeed >= 255 ? 255 : Rspeed);

	Lspeed = (Lspeed <= 0 ? 0 : Lspeed);
	Rspeed = (Rspeed <= 0 ? 0 : Rspeed);

	drone.motorSpeed[leftMotor.motorId] = Lspeed;
	drone.motorSpeed[rightMotor.motorId] = Rspeed;

	leftMotor.fwd(Lspeed);
	rightMotor.fwd(Rspeed);

	bayeuxCli.publish("/j5_motorSpeed", drone.motorSpeed);
};
function onRotateLeft() {
	var leftMotor = drone.rollMotors[0];
	var rightMotor = drone.rollMotors[1];
	var Lspeed = leftMotor.currentSpeed - drone.pitchSpeed;
	var Rspeed = rightMotor.currentSpeed + drone.pitchSpeed;

	Lspeed = (Lspeed >= 255 ? 255 : Lspeed);
	Rspeed = (Rspeed >= 255 ? 255 : Rspeed);

	Lspeed = (Lspeed <= 0 ? 0 : Lspeed);
	Rspeed = (Rspeed <= 0 ? 0 : Rspeed);

	drone.motorSpeed[leftMotor.motorId] = Lspeed;
	drone.motorSpeed[rightMotor.motorId] = Rspeed;

	leftMotor.fwd(Lspeed);
	rightMotor.fwd(Rspeed);
	bayeuxCli.publish("/j5_motorSpeed", drone.motorSpeed);
};

function onBackward() {
	var frontMotor = drone.pitchMotors[0];
	var rearMotor = drone.pitchMotors[1];
	var Fspeed = frontMotor.currentSpeed + drone.rollSpeed;
	var Bspeed = rearMotor.currentSpeed - drone.rollSpeed;

	Fspeed = (Fspeed >= 255 ? 255 : Fspeed);
	Bspeed = (Bspeed >= 255 ? 255 : Bspeed);

	Fspeed = (Fspeed <= 0 ? 0 : Fspeed);
	Bspeed = (Bspeed <= 0 ? 0 : Bspeed);

	drone.motorSpeed[frontMotor.motorId] = Fspeed;
	drone.motorSpeed[rearMotor.motorId] = Bspeed;

	frontMotor.fwd(Fspeed);
	rearMotor.fwd(Bspeed);
	bayeuxCli.publish("/j5_motorSpeed", drone.motorSpeed);
};
function onForward() {
	var frontMotor = drone.pitchMotors[0];
	var rearMotor = drone.pitchMotors[1];
	var Fspeed = frontMotor.currentSpeed - drone.rollSpeed;
	var Bspeed = rearMotor.currentSpeed + drone.rollSpeed;

	Fspeed = (Fspeed >= 255 ? 255 : Fspeed);
	Bspeed = (Bspeed >= 255 ? 255 : Bspeed);

	Fspeed = (Fspeed <= 0 ? 0 : Fspeed);
	Bspeed = (Bspeed <= 0 ? 0 : Bspeed);

	drone.motorSpeed[frontMotor.motorId] = Fspeed;
	drone.motorSpeed[rearMotor.motorId] = Bspeed;

	frontMotor.fwd(Fspeed);
	rearMotor.fwd(Bspeed);
	bayeuxCli.publish("/j5_motorSpeed", drone.motorSpeed);
};

function onSelfLeft() {
	var leftMotor = drone.yawMotors[0];
	var rightMotor = drone.yawMotors[1];

	var frontMotor = drone.rollMotors[0];
	var rearMotor = drone.rollMotors[1];

	var Lspeed = leftMotor.currentSpeed + drone.pitchSpeed;
	var Rspeed = rightMotor.currentSpeed - drone.pitchSpeed;

	Lspeed = (Lspeed >= 255 ? 255 : Lspeed);
	Rspeed = (Rspeed >= 255 ? 255 : Rspeed);

	Lspeed = (Lspeed <= 0 ? 0 : Lspeed);
	Rspeed = (Rspeed <= 0 ? 0 : Rspeed);

	leftMotor.fwd(Lspeed);
	rightMotor.fwd(Rspeed);

	frontMotor.fwd(Lspeed);
	rearMotor.fwd(Rspeed);
	bayeuxCli.publish("/j5_motorSpeed", drone.motorSpeed);
};
function onSelfRight() {
	var leftMotor = drone.yawMotors[0];
	var rightMotor = drone.yawMotors[1];

	var frontMotor = drone.rollMotors[0];
	var rearMotor = drone.rollMotors[1];

	var Lspeed = leftMotor.currentSpeed - drone.pitchSpeed;
	var Rspeed = rightMotor.currentSpeed + drone.pitchSpeed;

	Lspeed = (Lspeed >= 255 ? 255 : Lspeed);
	Rspeed = (Rspeed >= 255 ? 255 : Rspeed);

	Lspeed = (Lspeed <= 0 ? 0 : Lspeed);
	Rspeed = (Rspeed <= 0 ? 0 : Rspeed);

	leftMotor.fwd(Lspeed);
	rightMotor.fwd(Rspeed);

	frontMotor.fwd(Lspeed);
	rearMotor.fwd(Rspeed);
	bayeuxCli.publish("/j5_motorSpeed", drone.motorSpeed);
};

function getSettings() { return settingsBackup; };
function getCalibration() { return calibrationBackup; };

function setSettings(data) {
	drone.pitchSpeed = data.pitch || drone.pitchSpeed; drone.rollSpeed = data.roll || drone.rollSpeed; drone.yawSpeed = data.yaw || drone.yawSpeed;
};

function startIMU() {
	IMU_Helper.startIMU(onIMUDataCallback);
};
function onIMUDataCallback(data, cancelCallback) {
	drone.imuData = IMU_Helper.getDroneAngle();
	bayeuxCli.publish("/j5_imu", drone.imuData);
};

function calibrate() {
	var accelerometer = IMU_Helper.getFullAccelerometer();
	if (isNaN(accelerometer.x)) {
		return;
	} 
	drone.imuData = { rotation: { x: accelerometer.x, y: accelerometer.y, z: accelerometer.z } };
	calibrationBackup = IMU_Helper.getDroneAngle(drone.IMU.accelerometer, drone.IMU.gyro);
	settingsBackup = { pitch: drone.pitchSpeed, roll: drone.rollSpeed, yaw: drone.yawSpeed };
	console.log("Drone calibration: ", calibrationBackup);
};

function exportsFn(BT_PORT) {
	board = new j5.Board({ port: BT_PORT });
	board.on("ready", initDrone);

	var me = {
		create: create,
		startIMU: startIMU,
		getCalibration: getCalibration,
		getSettings: getSettings,
		setSettings: setSettings,

		emergency: emergency,
		setFlightMode: setFlightMode,

		onWakeUp: onWakeUp,
		onFlyUp: onFlyUp,
		onFlyDown: onFlyDown,
		onRotateLeft: onRotateLeft,
		onRotateRight: onRotateRight,
		onSelfRight: onSelfRight,
		onSelfLeft: onSelfLeft,
		onBackward: onBackward,
		onForward: onForward
	};	
	return me;
};
module.exports = exportsFn;