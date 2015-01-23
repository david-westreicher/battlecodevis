var battlecodeCamera = function(){
	var self = this;
	self.cameraDist = 200;
	self.cam = new THREE.PerspectiveCamera(80, window.innerWidth / window.innerHeight, 1, 1000 );
	self.center = new THREE.Vector3(0,0,0);
	self.toCenter = new THREE.Vector3(0,0,0);

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
	}
	self.update = function(mouseX,mouseY,pos){
        var angle1 = mouseX*Math.PI*2;
	    var angle2 = ((self.cameraDist-10)/590+1)*Math.PI/2+Math.PI;//mouseY*Math.PI/4;
		var cameraRadius = Math.abs(Math.sin(angle2))*self.cameraDist;
		self.cam.position.x = Math.sin(angle1)*cameraRadius+self.center.x;
		self.cam.position.y = Math.cos(angle1)*cameraRadius+self.center.y;
		self.cam.position.z = Math.cos(angle2)*self.cameraDist;
		self.cam.up.set(0,0,1);
		self.cam.lookAt(self.center);
		self.center.x+=(self.toCenter.x-self.center.x)/10;
		self.center.y+=(self.toCenter.y-self.center.y)/10;
	}
}
