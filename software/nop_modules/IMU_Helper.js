var IMU, calibrated;
var xOffset, yOffset, zOffset;
var grx, gry, grz;

function getIMU(j5) { IMU = new j5.IMU({ freq: 500}); return IMU; };

function getGyroAngles(gyro) {
	var gx = gyro.x, gy = gyro.y, gz = gyro.z;
	var gxs = gx/131, gys = gy/131, gzs = gz/131;
    return { x: gxs, y: gys, z: gzs }
};

function getAccelerometerAngles(accel) {
	var ax = accel.x, ay = accel.y, az = accel.z;
	var arx = (180 / Math.PI) * getAtan(ay, az, ax);
	var ary = (180 / Math.PI) * getAtan(ax, az, ay);
	var arz = (180 / Math.PI) * getAtan(ay, ax, az, true);

	return { x: arx, y: ary, z: arz };

	function getAtan(val1 , val2, ref, reverse) {
		var a = Math.sqrt(val1 * val1) + Math.sqrt(val2 * val2);
		return !reverse ? Math.atan(ref/a) : Math.atan(a/ref);
	};
};

function getAngles(gyro, accel) {
	var accelAngles = getAccelerometerAngles(accel);
	var gyroAngles = getGyroAngles(gyro);
	var xReverse = false;
	var yReverse = false;
	var zReverse = false;

	if (!calibrated) {
	    grx = accelAngles.x;
	    gry = accelAngles.y;
	    grz = accelAngles.z;
  	} else {
  		grx = gyroAngles.x;
    	gry = gyroAngles.y;
    	grz = gyroAngles.z;
  	}
	var rx = (0.96 * accelAngles.x) + (0.04 * grx);
	var ry = (0.96 * accelAngles.y) + (0.04 * gry);
	var rz = (0.96 * accelAngles.z) + (0.04 * grz);

	var x,y,z;

	if (!calibrated) {
		calibrated = true;
		xOffset = rx;
		yOffset = ry;
		zOffset = rz;
	} else {
	/*
		if ( Math.floor(rx - xOffset) > 0) {
			rx *= -1;
			xReverse = true;
		}
		if ( Math.floor(ry - yOffset) > 0) {
			ry *= -1;
			yReverse = true;
		}
		if ( Math.floor(rz - zOffset) > 0) {
			rz *= -1;
		}
	*/
		if (rx < 0) {
			x = rx + xOffset;
			xReverse = true;
		} else {
			x = rx - xOffset;
		}
		if (ry < 0) {
			y = ry + yOffset;			
			yReverse = true;
		} else {
			y = ry - yOffset;
		}
		if (rz < 0) {
			z = rz + zOffset;
			zReverse = true;
		} else {
			z = rz + zOffset;
		}
	}

	return { 
			x: Math.round(x).toFixed(2),
			xReverse: xReverse,

			y: Math.round(y).toFixed(2), 
			yReverse: yReverse,

			z: Math.round(z).toFixed(2),
			zReverse: zReverse

			//x: Math.round(rx - xOffset).toFixed(2),
			//y: Math.round(ry - yOffset).toFixed(2), 
			//z: Math.round(rz - zOffset).toFixed(2)
		};
};

function cancelCallback() { IMU.removeAllListeners("change"); };

function startIMU(callback) {
	IMU.on("change", onIMUSuccess);
	function onIMUSuccess() {
		if ( !(this.accelerometer.x || this.gyro.x) || (isNaN(this.accelerometer.x) || isNaN(this.gyro.x) ) ) {
			console.log("IMU getting null, skipping angles...");
		} else {
			callback(getAngles(this.gyro, this.accelerometer), cancelCallback);
		}
	};
};

var me = {
	//getGyroAngles: getGyroAngles,
	//getAccelerometerAngles: getAccelerometerAngles,
	getAngles: getAngles,
	startIMU: startIMU,
	getIMU: getIMU
};
exports.Helper = me;