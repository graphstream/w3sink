/*
 * SVG Renderer for w3sink.
 */
function SvgRenderer(rootElementId, width, height) {
    this.root = document.getElementById(rootElementId);
    this.xmlns = {
	svg: "http://www.w3.org/2000/svg",
	xlink: "http://www.w3.org/1999/xlink"
    };
    
    this.svg = document.createElementNS(this.xmlns.svg, "svg");
    this.svg.setAttributeNS(null, "width", width);
    this.svg.setAttributeNS(null, "height", height);
    this.svg.style.display = "block";
    this.svg.renderer = this;

    this.svg.onmouseup = function(e) {
	this.dragged_element = null;
    };

    this.svg.onmousemove = function(e) { 
	if (this.dragged_element != null) {
	    var offset = $(this).position();
	    var offsetX = e.clientX - offset.left;
	    var offsetY = e.clientY - offset.top;
	    var x = (offsetX / this.width.animVal.value) * this.viewBox.animVal.width + this.viewBox.animVal.x;
	    var y = (offsetY / this.height.animVal.value) * this.viewBox.animVal.height + this.viewBox.animVal.y;
	    this.renderer.setNodePosition(this.dragged_element, x, y);
	}
    };
    
    this.root.appendChild(this.svg);
    
    var defs = document.createElementNS(this.xmlns.svg, "defs");
    $(defs).load('renderer/svg-defs.svg defs > *');
    
    this.svg.appendChild(defs);

    this.nodes_container = document.createElementNS(this.xmlns.svg, 'g');
    this.edges_container = document.createElementNS(this.xmlns.svg, 'g');
    this.svg.appendChild(this.edges_container);
    this.svg.appendChild(this.nodes_container);
    
    this.setViewBox = function(orgX, orgY, width, height) {
	this.svg.setAttributeNS(null, "viewBox", orgX+" "+orgY+" "+width+" "+height);
    };

    this.an = function(id) {
	var g = document.createElementNS(this.xmlns.svg, "g");
	var u = document.createElementNS(this.xmlns.svg, "use");
	var m = document.createElementNS(this.xmlns.svg, "metadata");
	
	g.setAttribute("id", w3sink.nid(id));
	u.setAttribute("id", w3sink.nid(id)+'__use');
	u.setAttributeNS(this.xmlns.xlink, "href", "#node-shape-circle");
	g.setAttributeNS(null, "transform", "translate(50 50)");
	g.setAttributeNS(null, "class", "node");
	g.setAttribute('draggable', 'true');
	
	g.onmousedown = function(e) {
	    getAncestorByTagName(this, 'svg').dragged_element = this;
	};

	g.edges = [];

	g.appendChild(m);
	g.appendChild(u);
	this.nodes_container.appendChild(g);

	var x = Math.round(Math.random()*parseInt(this.svg.getAttribute('width')));
	var y = Math.round(Math.random()*parseInt(this.svg.getAttribute('height')))
	this.setNodePosition(id,x,y);
    };
    
    this.dn = function(id) {
	var n = document.getElementById(w3sink.nid(id));
	n.parentNode.removeChild(n);
    };

    this.ae = function(id,source,target,directed) {
	var g = document.createElementNS(this.xmlns.svg, "g");
	var u = document.createElementNS(this.xmlns.svg, "polyline");
	
	g.edgePoints = [
	    document.getElementById(w3sink.nid(source)),
	    document.getElementById(w3sink.nid(target))
	];
	
	if (g.edgePoints[0] == null)
	    console.log('source node '+source+'does not exist');

	if (g.edgePoints[1] == null)
	    console.log('target node '+target+'does not exist');

	$(g.edgePoints[0]).bind('nodeMoved', {edge: g}, g.edgeNodeMoved);
	$(g.edgePoints[1]).bind('nodeMoved', {edge: g}, g.edgeNodeMoved);

	g.setAttribute("id", w3sink.eid(id));
	g.setAttributeNS(null, "class", "edge");
	g.appendChild(u);
	this.edges_container.appendChild(g);
	
	g.edgeUpdatePoints();
    };
    
    this.de = function(id) {
	var e = document.getElementById(w3sink.eid(id));
	e.parentNode.removeChild(n);
    };

    this.setNodeSize = function(id,sx,sy) {
	if(sy == undefined)
	    sy = sx;
	
	w3sink.setNodeAttribute(null,w3sink.nid(id)+'__use', 'transform', 'scale('+sx+' '+sy+')');
    };

    this.setNodeShape = function(id, shape) {
	w3sink.setNodeAttribute(this.xmlns.xlink, w3sink.nid(id)+'__use', "href", "#node-shape-"+shape);
    };
    
    this.setNodePosition = function(id, x, y) {
	var n;

	if (typeof(id) == 'string')
	    n = document.getElementById(w3sink.nid(id));
	else
	    n = id;
	
	n.x = x;
	n.y = y;
	
	n.setAttributeNS(null, 'transform', 'translate('+x+' '+y+')');

	$(n).trigger('nodeMoved', n, x, y);
	// for(var i = 0; i < n.edges.length; i++)
	//    this.updateEdgePoints(n.edges[i]);
    };

    this.setNodeStyle = function(id,k,v) {
	$('#'+w3sink.nid(id)+"__use").css(k,v);
    };

    this.updateEdgePoints = function(e) {
	var nodes = e.points;
	var points = "";
	
	for(var i=0; i<nodes.length; i++) {
	    var node = document.getElementById(w3sink.nid(nodes[i]));

	    if(i > 0)
		points += " ";
	    
	    points += nodes[i].x + " " + nodes[i].y;
	}

	e.getElementsByTagName('polyline')[0].setAttributeNS(null, 'points', points);
    };
};

SVGGElement.prototype.edgeUpdatePoints = function() {
    if (!this.edgePoints)
	return;

    var points = "";
    
    for (var i = 0; i < this.edgePoints.length; i++) {
	if(i > 0)
	    points += " ";
	
	points += this.edgePoints[i].x + " " + this.edgePoints[i].y;
    }
    
    this.getElementsByTagName('polyline')[0].setAttributeNS(null, 'points', points);
};

SVGGElement.prototype.edgeNodeMoved = function(event, node, x, y) {
    event.data.edge.edgeUpdatePoints();
};

function getAncestorByTagName(el, tn){
    tn = tn.toLowerCase();
    if(el.parentNode) {
	if ( el.parentNode.nodeType == 1
	     && el.parentNode.tagName.toLowerCase() == tn
	   ) return el.parentNode;
	return getAncestorByTagName( el.parentNode, tn );
    }
    return null
}

w3sink.Renderer = SvgRenderer;
