/*! w3sink v0.0.1 - 2014-03-07 
 *  License: MIT */
(function(exports) {
    'use strict';

    /**
     * Extends a class.
     *
     * @param source
     *       the super class prototype
     * @param target
     *       the new class prototype
     */

    function extend(source, target) {
        for (var element in source) {
            if (!target.hasOwnProperty(element))
                target[element] = source[element];
        }
    }

    /**
     * Convert a string size in pixel size.
     */

    function getSize(element, value) {
        var re = /(\d+)(\w+)?/;
        var s = re.exec(value);

        return s[1];
    }

    /**
     * Build a new source object. It allows to connect sinks and send
     * events. A source has an id which is used as sourceId for sent
     * events.
     *
     * @param id
     *        id of the source
     */

    function Source(id) {
        this.id = id;
        this.timeId = 0;
        this.sinks = [];
    }

    /*
     * Prototype of Source.
     */
    Source.prototype = {
        /**
         * Register a new Sink on this source.
         */
        addSink: function(sink) {
            this.sinks.push(sink);
        },

        /**
         * Remove a previously registered sink.
         */
        removeSink: function(sink) {

        },

        /**
         * Get a new time id.
         */
        newTimeId: function() {
            return this.timeId++;
        },

        /**
         * Send a nodeAdded event.
         *
         * @param nodeId
         *        id of the added node
         */
        sendNodeAdded: function(nodeId) {
            var t = this.newTimeId();

            for (var i = 0; i < this.sinks.length; i++)
                this.sinks[i].nodeAdded(this.id, t, nodeId);
        },

        /**
         * Send a nodeRemoved event.
         *
         * @param nodeId
         *          id of the node being removed
         */
        sendNodeRemoved: function(nodeId) {
            var t = this.newTimeId();

            for (var i = 0; i < this.sinks.length; i++)
                this.sinks[i].nodeRemoved(this.id, t, nodeId);
        },

        /**
         * Send a nodeAttributeAdded event.
         *
         * @param nodeId
         *          id of the node
         * @param attrid
         *          key of the attribute
         * @param value
         *          value of the attribute
         */
        sendNodeAttributeAdded: function(nodeId, attrId, value) {
            var t = this.newTimeId();

            for (var i = 0; i < this.sinks.length; i++)
                this.sinks[i].nodeAttributeAdded(this.id, t, nodeId, attrId, value);
        },

        /**
         * Send a nodeAttributeChanged event.
         *
         * @param nodeId
         *          id of the node
         * @param attrid
         *          key of the attribute
         * @param [optional] oldValue
         *          previous value of the attribute
         * @param newValue
         *          new value of the attribute
         */
        sendNodeAttributeChanged: function(nodeId, attrId, oldValue, newValue) {
            var t = this.newTimeId();

            if (newValue === undefined)
                newValue = oldValue;

            for (var i = 0; i < this.sinks.length; i++)
                this.sinks[i].nodeAttributeChanged(this.id, t, nodeId, attrId, oldValue, newValue);
        },

        /**
         * Send a nodeAttributeRemoved event.
         *
         * @param nodeId
         *          id of the node
         * @param attrid
         *          key of the attribute
         */
        sendNodeAttributeRemoved: function(nodeId, attrId) {
            var t = this.newTimeId();

            for (var i = 0; i < this.sinks.length; i++)
                this.sinks[i].nodeAttributeRemoved(this.id, t, nodeId, attrId);
        },

        /**
         * Send an edgeAdded event.
         *
         * @param edgeId
         *          id of the new edge
         * @param source
         *          id of the source node of the edge
         * @param target
         *          id of the target node of the edge
         * @param [optional] directed
         *          true if edge is directed
         */
        sendEdgeAdded: function(edgeId, source, target, directed) {
            var t = this.newTimeId();

            if (directed === undefined)
                directed = false;

            for (var i = 0; i < this.sinks.length; i++)
                this.sinks[i].edgeAdded(this.id, t, edgeId, source, target, directed);
        },

        /**
         * Send an edgeRemoved event.
         *
         * @param edgeId
         *          id of the edge being removed
         */
        sendEdgeRemoved: function(edgeId) {
            var t = this.newTimeId();

            for (var i = 0; i < this.sinks.length; i++)
                this.sinks[i].edgeRemoved(this.id, t, edgeId);
        },

        /**
         * Send a edgeAttributeAdded event.
         *
         * @param edgeId
         *          id of the edge
         * @param attrid
         *          key of the attribute
         * @param value
         *          value of the attribute
         */
        sendEdgeAttributeAdded: function(edgeId, attrId, value) {
            var t = this.newTimeId();

            for (var i = 0; i < this.sinks.length; i++)
                this.sinks[i].edgeAttributeAdded(this.id, t, edgeId, attrId, value);
        },

        /**
         * Send a edgeAttributeChanged event.
         *
         * @param edgeId
         *          id of the edge
         * @param attrid
         *          key of the attribute
         * @param [optional] oldValue
         *          previous value of the attribute
         * @param newValue
         *          new value of the attribute
         */
        sendEdgeAttributeChanged: function(edgeId, attrId, oldValue, newValue) {
            var t = this.newTimeId();

            if (newValue === undefined)
                newValue = oldValue;

            for (var i = 0; i < this.sinks.length; i++)
                this.sinks[i].edgeAttributeChanged(this.id, t, edgeId, attrId, oldValue, newValue);
        },

        /**
         * Send a edgeAttributeRemoved event.
         *
         * @param edgeId
         *          id of the edge
         * @param attrid
         *          key of the attribute
         */
        sendEdgeAttributeRemoved: function(edgeId, attrId) {
            var t = this.newTimeId();

            for (var i = 0; i < this.sinks.length; i++)
                this.sinks[i].edgeAttributeRemoved(this.id, t, edgeId, attrId);
        },

        /**
         * Send a graphAttributeAdded event.
         *
         * @param attrid
         *          key of the attribute
         * @param value
         *          value of the attribute
         */
        sendGraphAttributeAdded: function(attrId, value) {
            var t = this.newTimeId();

            for (var i = 0; i < this.sinks.length; i++)
                this.sinks[i].graphAttributeAdded(this.id, t, attrId);
        },

        /**
         * Send a graphAttributeChanged event.
         *
         * @param attrid
         *          key of the attribute
         * @param [optional] oldValue
         *          previous value of the attribute
         * @param newValue
         *          new value of the attribute
         */
        sendGraphAttributeChanged: function(attrId, oldValue, newValue) {
            var t = this.newTimeId();

            if (newValue === undefined)
                newValue = oldValue;

            for (var i = 0; i < this.sinks.length; i++)
                this.sinks[i].graphAttributeChanged(this.id, t, attrId, oldValue, newValue);
        },

        /**
         * Send a graphAttributeRemoved event.
         *
         * @param attrid
         *          key of the attribute
         */
        sendGraphAttributeRemoved: function(attrId) {
            var t = this.newTimeId();

            for (var i = 0; i < this.sinks.length; i++)
                this.sinks[i].graphAttributeRemoved(this.id, t, attrId);
        },

        /**
         * Send a graphClearedEvent.
         */
        sendGraphCleared: function() {
            var t = this.newTimeId();

            for (var i = 0; i < this.sinks.length; i++)
                this.sinks[i].graphCleared(this.id, t);
        },

        /**
         * Send a stepBegins event.
         *
         * @param step
         *          step
         */
        sendStepBegins: function(step) {
            var t = this.newTimeId();

            for (var i = 0; i < this.sinks.length; i++)
                this.sinks[i].stepBegins(this.id, t, step);
        }
    };

    /**
     * Build a new Sink object.
     */

    function Sink() {}

    /*
     * The Sink prototype
     */
    Sink.prototype = {
        /**
         * A new node has been added.
         *
         * @param sourceId
         *          id of the source who send the event
         * @param timeId
         *          timeId of the event
         * @param nodeId
         *          id of the new node
         */
        nodeAdded: function(sourceId, timeId, nodeId) {},

        /**
         * A node will be removed.
         *
         * @param sourceId
         *          id of the source who send the event
         * @param timeId
         *          timeId of the event
         * @param nodeId
         *          id of the node being removed
         */
        nodeRemoved: function(sourceId, timeId, nodeId) {},

        /**
         * A new attribute has been added on a node.
         *
         * @param sourceId
         *          id of the source who send the event
         * @param timeId
         *          timeId of the event
         * @param nodeId
         *          id of the node
         * @param attrId
         *          key of the attribute
         * @param value
         *          value of the attribute
         */
        nodeAttributeAdded: function(sourceId, timeId, nodeId, attrId, value) {},

        /**
         * An attribute of a node has been changed.
         *
         * @param sourceId
         *          id of the source who send the event
         * @param timeId
         *          timeId of the event
         * @param nodeId
         *          id of the node
         * @param attrId
         *          key of the attribute
         * @param oldValue
         *          previous value of the attribute
         * @param newValue
         *          new value of the attribute
         */
        nodeAttributeChanged: function(sourceId, timeId, nodeId, attrId, oldValue, newValue) {},

        /**
         * An attribute of a node has been removed.
         *
         * @param sourceId
         *          id of the source who send the event
         * @param timeId
         *          timeId of the event
         * @param nodeId
         *          id of the node
         * @param attrId
         *          key of the attribute
         */
        nodeAttributeRemoved: function(sourceId, timeId, nodeId, attrId) {},

        /**
         * A new edge has been added.
         *
         * @param sourceId
         *          id of the source who send the event
         * @param timeId
         *          timeId of the event
         * @param edgeId
         *          id of the new edge
         * @param source
         *          id of the source node of the edge
         * @param target
         *          id of the target node of the edge
         * @param directed
         *          true if edge is directed
         */
        edgeAdded: function(sourceId, timeId, edgeId, source, target, directed) {},

        /**
         * A new edge will be removed.
         *
         * @param sourceId
         *          id of the source who send the event
         * @param timeId
         *          timeId of the event
         * @param edgeId
         *          id of the edge being removed
         */
        edgeRemoved: function(sourceId, timeId, edgeId) {},

        /**
         * An attribute of an edge has been added.
         *
         * @param sourceId
         *          id of the source who send the event
         * @param timeId
         *          timeId of the event
         * @param edgeId
         *          id of the edge
         * @param attrId
         *          key of the attribute
         * @param value
         *          value of the attribute
         */
        edgeAttributeAdded: function(sourceId, timeId, edgeId, attrId, value) {},

        /**
         * An attribute of an edge has been changed.
         *
         * @param sourceId
         *          id of the source who send the event
         * @param timeId
         *          timeId of the event
         * @param edgeId
         *          id of the edge
         * @param attrId
         *          key of the attribute
         * @param oldValue
         *          previous value of the attribute
         * @param newValue
         *          new value of the attribute
         */
        edgeAttributeChanged: function(sourceId, timeId, edgeId, attrId, oldValue, newValue) {},

        /**
         * An attribute of an edge has been removed.
         *
         * @param sourceId
         *          id of the source who send the event
         * @param timeId
         *          timeId of the event
         * @param edgeId
         *          id of the edge
         * @param attrId
         *          key of the attribute
         * @param oldValue
         *          previous value of the attribute
         * @param newValue
         *          new value of the attribute
         */
        edgeAttributeRemoved: function(sourceId, timeId, edgeId, attrId) {},

        /**
         * An attribute of the graph has been added.
         *
         * @param sourceId
         *          id of the source who send the event
         * @param timeId
         *          timeId of the event
         * @param attrId
         *          key of the attribute
         * @param value
         *          value of the attribute
         */
        graphAttributeAdded: function(sourceId, timeId, attrId, value) {},

        /**
         * An attribute of the graph has been changed.
         *
         * @param sourceId
         *          id of the source who send the event
         * @param timeId
         *          timeId of the event
         * @param attrId
         *          key of the attribute
         * @param oldValue
         *          previous value of the attribute
         * @param newValue
         *          new value of the attribute
         */
        graphAttributeChanged: function(sourceId, timeId, attrId, oldValue, newValue) {},

        /**
         * An attribute of the graph has been removed.
         *
         * @param sourceId
         *          id of the source who send the event
         * @param timeId
         *          timeId of the event
         * @param attrId
         *          key of the attribute
         */
        graphAttributeRemoved: function(sourceId, timeId, attrId) {},

        /**
         * The graph has been cleared.
         *
         * @param sourceId
         *          id of the source who send the event
         * @param timeId
         *          timeId of the event
         */
        graphCleared: function(sourceId, timeId) {},

        /**
         * A new step has begun.
         *
         * @param sourceId
         *          id of the source who send the event
         * @param timeId
         *          timeId of the event
         * @param step
         *          timestamp of the step
         */
        stepBegins: function(sourceId, timeId, step) {}
    };

    /**
     * Build a new Element object. Element is the base for GraphStream
     * objects with attributes.
     *
     * @param graph
     *          the graph object containing the element
     * @param type
     *          type of element given as a string
     * @param id
     *          id of the element, should be unique according to the
     *          graph and type
     */

    function Element(graph, type, id) {
        this.id = id;
        this.type = type;
        this.graph = graph;
        this.attributes = {};
    }

    /*
     * The Element prototype
     */
    Element.prototype = {
        /**
         * Get an attribute of this element.
         *
         * @param key
         *          key of the attribute
         */
        getAttribute: function(key) {
            return this.attributes[key];
        },

        /**
         * Set an attribute of this element.
         *
         * @param key
         *          key of the attribute
         * @param value
         *          new value of the attribute
         */
        setAttribute: function(key, value) {
            this.attributes[key] = value;
        },

        /**
         * Test if this element contains an attribute.
         *
         * @param key
         *          key of the attribute
         */
        hasAttribute: function(key) {
            return this.attributes.hasOwnProperty(key);
        },

        removeAttribute: function(key) {
            delete this.attributes[key];
        },

        setFill: function(color) {},

        setStroke: function(color) {},

        setStrokeWidth: function(size) {},

        setSize: function(size) {},

        setLabel: function(label) {},

        setStyle: function(style) {
            var styles = style.split(/\s*;\s*/),
                colors,
                i,
                t;

            for (i = 0; i < styles.length; i++) {
                if (styles[i] === '')
                    continue;
                t = styles[i].split(/\s*:\s*/);

                //
                // Using GraphStream CSS Reference 1.2
                //
                switch (t[0]) {
                    case 'fill-color':
                        colors = t[1].split(/\s*,\s*/);
                        this.setFill(colors[0]);
                        break;
                    case 'stroke-color':
                        colors = t[1].split(/\s*,\s*/);
                        this.setStroke(colors[0]);
                        break;
                    case 'stroke-width':
                        this.setStrokeWidth(getSize(this, t[1]));
                        break;
                    case 'z-index':
                        this.setZIndex(t[1]);
                        break;
                    case 'size':
                        this.setSize(getSize(this, t[1]));
                        break;
                    case 'fill-image':
                    case 'fill-mode':
                    case 'stroke-mode':
                    case 'padding':
                    case 'shadow-mode':
                    case 'shadow-color':
                    case 'shadow-width':
                    case 'shadow-offset':
                    case 'text-mode':
                    case 'text-background-mode':
                    case 'text-visibility-mode':
                    case 'text-visibility':
                    case 'text-color':
                    case 'text-background-color':
                    case 'text-style':
                    case 'text-alignment':
                    case 'text-padding':
                    case 'text-offset':
                    case 'text-font':
                    case 'text-size':
                    case 'icon':
                    case 'icon-mode':
                    case 'visibility':
                    case 'visibility-mode':
                    case 'size-mode':
                    case 'shape':
                    case 'arrow-shape':
                    case 'arrow-image':
                    case 'arrow-size':
                    case 'shape-points':
                        exports.console.log('[GraphStream CSS] unsupported property "' + t[0] + '" for ' + this.type);
                        break;
                    default:
                        exports.console.log('[GraphStream CSS] unknown property "' + t[0] + '" for ' + this.type);
                        break;
                }
            }
        },

        updateShapePosition: function() {}
    };

    function Node(graph, id) {
        Element.call(this, graph, 'Node', id);

        this.edges = {};

        this._x = 0;
        this._y = 0;

        this.pixelX = graph.randomPixelX();
        this.pixelY = graph.randomPixelY();

        this.index = graph.indexedNodes.length;
        graph.indexedNodes.push(this);
    }

    Node.prototype = {
        registerEdge: function(e) {
            this.edges[e.id] = e;
        },

        unregisterEdge: function(e) {
            delete this.edges[e.id];
        },

        x: function(x) {
            if (typeof(x) === 'undefined')
                return this._x;

            this._x = x;

            for (var eid in this.edges)
                this.edges[eid].nodePositionChanged(this);
        },

        y: function(y) {
            if (typeof(y) === 'undefined')
                return this._y;

            this._y = y;

            for (var eid in this.edges)
                this.edges[eid].nodePositionChanged(this);
        },

        setXY: function(x, y) {
            this._x = x;
            this._y = y;

            this.graph.viewbox.check(x, y);
            this.graph.viewbox.update(this);
        },

        setPixelXY: function(x, y) {
            this.pixelX = x;
            this.pixelY = y;

            this.updateShapePosition();

            for (var eid in this.edges)
                this.edges[eid].nodePositionChanged();

            return this;
        }
    };

    function Edge(graph, id, source, target, directed) {
        Element.call(this, graph, 'Edge', id);

        this.source = source;
        this.target = target;
        this.directed = directed;
        this.points = [{
            x: source.pixelX,
            y: source.pixelY
        }, {
            x: target.pixelX,
            y: target.pixelY
        }];

        this.index = graph.indexedEdges.length;
        graph.indexedEdges.push(this);
    }

    Edge.prototype = {
        nodePositionChanged: function() {
            this.points[0].x = this.source.pixelX;
            this.points[0].y = this.source.pixelY;
            this.points[this.points.length - 1].x = this.target.pixelX;
            this.points[this.points.length - 1].y = this.target.pixelY;

            this.updateShapePosition();
        }
    };

    extend(Element.prototype, Node.prototype);
    extend(Element.prototype, Edge.prototype);

    function Graph(selector, context) {
        Source.call(this, selector);

        if (typeof(context) === 'undefined')
            context = 'default';

        if (!contexts.hasOwnProperty(context))
            throw new Error('context "' + context + '" is not registered');

        this.context = new contexts[context](selector);

        this.nodes = {length:0};
        this.edges = {length:0};

        this.indexedNodes = [];
        this.indexedEdges = [];

        this.default_node_style = 'fill-color:#89a9e3;size:10px;stroke-color:#333333;stroke-width:5px;';
        this.default_node_size = 15;
        this.default_edge_style = 'stroke-color:#333333;stroke-width:2px;';

        this.viewbox = new ViewBox(this);
        this.dispatch = new Sink();

        //this._width = jQuery(this.context.getCanvas()).width();
        //this._height = jQuery(this.context.getCanvas()).height();
        this._width = exports.jQuery(this.context.getContainer()).width();
        this._height = exports.jQuery(this.context.getContainer()).height();
    }

    Graph.prototype = {
        width: function() {
            return this._width;
        },

        height: function() {
            return this._height;
        },

        nodesCount: function() {
            return this.nodes.length;
        },

        edgesCount: function() {
            return this.edges.length;
        },

        an: function(id) {
            if (this.nodes.hasOwnProperty(id)) {
                exports.console.log('[warning] node exists "' + id + '"');
                return;
            }

            var n = this.context.createNode(this, id);
            this.nodes[id] = n;
            this.nodes.length++
            n.setStyle(this.default_node_style);

            this.sendNodeAdded(id);
        },

        cn: function(id, key, value) {
            var n = this.nodes[id];

            if (value === undefined) {
                n.removeAttribute(key);
                this.sendNodeAttributeRemoved(id, key);
            } else {
                if (key === 'xy' || key === 'xyz')
                    n.setXY(value[0], value[1]);
                else if (key === 'size')
                    n.setSize(value);
                else if (key === 'style')
                    n.setStyle(value);
                else if (key === 'label')
                    n.setLabel(value);

                n.setAttribute(key, value);
                this.sendNodeAttributeChanged(id, key, value);
            }
        },

        setXY: function(id, x, y) {
            var n = this.nodes[id];
            n.setXY(x, y);
        },

        setPixelXY: function(id, x, y) {
            var n = this.nodes[id];
            n.setPixelXY(x, y);
        },

        dn: function(id) {
            var edgeToRemove = [];
            var n = this.nodes[id];

            for (var eid in this.edges) {
                if (this.edges[eid].source.id === id || this.edges[eid].target.id === id)
                    edgeToRemove.push(this.edges[eid]);
            }

            for (var i = 0; i < edgeToRemove.length; i++)
                this.de(edgeToRemove[i].id);

            this.sendNodeRemoved(id);

            this.context.removeNode(this, n);

            if (n.index === this.indexedNodes.length - 1)
                this.indexedNodes.pop();
            else {
                var lastNode = this.indexedNodes[this.indexedNodes.length - 1];
                var oldIndex = lastNode.index,
                    newIndex = n.index;

                lastNode.index = newIndex;
                this.indexedNodes[newIndex] = lastNode;
                this.indexedNodes.pop();

                this.context.nodeIndexChanged(lastNode, oldIndex, newIndex);
            }

            delete this.nodes[id];
            this.nodes.length--;
        },

        ae: function(id, src, trg, directed) {
            if (this.nodes[src] === undefined) {
                exports.console.log('node "' + src + '" not found for edge "' + id + '"');
                return;
            }

            if (this.nodes[trg] === undefined) {
                exports.console.log('node "' + trg + '" not found for edge "' + id + '"');
                return;
            }

            var e = this.context.createEdge(this, id, this.nodes[src], this.nodes[trg], directed);
            this.edges[id] = e;
            this.edges.length++;

            e.setStyle(this.default_edge_style);

            this.nodes[src].edges[id] = e;
            this.nodes[trg].edges[id] = e;

            this.edgesCount++;
            this.sendEdgeAdded(id, src, trg, directed);
        },

        ce: function(id, key, value) {
            var e = this.edges[id];

            if (typeof(value) === 'undefined') {
                e.removeAttribute(e);
                this.sendEdgeAttributeRemoved(id, key);
            } else {
                if (key === 'style')
                    e.setStyle(value);
                else if (key === 'size')
                    e.setSize(value);

                e.setAttribute(key, value);
                this.sendEdgeAttributeChanged(id, key, value);
            }
        },

        de: function(id) {
            var e = this.edges[id];
            if(typeof e === 'undefined')
                return;

            this.sendEdgeRemoved(id);

            this.context.removeEdge(this, e);

            delete e.source.edges[id];
            if(e.source !== e.target){
                delete e.target.edges[id];
            }

            if (e.index === this.indexedEdges.length - 1)
                this.indexedEdges.pop();
            else {
                var lastEdge = this.indexedEdges[this.indexedEdges.length - 1];
                var oldIndex = lastEdge.index,
                    newIndex = e.index;

                lastEdge.index = newIndex;
                this.indexedEdges[newIndex] = lastEdge;
                this.indexedEdges.pop();

                this.context.edgeIndexChanged(lastEdge, oldIndex, newIndex);
            }

            delete this.edges[id];
            this.edges.length--;

        },

        cg: function(k, v) {

        },

        cl: function() {
            this.context.clear();
            this.sendGraphCleared();
        },

        st: function(step) {
            this.sendStepBegins(step);
        },

        randomPixelX: function(x) {
            if (x === undefined)
                x = Math.random();

            return~~ (x * this.width());
        },

        randomPixelY: function(y) {
            if (y === undefined)
                y = Math.random();

            return~~ (y * this.height());
        },

        nodeAdded: function(sourceId, timeId, nodeId) {
            this.an(nodeId);
        },

        nodeRemoved: function(sourceId, timeId, nodeId) {
            this.dn(nodeId);
        },

        nodeAttributeAdded: function(sourceId, timeId, nodeId, key, value) {
            this.cn(nodeId, key, value);
        },

        nodeAttributeChanged: function(sourceId, timeId, nodeId, key, oldValue, newValue) {
            this.cn(nodeId, key, newValue);
        },

        nodeAttributeRemoved: function(sourceId, timeId, nodeId, key) {
            this.cn(nodeId, key, null);
        },

        edgeAdded: function(sourceId, timeId, edgeId, from, to, directed) {
            this.ae(edgeId, from, to, directed);
        },

        edgeRemoved: function(sourceId, timeId, edgeId) {
            this.de(edgeId);
        },

        edgeAttributeAdded: function(sourceId, timeId, edgeId, key, value) {
            this.ce(edgeId, key, value);
        },

        edgeAttributeChanged: function(sourceId, timeId, edgeId, key, oldValue, newValue) {
            this.ce(edgeId, key, newValue);
        },

        edgeAttributeRemoved: function(sourceId, timeId, edgeId, key) {
            this.ce(edgeId, key, null);
        },

        graphAttributeAdded: function(sourceId, timeId, key, value) {
            this.cg(key, value);
        },

        graphAttributeChanged: function(sourceId, timeId, key, oldValue, newValue) {
            this.cg(key, newValue);
        },

        graphAttributeRemoved: function(sourceId, timeId, key) {
            this.cg(key, null);
        },

        graphCleared: function(sourceId, timeId) {
            this.cl();
        },

        stepBegins: function(sourceId, timeId, step) {
            this.st(step);
        }
    };

    extend(Source.prototype, Graph.prototype);

    function Context(sel) {
        this.container = document.querySelector(sel);
    }

    Context.prototype = {
        getContainer: function() {
            return this.container;
        },
        createNode: function(graph, nodeId) {
            return new Node(graph, nodeId);
        },
        removeNode: function(graph, node) {},
        createEdge: function(graph, edgeId, source, target, directed) {
            return new Edge(graph, edgeId, source, target, directed);
        },
        removeEdge: function(graph, edge) {},
        clear: function(graph) {},
        zoom: function(factor) {},
        nodeIndexChanged: function(node, oldIndex, newIndex) {},
        edgeIndexChanged: function(edge, oldIndex, newIndex) {}
    };

    function ViewBox(graph) {
        this.graph = graph;
        this.minx = Infinity;
        this.miny = Infinity;
        this.maxx = -Infinity;
        this.maxy = -Infinity;
        this.padding = {
            top: 15,
            right: 15,
            bottom: 15,
            left: 15
        };
    }

    ViewBox.prototype = {
        reset: function() {
            this.minx = Infinity;
            this.miny = Infinity;
            this.maxx = -Infinity;
            this.maxy = -Infinity;
        },

        check: function(x, y) {
            var changed = false;

            if (x < this.minx) {
                changed = true;
                this.minx = x;
            }

            if (y < this.miny) {
                changed = true;
                this.miny = y;
            }

            if (x > this.maxx) {
                changed = true;
                this.maxx = x;
            }

            if (y > this.maxy) {
                changed = true;
                this.maxy = y;
            }

            if (changed) {
                if (this.minx === this.maxx) {
                    this.minx -= 0.1;
                    this.maxx += 0.1;
                }

                if (this.miny === this.maxy) {
                    this.miny -= 0.1;
                    this.maxy += 0.1;
                }

                this.update();
            }
        },

        compute: function() {
            var mx, my, Mx, My;

            mx = my = Infinity;
            Mx = My = -Infinity;

            for (var id in this.graph.nodes) {
                var node = this.graph.nodes[id];
                mx = Math.min(mx, node._x);
                my = Math.min(my, node._y);
                Mx = Math.max(Mx, node._x);
                My = Math.max(My, node._y);
            }

            this.minx = mx;
            this.miny = my;
            this.maxx = Mx;
            this.maxy = My;

            this.update();
        },

        update: function(node) {
            if (node === undefined) {
                for (var id in this.graph.nodes)
                    this.update(this.graph.nodes[id]);
            } else {
                var px = (node._x - this.minx) / (this.maxx - this.minx),
                    py = (node._y - this.miny) / (this.maxy - this.miny);

                px = this.padding.left + (this.graph.width() - this.padding.left - this.padding.right) * px;
                py = this.padding.bottom + (this.graph.height() - this.padding.bottom - this.padding.top) * py;

                node.setPixelXY(px, py);
            }
        }
    };

    var utilsLoadDefaultArgs = {
        method: 'GET',
        responseType: ''
    };

    function utilsLoad(args) {
        extend(utilsLoadDefaultArgs, args);

        var xhr = new XMLHttpRequest();
        xhr.open(args.method, args.url, true);
        xhr.responseType = args.responseType;

        xhr.send();

        return xhr;
    }

    function FileSource(type) {
        Source.call(this, type);
        this.type = type;
    }

    FileSource.prototype = {
        begin: function(url) {},
        nextEvents: function() {},
        nextStep: function() {},
        end: function() {}
    };

    extend(Source.prototype, FileSource.prototype);


    var contexts = {
        'default': Context
    };

    function registerContext(name, constructor) {
        contexts[name] = constructor;
    }

    var GS = {
        extend: extend,
        Node: Node,
        Edge: Edge,
        Graph: Graph,
        Context: Context,
        Source: Source,
        Sink: Sink,
        FileSource: FileSource,
        registerContext: registerContext
    };

    exports.GS = GS;
}(this));

