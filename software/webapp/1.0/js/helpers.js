/**
 * Copyright 2015, Dario Diaz.
 * All rights reserved.
 *
 * This source code is licensed under CC 4.0 https://creativecommons.org/licenses/by-nc-sa/4.0/
 *
 */

var panelClasses = ["panel-info", "panel-danger", "panel-warning"];
var connectionStatusClasses = ["text-success", "text-danger", "text-warning"];
var motorSpeedClasses = ["progress-bar-info", "progress-bar-success", "progress-bar-warning", "progress-bar-danger"];

//Display accel data
function displayIMU(data) {
	displayRotation(data);
};
function displayRotation(data) {
	var spans = $("#info-rotation").find("label span");
	spans[0].innerHTML = Math.round(data.x) + "°";
	spans[1].innerHTML = Math.round(data.y) + "°";
	spans[2].innerHTML = Math.round(data.z) + "°";
};
//Unified display for connection_stats
function displayStatus(status, type) {
	/*
		Types:
			1 - Successfull
			2 - Error
			3 - Connection error
	*/
	if (type === 1) {
		//$("#btn_connect").text("Disconnect").off().click(onBtnDisconnectClick);
	} else {
		$("#btn_connect").text("Connect").off().click(onBtnConnectClick);
	}
	panelClasses.forEach(function (item) { $("#panel_connectionStatus").removeClass(item); });
	connectionStatusClasses.forEach(function (item) { $("#connection_status").removeClass(item); });
	$("#panel_connectionStatus").addClass(panelClasses[type-1]);
	$("#connection_status").addClass(connectionStatusClasses[type-1]).text(status);
};

function displayMotors(motorSpeed) {
	var realSpeed = 0;
	var selectedClass = "";
	motorSpeed.forEach(function(speed, index) {
		realSpeed = Number(speed * 100 / 255).toFixed(2);
		$("#motor" + index).find("label").text(realSpeed);
		$("#control" + index).val(realSpeed);

		motorSpeedClasses.forEach(function(className) { $("#motor" + index + "+.progress .progress-bar").removeClass(className) } );
		selectedClass = motorSpeedClasses[Math.floor(realSpeed / 25)];
		$("#motor" + index + "+.progress .progress-bar").css("width", realSpeed + "%").addClass(selectedClass);
	});
};