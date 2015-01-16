var pako = require('pako');

window.pako = pako;
window.unzip = function(file){
    var reader = new FileReader();
    reader.onload = function(e){
        var byteArray = new Uint8Array(reader.result);
        try {
            var start = new Date().getTime();
            var result = pako.inflate(byteArray);
            var string = String.fromCharCode.apply(null,result.subarray(0,50))
            console.log(string);
            var end = new Date().getTime();
        }catch (err) {
            console.log(err);
        }
        console.log('unzip execution time: ' + (end - start));
    }
    reader.readAsArrayBuffer(file);
};
