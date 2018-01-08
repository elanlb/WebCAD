console.log("Editor script initializing.");

// test for WebGL compatability
if (!Detector.webgl) {
	Detector.addGetWebGLMessage();
}

var editorContainer = document.getElementById("editor");
var width = editorContainer.clientWidth;
var height = window.innerHeight;

// define the scene and camera
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);

var renderer = new THREE.WebGLRenderer();
renderer.setSize(width, height);
document.getElementById("editor").appendChild(renderer.domElement);
// stop some browsers from spitting out errors
renderer.context.getShaderInfoLog = function () { return ''; };


//
// setup controls
//

// orbit viewControls for controlling the view
var viewControls = new THREE.OrbitControls(camera, editorContainer);
viewControls.enableDamping = true;
viewControls.dampingFactor = 0.5;

// set which mouse buttons should be used
viewControls.mouseButtons = {
	ORBIT: THREE.MOUSE.LEFT,
	ZOOM: THREE.MOUSE.MIDDLE,
	PAN: THREE.MOUSE.RIGHT
};

// set camera position
camera.position.z = 5;

// add lights
var light = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.8);
scene.add(light);

var directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
scene.add(directionalLight);

// run renderer
function render () {	
	requestAnimationFrame(render);
	viewControls.update();
	renderer.render(scene, camera);
}
render();


//
// load shapes from file
//
$(document).ready(function () {
	// parse the json loaded from the DB in #json
	var objects = JSON.parse(document.getElementById("json").innerText);
	
	var shapes = objects.shapes;
	var operations = objects.operations;
	
	var thingsToRun = [];
	
	shapes.forEach(function (shape) {
		// now check which attributes the shape has and add if they don't
		var codeToRun = "var shape" + shapes.indexOf(shape) + " = CSG." + shape.shape + "({";
		
		if (shape.center != null) {
			codeToRun += "center:[" + shape.center + "],";
		}
		
		
		if (shape.radius != null) {
			codeToRun += "radius:[" + shape.radius + "],";
		}
		
		codeToRun += "})";
		
		thingsToRun.push(codeToRun);
	});
	
	// reset this so that we can do the operations
	codeToRun = "var output = shape0";
	operations.forEach(function (operation) {
		codeToRun += "." + operation.operation + "(shape" + operation.object + ")";
	});
	thingsToRun.push(codeToRun);
	
	// must do a for loop to make it a global variable
	for (var i = 0; i < thingsToRun.length; i++) {
		eval(thingsToRun[i]);
	}
	
	var geometry = output.toThreeGeometry();

	var material = new THREE.MeshStandardMaterial({color: 0xff0000});
	var mesh = new THREE.Mesh(geometry, material);
	scene.add(mesh);
	
	//
	// load the UI
	//
	shapes.forEach(function (shape) {
		var controlsDiv = $("<div></div>");
		controlsDiv.addClass("row");
		
		var nameField = $("<input>");
		nameField.addClass("form-control");
		nameField.attr("type", "text");
		nameField.attr("value", shape.name);
		controlsDiv.append(nameField);
		
		$("#controls").append(controlsDiv);
	});
});