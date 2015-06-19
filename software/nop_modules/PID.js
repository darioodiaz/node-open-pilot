var me = meConstructor;
function meConstructor(type, setPoint, kp, ki, kd) {
	this.compute = compute;
	this.type = type;
	this.setPoint = setPoint;

	this.kp = kp;
	this.ki = ki;
	this.kd = kd;

	this.errorArea = 0;
	this.lastError = 0;
};

function compute(angleData, setPoint) {
	this.setPoint = setPoint;
	console.log("SP: ", this.setPoint);
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
		console.log("Cannot compute, input is NULL");
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


exports.PID = me;