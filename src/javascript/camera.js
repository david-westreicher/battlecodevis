var battlecodeCamera = function(){
	var self = this;
	self.cameraDist = 200;
	self.cam = new THREE.PerspectiveCamera(80, window.innerWidth / window.innerHeight, 1, 1000 );
	self.center = new THREE.Vector3(0,0,0);
	self.toCenter = new THREE.Vector3(0,0,0);
	self.offset = new THREE.Vector3(0,0,0);
	self.planeNormal = new THREE.Vector3(0,0,1);
	self.angle1 = 0;
	self.angle2 = Math.PI/2;

    self.setCenter = function(x,y){
        self.toCenter.x = x;
        self.toCenter.y = y;
    }

    self.setCenterDelta = function(x,y){
        var forward = new THREE.Vector3(0,0,0);
        forward.copy(self.center);
        forward.add(self.offset);
        forward.sub(self.cam.position);
        forward.normalize();
        var up = new THREE.Vector3(0,0,0);
        up.copy(self.cam.up);
        var mid = new THREE.Vector3(0,0,0);
        mid.add(forward);
        mid.sub(up);
        mid.multiplyScalar(0.5);
        mid.add(forward);
        mid.projectOnPlane(self.planeNormal);
        mid.normalize();
        forward.copy(mid);
        //x/=self.cam.aspect;
        var angleForward = -Math.atan2(forward.y,forward.x);
        var angleMouse = -Math.atan2(y,-x);
        var dist = Math.sqrt(y*y+x*x);
        self.offset.x = (Math.sin(angleForward+angleMouse))*dist;
        self.offset.y = (Math.cos(angleForward+angleMouse))*dist;
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
	self.dragFinished = function(){
	    self.center.x += self.offset.x;
	    self.center.y += self.offset.y;
	    self.offset.x = 0;
	    self.offset.y = 0;
	}
	self.update = function(){
        self.cam.position.x = Math.sin(self.angle1)*self.cameraRadius+self.center.x+self.offset.x;
		self.cam.position.y = Math.cos(self.angle1)*self.cameraRadius+self.center.y+self.offset.y;
		self.cam.position.z = Math.cos(self.angle2)*self.cameraDist;
		self.cam.up.set(0,0,1);
		var lookAt = new THREE.Vector3(0,0,0);
		lookAt.copy(self.center);
		lookAt.add(self.offset);
		self.cam.lookAt(lookAt);
		//self.center.x+=(self.toCenter.x-self.center.x)/10;
		//self.center.y+=(self.toCenter.y-self.center.y)/10;
	}
	self.updateRotation = function(deltaMouseX){
        self.angle1 += deltaMouseX/30;
	    self.angle2 = ((self.cameraDist-10)/580+1)*Math.PI/2+Math.PI;//mouseY*Math.PI/4;
		self.cameraRadius = Math.abs(Math.sin(self.angle2))*self.cameraDist;
	}
	self.updateRotation(0);
}
