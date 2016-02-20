/**
 * Copyright 2015, Dario Diaz.
 * All rights reserved.
 *
 * This source code is licensed under CC 4.0 https://creativecommons.org/licenses/by-nc-sa/4.0/
 *
 */

//Try to connect with J5 server, then attachListeners to buttons and start communication
function app_connect() {
	var self = this;	
	self.socket = new Faye.Client('http://localhost:8000/');
	onConnect();

	self.socket.subscribe("/j5_imu", onIMUData);
	self.socket.subscribe("/j5_calibration", onIMUCalibration);
	self.socket.subscribe("/j5_motorSpeed", onMotorSpeed);
	self.socket.subscribe("/j5_settings", onServerSettings);

	function onConnect() {
		console.info("Connected to the server");
		sendEvent("/uiConnect");
		displayStatus("Connected", 1);
	};
};
function onServerSettings(data) {
	$("#pitch").val(data.pitch);
	$("#roll").val(data.roll);
	$("#yaw").val(data.yaw);
};
function onMotorSpeed(motorSpeed) {
	displayMotors(motorSpeed);
};
function onIMUCalibration(accel) {
	droneRender.calibrate(accel);
};
function onIMUData(data) { 
	displayIMU(data);
	droneRender.updateDroneRotation(data);
};
function sendEvent(eventName, params) { 
	app.socket.publish(eventName, params ? params: {} ); 
};
