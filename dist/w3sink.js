/*! w3sink v0.0.1 - 2014-10-14 
 *  License: MIT */
/*
 * CSS_tree() is used to store CSS for graphstream.
 * It contains two identical  tree-like structures, one for 'nodes' and one for 'edges'
 * Structure is as follow:
 *
 * ├─ nodes
 * │    ├── default
 * │    ├── classes
 * │    └── ids
 * └─ edges
 *      ├── default
 *      ├── classes
 *      └── ids
 */

// Empty object.
function CSS_tree() {
    this.nodes = {};
    this.nodes.ids = {};
    this.nodes.classes = {};
    this.nodes.default = {};

    this.edges = {};
    this.edges.ids = {};
    this.edges.classes = {};
    this.edges.default = {};
}

// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// !                                             !
// !  Problem if node/edge ID is just a number!  !
// !                                             !
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

// Convert from a string containing CSS data to a CSS_tree() object.
function data_to_obj(data) {

    // Use an empty tree structure as a starting point.
    var new_CSS = new CSS_tree();

    // Parse data.
    var parser = new CSSParser();
    var data_content = parser.parse(data, false, true);

    for (var id_family = 0; id_family < data_content.cssRules.length; id_family++) {
        var family = data_content.cssRules[id_family].mSelectorText;
        var list = data_content.cssRules[id_family].declarations;

        for (var id_property = 0; id_property < list.length; id_property++) {
            var prop = list[id_property].property;
            var val = list[id_property].values;

            // Get a string containing the value(s) of the CSS key:value(s) pair.
            var val_cnt = '';
            for (var id_value = 0; id_value < val.length; id_value++) {
                val_cnt += val[id_value].value + ' ';
            }
            val_cnt = val_cnt.substring(0, val_cnt.length - 1);

            var id_name, class_name;

            // NODES
            if (family.substring(0, 4) === 'node') {

                // IDs
                if (family.contains('node#')) {
                    id_name = family.substring(5);

                    // If the entry does not exist yet, create it.
                    if (new_CSS.nodes.ids[id_name] === undefined) {
                        new_CSS.nodes.ids[id_name] = {};
                    }

                    // Feed the entry.
                    new_CSS.nodes.ids[id_name][prop] = val_cnt;
                }

                // Classes
                else if (family.contains('node.')) {

                    // If the entry does not exist yet, create it.
                    class_name = family.substring(5);
                    if (new_CSS.nodes.classes[class_name] === undefined) {
                        new_CSS.nodes.classes[class_name] = {};
                    }

                    // Feed the entry.
                    new_CSS.nodes.classes[class_name][prop] = val_cnt;
                }

                // Root
                else {
                    new_CSS.nodes.default[prop] = val_cnt;
                }
            }

            // EDGES
            if (family.substring(0, 4) === 'edge') {

                // IDs
                if (family.contains('edge#')) {

                    // If the entry does not exist yet, create it.
                    id_name = family.substring(5).toString();
                    if (new_CSS.edges.ids[id_name] === undefined) {
                        new_CSS.edges.ids[id_name] = {};
                    }

                    // Feed the entry.
                new_CSS.edges.ids[id_name][prop] = val_cnt;
                }

                // Classes
                else if (family.contains('edge.')) {
                    class_name = family.substring(5);

                    // If the entry does not exist yet, create it.
                    if (new_CSS.edges.classes[class_name] === undefined) {
                        new_CSS.edges.classes[class_name] = {};
                    }

                    // Feed the entry.
                    new_CSS.edges.classes[class_name][prop] = val_cnt;
                }

                // Root
                else {
                    new_CSS.edges.default[prop] = val_cnt;
                }
            }
        }
    }
    return new_CSS;
}


// Convert from "cn/ce id style:style_data" to CSS_tree structure.
// 'type' is 'node' or 'edge'.
function style_to_obj(type, id, style_data) {
    var line = type + '#' + id + '{' + style_data + '}';

    return data_to_obj(line);
}


// Update 'main_CSS' with 'new_part' (both are CSS_tree).
function update_CSS(main_CSS, new_part) {
    var main_clone = _.clone(main_CSS, true);
    _.merge(main_CSS, new_part);

    // Return true if the update changed main_CSS content.
    return is_different(main_CSS, main_clone);
}


// Change a CSS_tree.?.default to a string.
// Useful to update graph.default_node_style and graph.default_edge_style.
function css_to_string(css_default) {
    var string = '';
    for (var value in css_default) {
        string += value + ':' + css_default[value] + ';';
    }
    return string;
}


