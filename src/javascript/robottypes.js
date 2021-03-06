var RobotTypes = {
    "AEROSPACELAB":{model:"assets/models/aerospace-lab.js"},
    "BARRACKS":{model:"assets/models/barracks.js"},
    "BASHER":{model:"assets/models/basher.js"},
    "BEAVER":{model:"assets/models/beaver.js"},
    "COMMANDER":{model:"assets/models/commander.js"},
    "COMPUTER":{model:"assets/models/computer.js"},
    "DRONE":{model:"assets/models/drone.js",height:25,shootHeight:25},
    "HANDWASHSTATION":{model:"assets/models/handwash.js"},
    "HELIPAD":{model:"assets/models/helipad.js"},
    "HQ":{model:"assets/models/hq.js",shootHeight:14},
    "LAUNCHER":{model:"assets/models/launcher.js"},
    "MINER":{model:"assets/models/miner.js"},
    "MINERFACTORY":{model:"assets/models/mine-factory-02.js"},
    "MISSILE":{model:"assets/models/missile.js",height:25},
    "SOLDIER":{model:"assets/models/soldier.js"},
    "SUPPLYDEPOT":{model:"assets/models/supply.js"},
    "TANK":{model:"assets/models/tank.js"},
    "TANKFACTORY":{model:"assets/models/tank-factory.js"},
    "TECHNOLOGYINSTITUTE":{model:"assets/models/tech.js"},
    "TOWER":{model:"assets/models/tower.js",shootHeight:14},
    "TRAININGFIELD":{model:"assets/models/training-field-02.js"}
};

(function initialize(){
    var keys = Object.keys(RobotTypes);
    for(var i=0;i<keys.length;i++){
        var type = RobotTypes[keys[i]];
        if(!("spawnHeight" in type))
            type["spawnHeight"] = 0;
        if(!("height" in type))
            type["height"] = 0;
        if(!("shootHeight" in type))
            type["shootHeight"] = 5;
    }
})();
