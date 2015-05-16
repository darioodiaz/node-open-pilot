var app = {
	//Props
	IP_SERVER : "http://127.0.0.1:8000",
	//Functions
	domReady: app_domReady,
	connect: app_connect,
	initJoystick: app_initJoystick
};

$(document).ready(app.domReady);
$(document).on("selectstart", function() { return false; });

//First function initialization
function app_domReady() { 
	$("#btn_connect").click(onBtnConnectClick); 
	$(".btn-change").click(onBtnChangeClick);
	droneRender.createRender(); 
	app.initJoystick(); 
};