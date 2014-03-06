(function (global) {
    "use strict";
    if (!global.netstream) {
        global.netstream = {};
    }

    global.netstream.DefaultSink = function () {
    };
    global.netstream.DefaultSink.prototype = {
        nodeAdded: function () {},
        nodeRemoved: function () {},
        nodeAttributeAdded: function () {},
        nodeAttributeChanged: function () {},
        nodeAttributeRemoved: function () {},
        edgeAdded: function () {},
        edgeRemoved: function () {},
        edgeAttributeAdded: function () {},
        edgeAttributeChanged: function () {},
        edgeAttributeRemoved: function () {},
        graphAttributeAdded: function () {},
        graphAttributeChanged: function () {},
        graphAttributeRemoved: function () {},
        graphCleared: function () {},
        stepBegins: function () {}
    };

    global.netstream.DOMSink = function (element) {
        this.element = element;
    };

    global.netstream.DOMSink.prototype = {
        element: "",
        appendMsg: function (msg) {
            var textNode = global.document.createTextNode(msg);
            var parNode = global.document.createElement('p');
            parNode.appendChild(textNode);
            this.element.appendChild(parNode);
        },
        nodeAdded: function (sourceId, timeId, nodeId) {
            this.appendMsg("(GSSink, " + sourceId + ":" + timeId + ") : an \"" + nodeId + "\"");
        },
        nodeRemoved: function (sourceId, timeId, nodeId) {
            this.appendMsg("(GSSink, " + sourceId + ":" + timeId + ") : dn \"" + nodeId + "\"");
        },
        nodeAttributeAdded: function (sourceId, timeId, nodeId, attrId, value) {
            this.appendMsg("(GSSink, " + sourceId + ":" + timeId + ") : cn \"" + nodeId + "\" \"" + attrId + "\":" + value);
        },
        nodeAttributeChanged: function (sourceId, timeId, nodeId, attrId, oldValue, newValue) {
            this.appendMsg("(GSSink, " + sourceId + ":" + timeId + ") : cn \"" + nodeId + "\" \"" + attrId + "\":" + newValue);
        },
        nodeAttributeRemoved: function (sourceId, timeId, nodeId, attrId) {
            this.appendMsg("(GSSink, " + sourceId + ":" + timeId + ") : cn \"" + nodeId + "\" \"" + attrId + "\":null");
        },
        edgeAdded: function (sourceId, timeId, edgeId, from, to, directed) {
            this.appendMsg("(GSSink, " + sourceId + ":" + timeId + ") : ae \"" + edgeId + "\" \"" + from + (directed === true ? "\">\"": "\" \"") + to + "\"");
        },
        edgeRemoved: function (sourceId, timeId, edgeId) {
            this.appendMsg("(GSSink, " + sourceId + ":" + timeId + ") : de \"" + edgeId + "\"");
        },
        edgeAttributeAdded: function (sourceId, timeId, edgeId, attrId, value) {
            this.appendMsg("(GSSink, " + sourceId + ":" + timeId + ") : ce \"" + edgeId + "\" \"" + attrId + "\":" + value);
        },
        edgeAttributeChanged: function (sourceId, timeId, edgeId, attrId, oldValue, newValue) {
            this.appendMsg("(GSSink, " + sourceId + ":" + timeId + ") : ce \"" + edgeId + "\" \"" + attrId + "\":" + newValue);
        },
        edgeAttributeRemoved: function (sourceId, timeId, edgeId, attrId) {
            this.appendMsg("(GSSink, " + sourceId + ":" + timeId + ") : cn \"" + edgeId + "\" \"" + attrId + "\":null");
        },
        graphAttributeAdded: function (sourceId, timeId, attrId, value) {
            this.appendMsg("(GSSink, " + sourceId + ":" + timeId + ") : cg  \"" + attrId + "\":" + value);
        },
        graphAttributeChanged: function (sourceId, timeId, attrId, oldValue, newValue) {
            this.appendMsg("(GSSink, " + sourceId + ":" + timeId + ") : cg \"" + attrId + "\":" + newValue);
        },
        graphAttributeRemoved: function (sourceId, timeId, edgeId, attrId) {
            this.appendMsg("(GSSink, " + sourceId + ":" + timeId + ") : cg  \"" + attrId + "\":null");
        },
        graphCleared: function (sourceId, timeId) {
            this.appendMsg("(GSSink, " + sourceId + ":" + timeId + ") : cl");
        },
        stepBegins: function (sourceId, timeId, time) {
            this.appendMsg("(GSSink, " + sourceId + ":" + timeId + ") : st " + time);
        }
    };



    global.netstream.LoggerSink = function () {
    };
    global.netstream.LoggerSink.prototype = {
        nodeAdded: function (sourceId, timeId, nodeId) {
            netstream.LOGGER("(GSSink, " + sourceId + ":" + timeId + ") : an \"" + nodeId + "\"");
        },
        nodeRemoved: function (sourceId, timeId, nodeId) {
            netstream.LOGGER("(GSSink, " + sourceId + ":" + timeId + ") : dn \"" + nodeId + "\"");
        },
        nodeAttributeAdded: function (sourceId, timeId, nodeId, attrId, value) {
            netstream.LOGGER("(GSSink, " + sourceId + ":" + timeId + ") : cn \"" + nodeId + "\" \"" + attrId + "\":" + value);
        },
        nodeAttributeChanged: function (sourceId, timeId, nodeId, attrId, oldValue, newValue) {
            netstream.LOGGER("(GSSink, " + sourceId + ":" + timeId + ") : cn \"" + nodeId + "\" \"" + attrId + "\":" + newValue);
        },
        nodeAttributeRemoved: function (sourceId, timeId, nodeId, attrId) {
            netstream.LOGGER("(GSSink, " + sourceId + ":" + timeId + ") : cn \"" + nodeId + "\" \"" + attrId + "\":null");
        },
        edgeAdded: function (sourceId, timeId, edgeId, from, to, directed) {
            netstream.LOGGER("(GSSink, " + sourceId + ":" + timeId + ") : ae \"" + edgeId + "\" \"" + from + (directed === true ? "\">\"": "\" \"") + to + "\"");
        },
        edgeRemoved: function (sourceId, timeId, edgeId) {
            netstream.LOGGER("(GSSink, " + sourceId + ":" + timeId + ") : de \"" + edgeId + "\"");
        },
        edgeAttributeAdded: function (sourceId, timeId, edgeId, attrId, value) {
            netstream.LOGGER("(GSSink, " + sourceId + ":" + timeId + ") : ce \"" + edgeId + "\" \"" + attrId + "\":" + value);
        },
        edgeAttributeChanged: function (sourceId, timeId, edgeId, attrId, oldValue, newValue) {
            netstream.LOGGER("(GSSink, " + sourceId + ":" + timeId + ") : ce \"" + edgeId + "\" \"" + attrId + "\":" + newValue);
        },
        edgeAttributeRemoved: function (sourceId, timeId, edgeId, attrId) {
            netstream.LOGGER("(GSSink, " + sourceId + ":" + timeId + ") : cn \"" + edgeId + "\" \"" + attrId + "\":null");
        },
        graphAttributeAdded: function (sourceId, timeId, attrId, value) {
            netstream.LOGGER("(GSSink, " + sourceId + ":" + timeId + ") : cg  \"" + attrId + "\":" + value);
        },
        graphAttributeChanged: function (sourceId, timeId, attrId, oldValue, newValue) {
            netstream.LOGGER("(GSSink, " + sourceId + ":" + timeId + ") : cg \"" + attrId + "\":" + newValue);
        },
        graphAttributeRemoved: function (sourceId, timeId, edgeId, attrId) {
            netstream.LOGGER("(GSSink, " + sourceId + ":" + timeId + ") : cg  \"" + attrId + "\":null");
        },
        graphCleared: function (sourceId, timeId) {
            netstream.LOGGER("(GSSink, " + sourceId + ":" + timeId + ") : cl");
        },
        stepBegins: function (sourceId, timeId, time) {
            netstream.LOGGER("(GSSink, " + sourceId + ":" + timeId + ") : st " + time);
        }
    };




    global.netstream.Receiver = function (options) {
        
        // --------- parameters
        this.sink = null;
        this.transport = null;
        this.debug = false;
        this.stream = "Default";

        // --------- init params
        for(var prop in options) {
          if(options.hasOwnProperty(prop) && this.hasOwnProperty(prop)) {
            this[prop] = options[prop];
          }
        }
        
        // wrapping this
        var gs = this;

        this.sink = this.sink || new netstream.DefaultGSSink();
        
        // link with the transport layer
        this.transport = this.transport || new netstream.Transport(options);
        
        this.transport.onevent = function (e){
          gs.receiveEvent(e);
        };
        
        this.transport.connect();
        
    }

    global.netstream.Receiver.prototype = {

        receiveEvent: function (msg) {
            //netstream.LOGGER(this.beg + " " + this.end);
            ////////var msg = new DataView(netstream.base64.decode(new Uint8Array(this.buffer, this.beg, this.end - this.beg)).buffer);
            var msgIndex = 0;

            // get the Stream name
            var res = this.readString(msg, msgIndex);
            var stream = res.data;
            msgIndex = res.index;
            if (this.debug) {
                netstream.LOGGER("(netstream.Receiver): Stream " + stream + " is addressed in this message");
            }
            // get the command
            var cmd = -1;
            cmd = msg.getInt8(msgIndex++);
            if (cmd != -1) {
                if (cmd == netstream.constants.EVENT_ADD_NODE) {
                    this.serve_EVENT_ADD_NODE(msg, msgIndex);
                } else if ((cmd & 0xFF) == (netstream.constants.EVENT_DEL_NODE & 0xFF)) {
                    this.serve_DEL_NODE(msg, msgIndex);
                } else if (cmd == netstream.constants.EVENT_ADD_EDGE) {
                    this.serve_EVENT_ADD_EDGE(msg, msgIndex);
                } else if (netstream.constants.EVENT_DEL_EDGE == cmd) {
                    this.serve_EVENT_DEL_EDGE(msg, msgIndex);
                } else if (cmd == netstream.constants.EVENT_STEP) {
                    this.serve_EVENT_STEP(msg, msgIndex);
                } else if (cmd == netstream.constants.EVENT_CLEARED) {
                    this.serve_EVENT_CLEARED(msg, msgIndex);
                } else if (cmd == netstream.constants.EVENT_ADD_GRAPH_ATTR) {
                    this.serve_EVENT_ADD_GRAPH_ATTR(msg, msgIndex);
                } else if (cmd == netstream.constants.EVENT_CHG_GRAPH_ATTR) {
                    this.serve_EVENT_CHG_GRAPH_ATTR(msg, msgIndex);
                } else if (cmd == netstream.constants.EVENT_DEL_GRAPH_ATTR) {
                    this.serve_EVENT_DEL_GRAPH_ATTR(msg, msgIndex);
                } else if (cmd == netstream.constants.EVENT_ADD_NODE_ATTR) {
                    this.serve_EVENT_ADD_NODE_ATTR(msg, msgIndex);
                } else if (cmd == netstream.constants.EVENT_CHG_NODE_ATTR) {
                    this.serve_EVENT_CHG_NODE_ATTR(msg, msgIndex);
                } else if (cmd == netstream.constants.EVENT_DEL_NODE_ATTR) {
                    this.serve_EVENT_DEL_NODE_ATTR(msg, msgIndex);
                } else if (cmd == netstream.constants.EVENT_ADD_EDGE_ATTR) {
                    this.serve_EVENT_ADD_EDGE_ATTR(msg, msgIndex);
                } else if (cmd == netstream.constants.EVENT_CHG_EDGE_ATTR) {
                    this.serve_EVENT_CHG_EDGE_ATTR(msg, msgIndex);
                } else if (cmd == netstream.constants.EVENT_DEL_EDGE_ATTR) {
                    this.serve_EVENT_DEL_EDGE_ATTR(msg, msgIndex);
                } else if (cmd == netstream.constants.EVENT_END) {
                    if (this.debug) {
                        netstream.LOGGER("(netstream.Receiver.decodeMessage): Client properly ended the connection.");
                    }
                    return;
                } else {
                    if (this.debug) {
                        netstream.LOGGER("(netstream.Receiver.decodeMessage): Don't know this command: " + cmd);
                    }
                    return;
                }
            }
        },


        readType: function (msg, msgIndex) {
            var data = -1;
            data = msg.getInt8(msgIndex);
            if (data == -1) {
                if (this.debug) {
                    netstream.LOGGER("(netstream.Receiver.readType): could not read type");
                }
                return 0;
            }
            return data;
        },

        readValue: function (msg, msgIndex, valueType) {
            if (netstream.constants.TYPE_BOOLEAN == valueType) {
                return this.readBoolean(msg, msgIndex);
            } else if (netstream.constants.TYPE_BOOLEAN_ARRAY == valueType) {
                return this.readBooleanArray(msg, msgIndex);
            } else if (netstream.constants.TYPE_BYTE == valueType) {
                return this.readByte(msg, msgIndex);
            } else if (netstream.constants.TYPE_BYTE_ARRAY == valueType) {
                return this.readByteArray(msg, msgIndex);
            } else if (netstream.constants.TYPE_SHORT == valueType) {
                return this.readShort(msg, msgIndex);
            } else if (netstream.constants.TYPE_SHORT_ARRAY == valueType) {
                return this.readShortArray(msg, msgIndex);
            } else if (netstream.constants.TYPE_INT == valueType) {
                return this.readInt(msg, msgIndex);
            } else if (netstream.constants.TYPE_INT_ARRAY == valueType) {
                return this.readIntArray(msg, msgIndex);
            } else if (netstream.constants.TYPE_LONG == valueType) {
                return this.readLong(msg, msgIndex);
            } else if (netstream.constants.TYPE_LONG_ARRAY == valueType) {
                return this.readLongArray(msg, msgIndex);
            } else if (netstream.constants.TYPE_FLOAT == valueType) {
                return this.readFloat(msg, msgIndex);
            } else if (netstream.constants.TYPE_FLOAT_ARRAY == valueType) {
                return this.readFloatArray(msg, msgIndex);
            } else if (netstream.constants.TYPE_DOUBLE == valueType) {
                return this.readDouble(msg, msgIndex);
            } else if (netstream.constants.TYPE_DOUBLE_ARRAY == valueType) {
                return this.readDoubleArray(msg, msgIndex);
            } else if (netstream.constants.TYPE_STRING == valueType) {
                return this.readString(msg, msgIndex);
            } else if (netstream.constants.TYPE_ARRAY == valueType) {
                return this.readArray(msg, msgIndex);
            }
            return null;
        },


        readArray: function (msg, msgIndex) {
            var len = msg.getInt32(msgIndex);
            msgIndex += 4;
            var data = [];
            var res;
            for (var i = 0; i < len; i++) {
                res = this.readValue(msg, msgIndex + 1, this.readType(msg, msgIndex));
                msgIndex = rex.index;
                data[i] = res.data;
            }
            return {
                "data": data,
                "index": msgIndex
            };
        },

        readString: function (msg, msgIndex) {
            var len = msg.getInt32(msgIndex);
            msgIndex += 4;

            var data = netstream.typedArrayToString(new Uint8Array(msg.buffer, msg.byteOffset + msgIndex, len));
            msgIndex += len;
            //netstream.LOGGER("string " +data)
            return {
                "data": data,
                "index": msgIndex
            };
        },

        readBoolean: function (msg, msgIndex) {
            var data = msg.getInt8(msgIndex++);
            return {
                "data": data === 0 ? false: true,
                "index": msgIndex
            };
        },

        readByte: function (msg, msgIndex) {
            var data = msg.getInt8(msgIndex++);
            return {
                "data": data,
                "index": msgIndex
            };
        },

        readShort: function (msg, msgIndex) {
            var data = msg.getInt16(msgIndex);
            return {
                "data": data,
                "index": msgIndex + 2
            };
        },

        readInt: function (msg, msgIndex) {
            var data = msg.getInt32(msgIndex);
            return {
                "data": data,
                "index": msgIndex + 4
            };
        },

        readLong: function (msg, msgIndex) {
            var head = msg.getInt32(msgIndex);
            if (head !== 0) {
                netstream.LOGGER("(netstream.Receiver.readLong) : Read long does not fit in a 32bits int... Big problem !!!!");
            }
            var data = msg.getInt32(msgIndex + 4);
            return {
                "data": data,
                "index": msgIndex + 8
            };
        },

        readFloat: function (msg, msgIndex) {
            var data = msg.getFloat32(msgIndex);
            return {
                "data": data,
                "index": msgIndex + 4
            };
        },

        readDouble: function (msg, msgIndex) {
            var data = msg.getFloat64(msgIndex);
            return {
                "data": data,
                "index": msgIndex + 8
            };
        },

        readIntArray: function (msg, msgIndex) {
            var len = msg.getInt32(msgIndex);
            msgIndex += 4;

            var data = [];
            for (var i = 0; i < len; i++) {
                data[i] = msg.getInt32(msgIndex);
                msgIndex += 4;
            }
            return {
                "data": data,
                "index": msgIndex
            };
        },

        readBooleanArray: function (msg, msgIndex) {
            var len = msg.getInt32(msgIndex);
            msgIndex += 4;

            var data = [];
            for (var i = 0; i < len; i++) {
                data[i] = msg.getInt8(msgIndex++);
                data[i] = data[i] === 0 ? false: true;
            }
            return {
                "data": data,
                "index": msgIndex
            };
        },

        readByteArray: function (msg, msgIndex) {
            var len = msg.getInt32(msgIndex);
            msgIndex += 4;

            var data = [];
            for (var i = 0; i < len; i++) {
                data[i] = msg.getInt8(msgIndex++);
            }
            return {
                "data": data,
                "index": msgIndex
            };
        },

        readDoubleArray: function (msg, msgIndex) {
            var len = msg.getInt32(msgIndex);
            msgIndex += 4;

            var data = [];
            for (var i = 0; i < len; i++) {
                data[i] = msg.getFloat64(msgIndex);
                msgIndex += 8;
            }
            return {
                "data": data,
                "index": msgIndex
            };
        },

        readFloatArray: function (msg, msgIndex) {
            var len = msg.getInt32(msgIndex);
            msgIndex += 4;

            var data = [];
            for (var i = 0; i < len; i++) {
                data[i] = msg.getFloat32(msgIndex);
                msgIndex += 4;
            }
            return {
                "data": data,
                "index": msgIndex
            };
        },

        readLongArray: function (msg, msgIndex) {
            var len = msg.getInt32(msgIndex);
            msgIndex += 4;
            var head;
            var data = [];
            for (var i = 0; i < len; i++) {
                head = msg.getInt32(msgIndex);
                msgIndex += 4;
                if (head !== 0) {
                    netstream.LOGGER("(netstream.Receiver.readLong) : Read long does not fit in a 32bits int... Big problem !!!!");
                }
                data[i] = msg.getInt32(msgIndex);
                msgIndex += 4;
            }
            return {
                "data": data,
                "index": msgIndex
            };
        },

        readShortArray: function (msg, msgIndex) {
            var len = msg.getInt32(msgIndex);
            msgIndex += 4;

            var data = [];
            for (var i = 0; i < len; i++) {
                data[i] = msg.getInt16(msgIndex);
                msgIndex += 2;
            }
            return {
                "data": data,
                "index": msgIndex
            };
        },

        //////////////////////////////////////////////////////////////////////////////
        serve_EVENT_DEL_EDGE_ATTR: function (msg, msgIndex) {
            if (this.debug) {
                netstream.LOGGER("(netstream.Receiver.readLong) : Received DEL_EDGE_ATTR command.");
            }
            var res = this.readString(msg, msgIndex);
            var sourceId = res.data;
            res = this.readLong(msg, res.index);
            var timeId = res.data;
            res = this.readString(msg, res.index);
            var edgeId = res.data;
            res = this.readString(msg, res.index);
            var attrId = res.data;
            this.sink.edgeAttributeRemoved(sourceId, timeId, edgeId, attrId);
        },

        serve_EVENT_CHG_EDGE_ATTR: function (msg, msgIndex) {
            if (this.debug) {
                netstream.LOGGER("(netstream.Receiver.readLong) : Received CHG_EDGE_ATTR command.");
            }
            var res = this.readString(msg, msgIndex);
            var sourceId = res.data;
            res = this.readLong(msg, res.index);
            var timeId = res.data;
            res = this.readString(msg, res.index);
            var edgeId = res.data;
            res = this.readString(msg, res.index);
            var attrId = res.data;

            var valueType = this.readType(msg, res.index);

            res = this.readValue(msg, res.index + 1, valueType);
            var oldValue = res.data;

            valueType = this.readType(msg, res.index );

            res = this.readValue(msg, res.index + 1, valueType);
            var newValue = res.data;

            this.sink.edgeAttributeChanged(sourceId, timeId, edgeId, attrId, oldValue, newValue);
        },

        serve_EVENT_ADD_EDGE_ATTR: function (msg, msgIndex) {
            if (this.debug) {
                netstream.LOGGER("(netstream.Receiver.readLong) : Received ADD_EDGE_ATTR command.");
            }
            var res = this.readString(msg, msgIndex);
            var sourceId = res.data;
            res = this.readLong(msg, res.index);
            var timeId = res.data;

            res = this.readString(msg, res.index);
            var edgeId = res.data;
            res = this.readString(msg, res.index);
            var attrId = res.data;

            res = this.readValue(msg, res.index + 1, this.readType(msg, res.index));
            var value = res.data;

            this.sink.edgeAttributeAdded(sourceId, timeId, edgeId, attrId, value);
        },

        serve_EVENT_DEL_NODE_ATTR: function (msg, msgIndex) {
            if (this.debug) {
                netstream.LOGGER("(netstream.Receiver.readLong) : Received DEL_NODE_ATTR command.");
            }
            var res = this.readString(msg, msgIndex);
            var sourceId = res.data;
            res = this.readLong(msg, res.index);
            var timeId = res.data;

            res = this.readString(msg, res.index);
            var nodeId = res.data;
            res = this.readString(msg, res.index);
            var attrId = res.data;

            this.sink.nodeAttributeRemoved(sourceId, timeId, nodeId, attrId);
        },

        serve_EVENT_CHG_NODE_ATTR: function (msg, msgIndex) {
            if (this.debug) {
                netstream.LOGGER("(netstream.Receiver.readLong) : Received EVENT_CHG_NODE_ATTR command.");
            }

            var res = this.readString(msg, msgIndex);
            var sourceId = res.data;
            res = this.readLong(msg, res.index);
            var timeId = res.data;
            res = this.readString(msg, res.index);
            var nodeId = res.data;
            res = this.readString(msg, res.index);
            var attrId = res.data;

            var valueType = this.readType(msg, res.index);

            res = this.readValue(msg, res.index + 1, valueType);
            if (res === null)
				return;
            var oldValue = res.data;

            valueType = this.readType(msg, res.index);

            res = this.readValue(msg, res.index + 1, valueType);
            var newValue = res.data;

            this.sink.nodeAttributeChanged(sourceId, timeId, nodeId, attrId, oldValue, newValue);
        },

        serve_EVENT_ADD_NODE_ATTR: function (msg, msgIndex) {
            if (this.debug) {
                netstream.LOGGER("(netstream.Receiver.readLong) : Received EVENT_ADD_NODE_ATTR command.");
            }
            var res = this.readString(msg, msgIndex);
            var sourceId = res.data;
            res = this.readLong(msg, res.index);
            var timeId = res.data;

            res = this.readString(msg, res.index);
            var nodeId = res.data;
            res = this.readString(msg, res.index);
            var attrId = res.data;

            res = this.readValue(msg, res.index + 1, this.readType(msg, res.index));
            if (res === null)
				return;
            var value = res.data;

            this.sink.nodeAttributeAdded(sourceId, timeId, nodeId, attrId, value);
        },

        serve_EVENT_DEL_GRAPH_ATTR: function (msg, msgIndex) {
            if (this.debug) {
                netstream.LOGGER("(netstream.Receiver.readLong) : Received EVENT_DEL_GRAPH_ATTR command.");
            }
            var res = this.readString(msg, msgIndex);
            var sourceId = res.data;
            res = this.readLong(msg, res.index);
            var timeId = res.data;

            res = this.readString(msg, res.index);
            var attrId = res.data;

            this.sink.graphAttributeRemoved(sourceId, timeId, attrId);
        },

        serve_EVENT_CHG_GRAPH_ATTR: function (msg, msgIndex) {
            if (this.debug) {
                netstream.LOGGER("(netstream.Receiver.readLong) : Received EVENT_CHG_GRAPH_ATTR command.");
            }
            var res = this.readString(msg, msgIndex);
            var sourceId = res.data;
            res = this.readLong(msg, res.index);
            var timeId = res.data;

            res = this.readString(msg, res.index);
            var attrId = res.data;

            var valueType = this.readType(msg, res.index);

            res = this.readValue(msg, res.index + 1, valueType);
            var oldValue = res.data;

            valueType = this.readType(msg, res.index);

            res = this.readValue(msg, res.index + 1, valueType);
            var newValue = res.data;

            this.sink.graphAttributeChanged(sourceId, timeId, attrId, oldValue, newValue);

        },

        serve_EVENT_ADD_GRAPH_ATTR: function (msg, msgIndex) {
            if (this.debug) {
                netstream.LOGGER("(netstream.Receiver.readLong) : Received EVENT_ADD_GRAPH_ATTR command.");
            }

            var res = this.readString(msg, msgIndex);
            var sourceId = res.data;
            res = this.readLong(msg, res.index);
            var timeId = res.data;

            res = this.readString(msg, res.index);
            var attrId = res.data;

            res = this.readValue(msg, res.index + 1, this.readType(msg, res.index));
            var value = res.data;

            this.sink.graphAttributeAdded(sourceId, timeId, attrId, value);
        },

        serve_EVENT_CLEARED: function (msg, msgIndex) {
            if (this.debug) {
                netstream.LOGGER("(netstream.Receiver.readLong) : Received EVENT_CLEARED command.");
            }
            var res = this.readString(msg, msgIndex);
            var sourceId = res.data;
            res = this.readLong(msg, res.index);
            var timeId = res.data;

            this.sink.graphCleared(sourceId, timeId);
        },

        serve_EVENT_STEP: function (msg, msgIndex) {
            if (this.debug) {
                netstream.LOGGER("(netstream.Receiver.readLong) : Received EVENT_STEP command.");
            }
            var res = this.readString(msg, msgIndex);
            var sourceId = res.data;
            res = this.readLong(msg, res.index);
            var timeId = res.data;

            res = this.readDouble(msg, res.index);
            var time = res.data;

            this.sink.stepBegins(sourceId, timeId, time);
        },

        serve_EVENT_DEL_EDGE: function (msg, msgIndex) {
            if (this.debug) {
                netstream.LOGGER("(netstream.Receiver.readLong) : Received EVENT_DEL_EDGE command.");
            }
            var res = this.readString(msg, msgIndex);
            var sourceId = res.data;
            res = this.readLong(msg, res.index);
            var timeId = res.data;

            res = this.readString(msg, res.index);
            var edgeId = res.data;

            this.sink.edgeRemoved(sourceId, timeId, edgeId);
        },

        serve_EVENT_ADD_EDGE: function (msg, msgIndex) {
            if (this.debug) {
                netstream.LOGGER("(netstream.Receiver.readLong) : Received ADD_EDGE command.");
            }
            var res = this.readString(msg, msgIndex);
            var sourceId = res.data;
            res = this.readLong(msg, res.index);
            var timeId = res.data;

            res = this.readString(msg, res.index);
            var edgeId = res.data;

            res = this.readString(msg, res.index);
            var from = res.data;

            res = this.readString(msg, res.index);
            var to = res.data;

            res = this.readBoolean(msg, res.index);
            var directed = res.data;

            this.sink.edgeAdded(sourceId, timeId, edgeId, from, to, directed);
        },

        serve_DEL_NODE: function (msg, msgIndex) {
            if (this.debug) {
                netstream.LOGGER("(netstream.Receiver.readLong) : Received DEL_NODE command.");
            }
            var res = this.readString(msg, msgIndex);
            var sourceId = res.data;
            res = this.readLong(msg, res.index);
            var timeId = res.data;

            res = this.readString(msg, res.index);
            var nodeId = res.data;

            this.sink.nodeRemoved(sourceId, timeId, nodeId);
        },

        serve_EVENT_ADD_NODE: function (msg, msgIndex) {
            if (this.debug) {
                netstream.LOGGER("(netstream.Receiver.readLong) : Received EVENT_ADD_NODE command");
            }
            var res = this.readString(msg, msgIndex);
            var sourceId = res.data;
            res = this.readLong(msg, res.index);
            var timeId = res.data;

            res = this.readString(msg, res.index);
            var nodeId = res.data;

            this.sink.nodeAdded(sourceId, timeId, nodeId);
        }

    };
} (this));