// Apply style 'key:value' to 'type' object of ID 'id'.
// E.g.: apply_css('node', 'n1', 'size', '10')
function apply_css(type, id, key, value) {
    if (type === 'node') {
        graph.nodes[id].setStyle(key + ':' + value);
    }
    else if (type === 'edge') {
        graph.edges[id].setStyle(key + ':' + value);
    }
    /*
    else
        console.log('Error of type: ' + type + ' for ' + id + ' in apply_css().');
    */
}

// Refresh a single node according to content of CSS tree.
// Parameters are:
// - tree: CSS object
// - current_node_id : node to refresh
// - is_single: if true, update graph.default_node_style, if needed
function read_css_for_node(tree, current_node_id, is_single) {
    var node_default = tree.nodes.default;
    var node_classes = tree.nodes.classes;
    var node_ids = tree.nodes.ids;
    var key;

    // If we deal with a single node, update graph.default_node_style, if needed.
    if (is_single) {
        var old_default = style_to_obj('node', 'dummy_node', graph.default_node_style);
        var new_default = style_to_obj('node', 'dummy_node', css_to_string(node_default));
        update_CSS(old_default, new_default);
        graph.default_node_style = css_to_string(old_default.nodes.ids.dummy_node);
    }

    //
    // node
    //
    for (key in node_default) {
        apply_css('node', current_node_id, key, node_default[key]);
    }

    //
    // node.xyz
    //
    for (var n_class in node_classes) {
        if (n_class === graph.nodes[current_node_id].className) {
            for (key in node_classes[n_class]) {
                apply_css('node', current_node_id, key, node_classes[n_class][key]);
            }
        }
    }

    //
    // node#xyz
    //
    for (var n_id in node_ids) {
        if (n_id === current_node_id) {
            for (key in node_ids[n_id]) {
                apply_css('node', current_node_id, key, node_ids[n_id][key]);
            }
        }
    }
}


// Refresh a single edge according to content of CSS tree.
// Parameters are:
// - tree: CSS object
// - current_edge_id : edge to refresh
// - is_single: if true, update graph.default_edge_style, if needed
function read_css_for_edge(tree, current_edge_id, is_single) {
    var edge_default = tree.edges.default;
    var edge_classes = tree.edges.classes;
    var edge_ids = tree.edges.ids;
    var key;

    // If we deal with a single edge, update graph.default_edge_style, if needed.
    if (is_single) {
        var old_default = style_to_obj('edge', 'dummy_edge', graph.default_edge_style);
        var new_default = style_to_obj('edge', 'dummy_edge', css_to_string(edge_default));
        update_CSS(old_default, new_default);
        graph.default_edge_style = css_to_string(old_default.edges.ids.dummy_edge);
    }

    //
    // edge
    //
    for (key in edge_default) {
        apply_css('edge', current_edge_id, key, edge_default[key]);
    }

    //
    // edge.xyz
    //
    for (var e_class in edge_classes) {
        if (e_class === graph.edges[current_edge_id].className) {
            for (key in edge_classes[e_class]) {
                apply_css('edge', current_edge_id, key, edge_classes[e_class][key]);
            }
        }
    }

    //
    // edge#xyz
    //
    for (var e_id in edge_ids) {
        if (e_id === current_edge_id) {
            for (key in edge_ids[e_id]) {
                apply_css('edge', current_edge_id, key, edge_ids[e_id][key]);
            }
        }
    }
}


// Read all content from tree to refresh a single object.
function read_css_for_obj(tree, type, id) {
    if (type === 'node') {
        read_css_for_node(tree, id, true);
    }
    else if (type === 'edge') {
        read_css_for_edge(tree, id, true);
    }
    /*
    else
        console.log('Problem of type: ' + type + ' in read_css_for_obj(' + id + ')...');
    */
}


// Read all 'nodes' content from tree, beginning with 'default', then 'classes', then 'ids'.
function read_nodes_css(tree) {
    var node_default = tree.nodes.default;
    var node_classes = tree.nodes.classes;
    var node_ids = tree.nodes.ids;

    // Update, if needed, graph.default_node_style.
    var old_default = style_to_obj('node', 'dummy_node', graph.default_node_style);
    var new_default = style_to_obj('node', 'dummy_node', css_to_string(node_default));
    update_CSS(old_default, new_default);
    graph.default_node_style = css_to_string(old_default.nodes.ids.dummy_node);

    // Refresh nodes one by one.
    for (var id in graph.nodes) {
        read_css_for_node(tree, id, false);
    }
}


