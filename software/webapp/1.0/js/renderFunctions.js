var droneRenderSettings = {
	calibrateX: 0, calibrateY: 0, calibrateZ: 0,
	lastX: 0, lastY: 0, lastZ: 0,
	lastUpdate: 0,
	calibrateTime: 0,
};
var droneRender = {
	WIDTH : $('#droneRender').width(), HEIGHT: $('#droneRender').height(),
	VIEW_ANGLE : 45, 
	NEAR : 10, FAR : 1000,
	container: $('#droneRender'),
  	settings: droneRenderSettings,

  	//Functions
  	createRender: createRender,
  	createLight: createLight,
  	render: render,
  	calibrate: calibrate,
  	updateDroneRotation: updateDroneRotation
};
droneRender.ASPECT = droneRender.WIDTH / droneRender.HEIGHT;

var ROTATION_CONSTANT = 6,
	sphereRotation = 0,
	floor,
	ROTATION_FIX = 0.04;

function createRender() {
	var self = this;
	this.renderer = new THREE.WebGLRenderer();
	this.renderer.setSize(this.WIDTH, this.HEIGHT);
	this.camera = new THREE.PerspectiveCamera(this.VIEW_ANGLE, this.ASPECT, 
											  this.NEAR, this.FAR);
	this.camera.position.x = 0;
	this.camera.position.y = 400;
	this.camera.position.z = 550;

	this.scene = new THREE.Scene();
	this.scene.add(new THREE.AxisHelper(3000));

	this.light = this.createLight(200, 200, 200);

	floor = new createBox(200, 300, 2);
	floor.position.y = 0;

	this.scene.add(this.camera);
	this.scene.add(this.light);
	this.scene.add(floor);

	this.container.append(this.renderer.domElement);
	this.camera.lookAt(floor.position);

	requestAnimationFrame(this.render);
};
function createLight(x, y, z) {	
	var light = new THREE.PointLight(0xFFFFFF);
	light.position.x = x;
	light.position.y = y;
	light.position.z = z;
	return light;
};
function render() {
	droneRender.renderer.render(droneRender.scene, droneRender.camera);
	try {
		droneRender.camera.lookAt(floor.position);
	} catch (e) { console.warn("DroneRenderer on render: ", e); }
	requestAnimationFrame(droneRender.render);
};
function calibrate(data) {
	droneRender.settings.rotationX = Math.round(data.x);
	droneRender.settings.rotationY = Math.round(data.y);
	droneRender.settings.rotationZ = Math.round(data.z);
};
function updateDroneRotation(data) {
	if (Math.round(droneRender.settings.rotationX - data.x)) {
		floor.rotation.z = data.x * Math.PI / 180;
	}
	if (Math.round(droneRender.settings.rotationY - data.y)) {
		floor.rotation.x = data.y * Math.PI / 180;
	}
	if (Math.round(droneRender.settings.rotationZ - data.z)) {
		//floor.rotation.y = data.z * Math.PI / 180;	
	}
	droneRender.settings.rotationX = data.x;
	droneRender.settings.rotationY = data.y;
	droneRender.settings.rotationZ = data.z;

};

function createBox(width, height, depth) {
	var geom = new THREE.CubeGeometry(width, depth, height);
	var material = new THREE.MeshLambertMaterial({ color: 0xebebeb });
	var obj = new THREE.Mesh(geom, material);
	return obj;
};