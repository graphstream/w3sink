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

            exports.test("Test simple attributes", function() {
                exports.ok(graph.nodes['1'].hasAttribute('attribute'), 'Supposedly existing attribute not found.');
                exports.ok(graph.nodes.n1.hasAttribute('attribute2'), 'Problem with multiple attributes on one event.');
                exports.ok(graph.nodes['1'].getAttribute('attribute') === '1', 'Wrong value for attribute (string).');
                exports.ok(graph.nodes['2'].getAttribute('attribute') === -2, 'Wrong value for attribute (negative number).');
                exports.ok(graph.nodes.n1.getAttribute('attribute2') === -12.34e7, 'Wrong value for attribute (scientific notation number).');
                exports.ok(graph.nodes['1'].hasAttribute('attribute2') === false, 'Problem with attributes deletion');
            });
            exports.test("Test elaborate-typed attributes", function() {
                var arr = graph.edges['0-1'].attributes.array;
                exports.ok(typeof(arr) !== 'undefined', 'Missing simple array-typed attribute');
                exports.ok(Array.prototype.isPrototypeOf(arr), 'Wrong type for an array-typed attribute');
                exports.ok(arr.length === 3, 'Problem with length of an simple array-typed attribute');
                exports.ok(arr[0] === 1 && arr[1] === 2 && arr[2] === 3, 'Problems with the values of a simple array-typed attribute');
                arr = graph.edges['1-2'].attributes.array2;
                exports.ok(typeof(arr) !== 'undefined', 'Missing multilevel array-typed attribute');
                exports.ok(Array.prototype.isPrototypeOf(arr), 'Wrong type for a multilevel  array-typed attribute');
                exports.ok(arr.length === 3, 'Problem with length of an multilevel array-typed attribute');
                exports.ok(arr[0].length === 2 && arr[1].length === 4 , 'Problems with sub-arrays length in an array-typed attribute');
                exports.ok(arr[0][0] === 0 && arr[1][2] === 4 &&  arr[1][3] === '4.5' && arr[2] === -5 , 'Problems with sub-arrays values and/or types in an array-typed attribute');
                var map = graph.edges['2-0'].attributes.map;
                exports.ok(typeof(map) !== 'undefined', 'Missing map-typed attribute');
                exports.ok(Object.prototype.isPrototypeOf(map), 'Wrong type for a map-typed attribute');
                exports.ok(typeof(map.key1) !== 'undefined' && typeof(map.key2) !== 'undefined', 'Problem with keys of a map-typed attribute');
                exports.ok(map.key1 === 'val1' && map.key2[0] === 'val' && map.key2[1] === '2', 'Problems with the values of a map-typed attribute');
            });


            exports.start(); // needed to resume qunit after the async call
        }

        var graph = new exports.GS.Graph('#canvas', 'svg');

        graph.dgs('graph.dgs', after_graph_loaded);
    });
})(this);