// Read all 'edges' content from tree, beginning with 'default', then 'classes', then 'ids'.
function read_edges_css(tree) {
    var edge_default = tree.edges.default;
    var edge_classes = tree.edges.classes;
    var edge_ids = tree.edges.ids;

    // Update, if needed, graph.default_edge_style.
    var old_default = style_to_obj('edge', 'dummy_edge', graph.default_edge_style);
    var new_default = style_to_obj('edge', 'dummy_edge', css_to_string(edge_default));
    update_CSS(old_default, new_default);
    graph.default_edge_style = css_to_string(old_default.edges.ids.dummy_edge);

    // Refresh edges one by one.
    for (var id in graph.edges) {
        read_css_for_edge(tree, id, false);
    }
}

// Read all content from tree to refresh the whole graph.
function read_css(tree) {
    read_nodes_css(tree);
    read_edges_css(tree);
}


// Check if old_CSS's content and new_CSS's content are different.
function is_different(old_CSS, new_CSS) {
    return !_.isEqual(_.reduce(old_CSS), _.reduce(new_CSS));
}

// Get content from CSS file and apply it to the graph objects as needed.
function handle_css_content(url, main_CSS_object) {
    var callback = function(data) {

        // Create a new CSS_tree object filled with the CSS file's content from 'url'.
        var new_CSS = data_to_obj(data);

        // Update the main CSS_tree object with the newly created object's content.
        var is_different = update_CSS(main_CSS_object, new_CSS);

        // If that update changed the main CSS_tree, refresh the 3D components of the graph.
        if (is_different) {
            read_css(main_CSS_object);
        }
    };

    $.get(url).success(callback);
}

