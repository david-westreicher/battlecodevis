var battlecodeCamera = function(){
	var self = this;
	self.cameraDist = 200;
	self.cam = new THREE.PerspectiveCamera(80, window.innerWidth / window.innerHeight, 1, 1000 );

	self.updateRatio = function(){
		self.cam.aspect = window.innerWidth / window.innerHeight;
		self.cam.updateProjectionMatrix();
	}
	self.updateDist = function(isUp){
		if(!isUp){
			self.cameraDist*=1.1;
		}else
			self.cameraDist/=1.1;
		self.cameraDist = Math.min(500,Math.max(10,self.cameraDist));
	}
	self.update = function(angle1,angle2,pos){
		var cameraRadius = Math.abs(Math.sin(angle2))*self.cameraDist;
		self.cam.position.x = Math.sin(angle1)*cameraRadius;
		self.cam.position.y = Math.cos(angle1)*cameraRadius;
		self.cam.position.z = Math.cos(angle2)*self.cameraDist;
		self.cam.up.set(0,0,1);
		self.cam.lookAt(pos);
	}
}
