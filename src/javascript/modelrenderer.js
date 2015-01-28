var ModelRenderer = function(){
	var self = this;
	
	self.geometries = [];
	self.meshes = [];
	self.types = RobotTypes;
	self.materials = [];

	self.loadModel = function(loader){
		if(self.models.length<=self.geometries.length)
			return;
		var model = self.models[self.geometries.length];
		console.log("loading "+model+"!");
		loader.load(model,function(geometry, materials){
			console.log(self.models[self.geometries.length]+" loaded!");
			if(geometry.vertices.length==0)
			    console.error("No vertices in model"+self.models[self.geometries.length]+", something is wrong");
			//geometry.computeVertexNormals();
			for(var type in self.types){
			    var currentType = self.types[type];
	            if(self.models[self.geometries.length]==currentType.model)
                    currentType.modelID = self.geometries.length;
	        }
			self.meshes.push([]);
			self.geometries.push(geometry);
			
			if(!materials) materials = array();
			self.materials.push(materials);
			//self.materials.push(materials);
			//console.log(materials);
			self.loadModel(loader);
		});
	};

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
	};

	self.init = function(){
	    self.meshes = [];
		var loader = new THREE.JSONLoader();
		self.normalMaterial = new THREE.MeshPhongMaterial( { color: 0xffffff, name: 'TEAM' } );
        self.redMaterial = new THREE.MeshPhongMaterial( { color: 0xff0000, name: 'TEAM' } );
        self.redLightMaterial = new THREE.MeshPhongMaterial( { color: 0xff44444, name: 'TEAM' } );
	    self.blueMaterial = new THREE.MeshPhongMaterial( { color: 0x0000ff, name: 'TEAM' } );
	    self.blueLightMaterial = new THREE.MeshPhongMaterial( { color: 0x4444ff , name: 'TEAM'} );
	    self.createModelsArray();
		self.loadModel(loader);
	};

	self.createMesh = function(geometry, material){
		if(!material) material = self.normalMaterial;
		var mesh = new THREE.Mesh( geometry, material );
		mesh.rotation.x = Math.PI/2;
		mesh.scale.x = mesh.scale.y = mesh.scale.z = 5; 
		mesh.castShadow = true;
		return mesh;
	};

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
	};
	
	
	self.changeTeamMaterial = function(materials, team, supply)
	{
		for(var k=0; k<materials.length; k++){
			if(materials[k].name == 'TEAM'){
                if(team=='A'){
		            if(supply>=1)
		                materials[k] = self.redMaterial;
		            else
		                materials[k] = self.redLightMaterial;
		        }else{
                    if(supply>=1)
		                materials[k] = self.blueMaterial;
		            else
		                materials[k] = self.blueLightMaterial;
		        }
			    break;
			}
		}
	};

	self.copyMaterial = function(materials){
	    var materialsCopy = [];
        for(var l=0;l<materials.length;l++){
            var mat = materials[l];
            if(mat.name=='TEAM')
                mat = self.blueMaterial;
            materialsCopy.push(mat);
        }
        return materialsCopy;
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
				//change team material
				var materials = self.copyMaterial(self.materials[modelID]);
				mesh = self.createMesh(self.geometries[modelID], new THREE.MeshFaceMaterial(materials));
				scene.add( mesh );
				self.meshes[modelID].push(mesh);
			}else{
				mesh = self.meshes[modelID][meshCounter[modelID]-1];
			}
			//update position ....
		    var yDif = -(robot.lastloc[1]-robot.loc[1]);
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
		    mesh.position.z = robot.z;
		    if(!robot.dead)
		        robot.z += (type.height-robot.z)/slowmotion;
			self.changeTeamMaterial(mesh.material.materials, robot.team, robot.supply);
		}
		//remove unnecessary meshes if meshCounter[i]<self.meshes[i]
		for(var i=0;i<meshCounter.length;i++){
		    while(meshCounter[i]<self.meshes[i].length){
		        var meshToDelete = self.meshes[i].pop();
		        scene.remove(meshToDelete);
		    }
		}
	};
};
