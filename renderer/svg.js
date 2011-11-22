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
    
    this.root.appendChild(this.svg);
    
    var defs = document.createElementNS(this.xmlns.svg, "defs");
    $(defs).load('renderer/svg-defs.svg defs > *');
    
    this.svg.appendChild(defs);
    
    this.an = function(id) {
	var g = document.createElementNS(this.xmlns.svg, "g");
	var u = document.createElementNS(this.xmlns.svg, "use");
	var m = document.createElementNS(this.xmlns.svg, "metadata");
	
	g.setAttribute("id", w3sink.nid(id));
	u.setAttribute("id", w3sink.nid(id)+'__use');
	u.setAttributeNS(this.xmlns.xlink, "href", "#node-shape-circle");
	g.setAttributeNS(null, "transform", "translate(50 50)");
	g.setAttributeNS(null, "class", "node");
	
	g.appendChild(m);
	g.appendChild(u);
	this.svg.appendChild(g);

	var x = Math.round(Math.random()*parseInt(this.svg.getAttribute('width')));
	var y = Math.round(Math.random()*parseInt(this.svg.getAttribute('height')))
	this.set_node_position(id,x,y);
    };
    
    this.dn = function(id) {
	var n = document.getElementById(w3sink.nid(id));
	n.parentNode.removeChild(n);
    };

    this.ae = function(id,source,target,directed) {
	var g = document.createElementNS(this.xmlns.svg, "g");
	var u = document.createElementNS(this.xmlns.svg, "polyline");
	var m = document.createElementNS(this.xmlns.svg, "metadata");
	
	var s = document.createElement('node');
	var t = document.createElement('node');
	s.innerHTML = source;
	t.innerHTML = target;
	m.appendChild(s);
	m.appendChild(t);
	
	var nm = $('#'+w3sink.nid(source)+' metadata').get(0);
	var ne = document.createElement('edge');
	ne.innerHTML = id;
	nm.appendChild(ne);

	nm = $('#'+w3sink.nid(target)+' metadata').get(0);
	ne = document.createElement('edge');
	ne.innerHTML = id;
	nm.appendChild(ne);

	g.setAttribute("id", w3sink.eid(id));
	g.setAttributeNS(null, "class", "edge");
	g.appendChild(m);
	g.appendChild(u);
	this.svg.appendChild(g);
	this.update_edge_points(g);
    };
    
    this.de = function(id) {
	var e = document.getElementById(w3sink.eid(id));
	e.parentNode.removeChild(n);
    };

    this.set_node_size = function(id,sx,sy) {
	if(sy == undefined)
	    sy = sx;
	
	w3sink.set_node_attribute(null,w3sink.nid(id)+'__use', 'transform', 'scale('+sx+' '+sy+')');
    };

    this.set_node_shape = function(id, shape) {
	w3sink.set_node_attribute(this.xmlns.xlink, w3sink.nid(id)+'__use', "href", "#node-shape-"+shape);
    };
    
    this.set_node_position = function(id, x, y) {
	w3sink.set_node_attribute(null,w3sink.nid(id), 'transform', 'translate('+x+' '+y+')');
	var edges = document.getElementById(w3sink.nid(id)).getElementsByTagName('metadata')[0].getElementsByTagName('edge');

	for(var i = 0; i < edges.length; i++)
	    this.update_edge_points(document.getElementById(w3sink.eid(edges[i].innerHTML)));
    };

    this.set_node_style = function(id,k,v) {
	$('#'+w3sink.nid(id)+"__use").css(k,v);
    };

    this.update_edge_points = function(e) {
	var nodes = e.getElementsByTagName('metadata')[0].getElementsByTagName('node');
	var points = "";
	
	for(var i=0; i<nodes.length; i++) {
	    var node = document.getElementById(w3sink.nid(nodes[i].innerHTML));
	    var coords = node.getAttribute('transform');

	    if(coords != null) {
		if(i > 0)
		    points += " ";
		
		points += coords.substring(10, coords.length - 1);
	    }
	}

	e.getElementsByTagName('polyline')[0].setAttributeNS(null, 'points', points);
    };
};

w3sink.renderer = SvgRenderer;
