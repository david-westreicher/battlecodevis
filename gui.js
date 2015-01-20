var GUI = function(){
    this.baseImgUrl = "http://s3.amazonaws.com/battlecode-avatars/avatars/";
    this.teamSections = $('.stats > div')
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
            this.towers[team]++;
            var tower = document.createElement('li');
            tower.className = "alive",
            this.teamSections[teamIndex].getElementsByClassName('towers')[0].appendChild(tower);
        }else{
            this.teamSections[teamIndex].getElementsByClassName('towers')[0].children[this.towers[team]-1].className = "dead";
            this.towers[team]--;
        }
    },
    resetScores: function(){
        this.towers = {'A': 0, 'B': 0};
        forEach(this.teamSections, function(i, section){
            var towerParent = section.getElementsByClassName('towers')[0];
            while(towerParent.firstElementChild){
                towerParent.removeChild(towerParent.firstElementChild);
            }
        });
    },
    win: function(team){
        var trophy = document.createElement('li'),
            teamIndex = this.getTeamIndex(team);
        this.teamSections[teamIndex].getElementsByClassName('trophies')[0].appendChild(trophy);
    },
    getTeamIndex: function(team){
        return (team=="A")?0:1;
    }
}
