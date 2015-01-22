var ModelRenderer = function(){
	var self = this;
	self.types = {
		"AEROSPACELAB":{model:"models/box.js"},
		"BARRACKS":{model:"models/box.js"},
		"BASHER":{model:"models/Suzanne.js"},
		"BEAVER":{model:"models/Suzanne.js"},
		"COMMANDER":{model:"models/Suzanne.js"}, 
		"COMPUTER":{model:"models/box.js"},
		"DRONE":{model:"models/drone.js",height:25,shootHeight:25},
		"HANDWASHSTATION":{model:"models/box.js"},
		"HELIPAD":{model:"models/box.js"},
		"HQ":{model:"models/hq.js",shootHeight:40},
		"LAUNCHER":{model:"models/Suzanne.js"},
		"MINER":{model:"models/Suzanne.js"},
		"MINERFACTORY":{model:"models/box.js"},
		"MISSILE":{model:"models/missile.js",height:25},
		"SOLDIER":{model:"models/Suzanne.js"},
		"SUPPLYDEPOT":{model:"models/box.js"},
		"TANK":{model:"models/Suzanne.js"},
		"TANKFACTORY":{model:"models/box.js"},
		"TECHNOLOGYINSTITUTE":{model:"models/box.js"},
		"TOWER":{model:"models/tower.js",shootHeight:22},
		"TRAININGFIELD":{model:"models/box.js"},
	};
	self.geometries = [];
	self.meshes = [];

	self.loadModel = function(loader){
		if(self.models.length<=self.geometries.length)
			return;
		var model = self.models[self.geometries.length];
		console.log("loading "+model+"!");
		loader.load(model,function(geometry){
			console.log(self.models[self.geometries.length]+" loaded!");
			//geometry.computeVertexNormals();
			for(var type in self.types){
			    var currentType = self.types[type]
	            if(self.models[self.geometries.length]==currentType.model)
                    currentType.modelID = self.geometries.length;
	        }
			self.meshes.push([]);
			self.geometries.push(geometry);
			self.loadModel(loader);
		});
	}

	self.createModelsArray = function(){
	    self.models = [];
	    for(var type in self.types){
	        var model = self.types[type].model;
	        var isAlreadyHere = false;
	        for(var i=0;i<self.models.length;i++){
	            if(self.models[i]==model){
	                isAlreadyHere = true;
	                break;
	            }
	        }
	        if(!isAlreadyHere)
	            self.models.push(model);
	    }
	}

	self.init = function(){
	    self.meshes = [];
		var loader = new THREE.JSONLoader();
		self.normalMaterial = new THREE.MeshLambertMaterial( { color: 0xffffff } );
        self.redMaterial = new THREE.MeshLambertMaterial( { color: 0xff0000 } );
	    self.blueMaterial = new THREE.MeshLambertMaterial( { color: 0x0000ff } );
	    self.createModelsArray();
		self.loadModel(loader);
	}

	self.createMesh = function(geometry){
		var mesh = new THREE.Mesh( geometry, self.normalMaterial );
		mesh.rotation.x = Math.PI/2;
		mesh.scale.x = mesh.scale.y = mesh.scale.z = 5; 
		mesh.castShadow = true;
		return mesh;
	}

	self.interpolateRot = function(from,to,interp){
	    var angleDiff = to-from;
	    //normalize to [-Math.PI*2,Math.PI*2]
		while(Math.abs(angleDiff)>=Math.PI*2){
			if(angleDiff>0)
				angleDiff-=Math.PI*2;
			else
				angleDiff+=Math.PI*2;
		}
		//normalize to [0,Math.PI*2]
		if(angleDiff<0)
		    angleDiff = Math.PI*2+angleDiff;
		//normalize to [-Math.PI,Math.PI]
		if(angleDiff>Math.PI)
		    angleDiff = angleDiff-Math.PI*2;
		to = angleDiff+from;
		return to*interp+from*(1-interp);
	}

	self.draw = function(scene,simData){
		if(self.models.length>self.geometries.length)
			return;
		var meshCounter = [];
		for(var i=0;i<self.models.length;i++){
			meshCounter.push(0);
		}
		for(var id in simData.robots){
			var robot = simData.robots[id];
			var type = self.types[robot.type];
			var modelID = type.modelID;
			if(!modelID)
				//default mesh
				modelID = 0;
			meshCounter[modelID]++;
			var mesh = null;
			if(meshCounter[modelID]>self.meshes[modelID].length){
				mesh = self.createMesh(self.geometries[modelID]);
				scene.add( mesh );
				self.meshes[modelID].push(mesh);
			}else{
				mesh = self.meshes[modelID][meshCounter[modelID]-1];
			}
			//update position ....
		    var yDif = robot.lastloc[1]-robot.loc[1];
		    var xDif = robot.lastloc[0]-robot.loc[0];
		    var toRot = (xDif==0&&yDif==0)?0:(-Math.atan2(yDif,xDif)+Math.PI);
		    mesh.rotation.y = self.interpolateRot(robot.rot,toRot,interp);
		    if(robot.hasInterp && isLastFrame){
		        robot.rot = toRot;
		        mesh.rotation.y = toRot;
		    }
	        var realPos = getInterpPosition(robot);
		    mesh.position.x = realPos[0];
		    mesh.position.y = realPos[1];
		    mesh.position.z = type.height?type.height:0;
		    mesh.material = (robot.team=='A')?self.redMaterial:self.blueMaterial;
		}
		//remove unnecessary meshes if meshCounter[i]<self.meshes[i]
		for(var i=0;i<meshCounter.length;i++){
		    while(meshCounter[i]<self.meshes[i].length){
		        var meshToDelete = self.meshes[i].pop();
		        scene.remove(meshToDelete);
		    }
		}
	}
}
