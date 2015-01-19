var ModelRenderer = function(){
	var self = this;
	self.models = ["models/Suzanne.js","models/monster.js"];
	self.geometries = [];
	self.types = {
		"DRONE":0,
		"HQ":1,
		"BEAVER":1,
		"TOWER":1,
		"TANK":1,
	};
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
			/*
			for ( var i = 0; i < 500; i ++ ) {
				var mesh = new THREE.Mesh( geometry, normalMaterial );
				mesh.rotation.x = Math.PI/2;
				mesh.position.z = 40;
				mesh.visible = false;
				mesh.castShadow = true;
				objects.push( mesh );
				scene.add( mesh );
			}*/
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
		self.loadModel(loader);
	}

	self.draw = function(scene,simData){
		if(self.models.length>self.loadedModels)
			return;
		var meshCounter = [];
		for(var i=0;i<self.models.length;i++){
			meshCounter.push(0);
		}
		for(var i=0;i<simData.robots.length;i++){
			var robot = simData.robots[i];
			var needMesh = self.types[robot.type];
			meshCounter[needMesh]++;
			var mesh = null;
			if(meshCounter[needMesh]>self.meshes[needMesh].length){
				//mesh = new mesh ...
			}else{
				mesh = self.meshes[needMesh][meshCounter[needMesh]-1];
			}
			//update position ....
		}
	}
}
