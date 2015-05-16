var IMU, imuData;

function getAccelerometerAngle(type) {
	var pows, aux;
	switch(type) {
		case 1:
			pows = (IMU.accelerometer.y * IMU.accelerometer.y) + (IMU.accelerometer.z * IMU.accelerometer.z);
			aux = IMU.accelerometer.x / Math.sqrt(pows);
		break;
		case 2:
			pows = (IMU.accelerometer.x * IMU.accelerometer.x) + (IMU.accelerometer.z * IMU.accelerometer.z);
			aux = IMU.accelerometer.y / Math.sqrt(pows);
		break;
		case 3:
			pows = (IMU.accelerometer.x * IMU.accelerometer.x) + (IMU.accelerometer.y * IMU.accelerometer.y);
			aux = Math.sqrt(pows) / IMU.accel.z;
		break;
	}
	return Number( (Math.atan(aux) * 180 / Math.PI).toFixed(2) );
};
function getGyroscopeAngle(type) {
	var typed = [IMU.gyro.pitch.angle, IMU.gyro.roll.angle, IMU.gyro.yaw.angle]
	var aux = typed[type-1] * Math.PI / 180 * 100;
	return Number( aux.toFixed(2) );
};

function getFullAccelerometer() {
	var accelerometer = {};
	accelerometer.x = getAccelerometerAngle(1);
	accelerometer.y = getAccelerometerAngle(2);
	accelerometer.z = getAccelerometerAngle(3);
	return accelerometer;
};
function getFullGyroscope() {
	var gyro = {};
	gyro.x = getGyroscopeAngle(1);
	gyro.y = getGyroscopeAngle(2);
	gyro.z = getGyroscopeAngle(3);
	return gyro;
};

function getDroneAngle(accel, gyro) {
	var ax = getAccelerometerAngle(1);
	var ay = getAccelerometerAngle(2);
	var az = getAccelerometerAngle(3);

	var gx = getGyroscopeAngle(1);
	var gy = getGyroscopeAngle(2);
	var gz = getGyroscopeAngle(3);

	var grx = drone.imuData.rotation.x + (100 * gx);
    var gry = drone.imuData.rotation.y + (100 * gy);
    var grz = drone.imuData.rotation.z + (100 * gz);

    var rx = Number( (0.96 * ax + 0.04 * grx).toFixed(2) );
	var ry = Number( (0.96 * ay + 0.04 * gry).toFixed(2) );
	var rz = Number( (0.96 * az + 0.04 * grz).toFixed(2) );

	return {
		accelerometer: { x: ax, y: ay, z: az },
		gyro: { x: grx, y: gry, z: grz },
		rotation: { x: gx, y: gy, z: gz }
	};
};

function getIMU(j5) { IMU = new j5.IMU({ freq: 100}); return IMU; };

function cancelCallback() { IMU.removeAllListeners("data"); };

function startIMU(callback) {
	IMU.on("data", onIMUSuccess);
	function onIMUSuccess(data) {
		imuData = data;
		callback(data, cancelCallback);
	};
};

function exportsFn() {
	var me = {
		getGyroscopeAngle: getGyroscopeAngle,
		getAccelerometerAngle: getAccelerometerAngle,
		getDroneAngle: getDroneAngle,
		getFullGyroscope: getFullGyroscope,
		getFullAccelerometer: getFullAccelerometer,
		startIMU: startIMU,
		getIMU: getIMU
	};
	return me;
};
module.exports = exportsFn;