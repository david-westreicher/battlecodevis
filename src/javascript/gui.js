var GUI = function(){
    this.baseImgUrl = "http://s3.amazonaws.com/battlecode-avatars/avatars/";
    this.teamSections = $('.stats > div')
    this.teams = {
        'A': {
            'towers': 0,
            'HQ': 0,
            'COMMANDER': 0
        },
        'B': {
            'towers': 0,
            'HQ': 0,
            'COMMANDER': 0
        }
    }
    this.resetScores();
}
GUI.prototype = {
    setUpControls: function(){
        this.slider = new controlbar(document.querySelector('.slider input'));
    },
    setTeams: function(data){
        forEach(this.teamSections, function(i, section){
            // set photo
            var imgUrl = (data[i][1].match(/hq\d+\.png/i)) ? 'assets/images/avatar_placeholder.png' : this.baseImgUrl + data[i][1];
            section.getElementsByClassName('photo')[0].firstElementChild.src = imgUrl;
            // set name
            section.getElementsByTagName('h3')[0].textContent = data[i][0];
        }, this);
    },
    updateScore: function(team, more){
        var teamIndex = this.getTeamIndex(team);
        if(more){
            this.teams[team].towers++;
            var tower = document.createElement('li');
            tower.className = "alive",
            this.teamSections[teamIndex].getElementsByClassName('towers')[0].appendChild(tower);
        }else{
            this.teamSections[teamIndex].getElementsByClassName('towers')[0].children[this.teams[team].towers-1].className = "dead";
            this.teams[team].towers--;
        }
    },
    setHQ: function(robot){
        this.teams[robot.team].HQ = robot.id;
        this.updateHP(robot, true);
    },
    setCommander: function(robot){
        var commanderElement = this.teamSections[this.getTeamIndex(robot)].getElementsByClassName(robot.type.toLowerCase());
        this.teams[robot.team].COMMANDER = robot.id;
        this.updateHP(robot, true);
        commanderElement[0].style.display = "block";
    },
    updateHP: function(robot, force){
        var type = robot.type.toLowerCase();
        forEach(this.teams, function(i, team){
            if(simulation.data.robots[team[robot.type]]){
                var bar = this.teamSections[this.getTeamIndex(team)].getElementsByClassName(type)[0],
                    percent = (simulation.data.robots[team[robot.type]].hp/constants[robot.type].hp)*100;
                bar.getElementsByTagName('span')[0].style.width = percent+'%';
                console.log('team '+ team +' '+ robot.type +' hp: ' + percent + '%');
            }
        }, this);
    },
    // when map is finished
    resetScores: function(){
        this.teams.A.towers = 0;
        this.teams.B.towers = 0;
        forEach(this.teamSections, function(i, section){
            var parent = section.querySelector('.towers');
            removeChildren(parent, 'li');
        });

        // reset COMMANDER
        this.commanderDead("A");
        this.commanderDead("B");
    },
    win: function(team){
        var trophy = document.createElement('li'),
            teamIndex = this.getTeamIndex(team);
        this.teamSections[teamIndex].getElementsByClassName('trophies')[0].appendChild(trophy);
    },
    commanderDead: function(team){
        this.teams[team].COMMANDER = 0;
        this.teamSections[this.getTeamIndex(team)].getElementsByClassName('commander')[0].style.display = "none";
    },
    getTeamIndex: function(team){
        return (team=="A")?0:1;
    },
    // when loading a new game
    resetUI: function(){
        // reset HQ
        this.teams.A.HQ = 0;
        this.teams.B.HQ = 0;

        // reset trophies
        forEach(this.teamSections, function(i, section){
            var trophiesParent = section.querySelector('.trophies');
            removeChildren(trophiesParent, 'li');
        });
    }
}
