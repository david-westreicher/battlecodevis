module.exports = function(grunt) {
    /**
     * ACTION CONFIG
     */
    grunt.initConfig({
        bower : {
            target : {
                rjsConfig : 'src/require.bower.js'
            }
        },
        less : {
            src : {
                expand : true,
                cwd : 'src/styles/less',
                src : '*.less',
                ext : '.css',
                dest : 'src/styles/css'
            },
            bootstrap : {
                expand : true,
                cwd : 'src/styles/less/bootstrap',
                src : 'bootstrap.less',
                ext : '.css',
                dest : 'src/styles/css/bootstrap'
            }
        }
    });

    /**
     * LOAD
     */
    grunt.loadNpmTasks('grunt-bower-requirejs');
    grunt.loadNpmTasks('grunt-contrib-less');

    /**
     * ACTIONS
     */
    var defaultActions = Array('less', 'bower');
    grunt.registerTask('default', defaultActions);
}; 