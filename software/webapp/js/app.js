var app = {
	//Props
	IP_SERVER : "http://127.0.0.1:8000",
	CONTROL_MODE: "keyboard",
	VOICE_COMMANDS_UP: {"flotar": 0, "volar": 0, "volar arriba": 0, "flotar arriba": 0},
	VOICE_COMMANDS_DOWN: {"bajar": 0, "descender": 0, "volar abajo": 0},
	VOICE_COMMANDS_START: {"despierta": 0},
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
	droneRender.createRender();
	app.initJoystick();
	//app.initKeyboard();
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
		var forFwd = {
			"113": "0",
			"119": "1",
			"101": 2,
			"114": 3,
		};
		var forBwd = {
			"97": "0",
			"115": "1",
			"100": 2,
			"102": 3,
		};

		if ( !( "".concat(e.which || e.keycode) in forFwd || "".concat(e.which || e.keycode) in forBwd) ) {
			if ( !( (e.which || e.keycode) == 111 || (e.which || e.keycode) == 108) ) {
				return;
			}
		}

		if ( (e.which || e.keycode) == 111 || (e.which || e.keycode) == 108 ) {
			sendEvent("/customMotor", { all: true, fwd: (e.which || e.keycode) == 111 });
		} else {
			sendEvent("/customMotor", { id: forFwd["".concat(e.which || e.keycode)] || forBwd["".concat(e.which || e.keycode)], 
									fwd: "".concat(e.which || e.keycode) in forFwd });
		}
	};
};

function app_parseVoiceCommands() {
	console.log("Voice: ", app.voiceCommand);
	if ( app.voiceCommand in app.VOICE_COMMANDS_UP) {
		console.log("Flying up");
		sendEvent("/flyUp");
	}
	if ( app.voiceCommand in app.VOICE_COMMANDS_DOWN) {
		console.log("Flying down");
		sendEvent("/flyDown");
	}
	if ( app.voiceCommand in app.VOICE_COMMANDS_START) {
		console.log("Wake uping");
		sendEvent("/wakeUp");		
	}
};

function app_initVoice() {
	if (app.recognition) {
		app.recognition.stop();
	}
	app.recognition = new webkitSpeechRecognition();
	app.recognition.continuous = true;
	app.recognition.lang = "es-AR";

	app.recognition.onerror = function(event) { console.warn("Voice commands error: ", event); };
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
		if (app.recognition) {
			app.recognition.stop();
		}
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