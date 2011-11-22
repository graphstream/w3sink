$(function() {
    function SvgRenderer(svgRootElement) {
	this.root = svgRootElement;
	
	this.init = function() {
	    /*
	     * Loading defs of the canvas.
	     */
	    var defs = $('<defs></defs>');
	    defs.load('renderer/svg-defs.xml defs > *');
	    this.root.prepend(defs);
	};
	
	this.an = function(id) {
	    var n = $('<g id="node:'+id+'"><use xlink:href="#node-shape-circle" x="150" y="150"/></g>');
	    this.root.append(n);
	};

	this.set_node_shape = function(id, shape) {
	    var e = $('#'+id+' use');
	    
	    if(e.length != 1) {
		// Failed here
	    }

	    
	};
    };

    $.extend({"renderer": SvgRenderer});
});