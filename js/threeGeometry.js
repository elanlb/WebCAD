// Created by Elan Bustos Jan 1 2018

// Method returns a geometry object for THREE.js

// inputs a CSG object
CSG.prototype.toThreeGeometry = function () {
	var geometry = new THREE.Geometry();
	
	// add all of the vertices to a list, remove duplicates, then make the faces and find each vertex
	var faces = [];
	var vertices = [];
	
	this.toPolygons().forEach(function (polygon) {
		faces.push(polygon.vertices);
	});
	
	function addIfNot (item, array) {
		// function to add an item to a list unless there is a similar object already there
		var inList = false;
		
		array.forEach(function (element) {
			if (element.x == item.x && element.y == item.y && element.z == item.z) {
				// check if each value of the position variable matches the item in the list
				inList = true;
			}
		});
		
		if (!inList) {
			array.push(item);
			return true;
		}
		
		else {
			return false;
		}
	}
	
	faces.forEach(function (face) {
		face.forEach(function (vertex) {
			// add each vertex to the array
			addIfNot(vertex.pos, vertices);
		});
	});
	
	// add the vertices to the three.js geometry
	vertices.forEach(function (vertex) {
		geometry.vertices.push(new THREE.Vector3(
			vertex.x,
			vertex.y,
			vertex.z
		));
	});
	
	function indexOfSimilar (item, array) {
		// indexOf method on arrays checks for an identical item- this function checks for similar
		
		for (var i = 0; i < array.length; i++) {
			if (array[i].x == item.x && array[i].y == item.y && array[i].z == item.z) {
				return i;
			}
		}
		
		return -1;
	}
	
	this.polygons.forEach(function (polygon) {
		// create a normal and then the faces using the index of similar function
		var normal = new THREE.Vector3(
			polygon.vertices[0].normal.x,
			polygon.vertices[0].normal.y,
			polygon.vertices[0].normal.z
		);
		
		geometry.faces.push(new THREE.Face3(
			indexOfSimilar(polygon.vertices[0].pos, vertices),
			indexOfSimilar(polygon.vertices[1].pos, vertices),
			indexOfSimilar(polygon.vertices[2].pos, vertices),
			normal
		));
		
		if (polygon.vertices.length > 3) {
			geometry.faces.push(new THREE.Face3(
				indexOfSimilar(polygon.vertices[0].pos, vertices),
				indexOfSimilar(polygon.vertices[2].pos, vertices),
				indexOfSimilar(polygon.vertices[3].pos, vertices),
				normal
			));
		}
	});
	
	return geometry;
};