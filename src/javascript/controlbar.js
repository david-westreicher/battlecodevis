var Controlbar = function(controls){
    this.controls = controls;
    this.setUp();
    this.paused = false;
    this.ffw = false;
};
Controlbar.prototype = {
    setUp: function(){
        this.controls.querySelector('.play').addEventListener('click', this.pause.bind(this));
        this.controls.querySelector('.upload').addEventListener('click', this.upload.bind(this));
        this.controls.querySelector('.fforward').addEventListener('click', this.fastForward.bind(this));
        this.controls.querySelector('.skip').addEventListener('click', this.nextMap.bind(this));
        this.controls.querySelector('.slider input').addEventListener('change', this.updateSlider.bind(this));
    },
    upload: function(){
        // refactor worker
    },
    updateSlider: function(e){
        var target = e.target || e.srcElement
        this.updateBar(target.value);
    },
    updateBar: function(value){
        this.controls.querySelector('.slider input').value = value;
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
    nextMap: function(winner){
        var signals = replayData.maplist[simulation.currentMap].frames[replayData.maplist[simulation.currentMap].frames.length-2].signals,
            winner = (typeof winner != "string" && signals.length == 1 && signals[0].type == "mapend") ? signals[0].winner : winner;

        if(replayData.maplist[simulation.currentMap].frames[replayData.maplist[simulation.currentMap].frames.length-1].length == 0){
            gui.win(winner);
            if(simulation.currentMap < replayData.maplist.length-1){
                this.showWinner(winner, function(){
                    simulation.currentMap++;
                    simulation.score[(winner=='A')?0:1]++;
                    simulation.newMap();
                    gui.resetScores();
                });
            }else{
                if(replayData.isLoaded){
                    simulation.currentMap = 0;
                    simulation.score = [0,0];
                    this.showWinner(winner, function(){
                        gui.resetUI()
                        simulation.newMap();
                        gui.resetScores();
                    });
                    return true;
                    console.log('replay');
                }else{
                    console.log('not ready yet')
                    return false;
                }
            }
        }else{
            console.log('not ready yet');
            return false;
        }
    },
    showWinner: function(winner, callback){
        var message = document.getElementById('message');
        var oldText = message.textContent;
        message.textContent = winner +' - '+ message.textContent;
        message.style.display = "block";
        this.pause();

        sleep(300, function(){
            message.style.display = "none";
            message.textContent = oldText;
            this.pause();
            if(callback)
                callback.call(this);
        }, this);
    }
};
