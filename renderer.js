var stats;
var battlecodeCam; var scene, renderer;
var lines,walls;
var mouseX = 0, mouseY = 0;
var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;
var frameNum = 0,interp,isLastFrame; 
var redCol = new THREE.Color(0xff0000);
var blueCol = new THREE.Color(0x0000ff);
var slowmotion = 4;
var oreMesh,gridMesh;
var modelRenderer = new ModelRenderer();
var explosionRenderer = new ExplosionRenderer();
var GLOBAL_SCALE = 10;
var GLOBAL_SCALED2 = GLOBAL_SCALE/2;
var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();
init();
modelRenderer.init();
animate();

function initEvents(){
	window.addEventListener( 'resize', onWindowResize, false );
	document.addEventListener( 'mousemove', onDocumentMouseMove, false );
	document.addEventListener( 'click', onDocumentMouseClick, false );
	if(navigator.userAgent.indexOf('Firefox')!=-1)
        document.addEventListener( 'DOMMouseScroll', onDocumentMouseWheel, false );
    else
	    document.addEventListener( 'mousewheel', onDocumentMouseWheel, false );
}

function init() {
	initEvents();
	battlecodeCam = new battlecodeCamera();
	scene = new THREE.Scene();
    explosionRenderer.init(scene);

	var lineGeom = new THREE.Geometry();
	for(var i=0;i<2*100;i++){
		lineGeom.vertices.push(new THREE.Vector3(0,0,0));
		lineGeom.colors.push(new THREE.Color(0x00ff00));
	}
	lines = new THREE.Line(lineGeom,new THREE.LineBasicMaterial({linewidth:3,vertexColors:THREE.VertexColors}),THREE.LinePieces);
	scene.add(lines);

	var gridGeom = new THREE.Geometry();
	var gridNum = 60;
	var startGrid = -gridNum;
	var gridSize = GLOBAL_SCALE;
	for(var x=-gridNum+1;x<gridNum;x++){
		gridGeom.vertices.push(new THREE.Vector3(x*gridSize,gridNum*gridSize,0));
		gridGeom.vertices.push(new THREE.Vector3(x*gridSize,-gridNum*gridSize,0));
	}
	for(var y=-gridNum+1;y<gridNum;y++){
		gridGeom.vertices.push(new THREE.Vector3(gridNum*gridSize,y*gridSize,0));
		gridGeom.vertices.push(new THREE.Vector3(-gridNum*gridSize,y*gridSize,0));
	}
	gridMesh = new THREE.Line(gridGeom,new THREE.LineBasicMaterial({color:0xCCCCCC}),THREE.LinePieces);
	gridMesh.position.z = 0.1;
	scene.add(gridMesh);

	//LIGHT
	var light = new THREE.DirectionalLight(0xffffff, 1);
	light.castShadow = true;
	//light.shadowCameraVisible = true;
    var ratio = GLOBAL_SCALE/80;
    //TODO set shadow quality to gui
    //light.shadowMapWidth = 1024*2;
    //light.shadowMapHeight = 1024*2;
	light.shadowCameraNear = 100*ratio;
	light.shadowCameraFar = 600*ratio;
	light.shadowCameraLeft = -2500*ratio;
	light.shadowCameraRight = 2500*ratio;
	light.shadowCameraTop = 2500*ratio;
	light.shadowCameraBottom = -2500*ratio;
	light.position.set(0,0,500*ratio);
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

function onDocumentMouseClick(event) {
    console.log(event);
    mouse.x = ( event.x / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.y / window.innerHeight ) * 2 + 1;
	if(oreMesh!=null){
        raycaster.setFromCamera( mouse, battlecodeCam.cam );
        var intersects = raycaster.intersectObject(oreMesh,false);
        if(intersects.length>0){
            console.log(intersects);
            var point = intersects[0].point;
            battlecodeCam.setCenter(point.x,point.y);
        }
    }
}

function onDocumentMouseWheel(event) {
    //TODO doesnt work in firefox?
    var delta = (navigator.userAgent.indexOf('Firefox')!=-1)?(-event.detail):(event.wheelDelta>0||event.wheelDeltaY>0)
	battlecodeCam.updateDist(delta>0);
}

function toOreLoc(x,y){
	var map = simulation.data.map;
	return [(((128-map.width)/2)|0)+x,(((128-map.height)/2)|0)+y];
}

function updateOreTexture(){
	var size = 128;
	var textureData;
	var map = simulation.data.map;
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
	for(var x =-1;x<=map.width;x++){
		for(var y =-1;y<=map.height;y++){
			var oreLoc = toOreLoc(x,y);
			var dataIndex = (oreLoc[0]+oreLoc[1]*128)*3;
			if(x==-1||y==-1||x==map.width||y==map.height){
			    //borders
                textureData[dataIndex+0]= 127;
				textureData[dataIndex+1]= 127;
				textureData[dataIndex+2]= 127;
				continue;
			}
			var oreInt = simulation.data.ore[x][y][1];
			var oreTeam = simulation.data.ore[x][y][2];
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
		oreMesh = new THREE.Mesh(new THREE.PlaneGeometry(size*GLOBAL_SCALE,size*GLOBAL_SCALE),
				new THREE.MeshBasicMaterial({map:oreTexture}));
		oreMesh.receiveShadow = true;
		if(map.width%2==0){
			gridMesh.position.x-=GLOBAL_SCALED2;
			oreMesh.position.x-=GLOBAL_SCALED2;}
		if(map.height%2==0){
			gridMesh.position.y+=GLOBAL_SCALED2;
			oreMesh.position.y+=GLOBAL_SCALED2;}
		scene.add(oreMesh);
	}
	oreMesh.material.map.needsUpdate = true;
}

function createMap(){
	var map = simulation.data.map;
	var tiles = map.tiles;
	var mapGeom = new THREE.Geometry();
	for(var x =-1;x<=map.width;x++){
		for(var y =-1;y<=map.height;y++){
			if(x==-1||y==-1||x==map.width||y==map.height||tiles.charAt(x+y*map.width)=='#')
				mapGeom.vertices.push(new THREE.Vector3(x*GLOBAL_SCALE-map.width*GLOBAL_SCALED2,-(y*GLOBAL_SCALE-map.height*GLOBAL_SCALED2),0));
		}	
	}
	walls = new THREE.PointCloud(mapGeom,new THREE.PointCloudMaterial({size:GLOBAL_SCALE*1.5,color:0x777777}));
	walls.position.z = 50*GLOBAL_SCALE/80;
	scene.add(walls);
}
function animate() {
	requestAnimationFrame( animate );

	if(simulation.data.ready && walls==null){
		createMap();
	}
	if(!simulation.data.ready && walls!=null){
		scene.remove(walls);
		walls = null;
		scene.remove(oreMesh);
		oreMesh = null;
		gridMesh.position.x = 0;
		gridMesh.position.y = 0;
	}
	if(simulation.data.oreChanged){
		updateOreTexture();
		simulation.data.oreChanged = false;
	}

	var frameMod = frameNum%slowmotion;
	if(frameMod==0)
		simulation.simulate();
	interp = frameMod/slowmotion;
	isLastFrame = frameMod==(slowmotion-1);
	frameNum++;

	render();
	stats.update();
}

function interpolate(arr2,arr1,interp){
	var result = [0,0];
	result[0] = arr1[0]*interp+(1-interp)*arr2[0];
	result[1] = arr1[1]*interp+(1-interp)*arr2[1];
	return result;	
}

function getInterpPosition(robot){
	var realPos = robot.loc;
	if(robot.hasInterp){
		realPos = interpolate(robot.lastloc,realPos,interp);
		if(isLastFrame)
			robot.hasInterp=false;
	}
	return realPos;
}

function render() {
	//update camera
	battlecodeCam.update((mouseX/windowHalfX),(mouseY/windowHalfY+1),scene.position);

	//draw shoot lines
	var simulines = simulation.data.lines;
	for(var i=0;i<lines.geometry.vertices.length;i+=2){
		if(i<simulines.length*2){
			var start = simulines[i/2][0];
			var end = simulines[i/2][1];
			var col = simulines[i/2][2]=='A'?redCol:blueCol;
			lines.geometry.vertices[i].set(start[0],start[1],start[2]);
			lines.geometry.vertices[i+1].set(end[0],end[1],end[2]);
			lines.geometry.colors[i].set(col);
			lines.geometry.colors[i+1].set(col);
		}else{
			lines.geometry.vertices[i].set(0,0,0);
			lines.geometry.vertices[i+1].set(0,0,0);
		}
	}
	lines.geometry.verticesNeedUpdate = true;
	lines.geometry.colorsNeedUpdate = true;

	modelRenderer.draw(scene,simulation.data);
	explosionRenderer.draw(scene,simulation.data.explosions);

	renderer.render( scene, battlecodeCam.cam );
}

