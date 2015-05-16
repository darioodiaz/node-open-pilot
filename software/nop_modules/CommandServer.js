var faye = require('faye'),
	http = require('http');

var client, server, bayeux;
var IP_SERVER = 'http://127.0.0.1:8000/';

function startFayeServer() {
	server = http.createServer();
    bayeux = new faye.NodeAdapter({mount: '/'});
    bayeux.attach(server);
	server.listen(8000);
	console.log("Fayer server started"); 
	subscribeClient();
	bayeux.on("disconnect", onClientDisconnect);
	return bayeux.getClient();
	function onClientDisconnect() {
		//drone.land();
		drone.emergency();
	};
};

function subscribeClient() {
	var client = new faye.Client(IP_SERVER);
	//UI events
	client.subscribe("/wakeUp", drone.onWakeUp());
	client.subscribe("/flyUp", drone.onFlyUp());
	client.subscribe("/flyDown", drone.onFlyDown());
	client.subscribe("/rotateLeft", drone.onRotateLeft());
	client.subscribe("/rotateRight", drone.onRotateRight());
	client.subscribe("/selfLeft", drone.onSelfLeft());
	client.subscribe("/selfRight", drone.onSelfRight());
	client.subscribe("/forward", drone.onForward());
	client.subscribe("/backward", drone.onBackward());
	client.subscribe("/settings", onSettings);
	client.subscribe("/uiConnect", onUIConnectionSuccessful);
};

function onSettings(data) { drone.setSettings(data); };

function onUIConnectionSuccessful() {
	bayeux.getClient().publish("/j5_calibration", drone.getCalibration());
	bayeux.getClient().publish("/j5_settings", drone.getSettings());
	drone.startIMU();
};

module.exports = exportsFn;
function exportsFn() {
	var me = {
		startFayeServer: startFayeServer
	};
	return me;
};