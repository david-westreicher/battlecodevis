var ModelRenderer = function(){
	var self = this;
	self.models = ["models/Suzanne.js","models/monster.js"];
	self.types = {
		"DRONE":0,
		"HQ":1,
		"BEAVER":1,
		"TOWER":1,
		"TANK":1,
	};
	self.geometries = [];
	self.loadedModels = 0;
	self.meshes = [];

	self.loadModel = function(loader){
		if(self.models.length<=self.loadedModels)
			return;
		var model = self.models[self.loadedModels];
		console.log("loading "+model+"!");
		loader.load(model,function(geometry){
			console.log(self.models[self.loadedModels]+" loaded!");
			geometry.center();
			geometry.computeVertexNormals();
			self.geometries.push(geometry);
			self.loadedModels++;
			self.loadModel(loader);
		});
	}
	self.init = function(){
		for(var i=0;i<self.models.length;i++){
			self.meshes.push([]);
		}
		var loader = new THREE.JSONLoader();
		self.normalMaterial = new THREE.MeshLambertMaterial( { color: 0xffffff } );
        self.redMaterial = new THREE.MeshLambertMaterial( { color: 0xff0000 } );
	    self.blueMaterial = new THREE.MeshLambertMaterial( { color: 0x0000ff } );
		self.loadModel(loader);
	}

	self.createMesh = function(geometry){
		var mesh = new THREE.Mesh( geometry, self.normalMaterial );
		mesh.castShadow = true;
		return mesh;
	}

	self.draw = function(scene,simData){
		if(self.models.length>self.loadedModels)
			return;
		var meshCounter = [];
		for(var i=0;i<self.models.length;i++){
			meshCounter.push(0);
		}
		for(var id in simData.robots){
			var robot = simData.robots[id];
			var needMesh = self.types[robot.type];
			if(!needMesh)
				//default mesh
				needMesh = 0;
			meshCounter[needMesh]++;
			var mesh = null;
			if(meshCounter[needMesh]>self.meshes[needMesh].length){
				mesh = self.createMesh(self.geometries[needMesh]);
				scene.add( mesh );
				self.meshes[needMesh].push(mesh);
			}else{
				mesh = self.meshes[needMesh][meshCounter[needMesh]-1];
			}
			//update position ....
	        var realPos = getInterpPosition(robot);
	        if(needMesh==1)
		        mesh.scale.x = mesh.scale.y = mesh.scale.z = (robot.type=='TOWER'?0.10:0.05);
		    else
		        mesh.scale.x = mesh.scale.y = mesh.scale.z = (robot.type=='TOWER'?60:30);
		    if(robot.type=='TOWER')
			    mesh.scale.z*=0.3;
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
		    mesh.rotation.y = robot.rot;
		    mesh.position.x = realPos[0];
		    mesh.position.y = realPos[1];
		    mesh.position.z = robot.type!='DRONE'?40:200;
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
