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
