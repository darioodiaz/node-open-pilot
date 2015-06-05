var drone = {
	pitchSpeed: 5, rollSpeed: 5, yawSpeed: 25, 
	flySpeed: 8, calibrated: false,
	motorSpeed: [], pidValues: [0,0,0,0]
}; 
var settingsBackup, calibrationBackup, bayeuxCli, netClient, io;

var j5 = require("johnny-five"),
	net = require('net'),
	firmata = require('firmata'),
	IMU_Helper = require("./IMU_Helper").Helper;
	commandServerModule = require("./CommandServer").Server,
	PID = require("./PID").PID;
	//API = require("./API").API;

function attachHardware() {
	drone.IMU = IMU_Helper.getIMU(j5);

	drone.pitchMotors = [];
	drone.rollMotors = [];

	/*      PITCH axis
			
		   	  (6) Front
				 ||
	Left   (3)----------(5) Right  ROLL axis
			     ||
	   	      (9) Rear

	*/

	//Left-Right
	drone.rollMotors.push( new j5.Motor({ pin: 3 }) );	
	drone.rollMotors.push( new j5.Motor({ pin: 5 }) );

	//Front-Rear
	drone.pitchMotors.push( new j5.Motor({ pin: 6 }) );
	drone.pitchMotors.push( new j5.Motor({ pin: 9 }) );

	drone.rollMotors[0].motorId = 0;
	drone.pitchMotors[0].motorId = 1;
	drone.rollMotors[1].motorId = 2;
	drone.pitchMotors[1].motorId = 3;

	drone.yawMotors = drone.rollMotors.concat(drone.pitchMotors);
};

function initDrone() {
	drone.PID = [];
	attachHardware();
	drone.PID.push( new PID("PITCH", 0, 5, 2, 3) );
	drone.PID.push( new PID("ROLL", 0, 3, 2, 3) );	
	IMU_Helper.startIMU(onIMUCallback);
	//drone.API = new API();
	//drone.API.createAPIServer(drone);
};

