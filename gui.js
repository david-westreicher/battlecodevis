var GUI = function(){
    this.baseImgUrl = "http://s3.amazonaws.com/battlecode-avatars/avatars/";
    this.teamSections = $('.stats > div')
    this.teams = {
        'A': {
            'towers': 0,
            'HQ': 0
        },
        'B': {
            'towers': 0,
            'HQ': 0
        }
    }
    this.resetScores();
}
GUI.prototype = {
    setTeams: function(data){
        forEach(this.teamSections, function(i, section){
            // set photo
            var imgUrl = (data[i][1].match(/hq\d+\.png/i)) ? 'images/avatar_placeholder.png' : this.baseImgUrl + data[i][1];
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
    updateLiveBar: function(bar, percent){
        bar.getElementsByTagName('span')[0].style.width = percent+'%';
    },
    setHQIds: function(robot){
        this.teams[robot.team].HQ = robot.id;
        this.updateHQHP();
    },
    updateHQHP: function(){
        forEach(this.teams, function(i, team){
            if(simulationData.robots[team.HQ]){
                console.log('team '+ team +' hp: ' + (simulationData.robots[team.HQ].hp/constants.HQ.hp)*100 + '%');
                var bar = this.teamSections[this.getTeamIndex(team)].getElementsByClassName('live')[0];
                this.updateLiveBar(bar, ((simulationData.robots[team.HQ].hp/constants.HQ.hp)*100));
            }
        }, this);
    },
    resetScores: function(){
        this.teams.A.towers = 0;
        this.teams.B.towers = 0;
        forEach(this.teamSections, function(i, section){
            var parent = section.querySelector('.towers');
            removeChildren(parent, 'li');
        });
    },
    win: function(team){
        var trophy = document.createElement('li'),
            teamIndex = this.getTeamIndex(team);
        this.teamSections[teamIndex].getElementsByClassName('trophies')[0].appendChild(trophy);
    },
    resetWins: function(){
        this.teams.A.HQ = 0;
        this.teams.B.HQ = 0;
    },
    getTeamIndex: function(team){
        return (team=="A")?0:1;
    },
}
