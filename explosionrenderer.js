var ExplosionRenderer = function(){
    var self = this;
    self.particlesPerExplosion = 20;
    self.particleNum = self.particlesPerExplosion*50;
    self.occupiedIndices = [];
    self.gravity = -1;
    self.tmpVec = new THREE.Vector3(0,0,0);
    self.init = function(scene){
        console.log("init explosionrenderer");
        self.particleGeom = new THREE.Geometry();
        self.particleSpeeds = [];
        for(var i=0;i<self.particleNum;i+=self.particlesPerExplosion)
            self.occupiedIndices.push(false);
	    for(var i =0;i<self.particleNum;i++){
				self.particleGeom.vertices.push(new THREE.Vector3(0,0,-5));
                self.particleSpeeds.push(new THREE.Vector3(0,0,0));
	    }
        var texture = THREE.ImageUtils.loadTexture( "assets/images/explosion.png" );
	    var material = new THREE.PointCloudMaterial({size:20,map:texture,transparent:true,color:0xffaaaa,alphaTest:0.5,opacity:0.5});
	    self.particlePointCloud = new THREE.PointCloud(self.particleGeom,material);
	    scene.add(self.particlePointCloud);
    }
    self.findFreeIndex = function(){
        var freeIndex = 0;
        for(var i=0;i<self.occupiedIndices.length;i++){
            if(!self.occupiedIndices[i]){
                self.occupiedIndices[i] = true;
                return freeIndex;
            }
            freeIndex+=self.particlesPerExplosion;
        }
        return -1;
    }

    self.draw = function(scene, explosions){
        var vertices = self.particleGeom.vertices;
        var speeds = self.particleSpeeds;
        var toRemove = [];
        var inverseSlowmo = 1.0/slowmotion;
        for(var i=0;i<explosions.length;i++){
            var explosion = explosions[i];
            if(explosion[0]){
                var freeIndex = self.findFreeIndex();
                if(freeIndex>=0){
                    var explosionLoc = explosion[2];
                    for(var j=freeIndex;j<freeIndex+self.particlesPerExplosion;j++){
                        var pos = vertices[j];
                        var x = (Math.random()-0.5)*5;
				        var y = (Math.random()-0.5)*5;
				        var z = (Math.random()-0.5)*5;
			            var speed = speeds[j];
			            pos.set(explosionLoc[0],explosionLoc[1],25);
			            speed.set(x,y,z);
                    }
                    explosion[0] = false;
                    explosion.push(freeIndex);
                }
            }else{
                var startIndex = explosion[3];
                for(var j=startIndex;j<startIndex+self.particlesPerExplosion;j++){
                    var pos = vertices[j];
			        var speed = speeds[j];
			        self.tmpVec.copy(speed);
			        self.tmpVec.multiplyScalar(inverseSlowmo);
                    pos.add(self.tmpVec);
			        speed.z += self.gravity*inverseSlowmo;
			        if(pos.z<0){
			            pos.z = 0;
			            speed.z *= -0.5;
			            speed.x *= 0.5;
			            speed.y *= 0.5;
			        }
                }
            }
            explosion[1]-=inverseSlowmo;
            if(explosion[1]<=0){
                if(explosion.length==4){
                    var startIndex = explosion[3];
                    for(var j=startIndex;j<startIndex+self.particlesPerExplosion;j++){
                        vertices[j].set(0,0,-100);
                    }
                    self.occupiedIndices[startIndex/self.particlesPerExplosion] = false;
                }
                toRemove.push(explosion);
            }
        }
        for(var i=0;i<toRemove.length;i++){
            var index = explosions.indexOf(toRemove[i]);
            if(index>-1)
                explosions.splice(index,1);
        }
        // remove all remaining particles (i.e. mapchange)
        if(explosions.length ==0){
            self.particlePointCloud.visible = false;
            for(var i=0;i<self.occupiedIndices.length;i++){
                if(self.occupiedIndices[i]){
                    var startIndex = i*self.particlesPerExplosion;
                    for(var j=startIndex;j<startIndex+self.particlesPerExplosion;j++){
                        vertices[j].set(0,0,-100);
                    }
                    self.occupiedIndices[i] = false;
                }
            }
        }else{
            self.particlePointCloud.visible = true;
	        self.particleGeom.verticesNeedUpdate = true;
	    }
    }
}
