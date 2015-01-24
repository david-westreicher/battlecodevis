require('package-script').spawn([
// INSTALLATION
{
    command: "npm",
    args: ["install", "-g", "pako@>=0.2.5"]
}, {
    command: "npm",
    args: ["install", "-g", "express@~4.9.x"]
}, {
    command: "npm",
    args: ["install", "-g", "browserify"]
}, {
    command: "npm",
    args: ["install", "-g", "beefy"]
}, { 
    command: "npm",
    args: ["install", "-g", "bower"]
}, {
    command: "npm",
    args: ["install", "-g", "grunt"]
}, {
    command: "npm",
    args: ["install", "-g", "grunt-cli"]
}, {
    command: "npm",
    args: ["install", "-g", "grunt-bower-requirejs@1.1"]
}, {
    command: "npm",
    args: ["install", "-g", "grunt-contrib-less@0.10"]
},

// SYMLINKS
{
    command : "pako",
    args : ["link", "pako"]
}, {
    command : "npm",
    args : ["link", "grunt"]
}, {
    command : "npm",
    args : ["link", "grunt-cli"]
}, {
    command : "npm",
    args : ["link", "grunt-bower-requirejs"]
}, {
    command : "npm",
    args : ["link", "grunt-contrib-less"]
},

// SCRIPTS
{
    command : "bower",
    args : ["install"]
}, {
    command : "grunt",
    args : []
}],

// package-script OPTIONS
{
    log : true
},

// package-script CALLBACK
function() {
    console.log("npm package-script global installation successfull");
});