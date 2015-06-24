/**
 * Copyright 2015, Dario Diaz.
 * All rights reserved.
 *
 * This source code is licensed under CC 4.0 https://creativecommons.org/licenses/by-nc-sa/4.0/
 *
 */

var faye = require('faye'),
	http = require('http');

var client, server, bayeux, drone;
var IP_SERVER = 'http://127.0.0.1:8000/';

function startFayeServer(droneInstance) {
	drone = droneInstance;
	server = http.createServer();
    bayeux = new faye.NodeAdapter({mount: '/'});
    bayeux.attach(server);
	server.listen(8000);
	console.log("Fayer server started"); 
	subscribeClient();
	bayeux.on("disconnect", onClientDisconnect);
	return bayeux.getClient();
	function onClientDisconnect() {
		drone.emergencyLand();
	};
};

function subscribeClient() {
	client = new faye.Client(IP_SERVER);
	//UI events
	client.subscribe("/wakeUp", drone.wakeUp);
	client.subscribe("/idle", drone.idle);
	client.subscribe("/flyUp", drone.flyUp);
	client.subscribe("/flyDown", drone.flyDown);
	client.subscribe("/rotateLeft", drone.rotateLeft);
	client.subscribe("/rotateRight", drone.rotateRight);
	client.subscribe("/selfLeft", drone.selfLeft);
	client.subscribe("/selfRight", drone.selfRight);
	client.subscribe("/forward", drone.forward);
	client.subscribe("/backward", drone.backward);
	client.subscribe("/settings", onSettings);
	client.subscribe("/uiConnect", onUIConnectionSuccessful);
};

function onSettings(data) { drone.setSettings(data); };

function onUIConnectionSuccessful() {
	bayeux.getClient().publish("/j5_settings", drone.getSettings());
};

var me = {
	startFayeServer: startFayeServer
};

exports.Server = me;