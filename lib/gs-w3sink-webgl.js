(function(exports) {
    'use strict';
    if (exports.GS === undefined)
        throw new Error('GS is not loaded');

    // Node

    function WEBGLNode(graph, id) {
        exports.GS.Node.call(this, graph, id);

        this.shape = new THREE.Mesh(new THREE.SphereGeometry(graph.default_node_size_3d, 16, 16),
                                    new THREE.MeshLambertMaterial());

        /*
        // Node as Cube instead of Sphere.
        this.shape = new THREE.Mesh(new THREE.BoxGeometry(graph.default_node_size_3d, graph.default_node_size_3d, graph.default_node_size_3d),
                                    new THREE.MeshLambertMaterial());
        */

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
            var ratio = size / graph.default_node_size_3d;
            this.shape.scale.set(ratio, ratio, ratio);
        },

        updateShapePosition: function() {
            this.shape.position.set(this._x, this._y, this._z);
        }
    };

    // Edge

    function WEBGLEdge(graph, id, source, target, directed) {
        exports.GS.Edge.call(this, graph, id, source, target, directed);

        var edgeGeometry = new THREE.Geometry();

        edgeGeometry.vertices.push(source.shape.position);
        edgeGeometry.vertices.push(target.shape.position);

        this.shape = new THREE.Line(edgeGeometry, new THREE.LineBasicMaterial({ vertexColors: true }));

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

        updateShapePosition: function() {
        }
    };

    exports.GS.extend(exports.GS.Node.prototype, WEBGLNode.prototype);
    exports.GS.extend(exports.GS.Edge.prototype, WEBGLEdge.prototype);

    // Context

    function WEBGLContext(selector) {
        GS.Context.call(this, selector);

        this.webgl = document.getElementById('three');
        var that = this;

        function run() {
            requestAnimationFrame(run);
            renderer.render(that.scene, camera);
            controls.update();
        };

        var view_width  = this.webgl.offsetWidth,
            view_height = this.webgl.offsetHeight;

        this.scene = new THREE.Scene();
        var renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(view_width, view_height);

        // Add a camera.
        // TODO: Place it according to graph content.
        var camera = new THREE.PerspectiveCamera(50, view_width / view_height, 1, 4000);
        camera.position.set(-25, -125, 300);
        camera.up.set(0, 0, 1);
        this.scene.add(camera);

        // Lights.
        var amb_light = new THREE.AmbientLight(0x555555);
        var dir_light = new THREE.DirectionalLight(0x888888, 1.5);
        dir_light.position.set(-10, -50, 100);
        this.scene.add(amb_light);
        this.scene.add(dir_light);

        /* Mouse controls. */
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
        controls.dynamicDampingFactor = .3;

        this.webgl.appendChild(renderer.domElement);

        run();
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
            this.scene.remove(node.shape);
        },

        wedges: function (edge) {
            this.scene.add(edge);
        },

        createEdge: function(graph, edgeId, source, target, directed) {
            var e = new WEBGLEdge(graph, edgeId, source, target, directed);
            return e;
        },

        removeEdge: function(graph, edge) {
            this.scene.remove(edge.shape);
        },

        clear: function(graph) {},

        zoom: function(factor) {}
    };

    exports.GS.extend(GS.Context.prototype, WEBGLContext.prototype);
    exports.GS.registerContext("webgl", WEBGLContext);
} (this));
