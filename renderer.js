var stats;
var battlecodeCam;
var scene, renderer;
var objects,lines,walls;
var redMaterial,blueMaterial,normalMaterial;
var mouseX = 0, mouseY = 0;
var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;
var frameNum = 0,interp,isLastFrame;
var redCol = new THREE.Color(0xff0000);
var blueCol = new THREE.Color(0x0000ff);
var slowmotion = 6;
var oreMesh,gridMesh;
init();
animate();

function initEvents(){
	window.addEventListener( 'resize', onWindowResize, false );
	document.addEventListener( 'mousemove', onDocumentMouseMove, false );
	document.addEventListener( 'mousewheel', onDocumentMouseWheel, false );
}

function init() {
	initEvents();
	battlecodeCam = new battlecodeCamera();
	scene = new THREE.Scene();
	objects = [];

	var lineGeom = new THREE.Geometry();
	for(var i=0;i<2*100;i++){
		lineGeom.vertices.push(new THREE.Vector3(0,0,0));
		lineGeom.colors.push(new THREE.Color(0x00ff00));
	}
	lines = new THREE.Line(lineGeom,new THREE.LineBasicMaterial({linewidth:3,vertexColors:THREE.VertexColors}),THREE.LinePieces);
	scene.add(lines);

	var gridGeom = new THREE.Geometry();
	var gridNum = 30;
	var startGrid = -gridNum;
	var gridSize = 80;
	for(var x=-gridNum+1;x<gridNum;x++){
		gridGeom.vertices.push(new THREE.Vector3(x*gridSize,gridNum*gridSize,0));
		gridGeom.vertices.push(new THREE.Vector3(x*gridSize,-gridNum*gridSize,0));
	}
	for(var y=-gridNum+1;y<gridNum;y++){
		gridGeom.vertices.push(new THREE.Vector3(gridNum*gridSize,y*gridSize,0));
		gridGeom.vertices.push(new THREE.Vector3(-gridNum*gridSize,y*gridSize,0));
	}
	gridMesh = new THREE.Line(gridGeom,new THREE.LineBasicMaterial({color:0xCCCCCC}),THREE.LinePieces);
	gridMesh.position.z = 1;
	scene.add(gridMesh);

	normalMaterial = new THREE.MeshLambertMaterial( { color: 0xffffff } );

	redMaterial = new THREE.MeshLambertMaterial( { color: 0xff0000 } );
	blueMaterial = new THREE.MeshLambertMaterial( { color: 0x0000ff } );
	var loader = new THREE.JSONLoader();
	loader.load( 'models/monster.js', function ( geometry ) {
		geometry.center();
		geometry.computeVertexNormals();
		for ( var i = 0; i < 500; i ++ ) {
			var mesh = new THREE.Mesh( geometry, normalMaterial );
			mesh.rotation.x = Math.PI/2;
			mesh.position.z = 40;
			mesh.visible = false;
			mesh.castShadow = true;
			objects.push( mesh );
			scene.add( mesh );
		}
	});

	//LIGHT
	var light = new THREE.DirectionalLight(0xffffff, 1);
	light.castShadow = true;
	//light.shadowCameraVisible = true;
	light.shadowCameraNear = 100;
	light.shadowCameraFar = 600;
	light.shadowCameraLeft = -2500;
	light.shadowCameraRight = 2500;
	light.shadowCameraTop = 2500;
	light.shadowCameraBottom = -2500;
	light.position.set(0,0,500);
	scene.add(light);
}

function onWindowResize() {
	windowHalfX = window.innerWidth / 2;
	windowHalfY = window.innerHeight / 2;
	battlecodeCam.updateRatio();
	renderer.setSize( window.innerWidth, window.innerHeight );
}

function onDocumentMouseMove(event) {
	mouseX = ( event.clientX - windowHalfX );
	mouseY = ( event.clientY - windowHalfY );
}

function onDocumentMouseWheel(event) {
	battlecodeCam.updateDist(event.wheelDelta>0||event.wheelDeltaY>0);
}

function toOreLoc(x,y){
	var map = replayData.maplist[0];
	return [(((128-map.width)/2)|0)+x,(((128-map.height)/2)|0)+y];
}

function updateOreTexture(){
	var size = 128;
	var textureData;
	var map = replayData.maplist[0];
	if(oreMesh==null){
		textureData = new Uint8Array(size*size*3);
		for(var x =0;x<=size;x++){
			for(var y =0;y<=size;y++){
				var dataIndex = (x+y*size)*3;
				textureData[dataIndex+0]= 255;
				textureData[dataIndex+1]= 255;
				textureData[dataIndex+2]= 255;
			}
		}
	}else
		textureData = oreMesh.material.map.image.data;
	for(var x =0;x<map.width;x++){
		for(var y =0;y<map.height;y++){
			var oreLoc = toOreLoc(x,y);
			var oreInt = simulationData.ore[x][y][1];
			var oreTeam = simulationData.ore[x][y][2];
			var dataIndex = (oreLoc[0]+oreLoc[1]*128)*3;
			if(oreInt<0){
				textureData[dataIndex+0]= 127;
				textureData[dataIndex+1]= 127;
				textureData[dataIndex+2]= 127;
			}else if(oreInt>0){
				var minCol = Math.max(50,255-oreInt*6);
				textureData[dataIndex+0]= (oreTeam=='A'?1:0.5)*minCol;
				textureData[dataIndex+1]= minCol*0.5;
				textureData[dataIndex+2]= (oreTeam!='A'?1:0.5)*minCol;
			}else{
				textureData[dataIndex+0]= 255;
				textureData[dataIndex+1]= 255;
				textureData[dataIndex+2]= 255;
			}
		}	
	}
	if(oreMesh==null){
		//var oreTexture = new THREE.DataTexture(textureData, size, size, THREE.RGBFormat, THREE.UnsignedByteType, THREE.UVMapping,THREE.ClampToEdgeWrapping,THREE.ClampToEdgeWrapping,THREE.NearestFilter, THREE.NearestMipMapLinearFilter );
		var oreTexture = new THREE.DataTexture(textureData, size, size, THREE.RGBFormat);
		oreMesh = new THREE.Mesh(new THREE.PlaneGeometry(size*80,size*80),
				new THREE.MeshBasicMaterial({map:oreTexture}));
		oreMesh.receiveShadow = true;
		if(map.width%2==0){
			gridMesh.position.x-=40;
			oreMesh.position.x-=40;}
		if(map.height%2==0){
			gridMesh.position.y+=40;
			oreMesh.position.y+=40;}
		scene.add(oreMesh);
	}
	oreMesh.material.map.needsUpdate = true;
}

