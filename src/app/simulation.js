var Simulation = function(){
    var self = this;

    self.newMap = function(){
        self.currentFrame = 0;
        if(window.battlecodeCam)
            window.battlecodeCam.setCenter(0,0);
        self.data  = {
            robots:{},
            lines:[],
            explosions:[],
            ore:[],
            oreChanged:false,
            ready:false,
            gold:[0,0],
            map:null,
            robotMap:null
        };
    }

    self.newReplayFile = function(){
        self.score = [0,0];
        self.currentMap = 0;
        self.newMap();
        gui.resetScores();
    }

    self.maplocToOreLoc = function(maploc){
        var map = self.data.map;
        return [-map.originX+maploc[0],-map.originY+maploc[1]];
    }

    self.initMap = function(){
        var map = replayData.maplist[self.currentMap];
        var oreStringArray = map.ore.split(',');
        for(var x =0;x<map.width;x++){
            var row = [];
            for(var y =0;y<map.height;y++){
                var currentOre = parseInt(oreStringArray[y+x*map.height]);
                row.push([currentOre,0,'']);
            }
            self.data.ore.push(row);
        }
        var tiles = map.tiles;
        var robotMap = []
        for(var x =0;x<map.width;x++){
            var row = []
            for(var y=0;y<map.height;y++){
                if(x==-1||y==-1||x==map.width||y==map.height||tiles.charAt(x+y*map.width)=='#'){
                    self.data.ore[x][y][1]=-1;
                }
                row.push(null);
            }
            robotMap.push(row);
        }
        self.data.oreChanged = true;
        self.data.ready = true;
        self.data.map = map;
        self.data.robotMap = robotMap;
    }

    self.locToMap = function(loc){
        var mapLoc = [0,0];
        var map = simulation.data.map;
        mapLoc[0] = (loc[0]-map.originX-map.width/2)*GLOBAL_SCALE;
        mapLoc[1] = -(loc[1]-map.originY-map.height/2)*GLOBAL_SCALE;
        return mapLoc;
    }

    self.simulate = function(){
        //check if replayData has enough maps/frames parsed
        var replayData = window.replayData;
        if(replayData==null || replayData.maplist.length==self.currentMap || replayData.maplist[self.currentMap].frames.length<=self.currentFrame+1)
            return;
        if(self.currentFrame==0)
            self.initMap();
        var frame = self.data.map.frames[self.currentFrame];
        var sigs = frame.signals;
        self.data.lines = [];
        self.data.gold = frame.score;
        self.currentFrame++;
        for(var i =0;i<sigs.length;i++){
            var sig = sigs[i];
            if(sig.type=="spawn"){
                var robotType = RobotTypes[sig.robotType];
                var loc = self.locToMap(sig.loc);
                var robot = {
                    id:sig.robotID,
                    loc: loc,
                    team: sig.team,
                    type: sig.robotType,
                    lastloc: loc,
                    hasInterp: false,
                    hp: 0,
                    supply: 0,
                    z: ('spawnHeight' in robotType)?
                        robotType.spawnHeight:
                        (('height' in robotType)?robotType.height:0),
                    rot:0
                };
                self.data.robots[robot.id] = robot;
                var mapLoc = self.maplocToOreLoc(sig.loc);
                robot.mapLoc = mapLoc;
                self.data.robotMap[mapLoc[0]][mapLoc[1]] = robot;
                if(robot.type == "TOWER"){
                    gui.updateScore(robot.team, true);
                }
                if(robot.type == "HQ"){
                    gui.updateScore(robot.team, true);
                    gui.setHQ(robot);
                }
                if(robot.type == "COMMANDER"){
                    gui.setCommander(robot);
                }
            }else if(sig.type=="move"){
                var robot = self.data.robots[sig.robotID];
                var mapLoc = robot.mapLoc;
                self.data.robotMap[robot.mapLoc[0]][robot.mapLoc[1]] = null;
                mapLoc = self.maplocToOreLoc(sig.loc);
                self.data.robotMap[mapLoc[0]][mapLoc[1]] = robot;
                robot.mapLoc = mapLoc;
                robot.lastloc = robot.loc;
                robot.loc = self.locToMap(sig.loc);
                robot.hasInterp = true;
            }else if(sig.type=="attack"){
                var robot = self.data.robots[sig.robotID];
                var type = RobotTypes[robot.type];
                var height = ("shootHeight" in type)?type.shootHeight:5;
                var from = [robot.loc[0],robot.loc[1],height];
                var attackLoc = self.locToMap(sig.loc);
                var mapLoc = self.maplocToOreLoc(sig.loc);
                var robot2 = self.data.robotMap[mapLoc[0]][mapLoc[1]];
                var type2 = (robot2)?RobotTypes[robot2.type]:null;
                height = (type2!=null)?type2.height:5;
                self.data.lines.push([from,[attackLoc[0],attackLoc[1],height],robot.team]);
            }else if(sig.type=="health"){
                var robots = sig.robots;
                var healths = sig.healths;
                for(var j=0;j<robots.length;j++){
                    var robot = self.data.robots[robots[j]];
                    if(robot.hp != healths[j]){
                        robot.hp = healths[j];
                        if(robot.type == "HQ" || robot.type == "COMMANDER"){
                                gui.updateHP(robot)
                        }
                    }
                }
            }else if(sig.type=="supply"){
                var robots = sig.robots;
                var supplies = sig.supplies;
                for(var j=0;j<robots.length;j++){
                    var robot = self.data.robots[robots[j]];
                    robot.supply = supplies[j];
                }
            }else if(sig.type=="ore"){
                var oreLoc = self.maplocToOreLoc(sig.loc);
                self.data.ore[oreLoc[0]][oreLoc[1]][1] = sig.amount;
                self.data.oreChanged = true;
            }else if(sig.type=="mine"){
                var robot = self.data.robots[sig.robotID];
                var mineLoc = self.maplocToOreLoc(sig.loc);
                self.data.ore[mineLoc[0]][mineLoc[1]][2] = robot?robot.team:sig.team;
                self.data.oreChanged = true;
            }else if(sig.type=="death"){
                var robot = self.data.robots[sig.robotID];
                self.data.robotMap[robot.mapLoc[0]][robot.mapLoc[1]] = null;
                switch (robot.type){
                    case "TOWER":
                        gui.updateScore(robot.team, false); break;
                    case "MISSILE":
                        self.data.explosions.push([true,7,robot.loc]); break;
                    case "COMMANDER":
                        gui.commanderDead(robot);
                }
                delete self.data.robots[sig.robotID];
            }else if(sig.type=="mapend"){
                self.newMap();
                gui.resetScores();
                gui.win(sig.winner);
                self.currentMap++;
                self.score[(sig.winner=='A')?0:1]++;
            }
        }
    }

    self.newMap();
}
