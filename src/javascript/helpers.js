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
