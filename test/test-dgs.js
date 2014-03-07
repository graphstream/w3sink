(function(exports) {
    'use strict';

    exports.module('DGS Tests');

    exports.asyncTest('asynchronous test: Test graph loading', function() {
        exports.expect(8);

        function after_graph_loaded() {
            exports.ok(true, 'DGS didn\'t load...');

            exports.ok(graph.nodes['1'].id === '1', 'Node ids are not ok');
            exports.ok(graph.nodesCount === graph.nodesCount, 'Problem with the number of nodes');
            exports.ok(graph.edgesCount === graph.edgesCount, 'Problem with the number of edges');
            exports.ok(graph.nodesCount <= 3, 'Problem with the number of nodes. Maybe something with node deletion');
            exports.ok(graph.nodesCount >= 3, 'Problem with the number of nodes. Maybe something with node addition');
            exports.ok(graph.edgesCount >= 3, 'Problem with the number of nodes. Maybe something with edge addition');
            exports.ok(graph.edgesCount >= 3, 'Problem with the number of nodes. Maybe something with edge addition');

            
            exports.start(); // needed to resume qunit after the async call
        }

        var graph = new exports.GS.Graph('#canvas', 'svg');

        graph.dgs('graph.dgs', after_graph_loaded);
    });
})(this);
