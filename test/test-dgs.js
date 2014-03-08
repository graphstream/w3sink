(function(exports) {
    'use strict';

    exports.module('DGS Tests');

    exports.asyncTest('asynchronous test: Test graph loading', function() {
        exports.expect(1);

        function after_graph_loaded() {
            exports.ok(true, 'DGS didn\'t load...');

            exports.test("Test nodes and edges creation/deletion", function() {
                exports.ok(graph.nodes['1'].id === '1', 'Node ids are not ok');
                exports.ok(graph.nodesCount === graph.nodesCount, 'Problem with the number of nodes');
                exports.ok(graph.edgesCount === graph.edgesCount, 'Problem with the number of edges');
                exports.ok(graph.nodesCount <= 4, 'Problem with the number of nodes. Maybe something with node deletion');
                exports.ok(graph.nodesCount >= 4, 'Problem with the number of nodes. Maybe something with node addition');
                exports.ok(graph.edgesCount >= 3, 'Problem with the number of nodes. Maybe something with edge addition');
                exports.ok(graph.edgesCount >= 3, 'Problem with the number of nodes. Maybe something with edge addition');
            });

            exports.test("Test attributes", function() {
                exports.ok(graph.nodes['1'].hasAttribute('attribute'), 'Supposedly existing attribute not found.');
                exports.ok(graph.nodes.n1.hasAttribute('attribute2'), 'Problem with multiple attributes on one event.');
                exports.ok(graph.nodes['1'].getAttribute('attribute') === '1', 'Wrong value for attribute (string).');
                exports.ok(graph.nodes['2'].getAttribute('attribute') === -2, 'Wrong value for attribute (negative number).');
                exports.ok(graph.nodes.n1.getAttribute('attribute2') === -12.34e7, 'Wrong value for attribute (scientific notation number).');
                
            });

            exports.start(); // needed to resume qunit after the async call
        }

        var graph = new exports.GS.Graph('#canvas', 'svg');

        graph.dgs('graph.dgs', after_graph_loaded);
    });
})(this);
