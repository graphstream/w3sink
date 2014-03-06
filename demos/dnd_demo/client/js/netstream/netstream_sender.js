//
//  netstream_sender.js
//  netstream project
//
//  Created by Yoann Pigné on 2012-05-17.
//  Copyright 2012 University of Le Havre. All rights reserved.
//

(function(global) {
  "use strict";
  if (!global.netstream) {
    global.netstream = {};
  }

  global.netstream.Source = function (options){
    // --------- parameters
    this.debug = true;
    this.sender = null;
    this.stream = null;
    this.id = null;
    
    for(var prop in options) {
      if(options.hasOwnProperty(prop) && this.hasOwnProperty(prop)) {
        this[prop] = options[prop];
      }
    }

    if (this.stream){
      this.sender.stream = this.stream;
    }
    this.id = this.id || "s"+Math.floor(Math.random()*1000);
    this._timeId = 0;
        
  };
  
  global.netstream.Source.prototype = {
    addNode: function (node){
      this.sender.nodeAdded(this.id, this._timeId, node);
      this._timeId+=1;
    },
    removeNode: function (node){
      this.sender.nodeRemoved(this.id, this._timeId, node);
      this._timeId+=1;
    },
    addEdge: function (edge, from_node, to_node, directed){
      this.sender.edgeAdded(this.id, this._timeId, edge, from_node, to_node, directed);
      this._timeId+=1;
    },
    removeEdge: function(edge){
      this.sender.edgeRemoved(this.id, this._timeId, edge);
      this._timeId+=1;
    },
    addAttribute: function (attribute, value){
      this.sender.graphAttributeAdded(this.id, this._timeId, attribute, value);
      this._timeId+=1;
    },
    removeAttribute: function (attribute){
      this.sender.graphAttributeRemoved(this.id, this._timeId, attribute);
      this._timeId+=1;
    },
    changeAttribute: function (attribute, oldValue, newValue){
      this.sender.graphAttributeChanged(this.id, this._timeId, attribute, oldValue, newValue);
      this._timeId+=1;
    },
    
    addNodeAttribute: function (node, attribute, value){
      this.sender.nodeAttributeAdded(this.id, this._timeId, node, attribute, value);
      this._timeId+=1;
    },
    removeNodeAttibute: function(node, attribute){
      this.sender.nodeAttributeRemoved(this.id, this._timeId, node, attribute);
      this._timeId+=1;
    },
    changeNodeAttribute: function(node, attribute, oldValue, newValue){
      this.sender.nodeAttributeChanged(this.id, this._timeId, node, attribute, oldValue, newValue);
      this._timeId+=1;
    },
    
    addEdgeAttribute: function (edge, attribute, value){
      this.sender.edgeAttributeAdded(this.id, this._timeId, edge, attribute, value);
      this._timeId+=1;
    },
    removeEdgeAttribute: function (edge, attribute){
      this.sender.edgeAttributeRemoved(this.id, this._timeId, edge, attribute);
      this._timeId+=1;
    },
    changeEdgeAttrivute: function (edge, attribute, oldValue, newValue){
      this.sender.edgeAttributeChanged(this.id, this._timeId, edge, attribute, oldValue, newValue);
      this._timeId+=1;
    },
    clearGraph: function (){
      this.sender.graphCleared(this.id, this._timeId);
      this._timeId+=1;
    },
    stepBegins: function (time){
      this.sender.stepBegins(this.id, this._timeId, time);
      this._timeId+=1;
    }
  };

  global.netstream.Sender = function(options) {

    // --------- constants
    this.BUFFER_INITIAL_SIZE = 4096;

    // --------- parameters
    this.debug = true;
    this.transport = null;
    this.stream ="default";
    this.onopen= null;

    for(var prop in options) {
      if(options.hasOwnProperty(prop) && this.hasOwnProperty(prop)) {
        this[prop] = options[prop];
      }
    }

    // ---------- Output buffer ------------
    this.buffer = new ArrayBuffer(this.BUFFER_INITIAL_SIZE);
    this.pos = 0;
    this.view = new DataView(this.buffer, 0);
  };


  global.netstream.Sender.prototype = {

    // =============
    // = Public API =
    // =============

    graphAttributeAdded: function(source_id, time_id, attribute, value) {
      this._encodeString(this.stream);
      this._encodeByte(netstream.constants.EVENT_ADD_GRAPH_ATTR);
      this._encodeString(source_id);
      this._encodeLong(time_id);
      this._encodeString(attribute);
      var type = this._getType(value);
      this._encodeByte(type);
      this._encodeValue(value, type);
      this._send();
    },

    graphAttributeChanged: function(source_id, time_id, attribute, old_value, new_value) {
      this._encodeString(this.stream);
      this._encodeByte(netstream.constants.EVENT_CHG_GRAPH_ATTR);
      this._encodeString(source_id);
      this._encodeLong(time_id);
      this._encodeString(attribute);
      var type = this._getType(old_value);
      this._encodeByte(type);
      this._encodeValue(old_value, type);
      type = this._getType(new_value);
      this._encodeByte(type);
      this._encodeValue(new_value, type);
      this._send();
    },

    graphAttributeRemoved: function(source_id, time_id, attribute) {
      this._encodeString(this.stream);
      this._encodeByte(netstream.constants.EVENT_DEL_GRAPH_ATTR);
      this._encodeString(source_id);
      this._encodeLong(time_id);
      this._encodeString(attribute);
      this._send();
    },

    nodeAttributeAdded: function(source_id, time_id, node_id, attribute, value) {
      this._encodeString(this.stream);
      this._encodeByte(netstream.constants.EVENT_ADD_NODE_ATTR);
      this._encodeString(source_id);
      this._encodeLong(time_id);
      this._encodeString(node_id);
      this._encodeString(attribute);
      var type = this._getType(value);
      this._encodeByte(type);
      this._encodeValue(value, type);
      this._send();
    },

    nodeAttributeChanged: function(source_id, time_id, node_id, attribute, old_value, new_value) {
      this._encodeString(this.stream);
      this._encodeByte(netstream.constants.EVENT_CHG_NODE_ATTR);
      this._encodeString(source_id);
      this._encodeLong(time_id);
      this._encodeString(node_id);
      this._encodeString(attribute);
      var type = this._getType(old_value);
      this._encodeByte(type);
      this._encodeValue(old_value, type);
      type = this._getType(new_value);
      this._encodeByte(type);
      this._encodeValue(new_value, type);
      this._send();
    },

    nodeAttributeRemoved: function(source_id, time_id, node_id, attribute) {
      this._encodeString(this.stream);
      this._encodeByte(netstream.constants.EVENT_DEL_NODE_ATTR);
      this._encodeString(source_id);
      this._encodeLong(time_id);
      this._encodeString(node_id);
      this._encodeString(attribute);
      this._send();
    },

    edgeAttributeAdded: function(source_id, time_id, edge_id, attribute, value) {
      this._encodeString(this.stream);
      this._encodeByte(netstream.constants.EVENT_ADD_EDGE_ATTR);
      this._encodeString(source_id);
      this._encodeLong(time_id);
      this._encodeString(edge_id);
      this._encodeString(attribute);
      var type = this._getType(value);
      this._encodeByte(type);
      this._encodeValue(value, type);
      this._send();
    },

    edgeAttributeChanged: function(source_id, time_id, edge_id, attribute, old_value, new_value) {
      this._encodeString(this.stream);
      this._encodeByte(netstream.constants.EVENT_CHG_EDGE_ATTR);
      this._encodeString(source_id);
      this._encodeLong(time_id);
      this._encodeString(edge_id);
      this._encodeString(attribute);
      var type = this._getType(old_value);
      this._encodeByte(type);
      this._encodeValue(old_value, type);
      type = this._getType(new_value);
      this._encodeByte(type);
      this._encodeValue(new_value, type);
      this._send();
    },

    edgeAttributeRemoved: function(source_id, time_id, edge_id, attribute) {
      this._encodeString(this.stream);
      this._encodeByte(netstream.constants.EVENT_DEL_EDGE_ATTR);
      this._encodeString(source_id);
      this._encodeLong(time_id);
      this._encodeString(edge_id);
      this._encodeString(attribute);
      this._send();
    },

    nodeAdded: function(source_id, time_id, node_id) {
      this._encodeString(this.stream);
      this._encodeByte(netstream.constants.EVENT_ADD_NODE);
      this._encodeString(source_id);
      this._encodeLong(time_id);
      this._encodeString(node_id);
      this._send();
    },

    nodeRemoved: function(source_id, time_id, node_id) {
      this._encodeString(this.stream);
      this._encodeByte(netstream.constants.EVENT_DEL_NODE);
      this._encodeString(source_id);
      this._encodeLong(time_id);
      this._encodeString(node_id);
      this._send();
    },

    edgeAdded: function(source_id, time_id, edge_id, from_node, to_node, directed) {
      this._encodeString(this.stream);
      this._encodeByte(netstream.constants.EVENT_ADD_EDGE);
      this._encodeString(source_id);
      this._encodeLong(time_id);
      this._encodeString(edge_id);
      this._encodeString(from_node);
      this._encodeString(to_node);
      this._encodeBoolean(directed);
      this._send();
    },

    edgeRemoved: function(source_id, time_id, edge_id) {
      this._encodeString(this.stream);
      this._encodeByte(netstream.constants.EVENT_DEL_EDGE);
      this._encodeString(source_id);
      this._encodeLong(time_id);
      this._encodeString(edge_id);
      this._send();
    },
    
    stepBegins: function(source_id, time_id, step) {
      this._encodeString(this.stream);
      this._encodeByte(netstream.constants.EVENT_STEP);
      this._encodeString(source_id);
      this._encodeLong(time_id);
      this._encodeDouble(step);
    },
    
    graphCleared: function(source_id, time_id) {
      this._encodeString(this.stream);
      this._encodeByte(netstream.constants.EVENT_CLEARED);
      this._encodeString(source_id);
      this._encodeLong(time_id);
    },
    
    
    
    // ===============
    // = Private API =
    // ===============

    _ensureBufferCapacityFor: function(size) {
      if (size + this.pos > this.buffer.byteLength) {
        if (this.debug) {
          netstream.LOGGER("Actual buffer size is " + this.buffer.byteLength + " resizing to " + ((this.byteLength * 1.4 > (size + this.pos)) ? this.byteLength * 1.4: size + this.pos) + " bytes", size, this.pos);
        }
        var newb = new ArrayBuffer(((this.byteLength * 1.4 > (size + this.pos)) ? this.byteLength * 1.4: size + this.pos))
        ,
        i = 0;
        for (; i < this.pos; i++) {
          newb[i] = this.buffer[i];
        }
        delete this.buffer;
        this.buffer = newb;
        this.view = new DataView(this.buffer, 0);
      }
    },

    _getType: function(value) {
      var is_array = typeof value.forEach !== 'undefined';
      var type = 0;
      if (is_array === true) {
        value = value[0];
      }
      if (typeof value === 'boolean') {
        if (is_array) {
          type = netstream.constants.TYPE_BOOLEAN_ARRAY;
        } else {
          type = netstream.constants.TYPE_BOOLEAN;
        }
      }
      else if (typeof value === "number") {
        if (is_array) {
          type = netstream.constants.TYPE_DOUBLE_ARRAY
        } else {
          type = netstream.constants.TYPE_DOUBLE;
        }
      }
      else if (typeof value === "string") {
        type = netstream.constants.TYPE_STRING;
      }
      else if (typeof value === "object") {
        throw "You tried to send an object through the NetStream Protocol, though it is not yet implemented.";
      }
      return type;
    },
    _encodeValue: function(value, value_type) {
      if (netstream.constants.TYPE_BOOLEAN === value_type) {
        return this._encodeBoolean(value);
      } else if (netstream.constants.TYPE_BOOLEAN_ARRAY === value_type) {
        return
        this._encodeBooleanArray(value);
      } else if (netstream.constants.TYPE_DOUBLE === value_type) {
        return this._encodeDouble(value);
      } else if (netstream.constants.TYPE_DOUBLE_ARRAY === value_type) {
        return
        this._encodeDoubleArray(value);
      } else if (netstream.constants.TYPE_STRING === value_type) {
        return this._encodeString(value);
      }
      return null;
    },

    _encodeString: function(value) {
      var utf8 = netstream.utf16to8(value);
      this._ensureBufferCapacityFor(4 + utf8.length);

      this.view.setInt32(this.pos, utf8.length);
      this.pos += 4;
      for (var i = 0, j = utf8.length; i < j; i++) {
        this.view.setUint8(this.pos++, utf8.charCodeAt(i));
      }
    },

    _encodeLong: function(value) {
      this._ensureBufferCapacityFor(8);
      this.view.setInt32(this.pos, 0);
      this.pos += 4;
      this.view.setInt32(this.pos, value);
      this.pos += 4;
    },

    _encodeDouble: function(value) {
      this._ensureBufferCapacityFor(8);
      this.view.setFloat64(this.pos, value);
      this.pos += 8;
    },

    _encodeDoubleArray: function(value) {
      this._ensureBufferCapacityFor(4 + 8 * value.length);

      this.view.setInt32(this.pos, value.length);
      this.pos += 4;
      value.forEach(function(e) {
        if (typeof e !== "number") {
          throw "All the elements of an Array should be of the same type";
        }
        this.view.setFloat64(this.pos, e);
        this.pos += 8;
      });
    },

    _encodeBoolean: function(value) {
      this._ensureBufferCapacityFor(1);
      this.view.setUint8(this.pos++, value ? 1: 0);
    },

    _encodeBooleanArray: function(value) {
      this._ensureBufferCapacityFor(4 + value.length);
      this.view.setInt32(this.pos, value.length);
      this.pos += 4;
      value.forEach(function(e) {
        if (typeof e !== "boolean") {
          throw "All the elements of an Array should be of the same type";
        }
        this.view.setUint8(this.pos++, e ? 1: 0);
      });
    },

    _encodeByte: function(value) {
      this._ensureBufferCapacityFor(1);
      this.view.setUint8(this.pos++, value);
    },

    _encodeByteArray: function(value) {
      this._ensureBufferCapacityFor(4 + value.length);
      this.view.setInt32(this.pos, value.length);
      this.pos += 4;
      value.forEach(function(e) {
        if (typeof e !== "number") {
          throw "All the elements of an Array should be of the same type";
        }
        this.view.setUint8(this.pos++, e);
      });
    },


    _send: function() {
      if(this.transport === null){
        throw "no transport available. Specify one before sending anything. Packet drop."
      }
      this.transport.sendEvent(this.buffer, 0, this.pos);
      this.pos = 0;
    }

  };
} (this));




