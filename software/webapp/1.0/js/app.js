/**
 * Copyright 2015, Dario Diaz.
 * All rights reserved.
 *
 * This source code is licensed under CC 4.0 https://creativecommons.org/licenses/by-nc-sa/4.0/
 *
 */

var app = {
	//Props
	IP_SERVER : "http://127.0.0.1:8000",
	CONTROL_MODE: "joystick",
	//VOICE_COMMANDS_UP: ["flotar", "volar", "volar arriba", "flotar arriba"],
	//VOICE_COMMANDS_DOWN: ["bajar", "descender", "volar abajo"],
	//Functions
	domReady: app_domReady,
	connect: app_connect,
	initJoystick: app_initJoystick,
	initKeyboard: app_initKeyboard,
	initVoice: app_initVoice,
	updateControlMode: app_updateControlMode,
	parseVoiceCommands: app_parseVoiceCommands,
};

$(document).ready(app.domReady);

//First function initialization
function app_domReady() { 
	$("#btn_connect").click(onBtnConnectClick);
	$(".btn-change").click(onBtnChangeClick);
	$("#controlForm input").change(onInputModeChange);
	//$("input[type='range']").change(onManualControlChange);
	droneRender.createRender();
	app.initJoystick();
};

function onManualControlChange(e) {
	var id = $(e.target).attr("id").split("control")[1];
	var speed = $(e.target).val();
	console.log("Id: ", id, " Speed: ", speed);
	sendEvent("/onlyMotor", { motorId: id, speed: speed });
};

function app_updateControlMode() {
	switch(app.CONTROL_MODE) {
		case "joystick": app.initJoystick(); break;
		case "keyboard": app.initKeyboard(); break;
		case "voice": app.initVoice(); break;
	}
};

function app_initKeyboard() {
	$(document)
		.off("keypress")
		.on("keypress", attachKeyboardEvents);

	function attachKeyboardEvents(e) {
		switch(e.which || e.keycode) {
			case 38:
				//sendEvent("");
			break;
			case 39:
				sendEvent("/flyUp");
			break;
			case 40:
			break;
			case 41:
				sendEvent("/flyDown");
			break;
		}
	};
};

function app_parseVoiceCommands() {
	if (app.voiceCommand) {
		if (app.voiceCommand == "arrancar") {
			sendEvent("/wakeUp");
		}
		if (app.voiceCommand == "flotar" || app.voiceCommand == "subir") {
			sendEvent("/flyUp");
		}
		if (app.voiceCommand == "bajar") {
			sendEvent("/flyDown");
		}
		if (app.voiceCommand == "apagar") {
			sendEvent("/land");
		}
	}
};

function app_initVoice() {
	app.recognition = new webkitSpeechRecognition();
	app.recognition.continuous = true;
	app.recognition.lang = "es-AR";

	app.recognition.onerror = function(event) { console.warn("Error: ", event); };
	app.recognition.onresult = function(event) {
		for (var i = event.resultIndex; i < event.results.length; i++) {
			if (event.results[i].isFinal) {
				app.voiceCommand = (event.results[i][0].transcript).toLowerCase();
			}
		}
		app.parseVoiceCommands();
	};
	app.recognition.start();
};

//Handler for the connect button
function onBtnConnectClick() {  app.connect(); };

function onInputModeChange(e) {
	if ($(e.target).val()) {
		app.CONTROL_MODE = $(e.target).val().toLowerCase();
		app.updateControlMode();
	}
};

function onBtnChangeClick(e) {
	var data = $(e.currentTarget).parent().find("input").attr("id");
	var val = $("#" + data).val();
	var params = {};
	params[data] = val;
	sendEvent("/client_settings", params);
};