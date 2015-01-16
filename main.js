var gzip = require('gzip-js');
//     options = {
//         level: 3,
//         name: 'hello-world.txt',
//         timestamp: parseInt(Date.now() / 1000, 10)
//     };
//
// // out will be a JavaScript Array of bytes
// var out = gzip.zip('Hello world', options);

var ChunkReader = function(file){
    var self = this;
    self.update = function(){
        console.log(self.start);
        console.log(self.end);
        console.log(self.file);
    }
    self.readNextLine = function(){
        if(self.start<self.file.size)
            self.reader.readAsBinaryString(self.file.slice(self.start,self.end));
        else{
            console.log("EOF")
            console.log("time: "+(new Date().getTime()-self.startTime.getTime()));
        }
        self.start+=self.chunkSize;
        self.end+=self.chunkSize;
        self.end= Math.min(self.file.size,self.end);
    }
    self.startTime = new Date();
    self.chunkSize = 1024;
    self.chunkSize = 2048;
    self.chunkSize = 4096;
    self.start = 0;
    self.end = self.chunkSize;
    self.reader = new FileReader();
    self.reader.onload = function(e){
        // console.log(self.reader.result);
        self.readNextLine();
    }
    self.file = file;
}
window.fileSelected = function(file){
    var reader = new FileReader();
    var data = null;
    reader.onload = function(e){
        var byteArray = new Uint8Array(reader.result);
        var start = new Date().getTime();
        data = gzip.unzip(byteArray);
        var end = new Date().getTime();
        console.log('unzip execution time: ' + (end - start));
    }
    reader.readAsArrayBuffer(file);
    return data;
};
