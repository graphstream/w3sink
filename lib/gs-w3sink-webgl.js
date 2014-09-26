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
