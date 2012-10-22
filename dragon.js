// an empty 'namespace' object is created if one doesn't exist already.
var rdfx = rdfx || {};

// a self executing function that returns an object with
// a single loaded property, that points to a function that
// writes "doc loaded" to the console.
rdfx.dragger = (function () {
	'use strict';

	// a function to be called when the document is loaded
	var loaded = function () {
		console.log("doc loaded");
	};

	// construct and return an object with a property called
	// "loaded" whose value is the loaded function
	return {
		"loaded": loaded
	};

// note the () means this function is executed immediately
// and the value that it returns is what gets stored in the
// rdfx.dragger variable
}());

// establish a listener so that when the load event is
// fired, the function referred to by the rdfx.dragger.loaded
// property is executed
window.addEventListener("load", rdfx.dragger.loaded);
