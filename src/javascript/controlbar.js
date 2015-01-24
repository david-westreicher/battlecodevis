var controlbar = function(slider){
    this.slider = slider;
    this.setUp();
};
controlbar.prototype = {
    setUp: function(){
        this.slider.addEventListener('change', this.change);
    },
    change: function(e){
        document.getElementById('currentValue').textContent = this.value;
    }
};