function createMap(){
	var map = replayData.maplist[0];
	var tiles = map.tiles;
	var mapGeom = new THREE.Geometry();
	for(var x =-1;x<=map.width;x++){
		for(var y =-1;y<=map.height;y++){
			if(x==-1||y==-1||x==map.width||y==map.height||tiles.charAt(x+y*map.width)=='#')
				mapGeom.vertices.push(new THREE.Vector3(x*80-map.width*40,-(y*80-map.height*40),0));
		}	
	}
	walls = new THREE.PointCloud(mapGeom,new THREE.PointCloudMaterial({size:100,color:0x777777}));
	walls.position.z = 50;
	scene.add(walls);
}
function animate() {
	requestAnimationFrame( animate );

	if(simulationData.ready && walls==null){
		createMap();
	}
	if(!simulationData.ready && walls!=null){
		scene.remove(walls);
		walls = null;
		scene.remove(oreMesh);
		oreMesh = null;
		gridMesh.position.x = 0;
		gridMesh.position.y = 0;
	}
	if(simulationData.oreChanged){
		updateOreTexture();
		simulationData.oreChanged = false;
	}

	var frameMod = frameNum%slowmotion;
	if(frameMod==0)
		simulate();
	interp = frameMod/slowmotion;
	isLastFrame = frameMod==(slowmotion-1);
	frameNum++;

	render();
	stats.update();
}

function locToMap(loc){
	var mapLoc = [0,0];
	var map = replayData.maplist[0];
	mapLoc[0] = (loc[0]-map.originX-map.width/2)*80;
	mapLoc[1] = -(loc[1]-map.originY-map.height/2)*80;
	return mapLoc;
}
function interpolate(arr2,arr1,interp){
	var result = [0,0];
	result[0] = arr1[0]*interp+(1-interp)*arr2[0];
	result[1] = arr1[1]*interp+(1-interp)*arr2[1];
	return result;	
}

function getInterpPosition(robot){
	var realPos = locToMap(robot.loc);
	if(robot.hasInterp){
		var mapLocOld = locToMap(robot.lastloc);
		realPos = interpolate(mapLocOld,realPos,interp);
		if(isLastFrame)
			robot.hasInterp=false;
	}
	return realPos;
}

function render() {
	//update camera
	var cameraAngle = (mouseX/windowHalfX)*Math.PI*2;
	var cameraAngle2 = (mouseY/windowHalfY+1)*Math.PI/4;
	battlecodeCam.update(cameraAngle,cameraAngle2,scene.position);

	//draw shoot lines
	var simulines = simulationData.lines;
	for(var i=0;i<lines.geometry.vertices.length;i+=2){
		if(i<simulines.length*2){
			var robot = simulines[i/2][0];
			var start = locToMap(robot.loc);
			var end = locToMap(simulines[i/2][1]);
			var col = robot.team=='A'?redCol:blueCol;
			lines.geometry.vertices[i].set(start[0],start[1],(robot.type!='DRONE'?40:200)-20);
			lines.geometry.vertices[i+1].set(end[0],end[1],0);
			lines.geometry.colors[i].set(col);
			lines.geometry.colors[i+1].set(col);
		}else{
			lines.geometry.vertices[i].set(0,0,0);
			lines.geometry.vertices[i+1].set(0,0,0);
		}
	}
	lines.geometry.verticesNeedUpdate = true;
	lines.geometry.colorsNeedUpdate = true;

	//update meshes
	var meshi = 0;
	for (var id in simulationData.robots){
		var robot = simulationData.robots[id];
		var realPos = getInterpPosition(robot);
		objects[meshi].scale.x = objects[meshi].scale.y = objects[meshi].scale.z = (robot.type=='TOWER'?0.10:0.05);
		if(robot.type=='TOWER')
			objects[meshi].scale.z*=0.3;
		var yDif = robot.lastloc[1]-robot.loc[1];
		var xDif = robot.lastloc[0]-robot.loc[0];
		var angleDiff = -Math.atan2(yDif,xDif)+Math.PI-robot.rot;
		while(Math.abs(angleDiff)>Math.PI*2){
			if(angleDiff>0)
				angleDiff-=Math.PI*2;
			else
				angleDiff+=Math.PI*2;
		}
		robot.rot += (angleDiff)/slowmotion;
		objects[meshi].rotation.y = robot.rot;
		objects[meshi].position.x = realPos[0];
		objects[meshi].position.y = realPos[1];
		objects[meshi].position.z = robot.type!='DRONE'?40:200;
		objects[meshi].material = (robot.team=='A')?redMaterial:blueMaterial;
		objects[meshi].visible = true;
		meshi++;
	}
	for(var i=meshi;i<objects.length;i++){
		objects[i].visible = false;
	}

	renderer.render( scene, battlecodeCam.cam );
}

