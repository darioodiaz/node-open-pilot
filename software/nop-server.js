var express = require("express"),
	drone = require("./nop_modules/Drone").Drone;

var server, expressPort = 3000;
var args = process.argv;

function parseArgs() {
	/*
		node nop-server.js COM_PORT -p 3000
	*/
	var isWifi = false;
	if (args.length < 3 || args.length < 3 && args[3] === "-p") {
		isWifi = true;
		console.log("Using wifi");
	} else {
		var BT_PORT = String(process.argv[2]).trim();
	}
	var portFound = false;
	process.argv.forEach(function(item, i) {
		if (portFound) { return; }
		if (String(item.trim()) === "-p") {
			if (!process.argv[i+1]) {
				console.error("Must specify a custom webserver port.");
				expressPort = NaN;
				showHelp();
				portFound = true;
				return;	
			} else if ( !isNaN( parseInt(process.argv[i+1]) ) ) {
				expressPort = parseInt(process.argv[i+1]);
				portFound = true;
			} else {
				console.error("The port must be a number.");
				showHelp();
				portFound = true;
			}
		}
	});
	if (isWifi) { drone.createWifi(); } else { drone.create(BT_PORT); }
	server = express();
	server.use("/ui", express.static("./webapp/"));
	server.get("/ui", onUISuccess);
	server.listen(expressPort);
	console.log("Webserver started on port:", expressPort);
	function onUISuccess(req, res) { res.sendFile("index.html"); };
};

function showHelp() {
	console.log("** Node Open Pilot Server **\n");
	console.log("Usage: ");
	console.log("\tnode nop-server.js [BLUETOOTH_PORT] [-p WEBSERVER_PORT]\n");
	console.log("Optional parameters:");
	console.log("\t-p: custom port for webserver. Defaults 3000");
	console.log("\tIf no BLUETOOTH_PORT is provied, will use ESP8266 Wifi settings");
};

parseArgs();