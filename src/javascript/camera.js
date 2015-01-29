var battlecodeCamera = function(){
	var self = this;
	self.cam = new THREE.PerspectiveCamera(80, window.innerWidth / window.innerHeight, 1, 1000 );
	self.center = new THREE.Vector3(0,0,0);
	self.toCenter = new THREE.Vector3(0,0,0);
	self.offset = new THREE.Vector3(0,0,0);
	self.planeNormal = new THREE.Vector3(0,0,1);
	self.winnerAnimation = false;

    self.setCenter = function(x,y){
        self.center.x = x;
        self.center.y = y;
    }

    self.reset = function(){
        self.setCenter(0,0);
        self.cameraRadius = 300;
        self.angle1 = 0;
        self.angle2 = 0.01;
        self.angle1Offset = 0;
        self.angle2Offset = 0;
    }
    self.reset();

    self.startWinnerAnimation = function(x,y){
        self.winnerAnimation = true;
        self.setCenter(x,y);
        self.cameraRadius = 100;
        self.angle2 = Math.PI*0.75;
        self.updateRotation(0,0);
    }

    self.endWinnerAnimation = function(x,y){
        self.winnerAnimation = false;
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
        var dist = Math.sqrt(y*y+x*x)*Math.log(self.cameraRadius)/10;
        self.offset.x = (Math.sin(angleForward+angleMouse))*dist;
        self.offset.y = (Math.cos(angleForward+angleMouse))*dist;
    }

	self.updateRatio = function(){
		self.cam.aspect = window.innerWidth / window.innerHeight;
		self.cam.updateProjectionMatrix();
	}
	self.updateDist = function(isUp){
		if(!isUp){
			self.cameraRadius*=1.2;
		}else
			self.cameraRadius/=1.2;
		self.cameraRadius = Math.min(700,Math.max(10,self.cameraRadius));
		self.update();
	}
	self.dragFinished = function(){
	    self.center.x += self.offset.x;
	    self.center.y += self.offset.y;
	    self.offset.x = 0;
	    self.offset.y = 0;
        self.angle1 += self.angle1Offset;
	    self.angle2 = Math.max(0.01,Math.min(Math.PI/2-0.2,self.angle2+self.angle2Offset));
        self.angle1Offset = 0;
        self.angle2Offset = 0;
	}
	self.update = function(){
	    if(self.winnerAnimation)
	        self.angle1+=0.01;
	    var xAngle = self.angle1+self.angle1Offset;
	    var yAngle = Math.max(0.01,Math.min(Math.PI/2-0.2,self.angle2+self.angle2Offset));
        self.cam.position.x = Math.sin(xAngle)*Math.sin(yAngle)*self.cameraRadius+self.center.x+self.offset.x;
		self.cam.position.y = Math.cos(xAngle)*Math.sin(yAngle)*self.cameraRadius+self.center.y+self.offset.y;
		self.cam.position.z = Math.cos(yAngle)*self.cameraRadius;
		self.cam.up.set(0,0,1);
		var lookAt = new THREE.Vector3(0,0,0);
		lookAt.copy(self.center);
		lookAt.add(self.offset);
		self.cam.lookAt(lookAt);
	}
	self.updateRotation = function(deltaMouseX,deltaMouseY){
        self.angle1Offset = -deltaMouseX*3;
	    self.angle2Offset = deltaMouseY*3;
	}

	self.save = function(){
	    self.saveObj = {
	        center: self.center,
	        angle1: self.angle1,
	        angle2: self.angle2,
	        cameraRadius: self.cameraRadius
	    };
        self.setCenter(0,0);
        self.cameraRadius = 300;
        self.angle1 = 0;
        self.angle2 = 0.01;
        self.angle1Offset = 0;
        self.angle2Offset = 0;
	}
	self.restore = function(){
	    self.reset();
	    self.center = self.saveObj.center;
	    self.angle1 = self.saveObj.angle1;
	    self.angle2 = self.saveObj.angle2;
	    self.cameraRadius = self.saveObj.cameraRadius;
        self.angle1Offset = 0;
        self.angle2Offset = 0;
	}
}
