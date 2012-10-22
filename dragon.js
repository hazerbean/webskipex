// an empty 'namespace' object is created if one doesn't exist already.
var rdfx = rdfx || {};

// a self executing function that returns an object with
// a single loaded property, that points to a function that
// writes "doc loaded" to the console.
rdfx.dragger = (function () {
	'use strict';

	var ensure_path_with_parent, ensure_path, paths_loaded, loaded;

	// recursive function that takes a path_array (of strings) and
	// ensures that each of its element strings exist as a chain of
	// child elements below the parent element.  Elements that already
	// exist are not replaced.
	ensure_path_with_parent = function (prefix, path_array, parent) {
		var id, elem, ul, li, span;

		// take the head of the path_array
		id = path_array.shift();

		// when undefined, we've reached the end of the array
		if (id) {
			prefix += "_" + id;
			// there is an id to be tested
			elem = document.getElementById(prefix);
			if (elem) {
				// sometimes its already there
				ensure_path_with_parent(prefix, path_array, elem);
			} else {

				// create a new list item element that is
				// a child of the parent
				li = document.createElement("li");
				li.setAttribute("id", prefix + "_");

				// create a span item that will go within the list
				// and add necessary text to it.
				span = document.createElement("span");
				span.setAttribute("draggable", true);
				span.appendChild(document.createTextNode(id));

				// create an unordered list into which
				// sublists may be added.
				ul = document.createElement("ul");
				ul.setAttribute("id", prefix);

				// connect the new nodes to each other and to the
				// parent element
				parent.appendChild(li);
				li.appendChild(span);
				li.appendChild(ul);

				// recurse
				ensure_path_with_parent(prefix, path_array, ul);
			}

		}
	};

	// takes an array that represents a path, finds the root
	// drag list element and kicks off a recursive
	ensure_path = function (path_array) {
		var ul = document.querySelector("#draglist");
		ensure_path_with_parent("rdfx", path_array,  ul);
	};

	paths_loaded = function (e) {
		// break up the file into an array of lines
		// by splitting it at every \n
		var raw = this.response.split("\n");

		// apply an anonymous function to each entry
		// in the array
		raw.map(
			function (path) {
				// split the line into an array such that
				// books/web/design would become
				// ["books","web","design"]
				var parts = path.split("/");
				ensure_path(parts);
			}
		);
	};

	// a function to be called when the document is loaded
	loaded = function () {
		// Use an 'ajax' XMLHttpRequest2 object to
		// load the db.txt file, and when this load is
		// complete pass control to the paths_loaded function
		var xhr = new XMLHttpRequest();
		xhr.addEventListener("load", paths_loaded);
		xhr.open('GET', 'db.txt', true);
		xhr.send();
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
