(function(exports) {
  'use strict';

  /*
   * This object will contains the CSS structure for the whole graph.
   */
  var CSS_structure = new CSS_tree();


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
        this.sinks[i].nodeAttributeChanged(this.id, t, nodeId, attrId,
          oldValue, newValue);
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
        this.sinks[i].edgeAttributeChanged(this.id, t, edgeId, attrId,
          oldValue, newValue);
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
     * @param attr
     *          key of the attribute
     * @param value
     *          value of the attribute
     */
    sendGraphAttributeAdded: function(attr, value) {
      var t = this.newTimeId();

      for (var i = 0; i < this.sinks.length; i++) {
        this.sinks[i].graphAttributeAdded(this.id, t, attr, value);
      }
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
        this.sinks[i].graphAttributeChanged(this.id, t, attrId, oldValue,
          newValue);
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
    nodeAttributeChanged: function(sourceId, timeId, nodeId, attrId, oldValue,
      newValue) {},

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
    edgeAttributeChanged: function(sourceId, timeId, edgeId, attrId, oldValue,
      newValue) {},

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
    graphAttributeChanged: function(sourceId, timeId, attrId, oldValue,
      newValue) {},

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
      if (value === null) {
        delete this.attributes[key];
      } else {
        this.attributes[key] = value;
      }
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

    setShape: function(shape) {},

    setLabel: function(label) {},

    setHide: function(is_visible) {},

    setClass: function(ui_class) {},

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
          case 'shape':
            this.setShape(t[1]);
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
            exports.console.log('[GraphStream CSS] unsupported property "' +
              t[0] + '" for ' + this.type);
            break;
          default:
            exports.console.log('[GraphStream CSS] unknown property "' + t[0] +
              '" for ' + this.type);
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

    z: function(z) {
      if (typeof(z) === 'undefined')
        return this._z;

      this._z = z;

      for (var eid in this.edges)
        this.edges[eid].nodePositionChanged(this);
    },

    setXY: function(x, y) {
      this._x = x;
      this._y = y;

      this.graph.viewbox.check(x, y);
      this.graph.viewbox.update(this);
    },
    setXYZ: function(x, y, z) {
      this._z = z;
      this.setXY(x, y);
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

      // Update 3D edges (to keep on with their nodes' movements).
      this.shape.geometry.verticesNeedUpdate = true;

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

    this.nodes = {};
    this.edges = {};

    this.nodesCount = 0;
    this.edgesCount = 0;

    this.indexedNodes = [];
    this.indexedEdges = [];

    // Default style for 3D objects.
    this.default_node_style = 'size:5; fill-color:#555;';
    this.default_edge_style = 'stroke-width:2; stroke-color:#999;';

    this.viewbox = new ViewBox(this);
    this.dispatch = new Sink();

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

    an: function(id) {
      if (this.nodes.hasOwnProperty(id)) {
        exports.console.log('[Warning] node exists "' + id + '"');
        return;
      }

      var n = this.context.createNode(this, id);
      this.nodes[id] = n;
      this.nodesCount++;

      n.setStyle(this.default_node_style);

      this.sendNodeAdded(id);
    },

    cn: function(id, key, value) {
      var n = this.nodes[id];

      if (value === undefined) {
        n.removeAttribute(key);
        this.sendNodeAttributeRemoved(id, key);
      } else {
        if (key === 'xy' || key === 'xyz' || key === 'x' || key === 'y' || key === 'z') {
          var x,y,z;
          switch (key) {
            case 'x':
              x = value;
              break;
            case 'y':
              y = value;
              break;
            case 'z':
              z = value;
              break;
            case 'xy':
              x = value[0];
              y = value[1];
              break;
            case 'xyz':
              x = value[0];
              y = value[1];
              z = value[2];
          }
          n.setXYZ(x, y, z);
        }
        else if (key === 'style') {
          n.setStyle(value);

          // Put that style in CSS_structure object.
          var style_obj = style_to_obj('node', n.id, value);
          update_CSS(CSS_structure, style_obj);
        }
        else if (key === 'size')
          n.setSize(value);
        else if (key === 'label')
          n.setLabel(value);
        else if (key === 'ui.class') {
          n.setClass(value);

          // Refresh that node according to 'value' class parameters.
          read_css_for_obj(CSS_structure, 'node', n.id);
        }
        else if (key === 'ui.hide') {
          // ui.hide attribute is probably not present when object is visible...
          var visible;
          if (value === 'true')
              visible = false;
          else
              visible = true;
          n.setHide(visible);
        }
        else
          n.setAttribute(key, value);
        this.sendNodeAttributeChanged(id, key, value);
      }
    },

    setXYZ: function(id, x, y, z) {
      var n = this.nodes[id];
      n.setXYZ(x, y, z);
    },

    setPixelXY: function(id, x, y) {
      var n = this.nodes[id];
      n.setPixelXY(x, y);
    },

    dn: function(id) {
      var edgeToRemove = [];
      var n = this.nodes[id];

      for (var eid in this.edges) {
        if (this.edges[eid].source.id === id || this.edges[eid].target.id ===
          id)
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
      this.nodesCount--;
    },

    ae: function(id, src, trg, directed) {
      if (this.nodes[src] === undefined) {
        exports.console.log('node "' + src + '" not found for edge "' + id +
          '"');
        return;
      }

      if (this.nodes[trg] === undefined) {
        exports.console.log('node "' + trg + '" not found for edge "' + id +
          '"');
        return;
      }

      var e = this.context.createEdge(this, id, this.nodes[src], this.nodes[trg], directed);
      this.edges[id] = e;

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
        if (key === 'style') {
          e.setStyle(value);

          // Put that style in CSS_structure object.
          var style_obj = style_to_obj('edge', e.id, value);
          update_CSS(CSS_structure, style_obj);
        }
        else if (key === 'size') {
          e.setSize(value);
        }
        else if (key === 'label')
          e.setLabel(value);
        else if (key === 'ui.class') {
          e.setClass(value);

          // Refresh that node according to 'value' class parameters.
          read_css_for_obj(CSS_structure, 'edge', e.id);
        }
        else if (key === 'ui.hide') {
          // ui.hide attribute is probably not present when object is visible...
          var visible;
          if (value === 'true')
              visible = false;
          else
              visible = true;
          e.setHide(visible);
        }
        else
          e.setAttribute(key, value);
        this.sendEdgeAttributeChanged(id, key, value);
      }
    },

    de: function(id) {
      var e = this.edges[id];
      if (typeof e === 'undefined')
        return;

      this.sendEdgeRemoved(id);

      this.context.removeEdge(this, e);

      delete e.source.edges[id];
      if (e.source !== e.target) {
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
      this.edgesCount--;
    },

    cg: function(key, value) {
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

    nodeAttributeChanged: function(sourceId, timeId, nodeId, key, oldValue,
      newValue) {
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

    edgeAttributeChanged: function(sourceId, timeId, edgeId, key, oldValue,
      newValue) {
      this.ce(edgeId, key, newValue);
    },

    edgeAttributeRemoved: function(sourceId, timeId, edgeId, key) {
      this.ce(edgeId, key, null);
    },

    graphAttributeAdded: function(sourceId, timeId, key, value) {
      // Get stylesheet content, convert it into a CSS_tree object and add it to CSS_structure.

      // If stylesheet is from a file.
      if (value.substring(0, 3) === 'url') {

        // Get file content.
        var url = value.substring(5, value.length - 2);

        // Put its content into CSS_structure and apply that content to the whole graph.
        handle_css_content(url, CSS_structure);
      }
      // If stylesheet is from a string.
      else {
        var object_css = data_to_obj(value);
        var is_different = update_CSS(CSS_structure, object_css);
        if (is_different) {
          read_css(CSS_structure);
        }
      }

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

        px = this.padding.left + (this.graph.width() - this.padding.left -
          this.padding.right) * px;
        py = this.padding.bottom + (this.graph.height() - this.padding.bottom -
          this.padding.top) * py;

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