(function(exports) {
    'use strict';

    function JSONSource() {
        exports.GS.FileSource.call(this, 'json');
        this.data = false;
        this.lastEvent = false;
    }

    JSONSource.prototype = {
        begin: function(url) {
            exports.jQuery.ajax({
                url: url,
                type: 'GET',
                dataType: 'json',
                async: false,
                context: this,
                success: function(data) {
                    this.setData(data);
                },
                error: function(xhr, msg, e) {
                    exports.console.log(msg);
                    exports.console.log(e);
                }
            });
        },

        setData: function(data) {
            this.data = data;
            this.data.events.reverse();
            exports.console.log(this.data);
        },

        nextEvents: function() {
            var e,
                id,
                kv,
                type;
            if (!this.data) {
                exports.console.log('no data');
                return;
            }

            if (this.data.events.length === 0)
                return false;

            e = this.data.events.pop();
            e.reverse();

            var dir = e.pop();

            switch (dir) {
                case 'an':
                    this.sendNodeAdded(e.pop());
                    break;
                case 'cn':
                    id = e.pop();

                    while (e.length > 0) {
                        type = '';
                        kv = e.pop();

                        if (kv[0] === '+' || kv[0] === '-' || kv[0] === '') {
                            type = kv[0];
                            kv.splice(0, 1);
                        }

                        switch (type) {
                            case '':
                                if (e.length === 2)
                                    e.push(e[1]);

                                this.sendNodeAttributeChanged(id, e[0], e[1], e[2]);
                                break;
                            case '+':
                                this.sendNodeAttributeAdded(id, e[0], e[1]);
                                break;
                            case '-':
                                this.sendNodeAttributeRemoved(id, e[0]);
                                break;
                        }
                    }

                    break;
                case 'dn':
                    this.sendNodeRemoved(e.pop());
                    break;
                case 'ae':
                    this.sendEdgeAdded(e.pop(), e.pop(), e.pop(), e.length > 0 ? e.pop() : false);
                    break;
                case 'ce':
                    id = e.pop();

                    while (e.length > 0) {
                        type = '';
                        kv = e.pop();

                        if (kv[0] === '+' || kv[0] === '-' || kv[0] === '') {
                            type = kv[0];
                            kv.splice(0, 1);
                        }

                        switch (type) {
                            case '':
                                if (e.length === 2)
                                    e.push(e[1]);

                                this.sendEdgeAttributeChanged(id, e[0], e[1], e[2]);
                                break;
                            case '+':
                                this.sendEdgeAttributeAdded(id, e[0], e[1]);
                                break;
                            case '-':
                                this.sendEdgeAttributeRemoved(id, e[0]);
                                break;
                        }
                    }

                    break;
                case 'de':
                    this.sendEdgeRemoved(e.pop());
                    break;
                case 'cg':
                   

                    while (e.length > 0) {
                        type = '';
                        kv = e.pop();

                        if (kv[0] === '+' || kv[0] === '-' || kv[0] === '') {
                            type = kv[0];
                            kv.splice(0, 1);
                        }

                        switch (type) {
                            case '':
                                if (e.length === 2)
                                    e.push(e[1]);

                                this.sendGraphAttributeChanged(e[0], e[1], e[2]);
                                break;
                            case '+':
                                this.sendGraphAttributeAdded(e[0], e[1]);
                                break;
                            case '-':
                                this.sendGraphAttributeRemoved(e[0]);
                                break;
                        }
                    }

                    break;
                case 'st':
                    this.sendStepBegins(e.pop());
                    break;
                case 'cl':
                    this.sendGraphCleared();
                    break;
                default:
                    exports.console.log('unknown event "' + dir + '"');
            }

            this.lastEvent = dir;

            return this.data.events.length > 0;
        },

        nextStep: function() {
            do
                this.nextEvents();
            while (this.lastEvent !== 'st' && this.data.events.length > 0);

            return this.data.events.length > 0;
        },

        end: function() {
            this.data = false;
            this.lastEvent = false;
        }
    };

    exports.GS.extend(exports.GS.FileSource.prototype, JSONSource.prototype);
    exports.GS.JSONSource = JSONSource;
}(this));

