(function(exports) {
	var SERVER_IP = "192.168.1.5";
		
	function W3SinkDemo() {
		this.notifyTimeout = false;
		this.graph = false;
		this.receiver = false;
		this.transport = false;
		this.sender = false;
		this.hbInterval = false;
		this.vbInterval = false;
		this.nodeId = false;
		this.useCookie = (window.location.search !== '?nocookie');
	}
	
	W3SinkDemo.prototype = {
		init: function() {
			var that = this;
			
			this.graph = new GS.Graph('#graph', 'svg');
			
			this.vbInterval = setInterval(function(){that.graph.viewbox.compute();}, 10000);
			
			this.transport = new netstream.Transport({
				'host': SERVER_IP,
				'port': 2003,
				'uri': '/',
				'base64': true,
				'debug': false
			});
			
			this.receiver = new netstream.Receiver({
				'debug': false,
				'transport': this.transport,
				'sink': this.graph
			});
			
			this.sender = new netstream.Sender({
				'debug': false,
				'transport': this.transport
			});
			
			this.source = new netstream.Source({
				'sender': this.sender
			});
		
			var disconnect = /^\?disconnect(?:=(.*))?$/;
		
			if (disconnect.test(window.location.search)) {
				var info = disconnect.exec(window.location.search);
				
				if (info[1] !== undefined)
					this.source.removeNode(info[1]);
				
				this.clearCookie();
				window.location = window.location.pathname;
			}
		
			var checkCookieName = this.getCookie('name');
			
			if (checkCookieName) {
				$('#fillcolor').attr('data-style-value', this.getCookie('fill'));
				$('#strokecolor').attr('data-style-value', this.getCookie('stroke'));
				this.connect(checkCookieName);
			}
			
			$('#connectButton').click(function() {
				var name = $('input[name="connectName"]').val();
				
				if (name.length < 5) {
					alert("Your name should contain at least 5 characters");
					return;
				}
				
				that.connect(name);
			});
			
			$('#updateNode').click(function() {
				that.updateRemoteNode();
			});

			var cp = Raphael.colorwheel($("#colorpicker")[0], 150).color("#eee");

			$('a.colorpicker').click(function(){
				$('a.colorpicker').removeClass('active');
				$(this).addClass('active');
				cp.color($(this).attr('data-style-value'));
			});
			
			cp.onchange(function(c){
				var a = $('a.colorpicker.active');
				a.attr('data-style-value', c.hex);
				that.updateNodeStyle();
			});

			cp.color($('a.colorpicker.active').attr('data-style-value'));
			this.updateNodeStyle();
			
			$('.tabs a').click (function() {
				if ($(this).hasClass('disable'))
					return;
				
				var tabs = $(this).attr('data-tabs'),
					tab = $(this).attr('data-tab');
				
				$('.tabs a[data-tabs="'+tabs+'"]').removeClass('active');
				$(this).addClass('active');
				$(tabs).removeClass('active');
				$(tab).addClass('active');
			});
		},
		
		heartbeat: function(action) {
			switch(action) {
			case 'start':
				if (this.hbInterval)
					return;
				
				var that = this;
				this.hbInterval = setInterval(function(){that.heartbeat("beat");}, 30000);
				
				break;
			case 'beat':
				this.source.changeNodeAttribute(this.nodeId, "heartbeat", "heart", "beat");
				break;
			case 'stop':
				if (this.hbInterval) {
					clearInterval(this.hbInterval);
					this.hbInterval = false;
				}
				
				break;
			}
		},
		
		getTags: function() {
			var tags = [];
			$('.information select.tags option:selected').each(function(){tags.push($(this).val());});
			return tags.join(';');
		},
		
		updateRemoteNode: function() {
			var name = $('input[name="name"]').val(),
				fill = $('#fillcolor').attr('data-style-value'),
				stro = $('#strokecolor').attr('data-style-value');
				tags = this.getTags();
			
			this.source.addNodeAttribute(name, 'style', "fill-color:" + fill + ";stroke-color:" + stro);
			
			if (tags !== null) {
				this.setCookie('tags', tags);
				console.log("'"+tags + "' " + typeof(tags));
				this.source.addNodeAttribute(name, 'tags', tags);
			}
			
			this.notify("Your node has been updated");
		},
		
		updateNodeStyle: function() {
			$('.setstyle').each(function(i,e) {
				d3.select('#thenode svg circle').style($(this).attr('data-style-type'), ($(this).attr('data-style-value')));
			});
			
			this.setCookie('fill', $('#fillcolor').attr('data-style-value'));
			this.setCookie('stroke', $('#strokecolor').attr('data-style-value'));
		},
		
		connect: function(name) {
			if (name.length < 5) {
				alert("Your name should contain at least 5 characters");
				return;
			}
			
			this.nodeId = name;
			this.source.addNode(name);
			this.setCookie('name', name);
			
			$('.tabs li:first-child').hide();
			$('.tabs li a').removeClass('disable');
			$('#tab-connect').removeClass('active');
			$('#tab-informations').addClass('active');
			$('a[data-tab="#tab-informations"]').addClass('active');
			$('input[name="name"]').val(name);
			$('#updateNode').show();
			
			this.source.addNodeAttribute(name, "label", name);
			
			this.heartbeat('start');
			
			var tagsCookie = this.getCookie('tags');
			
			if (tagsCookie)
				this.loadTags(tagsCookie);
				
			if (this.graph.nodes[name] && this.graph.nodes[name].hasAttribute('tags'))
				this.loadTags(this.graph.nodes[name].getAttribute('tags'));
			
			this.updateRemoteNode();
			this.notify("<p>You are connected as '"+name+"'.</p><a href='?disconnect'>Click here</a> to disconnect.");
		},
		
		loadTags: function(tagsString) {
			var tags = tagsString.split(";");
				
			for (var i = 0; i < tags.length; i++)
				$('select.tags option[value="'+tags[i]+'"]').attr('selected', 'selected');
		},
		
		notify: function(message) {
			var n = jQuery('#notification');
			
			if (this.notifyTimeout)
				clearTimeout(this.notifyTimeout);
			
			n.html(message);
			n.animate({right:10,opacity:1}, 1000);
			
			var that = this;
			this.notifyTimeout = setTimeout(function() {that.closeNotification();}, 5000);
		},
		
		closeNotification: function() {
			var n = jQuery('#notification');
			n.animate({right:-250,opacity:0}, 1000, function() {notifyTimeout = false;});
		},
	
		setCookie: function(key, value) {
			if (this.useCookie)
				document.cookie = 'w3sink.demo.'+key+'=' + encodeURIComponent(value) + ";";
		},
		
		getCookie: function(key) {
			if (!this.useCookie)
				return undefined;
			
			var re = new RegExp("w3sink.demo."+key+"=([^;]*)");
			
			if (re.test(document.cookie)) {
				var info = re.exec(document.cookie);
				return unescape(info[1]);
			} else {
				return false;
			}
		},
	
		clearCookie: function(key) {
			document.cookie = "w3sink.demo.name=;expires=Thu, 01-Jan-1970 00:00:01 GMT;";
			document.cookie = "w3sink.demo.fill=;expires=Thu, 01-Jan-1970 00:00:01 GMT;";
			document.cookie = "w3sink.demo.stroke=;expires=Thu, 01-Jan-1970 00:00:01 GMT;";
			document.cookie = "w3sink.demo.tags=;expires=Thu, 01-Jan-1970 00:00:01 GMT;";
		}
	};
	
	exports.W3SinkDemo = new W3SinkDemo();
} (this));
