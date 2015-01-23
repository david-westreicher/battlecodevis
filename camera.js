var battlecodeCamera = function(){
	var self = this;
	self.cameraDist = 200;
	self.cam = new THREE.PerspectiveCamera(80, window.innerWidth / window.innerHeight, 1, 1000 );
	self.center = new THREE.Vector3(0,0,0);
	self.toCenter = new THREE.Vector3(0,0,0);
	self.angle1 = 0;
	self.angle2 = Math.PI/2;

    self.setCenter = function(x,y){
        self.toCenter.x = x;
        self.toCenter.y = y;
    }
	self.updateRatio = function(){
		self.cam.aspect = window.innerWidth / window.innerHeight;
		self.cam.updateProjectionMatrix();
	}
	self.updateDist = function(isUp){
		if(!isUp){
			self.cameraDist*=1.1;
		}else
			self.cameraDist/=1.1;
		self.cameraDist = Math.min(600,Math.max(20,self.cameraDist));
		self.updateRotation(0);
		self.update();
	}
	self.update = function(){
        self.cam.position.x = Math.sin(self.angle1)*self.cameraRadius+self.center.x;
		self.cam.position.y = Math.cos(self.angle1)*self.cameraRadius+self.center.y;
		self.cam.position.z = Math.cos(self.angle2)*self.cameraDist;
		self.cam.up.set(0,0,1);
		self.cam.lookAt(self.center);
		self.center.x+=(self.toCenter.x-self.center.x)/10;
		self.center.y+=(self.toCenter.y-self.center.y)/10;
	}
	self.updateRotation = function(deltaMouseX){
        self.angle1 += deltaMouseX/30;
	    self.angle2 = ((self.cameraDist-10)/580+1)*Math.PI/2+Math.PI;//mouseY*Math.PI/4;
		self.cameraRadius = Math.abs(Math.sin(self.angle2))*self.cameraDist;
	}
	self.updateRotation(0);
}
