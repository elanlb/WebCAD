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
// load shapes from file and load initial UI
//

var objects = []; // whole JSON containing shapes and operations

$(document).ready(function () {
	updateGeometry(); // load the geometry
	updateShapeList(); // update the list of shapes
	
	$("#shapeSelector").change(updateUI());
	$("#updateButton").click(updateJSON());
});

function updateGeometry () {
	// parse the json loaded from the DB in #json
	objects = JSON.parse(document.getElementById("json").innerText);
	// make these global variables so that other functions can access them
	shapes = objects.shapes;
	operations = objects.operations;
	
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
}

function updateShapeList () {
	// update the list to select the shape to edit
	$("#shapeSelector").empty();
	
	objects.shapes.forEach(function (shape) {
		var option = $("<option></option>");
		option.text(shapes.indexOf(shape) + ": " + shape.name);
		$("#shapeSelector").append(option);
	});
}

function updateUI () {
	console.log("updating");
	// this function updates the properties based on the JSON object
	var shapeName = $("#shapeSelector").val();
	var shape = objects.shapes[parseInt(shapeName)]; // get the int from the selected option
	
	$("#nameField").val(shape.name);
	
	// set the position variables
	$("#xPosition").val(shape.center[0]);
	$("#yPosition").val(shape.center[1]);
	$("#zPosition").val(shape.center[2]);
	
	if (shape.radius != null) {
		// only set the y and z radii if it has them
		if (shape.radius[1] != null) {
			$("#yRadius").prop("disabled", false);
			$("#zRadius").prop("disabled", false);
			
			$("#xRadius").val(shape.radius[0]);
			$("#yRadius").val(shape.radius[1]);
			$("#zRadius").val(shape.radius[2]);
		}
		else {
			// if there is only one radius, make them all the same and only the x can be edited
			$("#yRadius").prop("disabled", true);
			$("#zRadius").prop("disabled", true);
			
			$("#xRadius").val(shape.radius);
			$("#yRadius").val(shape.radius);
			$("#zRadius").val(shape.radius);
		}
	}
	else {
		$("#xRadius").val(1); // set to the default radius if none is supplied
		$("#yRadius").val(1);
		$("#zRadius").val(1);
	}
}

function updateJSON () {
	var shapeName = $("#shapeSelector").val();
	var shape = objects.shapes[parseInt(shapeName)]; // get the int from the selected option
	
	// when the update button is clicked, read the values and update the objects to reload the geometry
	shape.name = $("#nameField").val();
	
	shape.center[0] = parseFloat($("#xPosition").val());
	shape.center[1] = parseFloat($("#yPosition").val());
	shape.center[2] = parseFloat($("#zPosition").val());
	
	shape.radius[0] = parseFloat($("#xRadius").val());
	shape.radius[1] = parseFloat($("#yRadius").val());
	shape.radius[2] = parseFloat($("#zRadius").val());
	
	// update the JSON string with the new values
	objects.shapes[parseInt(shapeName)] = shape;
	
	$("#json").text(JSON.stringify(objects));
	
	// update the geometry
	scene.remove(scene.mesh); // remove the previous mesh
	updateGeometry();
	
	// update the properties menu
	updateShapeList();
	updateUI();
}