function onIMUCallback(data, cancelCallback) {
	var pitchSpeed = drone.PID[0].compute(data);
	var rollSpeed = drone.PID[1].compute(data);	

	drone.pidValues[0] = data.xReverse ? rollSpeed : 0;
	drone.pidValues[2] = !data.xReverse ? rollSpeed : 0;

	drone.pidValues[1] = !data.yReverse ? pitchSpeed : 0;
	drone.pidValues[3] = data.yReverse ? pitchSpeed : 0;

	console.log("PID: ", drone.pidValues);

	bayeuxCli.publish("/j5_imu", data);
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
	drone.yawSpeed = drone.yawSpeed > 255 ? 255 : drone.yawSpeed; 

	if (true) {
		/*var leftVel = drone.yawSpeed + (drone.pidValues[0] ? drone.pidValues[0] - drone.yawSpeed : 0);
		var upVel = drone.yawSpeed + (drone.pidValues[1] ? drone.pidValues[1] - drone.yawSpeed : 0);
		var rightVel = drone.yawSpeed + (drone.pidValues[2] ? drone.pidValues[2] - drone.yawSpeed : 0);
		var downVel = drone.yawSpeed + (drone.pidValues[3] ? drone.pidValues[3] - drone.yawSpeed : 0);*/

		if (!drone.oldLeftVel) {
			drone.oldLeftVel = drone.pidValues[0];
			drone.oldUpVel = drone.pidValues[1];
			drone.oldRightVel = drone.pidValues[2];
			drone.oldDownVel = drone.pidValues[3];

			drone.leftVel = drone.oldLeftVel;
			drone.upVel = drone.oldUpVel;
			drone.rightVel = drone.oldRightVel;
			drone.downVel = drone.oldDownVel;
		} else {
			if (drone.pidValues[0] >= drone.oldLeftVel) {
				drone.leftVel = drone.pidValues[0];
			} else if(drone.pidValues[0]  ) {
				drone.leftVel = (drone.oldLeftVel - drone.pidValues[0]);
			} else {

			}

			if (drone.pidValues[2] > drone.oldUpVel) {
				drone.upVel = drone.pidValues[1];
			} else if(drone.pidValues  ) {
				drone.upVel = (drone.oldUpVel - drone.pidValues[1]);
			} else {

			}

			if (drone.pidValues[2] > drone.oldRightVel) {
				drone.rightVel = drone.pidValues[2];
			} else if(drone.pidValues[2]  ) {
				drone.rightVel = (drone.oldRightVel - drone.pidValues[2]);
			} else {

			}

			if (drone.pidValues[3] > drone.oldDownVel) {
				drone.downVel = drone.pidValues[3];
			} else if(drone.pidValues[3  ) {
				drone.downVel = (drone.oldDownVel - drone.pidValues[3]);
			} else {

			}

			drone.oldLeftVel = drone.leftVel;
			drone.oldUpVel = drone.upVel;
			drone.oldRightVel = drone.rightVel;
			drone.oldDownVel = drone.downVel;
		}	

		/*var leftVel = drone.pidValues[0];
		var upVel = drone.pidValues[1];
		var rightVel = drone.pidValues[2];
		var downVel = drone.pidValues[3];*/

		drone.leftVel = drone.leftVel > 180 ? 180 : drone.leftVel;
		drone.upVel = drone.upVel > 180 ? 180 : drone.upVel;
		drone.rightVel = drone.rightVel > 180 ? 180 : drone.rightVel;
		drone.downVel = drone.downVel > 180 ? 180 : drone.downVel;

		drone.leftVel = drone.leftVel < 0 ? 0 : drone.leftVel;
		drone.upVel = drone.upVel < 0 ? 0 : drone.upVel;
		drone.rightVel = drone.rightVel < 0 ? 0 : drone.rightVel;
		drone.downVel = drone.downVel < 0 ? 0 : drone.downVel;

		drone.rollMotors[0].fwd(drone.leftVel);
		drone.pitchMotors[0].fwd(drone.upVel);
		drone.rollMotors[1].fwd(drone.rightVel);
		drone.pitchMotors[1].fwd(drone.downVel);	

		drone.motorSpeed[drone.rollMotors[0].motorId] = drone.leftVel;
		drone.motorSpeed[drone.pitchMotors[0].motorId] = drone.upVel;
		drone.motorSpeed[drone.rollMotors[1].motorId] = drone.rightVel;
		drone.motorSpeed[drone.pitchMotors[1].motorId] = drone.downVel;
	} else {
		/*
		var leftVel = drone.yawSpeed - 2;
		var upVel = drone.yawSpeed;
		var rightVel = drone.yawSpeed - 60;
		var downVel = drone.yawSpeed - 20;

		leftVel = leftVel < 0 ? 0 : leftVel;
		upVel = upVel < 0 ? 0 : upVel;
		rightVel = rightVel < 0 ? 0 : rightVel;
		downVel = downVel < 0 ? 0 : downVel;

		drone.rollMotors[0].fwd(leftVel);
		drone.pitchMotors[0].fwd(upVel);
		drone.rollMotors[1].fwd(rightVel);
		drone.pitchMotors[1].fwd(downVel);	

		drone.motorSpeed[drone.rollMotors[0].motorId] = leftVel;
		drone.motorSpeed[drone.pitchMotors[0].motorId] = upVel;
		drone.motorSpeed[drone.rollMotors[1].motorId] = rightVel;
		drone.motorSpeed[drone.pitchMotors[1].motorId] = downVel;

		drone.yawMotors.forEach(function(motor) {
			drone.motorSpeed[motor.motorId] = drone.yawSpeed;
			motor.fwd(drone.yawSpeed);
		});
		*/
	}
	bayeuxCli.publish("/j5_motorSpeed", drone.motorSpeed);
};
function onFlyDown() {
	drone.yawSpeed -= drone.flySpeed * 6;
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
function getRotation() { return drone.rotation; };

function setSettings(data) {
	drone.pitchSpeed = data.pitch || drone.pitchSpeed; drone.rollSpeed = data.roll || drone.rollSpeed; drone.yawSpeed = data.yaw || drone.yawSpeed;
};

function emergencyLand() {
	console.warn("Something goes wrong! Doing emergency land");
	//var eqSpeed = 7, temp;
	//setTimeout(emergencyLading, 500);
	function emergencyLading() {
		drone.yawMotors.forEach(function(motor) {
			temp = motor.speed - eqSpeed < 25 ? 25 : motor.speed - eqSpeed;			
			motor.fwd(temp);
			drone.motorSpeed[motor.motorId] = temp;
		});
		bayeuxCli.publish("/j5_motorSpeed", drone.motorSpeed);
		setTimeout(emergencyLading, 500);
	};
};

function create(BT_PORT) {
	bayeuxCli = commandServerModule.startFayeServer(me);
	board = new j5.Board({ port: BT_PORT });
	board.on("ready", initDrone);
};

function createWifi(options) {
	options = options || { host: '192.168.4.1', port: 23 };
	netClient = net.connect(options, onNetClientConnect);
	function onNetClientConnect() {
		console.log('Net Client connection successfully');  
		var socketClient = this;
		io = new firmata.Board(socketClient);
		io.once('ready', onIOReady);
	}
	function onIOReady() {
		console.log('Net IO Ready');
		io.isReady = true;
		board = new j5.Board({io: io, repl: true});		
		board.on('ready', initDrone);
	}
};

function onlyMotor(data) {
	var _motor = drone.yawMotors[data.motorId];
	_motor.fwd(Number(data.speed) );
	drone.motorSpeed[data.motorId] = data.speed;
	bayeuxCli.publish("/j5_motorSpeed", drone.motorSpeed);
};

var me = {
	create: create,
	createWifi: createWifi,
	getSettings: getSettings,
	setSettings: setSettings,
	getRotation: getRotation,
	onlyMotor: onlyMotor,

	emergencyLand: emergencyLand,

	wakeUp: onWakeUp,
	flyUp: onFlyUp,
	flyDown: onFlyDown,
	rotateLeft: onRotateLeft,
	rotateRight: onRotateRight,
	selfRight: onSelfRight,
	selfLeft: onSelfLeft,
	backward: onBackward,
	forward: onForward
};	
exports.Drone = me;