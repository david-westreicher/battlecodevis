require.config({
	shim: {
		jquery: {
			exports: "$"
		},
		underscore: {
			exports: "_"
		},
		backbone: {
			deps: [
				"jquery",
				"underscore"
			],
			exports: "Backbone"
		},
		"backbone.marionette": {
			deps: [
				"backbone",
				"backbone.babysitter",
				"backbone.wreqr"
			]
		},
		bootstrap: {
			deps: [
				"jquery"
			]
		},
		shufflejs: {
			deps: [
				"modernizr"
			]
		},
		modernizr: {
			exports: "Modernizr"
		},
		"angular-route": {
			deps: [
				"angular"
			]
		},
		"angular-mocks": {
			deps: [
				"angular"
			]
		},
		"af-moo4q": {
			deps: [
				"jquery"
			]
		}
	},
	deps: [
		"require.app"
	],
	map: {
		"*": {
			css: "css",
			font: "font",
			text: "text"
		}
	},
	paths: {
		backbone: "../vendor/backbone/backbone",
		"backbone.babysitter": "../vendor/backbone.babysitter/lib/backbone.babysitter",
		"backbone.marionette": "../vendor/backbone.marionette/lib/core/backbone.marionette",
		"backbone.wreqr": "../vendor/backbone.wreqr/lib/backbone.wreqr",
		bootstrap: "../vendor/bootstrap/dist/js/bootstrap",
		hammerjs: "../vendor/hammerjs/hammer",
		jquery: "../vendor/jquery/jquery",
		css: "../vendor/require-css/css",
		"css-builder": "../vendor/require-css/css-builder",
		normalize: "../vendor/require-css/normalize",
		requirejs: "../vendor/requirejs/require",
		async: "../vendor/requirejs-plugins/src/async",
		depend: "../vendor/requirejs-plugins/src/depend",
		font: "../vendor/requirejs-plugins/src/font",
		goog: "../vendor/requirejs-plugins/src/goog",
		image: "../vendor/requirejs-plugins/src/image",
		json: "../vendor/requirejs-plugins/src/json",
		mdown: "../vendor/requirejs-plugins/src/mdown",
		noext: "../vendor/requirejs-plugins/src/noext",
		propertyParser: "../vendor/requirejs-plugins/src/propertyParser",
		"Markdown.Converter": "../vendor/requirejs-plugins/lib/Markdown.Converter",
		text: "../vendor/requirejs-plugins/lib/text",
		threejs: "../vendor/threejs/build/three",
		underscore: "../vendor/underscore/underscore"
	},
	packages: [

	]
});