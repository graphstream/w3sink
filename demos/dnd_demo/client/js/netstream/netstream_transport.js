(function (global) {
  "use strict";
  if (!global.netstream) {
    global.netstream = {};
  }

  global.netstream.Transport = function (options) {
    // --------- constants
    this.BUFFER_INITIAL_SIZE = 1048576;

    // --------- parameters
    this.scheme = "ws";
    this.host = "localhost";
    this.port = 2003;
    this.uri = "/gs/stream";
    this.socket = null;
    this.verbose = true;
    this.base64 = true;
    this.onevent = null;
    this.onopen = null;
    // --------- init params
    for(var prop in options) {
      if(options.hasOwnProperty(prop) && this.hasOwnProperty(prop)) {
        this[prop] = options[prop];
      }
    }

    // --------- private fields
    this._queue=[];
    if(this.base64){
      this._sizeOfInt = 8;
    } else {
      this._sizeOfInt = 4;
    }
    
    this._tmp_view = new DataView(new ArrayBuffer(4));

    // ---------- Input buffer
    this._inputBuffer = new ArrayBuffer(this.BUFFER_INITIAL_SIZE);

    this._inputEnd = -1;
    this._inputBeg = 0;
    this._inputPos = 0;
      
  };


  global.netstream.Transport.prototype = {


    
    // Small periodical send/receive of packet to keap the socket open.
    _initHeartbeating: function () {
        var self = this;
        this.refreshIntervalId = setInterval(function (e) {
            if (self.socket.readyState === self.socket.CLOSED) {
                clearInterval(self.refreshIntervalId);
            }
            else {
                if (self.debug) {
                    netstream.LOGGER("> Sending Hearbeat");
                }
                self.socket.send("Heartbeat");
            }
        },
        1000);
    },


    connect: function(){
      if(this.socket){
        return;
      }
      
      var self = this;
      
      // Creation / initialization
      if (typeof(WebSocket) === "undefined") {
          this.socket = new MozWebSocket(this.scheme + "://" + this.host + ":" + this.port + this.uri);
      }
      else {
          this.socket = new WebSocket(this.scheme + "://" + this.host + ":" + this.port + this.uri);
      }
      
      // events
      this.refreshIntervalId = 0;
      this.socket.onopen = function () {
          if (self.debug) {
              netstream.LOGGER("(netstream.Transport): conection opened");
          }
          self._initHeartbeating();
          
          // empty the queue
          for(var i=0; i<self._queue.length; i++){
            self.socket.send(self._queue[i]);
          }
          delete self._queue;
          if(typeof self.onopen === 'function'){
            self.onopen();
          }
          
      };
      this.socket.onerror = function (e) {
          netstream.LOGGER("(netstream.Transport): ERROR on the WebSocket");
          
      };

      this.socket.onmessage = function (e) {
        if (self.debug === true) {
          netstream.LOGGER("(netstream.Transport): < Received a " + e.data.length + " bytes long data chunk.");
        }
        self._handleMsg(e.data);
      };
      
      
      
    },
    sendEvent: function(buffer, start, length){
      //netstream.LOGGER("(netstream.transport.sendEvent) with buffer:"+buffer.byteLength+" ("+start+","+length+")");
      
      
      // prepare buffer 
      if(this.base64){
        buffer = netstream.base64.encode(new Uint8Array(buffer,start, length));
        this._tmp_view.setUint32(0,buffer.length);
        buffer = netstream.base64.encode(this._tmp_view.buffer) + buffer;
        start=-1;
      } 
      else{
        
      }
      
      
      if( this.socket === null || this.socket.readyState < this.socket.OPEN){
        this.connect();
        this._queue.push(this.base64?buffer:buffer.slice(start,start+length));
      }  
      else if ( this.socket.readyState === this.socket.OPEN){
        this.socket.send(this.base64?buffer:buffer.slice(start,start+length));
      } 
      else {
        netstream.LOGGER("not sending....");
      }
    },
    
    _do_send : function (buffer,start,length){
      
    },
    
    
    
    
     _compactInputBuffer: function (limit) {
       if (this._inputBeg > this._sizeOfInt) {
             var off = this._inputBeg;

             var array = new Uint8Array(this._inputBuffer);
             for (var i = 0; i < limit - this._inputBeg; i++) {
                 array[i] = array[this._inputBeg + i];
             }
             this._inputPos -= this._inputBeg;
             this._inputEnd -= this._inputBeg;
             this._inputBeg = 0;

             return off;
         }
         return 0;
     },

     _ensureInputBufferCapacity: function (size) {
         if ((size+this._inputPos) > this._inputBuffer.byteLength) {
             if (this.debug) {
                 netstream.LOGGER("Actual buffer size is " + this._inputBuffer.byteLength + " resizing to " + 1.4*(size + this._inputPos) + " bytes", size, this._inputPos);
             }
             var newb = new ArrayBuffer(1.4 * (size + this._inputPos));
             for (var i = 0, j=this._inputBuffer.byteLength; i < j; i++) {
                 newb[i] = this._inputBuffer[i];
             }
             delete this._inputBuffer;
             this._inputBuffer = newb;
         }
    },

    // Read "_sizeOfInt" bytes from the buffer at the current position,
    // unpack from base64 and read as a 4 bytes int.
    _unpackInputMessageSize: function (pos) {
        //netstream.LOGGER("(GSTransport.unpackMessageSize): pos="+pos);
        var arr = new Uint8Array(this._inputBuffer, pos, 8);
        //netstream.LOGGER(arr[0]+","+arr[1]+","+arr[2]+","+arr[3]+","+arr[4]+","+arr[5]+","+arr[6]+","+arr[7]);
        var view = new DataView(netstream.base64.decode(arr).buffer);
        //VIEW = view;
        var size = view.getInt32(0);
        //netstream.LOGGER("msg size = "+size);
        return size;
    },
   
    _handleMsg: function (encodedMsg) {
         var limit = 0;
         // Index past the last byte this.read during the current
         // invocation.
         var nbytes = 0;
         // Number of bytes this.read.
         nbytes = encodedMsg.length;
         this._ensureInputBufferCapacity(nbytes);
         
          var encodedArray = new Uint8Array(this._inputBuffer, this._inputPos, nbytes);
       
         for (var i = 0; i < nbytes; i++) {
             encodedArray[i] = encodedMsg.charCodeAt(i);
         }
         limit = this._inputPos + nbytes;
         if (nbytes <= 0)
         return;

         // Read the first header.
         if (this._inputEnd < 0) {
             if ((limit - this._inputBeg) >= this._sizeOfInt) {
                 // If no data has been read yet in the buffer or if the
                 // buffer was emptied completely at previous call: prepare to read
                 // a new message by decoding its header.
                 this._inputEnd = this._unpackInputMessageSize(0) + this._sizeOfInt;
                 this._inputBeg = this._sizeOfInt;
             } else {
                 // The header is incomplete, wait next call to complete it.	
                 //console.log("The header is incomplete, wait next call to complete it.");
                 this._inputPos = limit;
             }
         }

         // Read one or more messages or wait next call to buffers more.
         if (this._inputEnd > 0) {
             while (this._inputEnd < limit) {
                 // While the end of the message is in the limit of what was
                 // read, there are one or more complete messages. Decode
                 // them
                 // and read the header of the next message, until a message
                 // is
                 // incomplete or there are no more messages or a header is
                 // incomplete.
                 this._receiveEvent();

                 //this._inputBuffer.position(end);
                 if (this._inputEnd + this._sizeOfInt <= limit) {
                     // There is a following message.
                     //console.log("There is a following message");
                     this._inputBeg = this._inputEnd + this._sizeOfInt;
                     this._inputEnd = this._inputEnd +
                     this._unpackInputMessageSize(this._inputEnd) +
                     this._sizeOfInt;
                 } else {
                   //console.log("There is the beginning of a following message");
                     // There is the beginning of a following message
                     // but the header is incomplete. Compact the buffer
                     // and stop here.
                     this._inputBeg = this._inputEnd;
                     var p = limit - this._inputEnd;
                     this._compactInputBuffer(limit);
                     this._inputPos = p;
                     this._inputBeg = 0;
                     this._inputEnd = -1;
                     break;
                 }
             }

             if (this._inputEnd == limit) {
                 // If the end of the message coincides with the limit of
                 // what
                 // was read we have one last complete message. We decode it
                 // and
                 // clear the buffer for the next call.
                 //console.log("we have one last complete message.");
                 this._receiveEvent();
                 //////////buf.clear();
                 this._inputPos = 0;
                 this._inputBeg = 0;
                 this._inputEnd = -1;
             } else if (this._inputEnd > limit) {
                 // If the end of the message if after what was read, prepare
                 // to read more at next call when we will have buffered more
                 // data. If we are at the end of the buffer compact it (else
                 // no more space will be available for buffering).
                 this._inputPos = limit;
                 if (this._inputEnd > this._inputBuffer.byteLength){
                   this._compactInputBuffer(limit);
                }
             }
         }
     },
    
    _receiveEvent: function(){
      if(this.base64){
        var arr = new Uint8Array(this._inputBuffer, this._inputBeg, this._inputEnd - this._inputBeg);
        var msg = new DataView(netstream.base64.decode(arr).buffer);
      } else {
        var msg = new DataView(this.InputBuffer, this._inputBeg, this._inputEnd - this._inputBeg);
      }
      this.onevent(msg);
    }
    
    
  };
  


} (this));