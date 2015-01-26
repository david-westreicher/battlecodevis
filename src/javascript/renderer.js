var stats;
var battlecodeCam; var scene, renderer;
var lines,walls,oreMesh2;
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
var mouseDown = null;
var mouseButton = 0;
var mouseDownX = 0;
var mouseDownY = 0;
var CLICK_DRAG_TIME = 200;
init();
modelRenderer.init();
animate();

function initEvents(){
	window.addEventListener( 'resize', onWindowResize, false );
	document.addEventListener( 'mousemove', onDocumentMouseMove, false );
	document.addEventListener( 'click', onDocumentMouseClick, false );
	document.addEventListener( 'mousedown', onDocumentMouseDown, false );
	document.addEventListener( 'mouseup', onDocumentMouseUp, false );
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

function onDocumentMouseDown(event) {
    //console.log(event);
    mouseButton = Math.min(1,event.button);
    mouseDown = (new Date()).getTime();
    mouseDownX = ( event.x - windowHalfX );
    mouseDownY = ( event.y - windowHalfY );
}
function onDocumentMouseUp(event) {
    mouseDown = null;
    battlecodeCam.dragFinished();
}
function onDocumentMouseClick(event) {
    var now = (new Date()).getTime();
    // not a click but a drag MAGIC-CONSTANT!!!
    if(mouseDown+CLICK_DRAG_TIME<now){
        mouseDown = null;
        return;
    }
    mouse.x = ( event.x / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.y / window.innerHeight ) * 2 + 1;
	if(oreMesh!=null){
        raycaster.setFromCamera( mouse, battlecodeCam.cam );
        var intersects = raycaster.intersectObject(oreMesh,false);
        if(intersects.length>0){
            var point = intersects[0].point;
           // battlecodeCam.setCenter(point.x,point.y);
        }
    }
    mouseDown = null;
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

function updateOreUVs(){
	var map = simulation.data.map;
	var geom = oreMesh2.geometry;
	var faceIndex = 0;
	var textureSize = 1.0/4.0;
	var maxOre = simulation.data.map.maxOre;
    for(var x =-1;x<=map.width;x++){
		for(var y =-1;y<=map.height;y++){
			var oreLoc = toOreLoc(x,y);
			if(x==-1||y==-1||x==map.width||y==map.height){
			    //borders
			    faceIndex+=2;
				continue;
			}
			var oreInt = simulation.data.ore[x][y][0];
			var oreTeam = simulation.data.ore[x][y][2];
            var uvs1 = geom.faceVertexUvs[0][faceIndex++];
            var uvs2 = geom.faceVertexUvs[0][faceIndex++];
            var imageIndex = Math.floor(3*oreInt/maxOre);
			if(oreInt<0){
			    //wall
			}else if(oreInt>0){
			    //ore
			    var offset = textureSize*imageIndex;
                uvs1[0].x = offset;
			    uvs1[1].x = textureSize+offset;
			    uvs1[2].x = textureSize+offset;
                uvs2[0].x = textureSize+offset;
			    uvs2[1].x = offset;
			    uvs2[2].x = offset;
			}else{
			    //no ore
			    uvs1[0].x = 0;
			    uvs1[1].x = textureSize;
			    uvs1[2].x = textureSize;
                uvs2[0].x = textureSize;
			    uvs2[1].x = 0;
			    uvs2[2].x = 0;
			}
		}	
	}
	geom.uvsNeedUpdate = true;
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

    var corners = [[-GLOBAL_SCALED2,GLOBAL_SCALED2],[GLOBAL_SCALED2,GLOBAL_SCALED2],[GLOBAL_SCALED2,-GLOBAL_SCALED2],[-GLOBAL_SCALED2,-GLOBAL_SCALED2]];
	var ore2Geom = new THREE.Geometry();
	for(var x =-1;x<=map.width;x++){
		for(var y =-1;y<=map.height;y++){
			var ver = new THREE.Vector3(x*GLOBAL_SCALE-map.width*GLOBAL_SCALED2,-(y*GLOBAL_SCALE-map.height*GLOBAL_SCALED2),0);
			for(var i=0;i<corners.length;i++){
			    var corner = corners[i];
			    ore2Geom.vertices.push(new THREE.Vector3(corner[0]+ver.x,corner[1]+ver.y,0));
			}
			var currentVerIndex = ore2Geom.vertices.length-corners.length;
			var face1 = new THREE.Face3(currentVerIndex,currentVerIndex+2,currentVerIndex+1);
			var face2 = new THREE.Face3(currentVerIndex+2,currentVerIndex,currentVerIndex+3);
			ore2Geom.faces.push(face1);
			ore2Geom.faces.push(face2);
            ore2Geom.faceVertexUvs[0].push([
                    new THREE.Vector2(0,0),
                    new THREE.Vector2(1,1),
                    new THREE.Vector2(1,0)
                    ]);
            ore2Geom.faceVertexUvs[0].push([
                    new THREE.Vector2(1,1),
                    new THREE.Vector2(0,0),
                    new THREE.Vector2(0,1)
                    ]);

		}	
	}
	ore2Geom.uvsNeedUpdate = true;
    var texture = THREE.ImageUtils.loadTexture( "assets/images/floortexture.jpg" );
	oreMesh2 = new THREE.Mesh(ore2Geom,new THREE.MeshBasicMaterial({map:texture}));
	oreMesh2.receiveShadow = true;
    if(map.width%2==0){
		gridMesh.position.x-=GLOBAL_SCALED2;
		//oreMesh2.position.x-=GLOBAL_SCALED2;
    }
	if(map.height%2==0){
		gridMesh.position.y+=GLOBAL_SCALED2;
		//oreMesh2.position.y+=GLOBAL_SCALED2;
	}

	scene.add(oreMesh2);
}
function animate() {
	requestAnimationFrame( animate );

	if(simulation.data.ready && walls==null){
		createMap();
	}
	if(!simulation.data.ready && walls!=null){
		scene.remove(walls);
		walls = null;
		//scene.remove(oreMesh);
		scene.remove(oreMesh2);
		oreMesh2=null;
		oreMesh = null;
		gridMesh.position.x = 0;
		gridMesh.position.y = 0;
	}
	if(simulation.data.oreChanged){
		//updateOreTexture();
		updateOreUVs();
		simulation.data.oreChanged = false;
	}

	var frameMod = frameNum%slowmotion;
	if(frameMod==0 && !gui.controls.isPaused()){
		simulation.simulate();
	}
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
	var now = (new Date()).getTime();
	//if(mouseDown!=null && mouseDown+CLICK_DRAG_TIME<now)
    if(mouseDown!=null){
        if(mouseButton==0){
            battlecodeCam.setCenterDelta((mouseDownX-mouseX),(mouseDownY-mouseY));
        }else{
	        battlecodeCam.updateRotation(((mouseDownX-mouseX)/window.innerWidth),((mouseDownY-mouseY)/window.innerHeight));
        }
    }
	battlecodeCam.update();

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

