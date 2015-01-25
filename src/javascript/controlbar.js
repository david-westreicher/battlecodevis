var Controlbar = function(controls){
    this.controls = controls;
    this.setUp();
    this.pause = false;
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
        if(this.pause){
            elm.className = elm.className.replace(" active","");
        }else{
            elm.className += " active";
        }
        this.pause = !this.pause;
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
    isPause: function(){
        return this.pause;
    },
    nextMap: function(){
    }
};
