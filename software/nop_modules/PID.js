<<<<<<< HEAD
=======
/**
 * Copyright 2015, Dario Diaz.
 * All rights reserved.
 *
 * This source code is licensed under CC 4.0 https://creativecommons.org/licenses/by-nc-sa/4.0/
 *
 */

var me = meConstructor;
>>>>>>> e9f2e7c059b86d5dd7bd840401bf5e53e08f132d
function meConstructor(type, setPoint, kp, ki, kd) {
	this.compute = compute;
	this.type = type;
	this.setPoint = setPoint;

	this.kp = kp;
	this.ki = ki;
	this.kd = kd;

	this.errorArea = 0;
	this.lastError = 0;
	this.messaged = false;
};

function compute(angleData, setPoint) {
	this.setPoint = setPoint;
<<<<<<< HEAD
=======
	console.log("SP: ", this.setPoint);
>>>>>>> e9f2e7c059b86d5dd7bd840401bf5e53e08f132d
	var input;
	switch(this.type.toUpperCase()) {
		case "ROLL":
			input = angleData.x;
		break;
		case "PITCH":
			input = angleData.y;
		break;
		case "YAW":
			input = angleData.z;
		break;
	}
	if (!input || isNaN(input)) {
<<<<<<< HEAD
		if (!this.messaged) {
			console.log("Cannot compute, input is NULL");
			this.messaged = true;
		}
=======
		console.log("Cannot compute, input is NULL");
>>>>>>> e9f2e7c059b86d5dd7bd840401bf5e53e08f132d
		return 0;
	}
	var error = this.setPoint - input;
	this.errorArea += error;
	var derivativeError = (error - this.lastError);

	var P = this.kp * error;
	var I = this.ki * this.errorArea;
	var D = this.kd * derivativeError;

	I = 0; //TODO: Fix integral problem

	var val = P + I + D;
	this.lastError = error;

	val = val > 30 ? 30 : val;
	val = val < -30 ? -30 : val;

	return Math.round(val);
};

exports.PID = meConstructor;
