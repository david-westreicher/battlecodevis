var Controlbar = function(controls){
    this.controls = controls;
    this.setUp();
    this.paused = false;
    this.ffw = false;
    this.reasons = {
        "WON_BY_DUBIOUS_REASONS": "wins by having pure luck :(  (higher HQ-id)",
        "BARELY_BARELY_BEAT": "wins by generating more ore",
        "BARELY_BEAT": "wins because sanitation is important",
        "BEAT": "wins by having more tower health",
        "OWNED": "wins by having more HQ health",
        "PWNED": "wins by having more towers remaining",
        "DESTROYED": "wins by pwning the enemy's HQ"
    };
};
Controlbar.prototype = {
    setUp: function(){
        this.controls.querySelector('.play').addEventListener('click', this.pause.bind(this));
        this.controls.querySelector('.upload').addEventListener('click', this.upload.bind(this));
        this.controls.querySelector('.fforward').addEventListener('click', this.fastForward.bind(this));
        this.controls.querySelector('.skip').addEventListener('click', this.nextMap.bind(this));
        this.controls.querySelector('.frameslider input').addEventListener('change', this.updateSlider.bind(this));

        this.message = document.getElementById('message'),

        this.message.addEventListener("transitionend", function(){
            this.message.className += " hidden";
        }.bind(this), true);
        // this.message.addEventListener('click', function(e){
        //     splashscreen.className += " invisible";
        //     return false;
        // });
    },
    upload: function(){
        // refactor worker
    },
    updateSlider: function(e){
        var target = e.target || e.srcElement;
        this.updateBar(target.value);
    },
    updateBar: function(value){
        this.controls.querySelector('.frameslider input').value = value;
        document.getElementById('currentValue').textContent = value;
    },
    pause: function(){
        var elm = this.controls.querySelector('.play');
        if(this.paused){
            elm.className = elm.className.replace(" active","");
        }else{
            elm.className += " active";
        }
        this.paused = !this.paused;
    },
    fastForward: function(){
        var elm = this.controls.querySelector('.fforward');
        if(this.ffw){
            elm.className = elm.className.replace(" active","");
        }else{
            elm.className += " active";
        }
        this.ffw = !this.ffw;
        slowmotion = (this.ffw) ? 1 : 4;
    },
    isPaused: function(){
        return this.paused;
    },
    nextMap: function(winner, reason){
        var signals = replayData.maplist[simulation.currentMap].frames[replayData.maplist[simulation.currentMap].frames.length-2].signals,
            winner = (typeof winner != "string" && signals.length == 1 && signals[0].type == "mapend") ? signals[0].winner : winner,
            reason = (typeof reason != "string" && signals.length == 1) ? signals[0].reason : reason;

        if(replayData.maplist[simulation.currentMap].frames[replayData.maplist[simulation.currentMap].frames.length-1].length == 0){
            gui.win(winner);
            if(simulation.currentMap < replayData.maplist.length-1){
                this.showWinner(winner, reason, function(){
                    simulation.currentMap++;
                    simulation.score[(winner=='A')?0:1]++;
                    simulation.newMap();
                    gui.resetScores();
                });
            }else{
                if(replayData.isLoaded){
                    simulation.currentMap = 0;
                    simulation.score = [0,0];
                    this.showWinner(winner, reason, function(){
                        gui.resetUI();
                        simulation.newMap();
                        gui.resetScores();
                    });
                    return true;
                    console.log('replay');
                }else{
                    console.log('not ready yet');
                    return false;
                }
            }
        }else{
            console.log('not ready yet');
            return false;
        }
    },
    showWinner: function(winner, reason, callback){
        var container = message.children[0].children[0];

        var oldHtml = container.innerHTML,
            newHtml = "<img src='"+gui.teams[winner].image+"'/><br/><h1>"+gui.teams[winner].name+"</h1><h3>"+this.reasons[reason]+"</h3>";
        container.innerHTML = newHtml;

        message.className = message.className.replace("invisible", "");
        message.className = message.className.replace("hidden", "");
        this.pause();

        sleep(1000, function(){
            message.className += " invisible";
            container.innerHTML = oldHtml;
            this.pause();
            if(callback)
                callback.call(this);
        }, this);
    }
};
