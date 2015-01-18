var pako = require('pako');

self.addEventListener('message', function(e) {
    var file = e.data;

    // TODO add events to each big block
    // this way, it would be possible to start rendering by chunks
    var ChunkParser = function(){
        this.lastTag = null;
        this.tagStack = [];
        this.currentTag = null;
        this.metadata = {
            teams:[],
            maplist:[],
        };
        this.currentmap = null;

        this.parseChunk = function(chunk){
            //console.log(chunk);
            for(var i=0;i<chunk.length ;i++){
                var chr = String.fromCharCode.apply(null,[chunk[i]]);
                if(this.currentTag!=null){
                    //currently parsing inside the tag (<?>)
                    if(chr=='>'){
                        //end of the tag reached
                        if(this.lastTag!=null && ('/'+this.lastTag)==this.currentTag){
                            //this is a closing tag (i.e. </map>)
                            this.tagStack.pop();
                            this.closedTag(this.lastTag);
                            this.lastTag =(this.tagStack.length>0)?this.tagStack[this.tagStack.length-1]:null;
                        }else{
                            //this tag is an opening tag or single tag (i.e. <map> or <map/>)
                            if(this.currentTag.length>0){
                                if(this.currentTag[this.currentTag.length-1]!='/'){
                                    // i.e. <map>
                                    var tagname = this.openedTag(this.currentTag);
                                    this.tagStack.push(tagname);
                                    this.lastTag =(this.tagStack.length>0)?this.tagStack[this.tagStack.length-1]:null;
                                }else
                                    // single tag (i.e. <map/>)
                                    this.parseSingleTag(this.currentTag);
                            }
                        }
                        this.currentTag=null;
                    }else
                        //haven't reached end of the tag yet
                        this.currentTag+=chr;
                }else if(chr=='<')
                    //a new tag has begun
                    this.currentTag='';
                    else if(chr!=' '&&chr!='\n')
                        //we are between the opening and ending tag (=content)
                        this.parseContent(this.lastTag,chr);
            }
        }

        this.parseContent = function(tag,character){
            //parse map tiles and ores
            if(tag=='mapTiles')
                this.currentmap.tiles+=character;
            else if(tag=='int-array')
                this.currentmap.ore+=character;
        }

        this.openedTag = function(tag){
            var tagName = this.getTagName(tag);
            if(tagName=='ser.RoundDelta'){
                var signals = [];
                var maplist = this.metadata.maplist;
                var frame = {
                    signals:[],
                    score:{A:0,B:0}
                }
                this.currentSignals = frame.signals;
                maplist[maplist.length-1].frames.push(frame);
            }else if(tagName=='map'){
                //parse map meta data
                var attrs = this.getAttrs(tag);
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
                this.currentmap = map;
                this.metadata.maplist.push(map);
            }
            return tagName;
        }

        this.closedTag = function(tag){
            if(tag=='int-array')
                this.currentmap.ore+=',';
        }

        this.parseSingleTag = function(tag){
            //in demo 1217 in line 3102
            //parse a single tag with attributes (i.e. <map mapWidth='231'/>)
            var tagName = this.getTagName(tag);
            if(tagName=='sig.MovementSignal'){
                var attrs = this.getAttrs(tag);
                var signal = {
                    type:'move',
                    robotID:parseInt(attrs['robotID']),
                    loc:this.parseLoc(attrs['newLoc'])
                };
                this.currentSignals.push(signal);
            }else if(tagName=='sig.AttackSignal'){
                var attrs = this.getAttrs(tag);
                var signal = {
                    type:'attack',
                    robotID:parseInt(attrs['robotID']),
                    loc:this.parseLoc(attrs['targetLoc'])
                };
                this.currentSignals.push(signal);
            }else if(tagName=='sig.LocationOreChangeSignal'){
                var attrs = this.getAttrs(tag);
                var signal = {
                    type:'ore',
                    amount:parseFloat(attrs['ore']),
                    loc:this.parseLoc(attrs['loc'])
                };
                this.currentSignals.push(signal);
            }else if(tagName=='sig.MineSignal'){
                var attrs = this.getAttrs(tag);
                var signal = {
                    type:'mine',
                    team:attrs['mineTeam'],
					robotID:parseInt(attrs['robotID']),
                    loc:this.parseLoc(attrs['mineLoc'])
                };
                this.currentSignals.push(signal);
            }else if(tagName=='ser.RoundStats'){
                var maplist = this.metadata.maplist;
                var frames = maplist[maplist.length-1].frames;
                var frame = frames[frames.length-1];
                var points = this.getAttrs(tag)['points'].split(',');
                frame.score.A =points[0];
                frame.score.B =points[1];
            }else if(tagName=='sig.SpawnSignal'){
                var attrs = this.getAttrs(tag);
                var signal = {
                    type:'spawn',
                    robotID:parseInt(attrs['robotID']),
                    loc:this.parseLoc(attrs['loc']),
                    robotType:attrs['type'],
                    team:attrs['team']
                };
                this.currentSignals.push(signal);
            }else if(tagName=='sig.DeathSignal'){
                var attrs = this.getAttrs(tag);
                var signal = {
                    type:'death',
                    robotID:parseInt(attrs['objectID'])
                };
                this.currentSignals.push(signal);
            }else if(tagName=='ser.ExtensibleMetadata'){
                //parse team names
                var attrs = this.getAttrs(tag);
                if(this.metadata.teams.length==0){
                    this.metadata.teams.push(attrs['team-a']);
                    this.metadata.teams.push(attrs['team-b']);
                }
            }
        }

        this.parseLoc = function(str){
            var nums = str.split(',');
            nums = [parseInt(nums[0]),parseInt(nums[1])];
            return nums;
        }

        this.getAttrs = function(attrStr){
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

        this.getTagName = function(tag){
            //return the name of the tag without attributes
            return tag.trim().split(' ')[0];
        }
    }

    var ChunkReader = function(file){
        var counter = 0;
        var percent = 0;

        this.startTime = new Date();
        this.chunkSize = 65536*5;
        // this.chunkSize = 1048576*4;
        this.start = 0;
        this.end = this.chunkSize;
        this.file = file;

        this.chunkParser = new ChunkParser();

        this.inflate = new pako.Inflate({chunkSize:this.chunkSize});
        var self = this;
        this.inflate.onData =function(chunk) {
            // console.log('processing chunk '+counter);
            self.chunkParser.parseChunk(chunk);
            counter++;
        }

        this.reader = new FileReaderSync();

        this.readNextLine = function(){
            if(this.start<this.file.size){
                var chunk = this.reader.readAsArrayBuffer(this.file.slice(this.start,this.end));
                var byteArray = new Uint8Array(chunk);

                percent = ((this.chunkSize*counter/this.file.size))*10;
                postMessage({data: null, message: 'loading '+percent+'%'});

                try {
                    var start = new Date().getTime();
                    this.inflate.push(byteArray,false);
                    var end = new Date().getTime();
                }catch (err) {
                    console.log(err);
                }
                // console.log('unzip execution time: ' + (end - start));
                this.start+=this.chunkSize;
                this.end+=this.chunkSize;
                this.end= Math.min(this.file.size,this.end);
                this.readNextLine();
            }else{
                if(this.chunkParser.tagStack.length!=0){
                    throw new Error("something went terribly wrong while parsing :(");
                }
                console.log("parsing finished, time: "+(new Date().getTime()-this.startTime.getTime())+"ms")
                postMessage({data: chunkReader.chunkParser.metadata, message: 'loaded'});
                console.log('closing worker');
                close();
            }
        }
    };

    console.log("start parsing on worker");
    var chunkReader = new ChunkReader(file);
    chunkReader.readNextLine();
}, false);
