(function (exports) {
	function Layout(graph) {
		this.graph = graph;
		this.nodes = [];
		this.links = [];
		
		this.graph.addSink(this);
		
		for (var id in this.graph.nodes)
			this.registerNode(id);
		
		for (var id in this.graph.edges)
			this.registerEdge(id);
	}
	
	Layout.prototype = {
		start: function() {},
		reload: function() {},
		stop: function() {},
		
		registerNode: function(id) {
			var n = this.graph.nodes[id];
			n.layoutIndex = this.nodes.length;
			this.nodes.push({id:id});
		},
		
		unregisterNode: function(id) {
			var n = this.graph.nodes[id];
			this.nodes.splice(n.layoutIndex, 1);
		},
		
		registerEdge: function(id) {
			var e = this.graph.edges[id];
			e.layoutIndex = this.links.length;
			this.links.push({id:id, source:this.nodes[e.source.layoutIndex], target:this.nodes[e.target.layoutIndex], value:1});
		},
		
		unregisterEdge: function(id) {
			var e = this.graph.edges[id];
			this.links.splice(e.layoutIndex, 1);
		},
		
		nodeAdded: function(sourceId, timeId, nodeId) {
			this.registerNode(nodeId);
			this.reload();
		},
		
		nodeRemoved: function(sourceId, timeId, nodeId) {
			this.unregisterNode(nodeId);
			this.reload();
		},
		
		edgeAdded: function(sourceId, timeId, edgeId, source, target, directed) {
			this.registerEdge(edgeId);
			this.reload();
		},
		
		edgeRemoved: function(sourceId, timeId, edgeId) {
			this.unregisterEdge(edgeId);
			this.reload();
		},
		
		graphCleared: function(sourceId, timeId) {
			this.nodes = [];
			this.links = [];
			this.reload();
		},
		
		pushXY: function() {
			for (var i = 0; i < this.nodes.length; i++)
				this.graph.setXY(this.nodes[i].id, this.nodes[i].x, this.nodes[i].y);
		},
		
		nodeAttributeAdded: function(sourceId, timeId, nodeId, attrId, value) {},
		nodeAttributeChanged: function(sourceId, timeId, nodeId, attrId, oldValue, newValue) {},
		nodeAttributeRemoved: function(sourceId, timeId, nodeId, attrId) {},
		edgeAttributeAdded: function(sourceId, timeId, edgeId, attrId, value) {},
		edgeAttributeChanged: function(sourceId, timeId, edgeId, attrId, oldValue, newValue) {},
		edgeAttributeRemoved: function(sourceId, timeId, edgeId, attrId) {},
		graphAttributeAdded: function(sourceId, timeId, attrId, value) {},
		graphAttributeChanged: function(sourceId, timeId, attrId, oldValue, newValue) {},
		graphAttributeRemoved: function(sourceId, timeId, attrId) {},
		stepBegins: function(sourceId, timeId, step) {}
	};
	
	GS.extend(GS.Sink.prototype, Layout.prototype);	
	
	function ForceLayout(graph) {
		Layout.call(this, graph);
		
		this.layout_running = false;
		this.layout = d3.layout.force()
				.gravity(0)
				.charge(-15)
				.linkDistance(30);
			
		var that = this;

		this.layout.on("tick", function() {that.pushXY();});
	}
	
	ForceLayout.prototype = {
		start: function() {
			this.layout_running = true;
			this.reload();
		},
		
		reload: function() {
			if (this.layout_running)
				this.layout.stop();

			this.layout
				.nodes(this.nodes)
				.links(this.links);

			if (this.layout_running)
				this.layout.start();
		},
		
		stop: function() {
			this.layout_running = false;
			this.layout.stop();
		}
	};
	
	GS.extend(Layout.prototype, ForceLayout.prototype);	
	
	exports.GS.Layout = Layout;
	exports.GS.ForceLayout = ForceLayout;
}	(this));