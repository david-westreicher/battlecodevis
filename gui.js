var GUI = function(){
    this.baseImgUrl = "http://s3.amazonaws.com/battlecode-avatars/avatars/";
    this.teamSections = $('.stats > div')
    this.resetScores();
}
GUI.prototype = {
    setTeams: function(data){
        forEach(this.teamSections, function(i, section){
            // set photo
            section.getElementsByClassName('photo')[0].firstElementChild.src = this.baseImgUrl+data[i][1];
            // set name
            section.getElementsByTagName('h3')[0].textContent = data[i][0];
        }, this);
    },
    updateScore: function(team, more){
        var teamIndex = (team=="A")?0:1;
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
    }
}