(function(exports) {
	'use strict';
    var SVG = {
        ns: 'http://www.w3.org/2000/svg',
        xlinkns: 'http://www.w3.org/1999/xlink'
    };

    function SVGNode(graph, id) {
        exports.GS.Node.call(this, graph, id);

        this.shape = {
            g: document.createElementNS(SVG.ns, 'g'),
            node: document.createElementNS(SVG.ns, 'circle'),
            title: document.createElementNS(SVG.ns, 'title'),
            label: document.createElementNS(SVG.ns, 'text'),
            labelText: document.createTextNode(''),
            labelStroke: document.createElementNS(SVG.ns, 'text'),
            labelStrokeText: document.createTextNode('')
        };

        this.shape.g.setAttribute('transform', 'translate(' + this.pixelX + ',' + this.pixelY + ')');
        this.shape.node.setAttribute('class', 'node');
        this.shape.node.setAttribute('r', graph.default_node_size);
        this.shape.node.setAttribute('cx', 0);
        this.shape.node.setAttribute('cy', 0);
        this.shape.node.setAttribute('fill', 'black');
        this.shape.node.setAttribute('stroke', 'white');
        this.shape.node.setAttribute('stroke-width', '2px');
        this.shape.title.textContent = id;
        this.shape.label.setAttribute('font-size', '12px');
        this.shape.label.setAttribute('fill', '#ff7200');
        //this.shape.label.setAttribute('x', 15);
        //this.shape.label.setAttribute('y', 15);
        //this.shape.label.setAttribute('style', 'text-shadow: 0px 0px 2px #efefef;');

        this.shape.labelStroke.setAttribute('font-size', '12px');
        this.shape.labelStroke.setAttribute('fill', '#ff7200');
        //this.shape.labelStroke.setAttribute('x', 15);
        //this.shape.labelStroke.setAttribute('y', 15);
        this.shape.labelStroke.setAttribute('stroke', '#222222');
        this.shape.labelStroke.setAttribute('stroke-width', 5);

        this.shape.label.appendChild(this.shape.labelText);
        this.shape.labelStroke.appendChild(this.shape.labelStrokeText);

        this.shape.g.appendChild(this.shape.node);
        this.shape.g.appendChild(this.shape.title);
        this.shape.g.appendChild(this.shape.labelStroke);
        this.shape.g.appendChild(this.shape.label);

        graph.context.gnodes.appendChild(this.shape.g);
    }

    SVGNode.prototype = {
        setFill: function(color) {
            this.shape.node.setAttribute('fill', color);
        },

        setStroke: function(color) {
            this.shape.node.setAttribute('stroke', color);
        },

        setStrokeWidth: function(size) {
            this.shape.node.setAttribute('stroke-width', size);
        },

        setSize: function(size) {
            this.shape.node.setAttribute('r', size);
        },

        setLabel: function(label) {
            if (label === undefined)
                label = this.id;

            this.shape.labelText.textContent = label;
            this.shape.labelStrokeText.textContent = label;
        },

        updateShapePosition: function() {
            this.shape.g.setAttribute('transform', 'translate(' + this.pixelX + ',' + this.pixelY + ')');

            if (this.pixelX < this.graph.width() / 2) {
                this.shape.label.setAttribute('text-anchor', 'start');
                this.shape.labelStroke.setAttribute('text-anchor', 'start');
            } else {
                this.shape.label.setAttribute('text-anchor', 'end');
                this.shape.labelStroke.setAttribute('text-anchor', 'end');
            }
        }
    };

    function SVGEdge(graph, id, source, target, directed) {
        exports.GS.Edge.call(this, graph, id, source, target, directed);

        this.shape = document.createElementNS(SVG.ns, 'line');
        this.shape.setAttribute('class', 'edge');
        this.shape.setAttribute('x1', source.pixelX);
        this.shape.setAttribute('y1', source.pixelY);
        this.shape.setAttribute('x2', target.pixelX);
        this.shape.setAttribute('y2', target.pixelY);
        this.shape.setAttribute('stroke', 'black');
        this.shape.setAttribute('stroke-width', '1px');

        graph.context.gedges.appendChild(this.shape);
    }

    SVGEdge.prototype = {
        setStroke: function(color) {
            this.shape.setAttribute('stroke', color);
        },

        setStrokeWidth: function(size) {
            this.shape.setAttribute('stroke-width', size);
        },

        setSize: function(size) {
            this.setStrokeWidth(size);
        },

        updateShapePosition: function() {
            this.shape.setAttribute('x1', this.points[0].x);
            this.shape.setAttribute('y1', this.points[0].y);
            this.shape.setAttribute('x2', this.points[this.points.length - 1].x);
            this.shape.setAttribute('y2', this.points[this.points.length - 1].y);
        }
    };

    exports.GS.extend(exports.GS.Node.prototype, SVGNode.prototype);
    exports.GS.extend(exports.GS.Edge.prototype, SVGEdge.prototype);

    function SVGContext(selector) {
        exports.GS.Context.call(this, selector);

        this.svg = document.createElementNS(SVG.ns, 'svg:svg');
        this.svg.setAttribute('width', '100%');
        this.svg.setAttribute('height', '100%');
        this.svg.setAttributeNS('http://www.w3.org/2000/xmlns/', 'xmlns:xlink', SVG.xlinkns);

        this.container.appendChild(this.svg);

        this.root = document.createElementNS(SVG.ns, 'g');

        this.gedges = document.createElementNS(SVG.ns, 'g');
        this.gnodes = document.createElementNS(SVG.ns, 'g');

        this.root.appendChild(this.gedges);
        this.root.appendChild(this.gnodes);

        this.svg.appendChild(this.root);
    }

    SVGContext.prototype = {
        createNode: function(graph, nodeId) {
            var n = new SVGNode(graph, nodeId);
            return n;
        },

        removeNode: function(graph, node) {
            this.gnodes.removeChild(node.shape.g);
        },

        createEdge: function(graph, edgeId, source, target, directed) {
            var e = new SVGEdge(graph, edgeId, source, target, directed);
            return e;
        },

        removeEdge: function(graph, edge) {
            this.gedges.removeChild(edge.shape);
        },

        clear: function(graph) {},

        zoom: function(factor) {
            this.svg.setAttribute('transform', 'scale(' + factor + ')');
        }
    };

    exports.GS.extend(exports.GS.Context.prototype, SVGContext.prototype);
    exports.GS.registerContext('svg', SVGContext);
}(this));

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

