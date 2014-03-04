(function(exports) {
	
	if (GS === undefined)
		throw new Error("GS is not loaded");
	
	var DEFAULT_NODE_VERTEX_SHADER = [
		'attribute vec2 aVertexPos;',
		'attribute vec2 aCustomAttributes;', 
		'uniform vec2 uScreenSize;',
		'uniform mat4 uTransform;',
		'varying vec4 color;',
		'void main(void) {',
		'   gl_Position = uTransform * vec4(aVertexPos/uScreenSize, 0, 1);',
		'   gl_PointSize = aCustomAttributes[1] * uTransform[0][0];',
		'   float c = aCustomAttributes[0];',
		'   color = vec4(0.0, 0.0, 0.0, 255.0);',
		'   color.b = mod(c, 256.0); c = floor(c/256.0);',
		'   color.g = mod(c, 256.0); c = floor(c/256.0);',
		'   color.r = mod(c, 256.0); c = floor(c/256.0); color /= 255.0;',
		'}'
	].join('\n');
	
	var DEFAULT_NODE_FRAGMENT_SHADER = [
		'precision mediump float;',
		'varying vec4 color;',
		'void main(void) {',
		'   gl_FragColor = color;',
		'}'
	].join('\n');
	
	var DEFAULT_EDGE_VERTEX_SHADER = [
	
	].join('\n');
	
	var DEFAULT_EDGE_FRAGMENT_SHADER = [
	
	].join('\n');
	
	function WebGLNode(graph, id) {
		GS.Node.call(this, graph, id);
	}
	
	WebGLNode.prototype = {
		updateShapePosition: function() {
			this.graph.context.vertices [this.index*2+0] = this.pixelX;
			this.graph.context.vertices [this.index*2+1] = this.pixelY;
			
			this.graph.context.updateVertex();
		}
	};
	
	function initGL(canvas) {
		var gl;
		
		try {
			gl = canvas.getContext("experimental-webgl");
			gl.viewportWidth = canvas.width;
			gl.viewportHeight = canvas.height;
		} catch(e) {
			console.log("can not initialize webgl");
		}
		
		return gl;
	}
	
	function NodeShader(vertexShader, fragmentShader) {
		if (vertexShader === undefined)
			vertexShader = DEFAULT_NODE_VERTEX_SHADER;
			
		if (fragmentShader === undefined)
			fragmentShader = DEFAULT_NODE_FRAGMENT_SHADER;
		
		this.vertexShaderCode = vertexShader;
		this.fragmentShaderCode = fragmentShader;
	}
	
	NodeShader.prototype = {
		init: function(gl, program) {
			
		},
		
		activate: function(gl, program) {
			
		}
	};
	
	function EdgeShader(vertexShader, fragmentShader) {
	}
	
	EdgeShader.prototype = {
		
	};
	
	function WebGLContext(sel) {
		GS.Context.call(this, sel);
		
		this.canvas = document.createElement("canvas");
		this.gl = initGL(this.canvas);
		
		if (!this.gl)
			throw new Error("no webgl support");
		
		this.vertexBuffer = this.gl.createBuffer();
		this.edgesBuffer = this.gl.createBuffer();
		
		this.vertices = [];
		
		this.nodeShader = new NodeShader();
		this.edgeShader = new EdgeShader();
	}
	
	WebGLContext.prototype = {
		createNode: function(graph, nodeId) {
			var n = new WebGLNode(graph, nodeId);
			return n;
		},
		
		removeNode: function(graph, node) {
		},
		
		createEdge: function(graph, edgeId, source, target, directed) {
			return new Edge(graph, edgeId, source, target, directed);
		},
		
		removeEdge: function(graph, edge) {
		},
		
		clear: function(graph) {
		},
		
		zoom: function(factor) {
		},
		
		nodeIndexChanged: function(node, oldIndex, newIndex) {
			this.vertices [newIndex*2+0] = this.vertices [oldIndex*2+0];
			this.vertices [newIndex*2+1] = this.vertices [oldIndex*2+1];
		},
		
		edgeIndexChanged: function(edge, oldIndex, newIndex) {
		},
		
		updateVertex: function() {
			var gl = this.gl;
			
			gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);
			
			this.vertexBuffer.itemSize = 2;
			this.vertexBuffer.numItems = this.vertices.length / 2;
		}
	};
	
	GS.extend(GS.Context.prototype, WebGLContext.prototype);
	
} (this));
