(function(exports) {
    'use strict';

    exports.module('DGS Tests');

    exports.asyncTest('asynchronous test: Test graph loading', function() {
        exports.expect(2);

        function after_graph_loaded() {
            exports.ok(true, 'DGS didn\'t load...');

            exports.ok(graph.nodes['10'].id === '10', 'Node ids are not ok');

            exports.start(); // needed to resume qunit after the async call
        }

        var graph = new exports.GS.Graph('#canvas', 'svg');

        graph.dgs('graph.dgs', after_graph_loaded);
    });
})(this);
