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
// load shapes from file and load UI
//

var objects = []; // whole object containing shapes and operations

$(document).ready(function () {
	updateGeometry(); // load the geometry
	updateShapeList(); // update the list of shapes

	updateUI();

	$("#addCube").click(function () {
		objects.shapes.push({"name":"cube", "shape":"cube", "center":[0, 0, 0], "radius":[1, 1, 1], "operation":"union"});
		update();
	});
	$("#addSphere").click(function () {
		objects.shapes.push({"name":"sphere", "shape":"sphere", "center":[0, 0, 0], "radius":1, "operation":"union"});
		update();
	});
	$("#addCylinder").click(function () {
		objects.shapes.push({"name":"cylinder", "shape":"cylinder", "center":[0, 0, 0], "radius":1, "start":[0, -1, 0], "end":[0, 1, 0], "operation":"union"});
		update();
	});
	$("#removeShape").click(function () {
		var selectedShape = parseInt($("#shapeSelector").val());
		objects.shapes.splice(selectedShape, 1); // remove the current shape

		if (selectedShape - 1 >= 0) {
			var previousShape = $("#shapeSelector").children().eq(selectedShape - 1).val();
		}
		update();

		$("#shapeSelector").val(previousShape);
	});

	$("#shapeSelector").change(function () {
		updateUI();
	});

	$("#updateButton").click(update);
});

function update () {
	updateShapeList(); // the update json needs the shape list to work

	updateJSON();
	// update the geometry
	updateGeometry();

	// update the properties menu
	updateUI();

	updateShapeList(); // one more time to set shape names after read by updateJSON
}

function updateShapeList () {
	// get the current selection so that the list stays on the same item after they update
	if ($("#shapeSelector option").length) {
		var currentShapeNumber = parseInt($("#shapeSelector").val());
	}

	// update the list to select the shape to edit
	$("#shapeSelector").empty();

	objects.shapes.forEach(function (shape) {
		var option = $("<option></option>");
		option.text(objects.shapes.indexOf(shape) + ": " + shape.name);
		$("#shapeSelector").append(option);
	});

	if (currentShapeNumber != null && objects.shapes[currentShapeNumber] != null) {
		$("#shapeSelector").val(
			$("#shapeSelector option").get(currentShapeNumber).text
		);
	}
}

function updateGeometry () {
	// parse the json loaded from the DB in #json
	objects = JSON.parse(document.getElementById("json").value);

	var thingsToRun = []; // array containing code to execute to generate the shapes

	objects.shapes.forEach(function (shape) {
		// now check which attributes the shape has and add if they don't
		var codeToRun = "var shape" + objects.shapes.indexOf(shape) + " = CSG." + shape.shape + "({";

		if (shape.center != null) {
			codeToRun += "center:[" + shape.center + "],";
		}

		if (shape.radius != null) {
			codeToRun += "radius:[" + shape.radius + "],";
		}

		// if the shape is a cylinder and has a start and end, set them
		if (shape.start != null) {
			codeToRun += "start:[" + shape.start + "],";
		}
		if (shape.end != null) {
			codeToRun += "end:[" + shape.end + "],";
		}

		codeToRun += "})";
		thingsToRun.push(codeToRun);
	});

	// reset this so that we can do the operations
	codeToRun = "var output = shape0"; // start with shape0
	objects.shapes.forEach(function (shape, index) {
		if (index > 0) {
			codeToRun += "." + shape.operation + "(shape" + objects.shapes.indexOf(shape) + ")";
		}
	});
	thingsToRun.push(codeToRun);

	// remove mesh from scene
	scene.children.forEach(function (child) {
		if (child instanceof THREE.Mesh) {
			scene.children.splice(scene.children.indexOf(child));
		}
	});

	// must do a for loop to make it a global variable
	for (var i = 0; i < thingsToRun.length; i++) {
		eval(thingsToRun[i]);
	}

	var geometry = output.toThreeGeometry();

	var material = new THREE.MeshStandardMaterial({color: 0xff0000});
	var mesh = new THREE.Mesh(geometry, material);
	scene.add(mesh);
}

function updateUI () {
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

	// if the shape is a cylinder, set the start and end
	// otherwise, disable those fields and set them to blank
	if (shape.shape == "cylinder") {
		$("#xStart").prop("disabled", false); $("#xStart").val(shape.start[0]);
		$("#yStart").prop("disabled", false); $("#yStart").val(shape.start[1]);
		$("#zStart").prop("disabled", false); $("#zStart").val(shape.start[2]);
		$("#xEnd").prop("disabled", false); $("#xEnd").val(shape.end[0]);
		$("#yEnd").prop("disabled", false); $("#yEnd").val(shape.end[1]);
		$("#zEnd").prop("disabled", false); $("#zEnd").val(shape.end[2]);
	}
	else {
		$("#xStart").prop("disabled", true); $("#xStart").val("");
		$("#yStart").prop("disabled", true); $("#yStart").val("");
		$("#zStart").prop("disabled", true); $("#zStart").val("");
		$("#xEnd").prop("disabled", true); $("#xEnd").val("");
		$("#yEnd").prop("disabled", true); $("#yEnd").val("");
		$("#zEnd").prop("disabled", true); $("#zEnd").val("");
	}

	// set the operation selector
	// check if the shape isn't the first
	if (objects.shapes.indexOf(shape) > 0) {
		if (shape.operation != null) {
			$("#operationSelector").prop("disabled", false);
			$("#operationSelector").val(shape.operation);
		}
		else {
			$("#operationSelector").prop("disabled", false);
			$("#operationSelector").val("union");
		}
	}
	else {
		$("#operationSelector").prop("disabled", true);
		$("#operationSelector").val("");
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

	if (!$("#yRadius").prop("disabled")) { // if there is more than one radius
		shape.radius[0] = parseFloat($("#xRadius").val());
		shape.radius[1] = parseFloat($("#yRadius").val());
		shape.radius[2] = parseFloat($("#zRadius").val());
	}
	else {
		shape.radius = parseFloat($("#xRadius").val());
	}

	// check if the shape is a cylinder to set the start and end values
	if (shape.shape == "cylinder") {
		shape.start[0] = parseFloat($("#xStart").val());
		shape.start[1] = parseFloat($("#yStart").val());
		shape.start[2] = parseFloat($("#zStart").val());
		shape.end[0] = parseFloat($("#xEnd").val());
		shape.end[1] = parseFloat($("#yEnd").val());
		shape.end[2] = parseFloat($("#zEnd").val());
	}
	else {
		// if it's not a cylinder, do nothing
	}

	shape.operation = $("#operationSelector").val();

	// update the JSON string with the new values
	objects.shapes[parseInt(shapeName)] = shape;

	$("#json").text(JSON.stringify(objects));
}
