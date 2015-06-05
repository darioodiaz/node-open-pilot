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

function compute(angleData) {
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
	var error = this.setPoint - input;
	this.errorArea += error;
	var derivativeError = (error - this.lastError);

	var P = this.kp * error;
	var I = this.ki * this.errorArea;
	var D = this.kd * derivativeError;

	var val = P + I + D;
	this.lastError = error;

	val = val > 255 ? 255 : val;
	//val = val < 0 ? 0 : val;

	return Math.round(val);
};


exports.PID = me;