(function(exports) {
    'use strict';

    if (exports.GS === undefined)
        throw new Error('GS is not loaded');

    exports.GS.Graph.prototype.dgs = function(url, callback) {
        var dgs = new DGSParser(this);

        exports.jQuery.get(url).then(function(data) {
            dgs.setData(data);
            dgs.parse();
            if (callback !== undefined) {
                callback();
            }
        }, function(err) {
            throw new Error(err);
        });
    };

    function DGSParser(graph) {
        this.graph = graph;
        this.lines = [];
        this.line = '';
    }

    DGSParser.prototype.setData = function(data) {
        var re, line;
        this.lines = data.split('\n').reverse();

        line = this.lines.pop();
        re = /^DGS00\d$/;
        if (!re.test(line))
            throw new Error('invalid dgs header "' + line + '"');

        line = this.lines.pop();
        re = /^\S+ \d+ \d+$/;
        if (!re.test(line))
            throw new Error('invalid dgs header "' + line + '"');

        var i = 0;

        while (i < this.lines.length) {
            if (this.lines[i] === '' || this.lines[i].charAt(0) === '#') {
                this.lines.splice(i, 1);
            } else i++;
        }
    };

    DGSParser.prototype.ready = function() {
        return (this.lines.length > 0);
    };

    DGSParser.prototype.next = function() {
        this.line = this.lines.pop();
        return this;
    };

    DGSParser.prototype.dir = function() {
        var dir = this.line.substr(0, 2).toLowerCase();
        this.line = this.line.substr(3, this.line.length - 3);
        return dir;
    };

    DGSParser.prototype.parse = function() {
        var dir,
            id,
            source,
            target,
            directed;

        while (this.ready()) {
            this.next();

            dir = this.dir();

            //
            // Execute directive
            //
            switch (dir) {
                case 'an':
                    id = this.nextId();

                    this.graph.an(id);
                    this.parseAttributes('node', id);
                    break;
                case 'cn':
                    id = this.nextId();
                    this.parseAttributes('node', this.graph.sn(id));
                    break;
                case 'dn':
                    id = this.nextId();
                    this.graph.dn(id);
                    break;
                case 'ae':
                    id = this.nextId();
                    source = this.nextId();
                    directed = this.isDirectedEdge();
                    target = this.nextId();

                    this.graph.ae(id, source, target);
                    break;
                case 'ce':
                    id = this.nextId();

                    this.parseAttributes('edge', this.graph.se(id));
                    break;
                case 'de':
                    id = this.nextId();
                    this.graph.de(id);
                    //this.parseAttributes('edge', id);
                    break;
                case 'cg':
                    break;
                case 'st':
                    this.graph.st(this.nextReal());
                    break;
                case 'cl':
                    this.graph.cl();
                    break;
                default:
                    throw new Error('unknown directive "' + dir + '"');
            }
        }
    };

    DGSParser.prototype.nextId = function() {
        var re = /^\s*(?:'([^']+)'|"([^"]+)"|([\w\d-_]+))(?:(.*))?$/;
        var ex = re.exec(this.line);
        var i = 0;
        if (ex[++i] !== undefined || ex[++i] !== undefined || ex[++i] !== undefined) {
            this.line = ex[4];
            return ex[i];
        } else return undefined;
    };

    DGSParser.prototype.isDirectedEdge = function() {
        var re = /^\s*(>)(?:(.*))?$/;
        var ex = re.exec(this.line);
        if (ex === null) {
            return false;
        }

        if (ex[1] !== undefined && ex[1] === '>') {
            this.line = ex[2];
            return true;
        } else return false;
    };

    DGSParser.prototype.nextReal = function() {
        var re = /^(\d+(?:\.\d+)?)$/;
        var ex = re.exec(this.line);

        return ex[1];
    };

    DGSParser.prototype.parseAttributes = function(type, e, attributes) {
        var re = /[+-]?("[^"]*"|'[^']*'|\w[[\w.]*)([:=](\d+([.]\d+)?|\w[[\w.]*|"[^"]*"|'[^']*'|#[a-fA-F0-9]{6}))?/g;
        switch (type) {
            case 'node':
                break;
            case 'edge':
                break;
        }
    };
})(window);

