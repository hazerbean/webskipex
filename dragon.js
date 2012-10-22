// an empty 'namespace' object is created if one doesn't exist already.
var rdfx = rdfx || {};

// a self executing function that returns an object with
// a single loaded property, that points to a function that
// writes "doc loaded" to the console.
rdfx.dragger = (function () {
	'use strict';

	// all variables used within this function are declared here.
	var drag_over,
		drag_start,
		drag_enter,
		drag_leave,
		drop,
		make_drop_zone,
		make_draggable,
		ensure_path_with_parent,
		ensure_path,
		paths_loaded,
		loaded;

	// this MUST return false in order for an element
	// to be able to accept dragged and dropped items
	// bizarre but true: e.g. http://goo.gl/30e6U
	drag_over = function (ev) {
		ev.preventDefault();
		return false;
	};

	// use the start of a drag to grab the ID
	// of the thing that's being dragged (so it can
	// be used later to get a handle on the element
	// to move)
	drag_start = function (ev) {
		ev.dataTransfer.setData("string:text/x-rdfx", ev.target.parentElement.id);
	};

	// update the CSS of an element that is the
	// target of an ongoing drag
	drag_enter = function (ev) {
		ev.target.classList.add("dragtarget");
	};

	// update the CSS of an element that was
	// previously dragged over
	drag_leave = function (ev) {
		ev.target.classList.remove("dragtarget");
	};

	// handles dropping of one element on another
	// works out where the element should be moved
	// to and adjusts the Document Object Model (DOM) accordingly
	drop = function (ev) {

		var data, elem, target, ul;

		// get the ID of the element to be moved
		data = ev.dataTransfer.getData("string:text/x-rdfx");
		elem = document.getElementById(data);

		// get a handle where the drop occurred
		target = ev.target;

		if (target.nodeName === "LI") {
			// if the drop occurred on an LI, then the
			// dropped item should be added to its sublist
			target = target.querySelector("ul");
			target.insertBefore(elem, target.firstChild);
		} else {
			if (target.nodeName === "SPAN") {
				// if the drop occurred on a SPAN, then the
				// dropped item should be added to its
				// parent UL (i.e. they become siblings)
				ul = target.parentElement.parentElement;
				ul.insertBefore(elem, target.parentElement);
			} else {
				// we assume it's already in the UL
				target.appendChild(elem);
			}
		}

		// ensure the target is no longer highlighted
		ev.target.classList.remove("dragtarget");

		// exit, ensuring the detailt is canceled so
		// its clear the drop has been handled.
		ev.preventDefault();
		return false;
	};


	// Adds the listeners necessary for an element to react when
	// when objects are dragged over or dropped on them
	make_drop_zone = function (elem) {
		elem.addEventListener("drop", drop, false);
		elem.addEventListener("dragover", drag_over, false);
		elem.addEventListener("dragenter", drag_enter, false);
		elem.addEventListener("dragleave", drag_leave, false);
	};


	// Adds any listeners necessary for an element to be draggable
	make_draggable = function (elem) {
		elem.addEventListener("dragstart", drag_start, false);
	};


	// recursive function that takes a path_array (of strings) and
	// ensures that each of its element strings exist as a chain of
	// child elements below the parent element.  Elements that already
	// exist are not replaced.
	ensure_path_with_parent = function (prefix, path_array, parent) {
		var id, elem, ul, li, span;

		// any parent should be able to receive drops
		make_drop_zone(parent);

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

				// a new element has been created so
				// attach the drag listeners
				make_draggable(span);

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
