var pako = require('pako');

var ChunkParser = function(){
	var self = this;	
	self.lastTag=null;
	self.tagStack = [];
	self.currentTag = null;	
	self.metadata = {
		teams:[],
		maplist:[],
	};
	self.currentmap = null;
	self.parseChunk = function(chunk){
		//console.log(chunk);			
		for(var i=0;i<chunk.length ;i++){
			var chr = String.fromCharCode.apply(null,[chunk[i]]);
			if(self.currentTag!=null){
				//currently parsing inside the tag (<?>)
				if(chr=='>'){
					//end of the tag reached
					if(self.lastTag!=null && ('/'+self.lastTag)==self.currentTag){
						//this is a closing tag (i.e. </map>)
						self.tagStack.pop();
						self.closedTag(self.lastTag);
						self.lastTag =(self.tagStack.length>0)?self.tagStack[self.tagStack.length-1]:null;
					}else{
						//this tag is an opening tag or single tag (i.e. <map> or <map/>)
						if(self.currentTag.length>0){
							if(self.currentTag[self.currentTag.length-1]!='/'){
								// i.e. <map>
								var tagname = self.openedTag(self.currentTag);
								self.tagStack.push(tagname);
								self.lastTag =(self.tagStack.length>0)?self.tagStack[self.tagStack.length-1]:null;
							}else
								// single tag (i.e. <map/>)
								self.parseSingleTag(self.currentTag);
						}
					}
					self.currentTag=null;
				}else
					//haven't reached end of the tag yet
					self.currentTag+=chr;
			}else if(chr=='<')
				//a new tag has begun
				self.currentTag='';
			else if(chr!=' '&&chr!='\n')
				//we are between the opening and ending tag (=content)
				self.parseContent(self.lastTag,chr);
		}
	}

	self.parseContent = function(tag,character){
		//parse map tiles and ores
		if(tag=='mapTiles')
			self.currentmap.tiles+=character;
		else if(tag=='int-array')
			self.currentmap.ore+=character;
	}

	self.openedTag = function(tag){
		var tagName = self.getTagName(tag);
		if(tagName=='ser.RoundDelta'){
			var signals = [];
			var maplist = self.metadata.maplist;
			var frame = {
				signals:[],
				score:{A:0,B:0}
			}
			self.currentSignals = frame.signals;
			maplist[maplist.length-1].frames.push(frame); 
		}else if(tagName=='map'){
			//parse map meta data
			var attrs = self.getAttrs(tag);
			var map ={
				width:parseInt(attrs['mapWidth']),
				height:parseInt(attrs['mapHeight']),
				originX:parseInt(attrs['mapOriginX']),
				originY:parseInt(attrs['mapOriginY']),
				name:attrs['mapName'],
				tiles:'',
				ore:'',
				frames:[]
			};
			self.currentmap = map;
			self.metadata.maplist.push(map);
		} 
		return tagName;
	}

	self.closedTag = function(tag){
	}
	
	self.parseSingleTag = function(tag){
		//in demo 1217 in line 3102
		//parse a single tag with attributes (i.e. <map mapWidth='231'/>)
		var tagName = self.getTagName(tag);
		if(tagName=='sig.MovementSignal'){
			var attrs = self.getAttrs(tag);
			var signal = {
				type:'move',
				robotID:parseInt(attrs['robotID']),
				loc:self.parseLoc(attrs['newLoc'])
			};
			self.currentSignals.push(signal);
		}else if(tagName=='sig.AttackSignal'){
			var attrs = self.getAttrs(tag);
			var signal = {
				type:'attack',
				robotID:parseInt(attrs['robotID']),
				loc:self.parseLoc(attrs['targetLoc'])
			};
			self.currentSignals.push(signal);
		}else if(tagName=='ser.RoundStats'){
			var maplist = self.metadata.maplist;
			var frames = maplist[maplist.length-1].frames;
			var frame = frames[frames.length-1];
			var points = self.getAttrs(tag)['points'].split(',');
			frame.score.A =points[0]; 
			frame.score.B =points[1]; 
		}else if(tagName=='sig.SpawnSignal'){
			var attrs = self.getAttrs(tag);
			var signal = {
				type:'spawn',
				robotID:parseInt(attrs['robotID']),
				loc:self.parseLoc(attrs['loc']),
				robotType:attrs['type'],
				team:attrs['team']
			};
			self.currentSignals.push(signal);
		}else if(tagName=='sig.DeathSignal'){
			var attrs = self.getAttrs(tag);
			var signal = {
				type:'death',
				robotID:parseInt(attrs['objectID'])
			};
			self.currentSignals.push(signal);
		}else if(tagName=='ser.ExtensibleMetadata'){
			//parse team names
			var attrs = self.getAttrs(tag);
			if(self.metadata.teams.length==0){
				self.metadata.teams.push(attrs['team-a']);
				self.metadata.teams.push(attrs['team-b']);
			}
		}
	}

	self.parseLoc = function(str){
		var nums = str.split(',');	
		nums = [parseInt(nums[0]),parseInt(nums[1])];
		return nums;
	}

	self.getAttrs = function(attrStr){
		var attrs = {}
		var splitted = attrStr.split(' ').slice(1);
		for(var i=0;i<splitted.length;i++){
			var attrPair = splitted[i];
			if(attrPair[attrPair.length-1]=='/')
				attrPair = attrPair.slice(0,attrPair.length-1);
			attrPair = attrPair.split('=');
			attrs[attrPair[0]] = attrPair[1].slice(1,attrPair[1].length-1);
		}
		return attrs;
	}

	self.getTagName = function(tag){
		//return the name of the tag without attributes
		return tag.trim().split(' ')[0];	
	}
}
var ChunkReader = function(file){
	var self = this;
	self.readNextLine = function(){
		if(self.start<self.file.size)
			self.reader.readAsArrayBuffer(self.file.slice(self.start,self.end));	
		else{
			if(self.chunkParser.tagStack.length!=0)
				console.log("something went terribly wrong while parsing :(");
			console.log("parsing finished, time: "+(new Date().getTime()-self.startTime.getTime())+"ms")
		}
		self.start+=self.chunkSize;
		self.end+=self.chunkSize;
		self.end= Math.min(self.file.size,self.end);
	}
	self.startTime = new Date();
	self.chunkParser = new ChunkParser();
	//self.chunkSize = 1024;
	//self.chunkSize = 2048;
	//self.chunkSize = 4096;
	//self.chunkSize = 8192;
	//self.chunkSize = 16384;
	self.chunkSize = 65536;
	self.chunkSize = 1048576*4;
	self.start = 0;
	self.inflate = new pako.Inflate({chunkSize:self.chunkSize});
	self.inflate.onData =function(chunk) {
		console.log(typeof chunk);
		self.chunkParser.parseChunk(chunk);
	}
	self.end = self.chunkSize;
	self.reader = new FileReader();
	self.reader.onload = function(e){
		//console.log(self.reader.result);
        var byteArray = new Uint8Array(self.reader.result);
        try {
            var start = new Date().getTime();
			self.inflate.push(byteArray,false);
           // result = pako.inflate(byteArray);
            // var string = String.fromCharCode.apply(null,result.subarray(0,50))
            // console.log(string);
            var end = new Date().getTime();
            console.log('unzip execution time: ' + (end - start));
		    //;
		    self.readNextLine();
        }catch (err) {
            console.log(err);
        }
	}
	self.file = file;
}

window.getData = function(file){
	console.log("start parsing");
	var chunkReader = new ChunkReader(file);
	var data = chunkReader.chunkParser.metadata;
	chunkReader.readNextLine();
	return data;
}
