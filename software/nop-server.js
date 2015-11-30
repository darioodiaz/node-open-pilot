var express = require("express"),
	drone = require("./nop_modules/Drone").Drone;

var server;

function parseArgs() {
	/*
		node nop-server.js COM_PORT -p 3000
	*/
	var isWifi = false;
	if (process.argv.length < 3) {
		isWifi = true;
		console.log("Using wifi");
		//console.log("Must specify a Bluetooth port.");
		//showHelp();
		//return;	
	}
	var expressPort = 3000;
	var BT_PORT = String(process.argv[2]).trim();
	var portFound = false;
	process.argv.forEach(function(item, i) {
		if (portFound) { return; }
		if (String(item.trim()) == "-p") {
			if (!process.argv[i+1]) {
				console.log("Must specify a custom webserver port.");
				expressPort = -1;
				showHelp();
				return;	
			} else {
				parseInt(process.argv[i+1]);
				expressPort = parseInt(process.argv[i+1]);
				portFound = true;
			}
		}
	});
	if (isNaN(expressPort)) { 
		console.log("The port must be a number");
		showHelp();
		return;
	}
	if (expressPort == -1) { return; }
	if (isWifi) {
		drone.createWifi();
	} else {
		drone.create(BT_PORT);
	}
	server = express();
	server.use("/ui", express.static("webapp/1.0/"));
	server.get("/ui", onUISuccess);
	server.listen(expressPort);
	console.log("Server started on port:", expressPort);
};

function onUISuccess(req, res) {
	res.sendFile("index.html");
};

function showHelp() {
	console.log("** Node Open Pilot Server **\n");
	console.log("Usage: ");
	console.log("\tnode nop-server.js BLUETOOTH_PORT [-p WEBSERVER_PORT]\n");
	console.log("Optional parameters:");
	console.log("\t-p: custom port for webserver. Defaults 3000");
};

parseArgs();