(function(exports) {
    "use strict";

    function Layout(graph) {
        this.graph = graph;
        this.nodes = [];
        this.links = [];
        var id;

        this.graph.addSink(this);

        for (id in this.graph.nodes)
            this.registerNode(id);

        for (id in this.graph.edges)
            this.registerEdge(id);




    }

    Layout.prototype = {
        start: function() {},
        reload: function() {},
        stop: function() {},

        registerNode: function(id) {
            var n = this.graph.nodes[id];
            n.layoutIndex = this.nodes.length;
            this.nodes.push({
                id: id
            });
        },

        unregisterNode: function(id) {
            var n = this.graph.nodes[id];
            this.nodes.splice(n.layoutIndex, 1);
        },

        registerEdge: function(id) {
            var e = this.graph.edges[id];
            e.layoutIndex = this.links.length;
            this.links.push({
                id: id,
                source: this.nodes[e.source.layoutIndex],
                target: this.nodes[e.target.layoutIndex],
                value: 1
            });
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

    exports.GS.extend(exports.GS.Sink.prototype, Layout.prototype);

    function ForceLayout(graph) {
        Layout.call(this, graph);

        this.layout_running = false;
        this.layout = d3.layout.force()
            .gravity(0)
            .charge(-15)
            .linkDistance(30);

        var that = this;

        this.layout.on("tick", function() {
            that.pushXY();
        });
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

    exports.GS.extend(Layout.prototype, ForceLayout.prototype);


    exports.GS.Layout = Layout;
    exports.GS.ForceLayout = ForceLayout;

}(this));

(function(exports) {
    'use strict';
    if (exports.GS === undefined)
        throw new Error('GS is not loaded');

    var DEFAULT_NODE_VERTEX_SHADER = [
        'attribute vec2 aVertexPos;',
        'attribute vec2 aCustomAttributes;',
        'uniform vec2 uScreenSize;',
        'uniform mat4 uTransform;',
        'varying vec4 color;',
        'void main(void) {',
        '   gl_Position = uTransform * vec4(aVertexPos/uScreenSize, 0, 1);',
        '   gl_PointSize = aCustomAttributes[1] * uTransform[0][0];',
        '   float c = aCustomAttributes[0];',
        '   color = vec4(0.0, 0.0, 0.0, 255.0);',
        '   color.b = mod(c, 256.0); c = floor(c/256.0);',
        '   color.g = mod(c, 256.0); c = floor(c/256.0);',
        '   color.r = mod(c, 256.0); c = floor(c/256.0); color /= 255.0;',
        '}'
    ].join('\n');

    var DEFAULT_NODE_FRAGMENT_SHADER = [
        'precision mediump float;',
        'varying vec4 color;',
        'void main(void) {',
        '   gl_FragColor = color;',
        '}'
    ].join('\n');

    var DEFAULT_EDGE_VERTEX_SHADER = [

    ].join('\n');

    var DEFAULT_EDGE_FRAGMENT_SHADER = [

    ].join('\n');

    function WebGLNode(graph, id) {
        exports.GS.Node.call(this, graph, id);
    }

    WebGLNode.prototype = {
        updateShapePosition: function() {
            this.graph.context.vertices[this.index * 2 + 0] = this.pixelX;
            this.graph.context.vertices[this.index * 2 + 1] = this.pixelY;

            this.graph.context.updateVertex();
        }
    };

    function initGL(canvas) {
        var gl;

        try {
            gl = canvas.getContext('experimental-webgl');
            gl.viewportWidth = canvas.width;
            gl.viewportHeight = canvas.height;
        } catch (e) {
            exports.console.log('can not initialize webgl');
        }

        return gl;
    }

    function NodeShader(vertexShader, fragmentShader) {
        if (vertexShader === undefined)
            vertexShader = DEFAULT_NODE_VERTEX_SHADER;

        if (fragmentShader === undefined)
            fragmentShader = DEFAULT_NODE_FRAGMENT_SHADER;

        this.vertexShaderCode = vertexShader;
        this.fragmentShaderCode = fragmentShader;
    }

    NodeShader.prototype = {
        init: function(gl, program) {

        },

        activate: function(gl, program) {

        }
    };

    function EdgeShader(vertexShader, fragmentShader) {}

    EdgeShader.prototype = {

    };

    function WebGLContext(sel) {
        exports.GS.Context.call(this, sel);

        this.canvas = document.createElement('canvas');
        this.gl = initGL(this.canvas);

        if (!this.gl)
            throw new Error('no webgl support');

        this.vertexBuffer = this.gl.createBuffer();
        this.edgesBuffer = this.gl.createBuffer();

        this.vertices = [];

        this.nodeShader = new NodeShader();
        this.edgeShader = new EdgeShader();
    }

    WebGLContext.prototype = {
        createNode: function(graph, nodeId) {
            var n = new WebGLNode(graph, nodeId);
            return n;
        },

        removeNode: function(graph, node) {},

        createEdge: function(graph, edgeId, source, target, directed) {
            return new exports.GS.Edge(graph, edgeId, source, target, directed);
        },

        removeEdge: function(graph, edge) {},

        clear: function(graph) {},

        zoom: function(factor) {},

        nodeIndexChanged: function(node, oldIndex, newIndex) {
            this.vertices[newIndex * 2 + 0] = this.vertices[oldIndex * 2 + 0];
            this.vertices[newIndex * 2 + 1] = this.vertices[oldIndex * 2 + 1];
        },

        edgeIndexChanged: function(edge, oldIndex, newIndex) {},

        updateVertex: function() {
            var gl = this.gl;

            gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);

            this.vertexBuffer.itemSize = 2;
            this.vertexBuffer.numItems = this.vertices.length / 2;
        }
    };

    exports.GS.extend(exports.GS.Context.prototype, WebGLContext.prototype);

}(this));
