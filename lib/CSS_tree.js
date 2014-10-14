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
