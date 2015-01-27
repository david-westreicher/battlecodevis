// global helper
var $ = function (el) {
    return document.querySelectorAll(el);
}
var forEach = function (object, callback, scope){
    var isObject = Object.prototype.toString.call(object) == "[object Object]";
    var i,
        keys = (isObject) ? Object.keys(object) : object,
        l = keys.length;

    for (i = 0; i < l; ++i) {
        var item = object[(isObject) ? keys[i] : i];
        callback.call(scope, i, item); // passes back stuff we need
    }
};
var removeChildren = function(parentElement, selector){
    while(parentElement.lastChild){
        parentElement.removeChild(parentElement.lastChild);
    }
};
var sleep = function(time, callback, scope){
    var runCount = 0;
    function timerMethod() {
        runCount++;
        if(runCount > 3){
            clearInterval(timerId);
            callback.call(scope);
        }
    }

    var timerId = setInterval(timerMethod, time);
};
// fade out
var fadeOut = function(el){
    el.style.opacity = 1;

    (function fade() {
        if ((el.style.opacity -= .1) < 0) {
            el.style.display = "none";
        } else {
            requestAnimationFrame(fade);
        }
    })();
}

// fade in
var fadeIn = function(el, display){
    el.style.opacity = 0;
    el.style.display = display || "block";

    (function fade() {
        var val = parseFloat(el.style.opacity);
        if (!((val += .1) > 1)) {
            el.style.opacity = val;
            requestAnimationFrame(fade);
        }
    })();
}
