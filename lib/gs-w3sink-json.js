(function (exports) {
	function JSONSource() {
		GS.FileSource.call(this, "json");
		this.data = false;
		this.lastEvent = false;
	}
	
	JSONSource.prototype = {
		begin: function(url) {
			jQuery.ajax({
				url: url,
				type: 'GET',
				dataType: 'json',
				async: false,
				context: this,
				success: function(data) {
					this.setData(data);
				},
				error: function (xhr, msg, e) {console.log(msg); console.log(e);}
			});
		},
		
		setData: function(data) {
			this.data = data;
			this.data.events.reverse();
			console.log(this.data);
		},
		
		nextEvents: function() {
			if (!this.data) {
				console.log("no data");
				return;
			}
			
			if (this.data.events.length === 0)
				return false;
			
			var e = this.data.events.pop();
			e.reverse();
			
			var dir = e.pop();
			
			switch (dir) {
			case 'an':
				this.sendNodeAdded(e.pop());
				break;
			case 'cn':
				var id = e.pop();
				var kv;
				
				while (e.length > 0) {
					var type = '';
					kv = e.pop();
					
					if (kv[0] === '+' || kv[0] === '-' || kv[0] === '') {
						type = kv[0];
						kv.splice(0,1);
					}
					
					switch(type) {
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
				var id = e.pop();
				var kv;
				
				while (e.length > 0) {
					var type = '';
					kv = e.pop();
					
					if (kv[0] === '+' || kv[0] === '-' || kv[0] === '') {
						type = kv[0];
						kv.splice(0,1);
					}
					
					switch(type) {
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
				var kv;
				
				while (e.length > 0) {
					var type = '';
					kv = e.pop();
					
					if (kv[0] === '+' || kv[0] === '-' || kv[0] === '') {
						type = kv[0];
						kv.splice(0,1);
					}
					
					switch(type) {
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
				console.log("unknown event '"+dir+"'");
			}
			
			this.lastEvent = dir;
			
			return this.data.events.length > 0;
		},
		
		nextStep: function() {
			do
				this.nextEvents();
			while (this.lastEvent != 'st' && this.data.events.length > 0);
			
			return this.data.events.length > 0;
		},
		
		end: function() {
			this.data = false;
			this.lastEvent = false;
		}
	};
	
	GS.extend(GS.FileSource.prototype, JSONSource.prototype);
	GS.JSONSource = JSONSource;
} (this));