(function(exports) {
  'use strict';

  /*
   * This object will contains the CSS structure for the whole graph.
   */
  var CSS_structure = new exports.CSS_tree();


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

    this.default_node_size = '5';

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
          var style_obj = exports.style_to_obj('node', n.id, value);
          exports.update_CSS(CSS_structure, style_obj);
        }
        else if (key === 'size')
          n.setSize(value);
        else if (key === 'label')
          n.setLabel(value);
        else if (key === 'ui.class') {
          n.setClass(value);

          // Refresh that node according to 'value' class parameters.
          exports.read_css_for_obj(CSS_structure, 'node', n.id);
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
          var style_obj = exports.style_to_obj('edge', e.id, value);
          exports.update_CSS(CSS_structure, style_obj);
        }
        else if (key === 'size') {
          e.setSize(value);
        }
        else if (key === 'label')
          e.setLabel(value);
        else if (key === 'ui.class') {
          e.setClass(value);

          // Refresh that node according to 'value' class parameters.
          exports.read_css_for_obj(CSS_structure, 'edge', e.id);
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

      // If stylesheet is from a file (e.g., cg ui.stylesheet:url('path/to/file.css')):
      if (value !== undefined) {
        if (value.substring(0, 3) === 'url') {

          // Get file content.
          var url = value.substring(5, value.length - 2);

          // Put its content into CSS_structure and apply that content to the whole graph.
          exports.handle_css_content(url, CSS_structure);
        }
        // If stylesheet is from a string (e.g., cg ui.stylesheet:'node{...}'):
        else {
          var object_css = exports.data_to_obj(value);

          // Update display if needed.
          var is_different = exports.update_CSS(CSS_structure, object_css);
          if (is_different) {
            exports.read_css(CSS_structure);
          }
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

/*
The GDS Grammar:

<DGS>        ::= <header> ( <event> | <comment> | <EOL> )*
<header>     ::= <magic> <EOL> <id> <int> <int> <EOL>
<magic>      ::= "DGS004" | "DGS003"
<event>      ::= ( <an> | <cn> | <dn> | <ae> | <ce> | <de> | <cg> | <st> | <cl> ) ( <comment> | <EOL> )
<an>         ::= "an" <id> <attributes>
<cn>         ::= "cn" <id> <attributes>
<dn>         ::= "dn" <id>
<ae>         ::= "ae" <id> <id> ( <direction> )? <id> <attributes>
<ce>         ::= "ce" <id> <attributes>
<de>         ::= "de" <id>
<cg>         ::= "cg" <attributes>
<st>         ::= "st" <real>
<cl>         ::= "cl"
<attributes> ::= ( <attribute> )*
<attribute>  ::= ( "+" | "-" )? <id> ( <assign> <value> ( "," <value> )* )?
<value>      ::= <string> | <real> | "" | <array> | <map>
<array>      ::= "{" ( <value> ( "," <value> )* )? "}"
<map>        ::= "[" ( <mapping> ( "," <mapping> )* )? "]"
<mapping>    ::= <id> <assign> <value>
<direction>  ::= '<' | '>' | ''
<assign>     ::= '=' | ':'
<id>         ::= <string> | <int> | <word> ( '.' <word> )*

<comment>    ::= "#" ( . )* <EOL>
<int>        ::= '0' | ( '1' .. '9' ) ( '0' .. '9' )*
<real>       ::= <int> ( "." ( "0" )* <int> )?
<word>       ::= ( 'a' .. 'z' | 'A' .. 'Z' ) ( 'a' .. 'z' | 'A' .. 'Z' | '0' .. '9' | '-' | '_' )*
<string>     ::= '"' ( [^'"'] | '\"' )* '"'

*/

(function(exports) {
  'use strict';

  if (exports.GS === undefined)
    throw new Error('GS is not loaded');

  var parser = {
    lines: [],
    line: '',
    source:null
  };

  function FileSourceDGS() {
    exports.GS.FileSource.call(this, 'DGS');
    parser.source = this;
  }

  // If urlOrData is a dgs file content, isData needs to be true.
  // If urlOrData is a dgs file name, isData needs to be false.
  FileSourceDGS.prototype.begin = function(urlOrData, isData) {
    var that = this;
    return new exports.Promise(
      function(resolve, reject) {
        var callback = function(data) {
          parser.setData(data);
          resolve(that);
        };

        if (isData) {
          callback(urlOrData);
        } else {
          exports.jQuery.get(urlOrData).then(callback, function(err) {
            reject(err);
          });
        }
      });
  };

  FileSourceDGS.prototype.nextEvents = function() {
    var result = parser.parseOneLine();
    return result;
  };

  FileSourceDGS.prototype.nextStep = function() {
    var stepRead = false;
    while(parser.ready() && parser.parseOneLine() !== 'st') {
      stepRead = true;
    }
    return stepRead;
  };

  FileSourceDGS.prototype.readAll = function() {
    parser.parseAll();
  };

  FileSourceDGS.prototype.end = function() {
    // nope
  };

  exports.GS.extend(exports.GS.FileSource.prototype, FileSourceDGS.prototype);

  parser.setData = function(data) {
    var re, line;
    parser.lines = data.split('\n').reverse();

    line = parser.lines.pop();
    re = /^DGS00\d$/;
    if (!re.test(line))
      throw new Error('invalid dgs header "' + line + '"');

    line = parser.lines.pop();
    re = /^\S+ \d+ \d+$/;
    if (!re.test(line))
      throw new Error('invalid dgs header "' + line + '"');

    var i = 0;

    while (i < parser.lines.length) {
      if (parser.lines[i] === '' || parser.lines[i].charAt(0) === '#') {
        parser.lines.splice(i, 1);
      } else i++;
    }
  };

  // exports.GS.Graph.prototype.dgs = function(url, callback) {
  //     var dgs = new DGSParser(this);
  //
  //     exports.jQuery.get(url).then(function(data) {
  //         dgs.setData(data);
  //         dgs.parse();
  //         if (callback !== undefined) {
  //             callback();
  //         }
  //     }, function(err) {
  //         throw new Error(err);
  //     });
  // };

  parser.setData = function(data) {
    var re, line;
    parser.lines = data.split('\n').reverse();

    line = parser.lines.pop();
    re = /^DGS00\d$/;
    if (!re.test(line))
      throw new Error('invalid dgs header "' + line + '"');

    line = parser.lines.pop();
    re = /^\S+ \d+ \d+$/;
    if (!re.test(line))
      throw new Error('invalid dgs header "' + line + '"');

    var i = 0;

    while (i < parser.lines.length) {
      if (parser.lines[i] === '' || parser.lines[i].charAt(0) === '#') {
        parser.lines.splice(i, 1);
      } else i++;
    }
  };

  parser.ready = function() {
    return (parser.lines.length > 0);
  };

  parser.next = function() {
    parser.line = parser.lines.pop();
    return this;
  };

  parser.dir = function() {
    if (parser.line.match(/^\s*#/) !== null) {
      return '#';
    }
    var dir = parser.line.substr(0, 2).toLowerCase();
    parser.line = parser.line.substr(3, parser.line.length - 3);
    return dir;
  };

  parser.parseOneLine = function() {
    var dir,
      id,
      source,
      target,
      directed;
    parser.next();

    dir = parser.dir();

    //
    // Execute directive
    //
    switch (dir) {
      case 'an':
        id = parser.nextId();
        parser.source.sendNodeAdded(id);
        parser.parseAttributes('node', id);
        break;
      case 'cn':
        id = parser.nextId();
        parser.parseAttributes('node', id);
        break;
      case 'dn':
        id = parser.nextId();
        parser.source.sendNodeRemoved(id);
        break;
      case 'ae':
        id = parser.nextId();
        source = parser.nextId();
        directed = parser.isDirectedEdge();
        target = parser.nextId();
        parser.source.sendEdgeAdded(id, source, target, directed);
        parser.parseAttributes('edge', id);
        break;
      case 'ce':
        id = parser.nextId();
        parser.parseAttributes('edge', id);
        break;
      case 'de':
        id = parser.nextId();
        parser.source.sendEdgeRemoved(id);
        break;
      case 'cg':
        parser.parseAttributes('graph');
        break;
      case 'st':
        parser.source.sendStepBegins(parser.nextReal());
        break;
      case 'cl':
        parser.source.sendGraphCleared.cl();
        break;
      case '#':
        break;
      default:
        throw new Error('DSG Parser unknown directive "' + dir + '"');
    }
    return dir;
  };

  parser.parseAll = function() {
    while (parser.ready()) {
      parser.parseOneLine();
    }
  };

  parser.nextId = function() {
    var re = /^\s*(?:'([^']+)'|"([^"]+)"|([\w\d-_]+))(?:(.*))?$/;
    var ex = re.exec(parser.line);
    if (ex === null) {
      throw new Error('DSG Parser Problem with ids reading that line :' +
        parser.line);
    } else {
      parser.line = ex[4];

      return ex[1] || ex[2] || ex[3];
    }
  };

  parser.isDirectedEdge = function() {
    var re = /^\s*(>)(?:(.*))?$/;
    var ex = re.exec(parser.line);
    if (ex === null) {
      return false;
    }

    if (ex[1] !== undefined && ex[1] === '>') {
      parser.line = ex[2];
      return true;
    } else
      return false;
  };

  parser.nextReal = function() {
    var re = /^(\d+(?:\.\d+)?)$/;
    var ex = re.exec(parser.line);

    return ex[1];
  };

  parser.parseAttributes = function(type, e) {
    var that = this;

    function readValue(isArray) {
      var re,
        ex,
        in_re,
        in_ex,
        o = [],
        map,
        nextChar;

      if (ex === null) {
        throw new Error('No value could be read on line: ' + that.line);
      }

      do {
        re = /^\s*(([^\s])(.*))/;
        ex = re.exec(that.line);
        // ex[1] is the all value
        // ex[2] is the first char
        // ex[3] is the rest

        switch (ex[2]) {
          case '\'':
          case '"':
            in_re = /^([^'^"]*)['"](.*)$/;
            in_ex = in_re.exec(ex[3]); // exec on the rest (no starting quote)
            if (in_ex === null) {
              throw new Error('Could not read a string on line: ' + that.line);
            }
            o.push(in_ex[1]);
            that.line = in_ex[2];
            break;
          case '#':
            in_re = /^(#[a-fA-F0-9]{6}|[a-fA-F0-9]{3})(.*)/;
            in_ex = in_re.exec(ex[1]); // exec on the rest (no starting #)
            if (in_ex === null) {
              throw new Error('Could not read a color on line: ' + that.line);
            }
            o.push(in_ex[1]);
            that.line = in_ex[2];
            break;
          case '{': // an array
            that.line = ex[3];
            var arr = readValue(true);
            in_re = /^\s*((\})(.*))/;
            in_ex = in_re.exec(that.line);
            if (in_ex === null) {
              throw new Error('Could not read a table on line: ' + that.line);
            }
            o.push(arr);

            that.line = in_ex[3];
            break;
          case '[': // a map
            map = {};
            in_re = /^\s*([^\s])/;
            in_ex = in_re.exec(ex[3]);
            that.line = ex[3];
            nextChar = in_ex[1];
            while (nextChar !== ']') {
              in_re = /^\s*(?:"([^"]*)"|'([^']*)'|(\w[[\w.]*))\s*[:=](.*)$/;
              in_ex = in_re.exec(that.line);
              if (in_ex === null) {
                throw new Error('Could not read a hash on line: ' + that.line);
              }
              var key = in_ex[1] || in_ex[2] || in_ex[3];
              that.line = in_ex[4];
              var value = readValue(false);
              map[key] = value;

              in_re = /^\s*(([^\s])(.*))/;
              in_ex = in_re.exec(that.line);

              // in_ex[1] is the all value
              // in_ex[2] is the first char
              // in_ex[3] is the rest
              nextChar = in_ex[2];
              if (nextChar !== ']' && nextChar !== ',') {
                throw new Error('Could not read a hash on line: ' + that.line);
              }
              that.line = in_ex[3];
            }
            o.push(map);
            break;

          default: // word or number
            in_re =
              /\s*(?:([+-]?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)|(\w[-\w.]*)|"([^"]*)"|'([^']*)')(.*)$/;
            in_ex = in_re.exec(ex[1]);
            if (in_ex === null) {
              throw new Error('Could not read a word or number on line: ' +
                that.line);
            }
            var tmp = ((typeof(in_ex[1]) !== 'undefined') ? parseFloat(in_ex[
              1], 10) : in_ex[2] || in_ex[3] || in_ex[4]);

            o.push(tmp);
            that.line = in_ex[5];
        }

        re = /^\s*(([^\s]|)(.*))/;
        ex = re.exec(that.line);
        // ex[1] is the all value
        // ex[2] is the first char
        // ex[3] is the rest

        if (ex === null) {
          throw new Error('No value could be read on line: ' + that.line);
        }

        if (ex[2] === ',' && isArray) {
          that.line = ex[3];
        }
      } while (ex[2] === ',' && isArray);

      if (o.length === 1) {
        return o[0];
      }
      return o;
    } // end readValue.


    if (typeof parser.line === 'undefined' || parser.line.match(/^\s*$/) !==
      null) {
      // exports.console.log('No attributes for ' + type + ' ' + e + '. Moving on.');
      return;
    }

    var re = /^\s*([+-]?)(?:"([^"]*)"|'([^']*)'|(\w[[\w\.]*))(.*?)$/;   // ZZZZZZ

    var ex = re.exec(parser.line);
    var isRemove,
      attrName,
      attrVal;

    if (ex === null) {
      //exports.console.log('No attributes for ' + type + ' ' + e + '. Moving on.');
      return;
    }
    // exports.console.log(ex);
    isRemove = ex[1] === '-' ? true : false;

    // Get attribute name and value. No quotes.
    attrName = ex[2] || ex[3] || ex[4];

    // go on with the rest.
    parser.line = ex[5];

    re = /\s*([:=])?(.*?)$/;
    ex = re.exec(parser.line);
    // exports.console.log(ex);

    if (typeof(ex[1]) !== 'undefined') {
      // we have a value.
      parser.line = ex[2];

      attrVal = readValue(true);
    }

    // exports.console.log('attrName: ' + attrName);
    // exports.console.log('attrVal: ' + attrVal);

    if (isRemove) {
      switch (type) {
        case 'node':
          parser.source.sendNodeAttributeRemoved(e,attrName);
          break;
        case 'edge':
          parser.source.sendEdgeAttributeRemoved(e,attrName);
          break;
        case 'graph':
          parser.source.sendGraphAttributeRemoved(attrName);

      }
    } else {
      switch (type) {
        case 'node':
          parser.source.sendNodeAttributeAdded(e, attrName, attrVal);
          break;
        case 'edge':
          parser.source.sendEdgeAttributeAdded(e, attrName, attrVal);
          break;
        case 'graph':
          parser.source.sendGraphAttributeAdded(attrName, attrVal);
          break;
      }
    }

    // Maybe there are some extra attributes. Let's call the method recursively.
    if (parser.line !== '') {
      parser.parseAttributes(type, e);
    }
  };

  exports.GS.FileSourceDGS = FileSourceDGS;

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

    var list_labels = [];
    var list_objects = [];

    var list_shapes = [new THREE.SphereGeometry(1, 16, 16),
                       new THREE.BoxGeometry(1, 1, 1),
                       new THREE.TetrahedronGeometry(1),
                       new THREE.OctahedronGeometry(1),
                       new THREE.TorusGeometry(1, 0.3, 8, 16)
                      ];

    // Node

    function WEBGLNode(graph, id) {
        exports.GS.Node.call(this, graph, id);

        // Default shape is a sphere.
        var geometry = list_shapes[0];
        this.shape = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial());
        this.shape.type = 'Node';

        list_objects[this.shape.id] = this.shape;

        graph.context.wnodes(this.shape);
    }

    WEBGLNode.prototype = {
        setFill: function(color) {
            this.shape.material.color = new THREE.Color(color);
        },

        setStroke: function(color) {
            this.setFill(color);
        },

        setStrokeWidth: function(size) {
            this.setSize(size);
        },

        setSize: function(size) {
            this.shape.scale.set(size, size, size);
        },

        setClass: function(ui_class) {
            this.className = ui_class;
        },

        setHide: function(is_visible) {
            this.shape.visible = is_visible;
        },

        setShape: function(shape) {
            var id_shape = 0;
            switch (shape) {
                case 'cube':
                    id_shape = 1;
                    break;
                case 'tetra':
                    id_shape = 2;
                    break;
                case 'octa':
                    id_shape = 3;
                    break;
                /*
                // Problem for label, because center of torus is empty -> never visible
                case 'torus':
                    id_shape = 4;
                    break;
                */
                default:
                    // sphere or unknown shape.
                    break;
            }

            this.shape_name = shape;

            var geom = list_shapes[id_shape];
            //this.shape.geometry.dispose();
            this.shape.geometry = geom.clone();
            this.shape.geometry.buffersNeedUpdate = true;
        },

        updateShapePosition: function() {
            this.shape.position.set(this._x, this._y, this._z);
        },

        setLabel: function(label) {
            var position = this.shape.position;
            var color = '#' + this.shape.material.color.getHexString();
            var text = document.createElement('div');
            text.style.position = 'absolute';
            text.style.width = 100;
            text.style.height = 100;
            text.innerHTML = label;
            //text.style.color = 'white';
            text.style.backgroundColor = color;
            text.style.left = position.x + 'px';
            text.style.top = position.y + 'px';
            text.style.display = 'none';
            document.body.appendChild(text);

            // Remove label if it exists.
            if (list_labels[this.shape.id] !== undefined) {
                list_labels[this.shape.id].style.display = 'none';
                delete list_labels[this.shape.id];
            }

            list_labels[this.shape.id] = text;
        }
    };

    // Edge

    function WEBGLEdge(graph, id, source, target, directed) {
        exports.GS.Edge.call(this, graph, id, source, target, directed);

        var edgeGeometry = new THREE.Geometry();

        edgeGeometry.vertices.push(source.shape.position);
        edgeGeometry.vertices.push(target.shape.position);

        this.shape = new THREE.Line(edgeGeometry, new THREE.LineBasicMaterial({ vertexColors: true }));
        this.shape.type = 'Edge';
        this.shape.geometry.computeBoundingSphere();

        list_objects[this.shape.id] = this.shape;

        graph.context.wedges(this.shape);
    }

    WEBGLEdge.prototype = {
        setStroke: function(color) {
            this.shape.geometry.colors[0] = new THREE.Color(color);
            this.shape.geometry.colors[1] = new THREE.Color(color);
            this.shape.geometry.colorsNeedUpdate = true;
        },

        setStrokeWidth: function(size) {
            this.shape.material.linewidth = size;
        },

        setSize: function(size) {
            this.setStrokeWidth(size);
        },

        setClass: function(ui_class) {
            this.className = ui_class;
            //console.log('%c', 'color:red', 'Class for edge ' + this.id + ': ' + ui_class);
        },

        setHide: function(is_visible) {
            this.shape.visible = is_visible;
        },

        updateShapePosition: function() {
            this.shape.geometry.computeBoundingSphere();
        },

        setLabel: function(label) {
            var position = this.shape.geometry.boundingSphere.center;
            var color = '#' + this.shape.geometry.colors[0].getHexString();
            var text = document.createElement('div');
            text.style.position = 'absolute';
            text.style.width = 100;
            text.style.height = 100;
            text.innerHTML = label;
            //text.style.color = color;
            text.style.backgroundColor = color;
            text.style.left = position.x + 'px';
            text.style.top = position.y + 'px';
            text.style.display = 'none';
            document.body.appendChild(text);

            // Remove label if it exists.
            if (list_labels[this.shape.id] !== undefined) {
                list_labels[this.shape.id].style.display = 'none';
                delete list_labels[this.shape.id];
            }

            list_labels[this.shape.id] = text;
        }
    };

    exports.GS.extend(exports.GS.Node.prototype, WEBGLNode.prototype);
    exports.GS.extend(exports.GS.Edge.prototype, WEBGLEdge.prototype);

    // Context

    function WEBGLContext(selector) {
        GS.Context.call(this, selector);

        this.webgl = document.getElementById('three');

        var view_width  = this.webgl.offsetWidth,
            view_height = this.webgl.offsetHeight;
        var projector = new THREE.Projector();

        this.list_labels = [];
        this.list_objects = [];
        var field_depth = 400;

        this.scene = new THREE.Scene();

        var camera = new THREE.PerspectiveCamera(50, view_width / view_height, 1, 10000);
        camera.position.set(-125, -125, 300);
        camera.up.set(0, 0, 1);
        //camera.target = new THREE.Vector3(0, 0, 0);

        // Lights.
        var amb_light = new THREE.AmbientLight(0x555555);
        var dir_light = new THREE.DirectionalLight(0x888888, 1.5);
        dir_light.position.set(-10, -50, 100);
        this.scene.add(amb_light);
        this.scene.add(dir_light);

        /* Mouse controls */
        // Left click + move: rotate
        // Mouse wheel / middle click + move: zoom in/out
        // Right click + move: pan
        var controls = new THREE.TrackballControls(camera);
        controls.rotateSpeed = 1.5;
        controls.zoomSpeed = 10;
        controls.panSpeed = 1.5;
        controls.noZoom = false;
        controls.noPan = false;
        controls.staticMoving = true;

        window.addEventListener('resize', onWindowResize, false);

        var renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(view_width, view_height);

        this.webgl.appendChild(renderer.domElement);
        var that = this;

        run();

        function run() {
            requestAnimationFrame(run);
            controls.update();
            update_labels();
            renderer.render(that.scene, camera);
        }


        // Label

        // Make sure label color is the same as its related object color.
        function update_label_color(object, label) {
            if (object.type === 'Node') {
                label.style.backgroundColor = '#' + object.material.color.getHexString();
            }
            else {
                label.style.backgroundColor = '#' + object.geometry.colors[0].getHexString();
            }
        }

        // Update labels position if needed.
        function update_labels() {
            for (var i in list_labels) {
                var label = list_labels[i];
                var object = list_objects[i];
                var vector;

                var is_inside_fov = is_in_fov(object);
                var visible = is_visible(object);

                if (object.type === 'Node') {
                    vector = object.position;
                }
                else {
                    vector = object.geometry.boundingSphere.center;
                }

                //vector = object.geometry.boundingSphere.center;

                var projection = projector.projectVector(vector.clone(), camera);
                var distance = vector.distanceTo(camera.position);

                // If the label can seen, refresh its position and color and display it.
                if (visible && is_inside_fov && distance < field_depth) {
                    label.style.display = '';
                    update_label_color(object, label);
                    projection.x = (1 + projection.x) / 2 * window.innerWidth - label.clientWidth / 2;
                    projection.y = (1 - projection.y) / 2 * window.innerHeight - label.clientHeight / 2;
                    label.style.top = projection.y + 'px';
                    label.style.left = projection.x + 'px';
                }
                else {
                    label.style.display = 'none';
                }
            }
        }

        // Return true if object's *center* is not behind another object.
        function is_visible(object) {
            var direction;

            if (object.type === 'Node') {
                direction = object.position.clone();
            }
            else {
                direction = object.geometry.boundingSphere.center.clone();
            }

            var ray_source = camera.position.clone();
            var ray_target = direction.sub(ray_source).normalize();

            // Launch a ray from camera to current object.
            var ray = new THREE.Raycaster(ray_source, ray_target);
            var ray_intersects = ray.intersectObjects(that.scene.children, true);

            // If current object is not the first seen in the line of sight from camera to itself...
            if (ray_intersects[0] && object.id !== ray_intersects[0].object.id) {
                // ..., it is hidden.
                return false;
            }

            // Object is visible.
            return true;
        }

        // Return true if object is in the camera's field of view.
        function is_in_fov(object) {
            camera.updateMatrix();
            camera.updateMatrixWorld();
            camera.matrixWorldInverse.getInverse(camera.matrixWorld);

            object.updateMatrix();
            object.updateMatrixWorld();
            var frustum = new THREE.Frustum();
            frustum.setFromMatrix(new THREE.Matrix4().multiplyMatrices(
                                        camera.projectionMatrix,
                                        camera.matrixWorldInverse));
            return frustum.intersectsObject(object);
        }

        function onWindowResize() {
            camera.aspect = document.getElementById('three').offsetWidth / document.getElementById('three').offsetHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(document.getElementById('three').offsetWidth, document.getElementById('three').offsetHeight);
        }
    }

    WEBGLContext.prototype = {
        wnodes: function (node) {
            this.scene.add(node);
        },

        createNode: function(graph, nodeId) {
            var n = new WEBGLNode(graph, nodeId);
            return n;
        },

        removeNode: function(graph, node) {
            var id = node.shape.id;
            this.scene.remove(node.shape);

            // Remove label if it exists.
            if (list_labels[id] !== undefined) {
                list_labels[id].style.display = 'none';
                delete list_labels[id];
                delete list_objects[id];
            }
        },

        wedges: function (edge) {
            this.scene.add(edge);
        },

        createEdge: function(graph, edgeId, source, target, directed) {
            var e = new WEBGLEdge(graph, edgeId, source, target, directed);
            return e;
        },

        removeEdge: function(graph, edge) {
            var id = edge.shape.id;
            this.scene.remove(edge.shape);

            // Remove label if it exists.
            if (list_labels[id] !== undefined) {
                list_labels[id].style.display = 'none';
                delete list_labels[id];
                delete list_objects[id];
            }
        },

        clear: function(graph) {},

        zoom: function(factor) {}
    };

    exports.GS.extend(GS.Context.prototype, WEBGLContext.prototype);
    exports.GS.registerContext("webgl", WEBGLContext);
} (this));
