(function(exports) {
    'use strict';

    function CanvasNode(graph, nodeId) {
        exports.GS.Node.call(this, graph, nodeId);

        this.shape = new exports.Kinetic.Circle({
            x: graph.randomPixelX(),
            y: graph.randomPixelY(),
            radius: 15,
            fill: 'black',
            stroke: 'white',
            strokeWidth: 2
        });
    }

    CanvasNode.prototype = {
        updateShapePosition: function() {
            this.shape.setX(this.pixelX);
            this.shape.setY(this.pixelY);
            this.graph.context.layers.drawLayerOf(this);
        },

        setFill: function(color) {
            this.shape.setFill(color);
        },

        setStroke: function(color) {
            this.shape.setStroke(color);
        },

        setStrokeWidth: function(size) {
            this.shape.setStrokeWidth(size);
        },

        setSize: function(size) {
            this.shape.setRadius(size);
        }
    };

    exports.GS.extend(exports.GS.Node.prototype, CanvasNode.prototype);

    function CanvasEdge(graph, edgeId, source, target, directed) {
        exports.GS.Edge.call(this, graph, edgeId, source, target, directed);

        this.shape = new Kinetic.Line({
            points: this.points,
            stroke: 'black',
            strokeWidth: 2,
            lineJoin: 'round',
            lineCap: 'round'
        });
    }

    CanvasEdge.prototype = {
        updateShapePosition: function() {
            this.shape.setPoints(this.points);
            this.graph.context.layers.drawLayerOf(this);
        },

        setFill: function(color) {
            this.shape.setFill(color);
        },

        setStroke: function(color) {
            this.shape.setStroke(color);
        },

        setStrokeWidth: function(size) {
            this.shape.setStrokeWidth(size);
        }
    };

    exports.GS.extend(exports.GS.Edge.prototype, CanvasEdge.prototype);

    function Layers(stage, nodeLayers, edgeLayers) {
        var i,
            l;
        Layers.prototype.layers.push(this);

        if (nodeLayers === undefined)
            nodeLayers = 4;

        if (edgeLayers === undefined)
            edgeLayers = nodeLayers;

        this.stage = stage;
        this.drag = new Kinetic.Layer('drag');
        this.dragEdges = new Kinetic.Layer('dragEdges');

        this.nodes = [];
        this.edges = [];

        for (i = 0; i < edgeLayers; i++) {
            l = new Kinetic.Layer('edges#' + i);
            l.changed = true;
            this.edges.push(l);
            this.stage.add(l);
        }

        this.stage.add(this.dragEdges);

        for (i = 0; i < nodeLayers; i++) {
            l = new Kinetic.Layer('nodes#' + i);
            l.changed = true;
            this.nodes.push(l);
            this.stage.add(l);
        }

        this.stage.add(this.drag);
    }

    Layers.prototype.layers = [];

    Layers.prototype.addNode = function(n) {
        var to = ~~ (Math.random() * this.nodes.length);
        this.nodes[to].add(n.shape);
        this.nodes[to].changed = true;
    };

    Layers.prototype.addEdge = function(e) {
        var to = ~~ (Math.random() * this.edges.length);
        this.edges[to].add(e.shape);
        this.edges[to].changed = true;
    };

    Layers.prototype.removeNode = function(n) {
        var l = n.shape.getLayer();
        l.remove(n.shape);
        l.changed = true;
    };

    Layers.prototype.removeEdge = function(e) {
        var l = e.shape.getLayer();
        l.remove(e.shape);
        l.changed = true;
    };

    Layers.prototype.drawLayerOf = function(e) {
        e.shape.getLayer().changed = true;
    };

    Layers.prototype.drawAll = function() {
        var i;
        for (i = 0; i < this.edges.length; i++) {
            if (this.edges[i].changed) {
                this.edges[i].draw();
                this.edges[i].changed = false;
            }
        }

        for (i = 0; i < this.nodes.length; i++) {
            if (this.nodes[i].changed) {
                this.nodes[i].draw();
                this.nodes[i].changed = false;
            }
        }
    };

    Layers.prototype.dragStart = function(node) {
        var i,
            eid,
            l;
        this.__beforeDragLayer = node.shape.getLayer();
        node.shape.moveTo(this.drag);
        node.shape.draggable(true);

        for (i = 0; i < this.nodes.length; i++)
            this.nodes[i].listen(false);

        for (eid in node.edges) {
            l = node.edges[eid].shape.getLayer();
            node.edges[eid].shape.moveTo(this.dragEdges);
            l.draw();
        }

        this.__beforeDragLayer.draw();
        this.drag.draw();
        this.dragEdges.draw();
    };

    Layers.prototype.dragEnd = function(node) {
        var i,
            eid,
            to;
        node.shape.moveTo(this.__beforeDragLayer);
        node.shape.draggable(false);

        for (i = 0; i < this.nodes.length; i++)
            this.nodes[i].listen(true);

        for (eid in node.edges) {
            to = ~~ (Math.random() * this.edges.length);
            node.edges[eid].shape.moveTo(this.edges[to]);
            this.edges[to].draw();
        }

        this.__beforeDragLayer.draw();
        this.drag.draw();
        this.dragEdges.draw();
    };

    function CanvasContext(sel) {
        exports.GS.Context.call(this, sel);

        this.stage = new Kinetic.Stage({
            container: this.container,
            width: exports.$(this.container).width(),
            height: exports.$(this.container).height()
        });

        this.layers = new Layers(this.stage);
    }

    CanvasContext.prototype = {
        createNode: function(graph, nodeId) {
            var n = new CanvasNode(graph, nodeId);
            this.layers.addNode(n);
            return n;
        },

        removeNode: function(graph, node) {
            this.layers.removeNode(node);
        },

        createEdge: function(graph, edgeId, source, target, directed) {
            var e = new CanvasEdge(graph, edgeId, source, target, directed);
            this.layers.addEdge(e);
            return e;
        },

        removeEdge: function(graph, edge) {
            this.layers.removeEdge(edge);
        },

        clear: function(graph) {}
    };

    exports.GS.extend(exports.GS.Context.prototype, CanvasContext.prototype);

    setInterval(function() {
        for (var i = 0; i < Layers.prototype.layers.length; i++)
            Layers.prototype.layers[i].drawAll();
    }, 25);

    exports.GS.registerContext('canvas', CanvasContext);
}(this));
