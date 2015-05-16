var express = require("express");
	droneModule = require("./nop_modules/Drone");

var server, drone;

function parseArgs() {
	/*
		node nop-server.js COM_PORT -p 3000
	*/
	if (process.argv.length < 3) {
		console.log("Must specify a Bluetooth port.");
		showHelp();
		return;	
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
	drone = droneModule(BT_PORT);
	server = express();
	server.use(express.static("/webapp"));
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