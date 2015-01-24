define(function() {

	/**
	 * Register Method
	 * objpath is a dot limited string of paths (like com.schnitzel.namespace)
	 */
	window.register = function(objpath, obj) {
		var arr_objects = objpath.split('.');
		var obj_root = window;
		var string_root = 'window';

		// for each object separated by a dot
		for(var i = 0; i < arr_objects.length; i++) {
			// if object exists in root
			if(obj_root[arr_objects[i]] === undefined) {
				// set obj to path if it is defined
				if(obj){
					obj_root[arr_objects[i]] = obj;
				}else{
					obj_root[arr_objects[i]] = new Object();
				}
				
				obj_root = obj_root[arr_objects[i]];
				string_root += '.' + arr_objects[i];
			} else {
				obj_root = obj_root[arr_objects[i]];
				string_root += '.' + arr_objects[i];
			}
		}
	};
	
	/**
	 * Set URL Prefix 
	 */
	if(!window.urlPrefix){
		//window.urlPrefix = 'http://';
		window.urlPrefix = '';
	}
	window.setUrlPrefix = function(val){
        window.urlPrefix = val;
    };
    window.getUrlPrefix = function(){
        return window.urlPrefix;
    };
	
	/**
	 * Require App
	 * You can add Ready Event Functions
	 * which will be executed on loading of the needed require.js modules
	 * most important is the config file (which contains all the loaded modules)
	 */
	var requireApp = {
		ready: false,
		readyFunctions: Array(),

		onReady: function(func) {
			if(func) {
				if(this.isReady()) {
					func();
				} else {
					this.readyFunctions.push(func);
				}
			}
		},

		isReady: function() {
			return this.ready;
		},

		setReady: function() {
			if(!this.ready) {
				this.ready = true;
				for(var i = 0; i < this.readyFunctions.length; i++) {
					this.readyFunctions[i]();
				}
			}
		}
	};

	/**
	 * default require settings
	 */
	require.config({
		//baseUrl: './',
		shim: {
			'bootstrap3-editable': {
				deps: [
					"jquery-ui",
					'css!bootstrap3-editable-css'
				]
			}
		},
		paths: {
			r: 'require.app',
			config: 'require.bower',
			vendor: '../vendor',
			styles: 'styles',
			
			// workbench vendor paths
			'project-isolationcamp-js': '../workbench/project/isolationcamp-js/src',

			// additional Vendor Paths - Fixes Issues
			'eventEmitter': '../vendor/eventEmitter',
			'eventie': '../vendor/eventie',
			'statsjs': '../vendor/stats.js/build/stats.min',
			
			'bootstrap3-editable': '../vendor/x-editable/dist/bootstrap3-editable/js/bootstrap-editable.min',
			'bootstrap3-editable-css': '../vendor/x-editable/dist/bootstrap3-editable/css/bootstrap-editable'
		},
		callback: function() {
			// set app dependencies - dispatch ready event after those modules are loaded
			require(['config'], function() {
				requireApp.setReady();
			});
		}
	});

	/**
	 *
	 */
	return requireApp;
}); 