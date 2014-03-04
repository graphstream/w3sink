(function(exports) {
	function GS(sel) {
		this.canvas = d3.select(sel);
		
		this.svg = this.canvas.append("svg")
			.attr("width", '100%')
			.attr("height", '500px')
			.attr('viewBox', '0 0 1000 1000');
		
		this.transform = {'scale': 1, 'dx': 0, 'dy': 0};

		this.container = this.svg.append("g");
		this.container.attr('transform', 'scale(0.75)');

		this.edges = this.container.append("g");
		this.nodes = this.container.append("g");

		this.default_node_style = "fill:%autofill%;size:25px;stroke:#ffffff;stroke-width:5px;";
		this.default_node_size  = "15px";
		this.default_edge_style = "stroke:#06C;stroke-width:2px;";

		this.dispatch = d3.dispatch(
			"nodeAdded", "nodeAttributeAdded", "nodeAttributeChanged", "nodeAttributeRemoved", "nodeRemoved",
			"edgeAdded", "edgeAttributeAdded", "edgeAttributeChanged", "edgeAttributeRemoved", "edgeRemoved",
			"graphAttributeAdded", "graphAttributeChanged", "graphAttributeRemoved",
			"stepBegins", "graphCleared");
		
		this.colors_generator = d3.scale.category20b();

		this.layout = d3.layout.force()
				.gravity(0.09)
				.charge(function(d) { return -Math.random()*150-50; })
				.linkDistance(function(d) { return Math.random()*250+50; })
				.linkStrength(function(d) { return Math.random(); })
				.size([1000,1000]);

		this.layout_running = false;
		this.ut();
	}

	GS.prototype.ut = function() {
		this.container.transition()
			.duration(1000)
			.attr('transform', 'translate('+this.transform.dx+','+this.transform.dy+')scale('+this.transform.scale+')');
	}

	GS.prototype.zoom = function(z) {
		this.transform.scale = z;
		this.transform.dx = (1-z) * 1000;
		this.transform.dy = (1-z) * 1000;

		this.ut();
	}

	GS.prototype.on = function(event_name, func) {
		this.dispatch(event_name, func);
	}

	GS.prototype.an = function(id) {
		var nodes = this.nodes.selectAll('circle.node').data();
		nodes.push({'id':id});
		
		this.nodes.selectAll('circle.node')
			.data(nodes, function(d) { return d.id; }).enter().append("circle")
				.attr("class", "node")
				.attr("r", this.default_node_size)
				.attr("cx", function(d) {return ~~(Math.random()*1000);})
				.attr("cy", function(d) {return ~~(Math.random()*1000);})
				.attr('data-nodeid', function(d){return d.id;})
				.style("fill", function(d) { return 'black'; })
				.style("stroke", "white")
				.style("stroke-width", "2px")
				.call(this.layout.drag)
				.append("title")
				.text(function(d) { return d.id; });

		var defStyle = this.default_node_style
			.replace(/%autofill%/, this.colors_generator(~~(Math.random()*200)));

		this.cn(id, "style", defStyle);
		this.autolayout('reload');

		this.dispatch.nodeAdded(id);
	}

	GS.prototype.dn = function(id) {
		var edgeToRemove = [];
		var edges = this.edges.selectAll('line.edge').data();

		for (var i = 0; i < edges.length; i++) {
			if (edges[i].source.id == id || edges[i].target.id == id)
				edgeToRemove.push(edges[i]);
		}

		for (var i = 0; i < edgeToRemove.length; i++)
			this.de(edgeToRemove[i].id);

		var nodes = this.nodes.selectAll('circle.node').data();
		var nodes_data = [];

		for (var i = 0; i < nodes.length; i++) {
			if (nodes[i].id != id)
				nodes_data.push(nodes[i]);
		}

		this.nodes.selectAll('circle.node')
			.data(nodes_data, function(d) { return d.id; })
			.exit().remove();
		
		this.autolayout('reload');

		this.dispatch.nodeRemoved(id);
	}

	GS.prototype.cn = function(id, key, value) {	
		var n = this.sn(id);
		
		if (typeof(value) == 'undefined') {
			this.dispatch.nodeAttributeRemoved(id, key);
		}
		else {
			if (key=='xy')
				this.cn_xy(n, value[0], value[1]);
			else if (key=='size')
				n.attr('r', value);
			else if (key=='style')
				this.ss(n, value);
			
			this.dispatch.nodeAttributeChanged(id, key, value);
		}
	}

	GS.prototype.cn_xy = function(n, x, y) {
		if (typeof(n) == 'string' || typeof(n) == 'number')
			n = this.sn(n);
		
		n.data.px = x;
		n.data.py = y;
		n.attr('cx', x);
		n.attr('cy', y);
		
		this.edges.selectAll("line.edge[data-src='"+n.data.id+"']")
			.attr('x1', x)
			.attr('y1', y);
		this.edges.selectAll("line.edge[data-trg='"+n.data.id+"']")
			.attr('x2', x)
			.attr('y2', y);
	}

	GS.prototype.sn = function(id) {
		return this.nodes.select('circle.node[data-nodeid="'+id+'"]');
	}

	GS.prototype.ae = function(id, src, trg) {
		var edges = this.edges.selectAll('line.edge').data();
		edges.push({'id': id, 'source': this.sn(src).data()[0], 'target': this.sn(trg).data()[0]});
		
		var 	x1 = this.sn(src).attr('cx'),
			y1 = this.sn(src).attr('cy'),
			x2 = this.sn(trg).attr('cx'),
			y2 = this.sn(trg).attr('cy');

		this.edges.selectAll('line.edge')
			.data(edges, function(d) {return d.id;}).enter()
				.append("line")
				.attr("class", "edge")
				.attr("data-edgeid", function(d){return d.id;})
				.attr('x1', x1)
				.attr('y1', y1)
				.attr('x2', x2)
				.attr('y2', y2)
				.style("stroke", "black")
				.style("stroke-width", "1px");

		this.se(id).attr('data-src', src).attr('data-trg', trg);
		this.ce(id, "style", this.default_edge_style);

		this.dispatch.edgeAdded(id, src, trg);
	}

	GS.prototype.de = function(id) {
		var edges = this.edges.selectAll('line.edge').data();
		var edges_data = [];
		
		for (var i = 0; i < edges.length; i++) {
			if (edges[i].id != id)
				edges_data.push(edges[i]);
		}
		
		this.edges.selectAll('line.edge').data(edges_data, function(d) {return d.id;})
			.exit().remove();

		this.autolayout('reload');
		this.dispatch.edgeRemoved(id);
	}

	GS.prototype.ce = function(id, key, value) {
		var e = this.se(id);
		
		if (typeof(value) == 'undefined') {
			this.dispatch.edgeAttributeRemoved(id, key);
		}
		else {
			if (key=='style')
				this.ss(e, value);
			
			this.dispatch.edgeAttributeChanged(id, key, value);
		}
	}

	GS.prototype.se = function(id) {
		return this.edges.select('line.edge[data-edgeid="'+id+'"]');
	}

	GS.prototype.ss = function(e, style) {
		var styles = style.split(/\s*;\s*/);
			
		for (var i=0; i<styles.length; i++) {
			if (styles[i]=='') continue;
			var t = styles[i].split(/:/);
			t[0] = t[0].trim();
			t[1] = t[1].trim();
			e.style(t[0], t[1]);
		}
	}

	GS.prototype.autolayout = function(action) {
		if (typeof(action) == 'undefined')
			action = 'start';

		switch (action) {
		case 'start':
			var nodes = this.nodes;
			var edges = this.edges;

			this.layout.on("tick", function() {

				edges.selectAll('line.edge')
					.attr("x1", function(d) {return d.source.x;})
	 				.attr("y1", function(d) {return d.source.y;})
					.attr("x2", function(d) {return d.target.x;})
					.attr("y2", function(d) {return d.target.y;});
				
				nodes.selectAll('circle.node')
					.attr("cx", function(d) {return d.x;})
					.attr("cy", function(d) {return d.y;});
			});

			this.layout_running = true;
			this.layout.start();

			break;
		case 'reload':
			if (this.layout_running)
				this.layout.stop();

			var nodes = this.nodes.selectAll('circle.node');
			this.layout.nodes(nodes.data());

			var edges = this.edges.selectAll('line.edge');
			this.layout.links(edges.data());

			if (this.layout_running)
				this.layout.start();

			break;
		case 'stop':
			this.layout_running = false;
			this.layout.stop();
			break;
		case 'clear':
			this.layout.stop();
			this.layout.nodes([]).links([]);

			if (this.layout_running)
				this.layout.start();

			break;
		}
	}
	
	GS.prototype.cl = function() {
		this.edges.selectAll('line.edge').remove();
		this.nodes.selectAll('circle.node').remove();
		this.autolayout('clear');
		this.dispatch.graphCleared();
	}

	exports.GS = GS;
})(window);
