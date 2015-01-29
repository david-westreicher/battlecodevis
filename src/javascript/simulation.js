var Simulation = function(){
    var self = this;

    self.newMap = function(){
        self.currentFrame = 0;
        if(window.battlecodeCam)
            window.battlecodeCam.reset();
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
        self.mapwinner = null;
    }

    self.newReplayFile = function(){
        self.score = [0,0];
        self.currentMap = 0;
        self.newMap();
        self.mapwinner = null;
        gui.resetScores();
    }

    self.maplocToOreLoc = function(maploc){
        var map = self.data.map;
        var x = -map.originX+maploc[0];
        var y = -map.originY+maploc[1];
        if(x<0||y<0||x>=map.width||y>=map.height)
            return null;
        return [x,y];
    }

    self.initMap = function(){
        var map = replayData.maplist[self.currentMap];
        var oreStringArray = map.ore.split(',');
        var maxOre = 0;
        for(var x =0;x<map.width;x++){
            var row = [];
            for(var y =0;y<map.height;y++){
                var currentOre = parseInt(oreStringArray[y+x*map.height]);
                if(currentOre>maxOre)
                    maxOre = currentOre
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
        self.mapwinner = null;
        self.data.oreChanged = true;
        self.data.ready = true;
        self.data.map = map;
        self.data.map.maxOre = maxOre;
        self.data.robotMap = robotMap;
    }

    self.locToMap = function(loc){
        var mapLoc = [0,0];
        var map = self.data.map;
        mapLoc[0] = (loc[0]-map.originX-map.width/2)*GLOBAL_SCALE;
        mapLoc[1] = -(loc[1]-map.originY-map.height/2)*GLOBAL_SCALE;
        return mapLoc;
    }

    self.winnerAnimation = function(){
        var losers = [];
        var robots = simulation.data.robots;
        var robotIDs = Object.keys(simulation.data.robots);
        for(var i=0;i<robotIDs.length;i++){
            var robot = robots[robotIDs[i]];
            if(robot.team!=self.mapwinner){
                if(robot.z>-15)
                    robot.z-=(0.1+Math.random()*0.3)/4;
                robot.dead = true;
                losers.push(robot);
            }
        }
        self.animationTimer++;
        if(self.animationTimer%8==0){
            var randRobot = losers[Math.floor(Math.random()*losers.length)];
            self.data.explosions.push([true,15,randRobot.loc]);
        }
        if(self.animationTimer>400){
            slowmotion=4;
            self.mapwinner=null;
            window.battlecodeCam.endWinnerAnimation();
            gui.controls.nextMap(self.mapwinner);
        }
    }

    self.simulate = function(){
        //check if replayData has enough maps/frames parsed
        var replayData = window.replayData;

        if(self.mapwinner!=null){
            self.winnerAnimation();
            return;
        }

        if(replayData==null || replayData.maplist.length==self.currentMap || replayData.maplist[self.currentMap].frames.length<=self.currentFrame+1)
            return;
        if(self.currentFrame==0)
            self.initMap();
        var frame = self.data.map.frames[self.currentFrame];
        var sigs = frame.signals;
        self.data.lines = [];
        self.data.gold = frame.score;
        gui.controls.updateBar(self.currentFrame);
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
                    z: robotType.spawnHeight,
                    dead: false,
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
                    //gui.updateScore(robot.team, true);
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
                var from = [robot.loc[0],robot.loc[1],RobotTypes[robot.type].shootHeight];
                var attackLoc = self.locToMap(sig.loc);
                var attackHeight = 5;
                var mapLoc = self.maplocToOreLoc(sig.loc);
                var enemyRobot = (mapLoc==null)?null:self.data.robotMap[mapLoc[0]][mapLoc[1]];
                var enemyType = (enemyRobot==null)?null:RobotTypes[enemyRobot.type];
                if(enemyType!=null)
                    attackHeight += enemyType.height;
                attackLoc.push(attackHeight);
                for(var l = 0;l<3;l++)
                    attackLoc[l] += (Math.random()-0.5);
                self.data.lines.push([from,attackLoc,robot.team]);
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
                self.data.ore[oreLoc[0]][oreLoc[1]][0] -= sig.amount;
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
                        gui.commanderDead(robot.team);
                }
                if(robot.type!="HQ")
                    delete self.data.robots[sig.robotID];
            }else if(sig.type=="mapend"){
                self.mapwinner = sig.winner;
                self.animationTimer = 0;
                slowmotion=1;
                var robots = simulation.data.robots;
                var robotIDs = Object.keys(simulation.data.robots);
                var loserHQ = null;
                for(var i=0;i<robotIDs.length;i++){
                    var robot = robots[robotIDs[i]];
                    if(robot.team!=self.mapwinner&&robot.type=="HQ")
                        loserHQ = robot;
                }
                if(loserHQ!=null)
                    window.battlecodeCam.startWinnerAnimation(loserHQ.loc[0],loserHQ.loc[1]);
            }
        }
    }

    self.newMap();
}
