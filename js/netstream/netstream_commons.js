//
//  netstream_commons.js
//  netstream project
//
//  Created by Yoann Pigné on 2012-05-14.
//  Copyright 2012 University of Le Havre. All rights reserved.
//
(function(global) {
  "use strict";

  if (!global.netstream) {
    global.netstream = {};
  }

  global.netstream.utf16to8 = function (str) {
    var out, i, len, c;

    out = "";
    len = str.length;
    for(i = 0; i < len; i++) {
      c = str.charCodeAt(i);
      if ((c >= 0x0001) && (c <= 0x007F)) {
        out += str.charAt(i);
      } else if (c > 0x07FF) {
        out += String.fromCharCode(0xE0 | ((c >> 12) & 0x0F));
        out += String.fromCharCode(0x80 | ((c >>  6) & 0x3F));
        out += String.fromCharCode(0x80 | ((c >>  0) & 0x3F));
      } else {
        out += String.fromCharCode(0xC0 | ((c >>  6) & 0x1F));
        out += String.fromCharCode(0x80 | ((c >>  0) & 0x3F));
      }
    }
    return out;
  };

  // Copyright (c) 2008 notmasteryet
  global.netstream.TypedArrayReader = function(t_array) {


    this.position = 0;
    this.array = new Uint8Array(t_array.buffer, t_array.byteOffset, t_array.byteLength);
    this.readByte = function() {
      if (this.position >= this.array.length) {
        return null;
      }
      return this.array[this.position++];
    };
  };
  // RFC 2279
  global.netstream.Utf8Translator = function(reader) {
    this.reader = reader;
    this.waitBom = true;
    this.pendingChar = null;
    this.readChar = function() {
      var ch = null;
      do {
        if (this.pendingChar !== null) {
          ch = this.pendingChar;
          this.pendingChar = null;
        } else {
          var b1 = this.reader.readByte();
          if (b1 < 0) {
            return null;
          }
          if ((b1 & 0x80) === 0) {
            ch = String.fromCharCode(b1);
          } else {
            var currentPrefix = 0xC0;
            var validBits = 5;
            do {
              var mask = currentPrefix >> 1 | 0x80;
              if ((b1 & mask) === currentPrefix) {
                break;
              }
              currentPrefix = currentPrefix >> 1 | 0x80;
              --validBits;
            }
            while (validBits >= 0);
            if (validBits > 0) {
              var code = (b1 & ((1 << validBits) - 1));
              for (var i = 5; i >= validBits; --i) {
                var bi = this.reader.readByte();
                if ((bi & 0xC0) != 0x80) throw "Invalid sequence character";
                code = (code << 6) | (bi & 0x3F);
              }
              if (code <= 0xFFFF) {
                if (code === 0xFEFF && this.waitBom)
                ch = null;
                else
                ch = String.fromCharCode(code);
              } else {
                var v = code - 0x10000;
                var w1 = 0xD800 | ((v >> 10) & 0x3FF);
                var w2 = 0xDC00 | (v & 0x3FF);
                this.pendingChar = String.fromCharCode(w2);
                ch = String.fromCharCode(w1);
              }
            } else {
              throw "Invalid character";
            }
          }
        }
        this.waitBom = false;
      }
      while (ch === null);
      return ch;
    };
  };

  //
  //   Takes a typed Array received from the websocket and supposly encoding an utf8 string.
  //   Converts it to a unicode string.
  //
  //   BEING USED
  //
  global.netstream.typedArrayToString = function(input) {

    var reader = new netstream.TypedArrayReader(input),
    utf8 = new netstream.Utf8Translator(reader),
    result = [],
    i = 0,
    ch = 0,
    s = "";
    ch = utf8.readChar();
    while (ch.charCodeAt(0) !== 0) {
      result[i++] = ch;
      ch = utf8.readChar();
    }
    s = result.join("");
    return s;
  };

  global.netstream.base64 = {
    _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
    _keyCode: {
      65: 0,
      66: 1,
      67: 2,
      68: 3,
      69: 4,
      70: 5,
      71: 6,
      72: 7,
      73: 8,
      74: 9,
      75: 10,
      76: 11,
      77: 12,
      78: 13,
      79: 14,
      80: 15,
      81: 16,
      82: 17,
      83: 18,
      84: 19,
      85: 20,
      86: 21,
      87: 22,
      88: 23,
      89: 24,
      90: 25,
      97: 26,
      98: 27,
      99: 28,
      100: 29,
      101: 30,
      102: 31,
      103: 32,
      104: 33,
      105: 34,
      106: 35,
      107: 36,
      108: 37,
      109: 38,
      110: 39,
      111: 40,
      112: 41,
      113: 42,
      114: 43,
      115: 44,
      116: 45,
      117: 46,
      118: 47,
      119: 48,
      120: 49,
      121: 50,
      122: 51,
      48: 52,
      49: 53,
      50: 54,
      51: 55,
      52: 56,
      53: 57,
      54: 58,
      55: 59,
      56: 60,
      57: 61,
      43: 62,
      47: 63,
      61: 64
    },
    decode: function(input) {
      var lkey1 = this._keyStr.indexOf(input[input.length - 1]);
      var lkey2 = this._keyStr.indexOf(input[input.length - 2]);
      var bytes = Math.ceil((3 * input.length) / 4.0);
      if (lkey1 == 64) bytes--;
      //padding chars, so skip
      if (lkey2 == 64) bytes--;
      //padding chars, so skip
      var arrayBuffer = new ArrayBuffer(bytes);

      var uarray;
      var chr1,
      chr2,
      chr3;
      var enc1,
      enc2,
      enc3,
      enc4;
      var i = 0;
      var j = 0;
      if (arrayBuffer) uarray = new Uint8Array(arrayBuffer);
      else uarray = new Uint8Array(bytes);
      //input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
      for (i = 0; i < input.length; i++) {
        var d = input[i];
        if ((d < 65 || d > 90) && (d < 97 || d > 122) & (d < 47 || d > 57) & d != 61 & d != 43) {
          throw "illegal character in base64 string " + d;
        }
      }
      for (i = 0; i < bytes; i += 3) {
        enc1 = this._keyCode[input[j++]];
        //.indexOf(input.charAt(j++));
        enc2 = this._keyCode[input[j++]];
        //this._keyStr.indexOf(input.charAt(j++));
        enc3 = this._keyCode[input[j++]];
        //this._keyStr.indexOf(input.charAt(j++));
        enc4 = this._keyCode[input[j++]];
        //this._keyStr.indexOf(input.charAt(j++));
        chr1 = (enc1 << 2) | (enc2 >> 4);
        chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
        chr3 = ((enc3 & 3) << 6) | enc4;
        uarray[i] = chr1;
        if (enc3 != 64) uarray[i + 1] = chr2;
        if (enc4 != 64) uarray[i + 2] = chr3;
      }
      return uarray;
    },
    encode: function(arrayBuffer) {
      var base64 = '';
      if('slice' in arrayBuffer){
        var bytes = new Uint8Array(arrayBuffer);
        
      } else {
        var bytes = arrayBuffer;
      }
      var byteLength = bytes.byteLength;
      var byteRemainder = byteLength % 3;
      var mainLength = byteLength - byteRemainder;
      var a,
      b,
      c,
      d;
      var chunk;
      for (var i = 0; i < mainLength; i = i + 3) {
        chunk = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2];
        a = (chunk & 16515072) >> 18;
        b = (chunk & 258048) >> 12;
        c = (chunk & 4032) >> 6;
        d = chunk & 63;
        base64 += this._keyStr[a] + this._keyStr[b] + this._keyStr[c] + this._keyStr[d];
      }
      if (byteRemainder == 1) {
        chunk = bytes[mainLength];
        a = (chunk & 252) >> 2;
        b = (chunk & 3) << 4;
        base64 += this._keyStr[a] + this._keyStr[b] + '==';
      } else if (byteRemainder == 2) {
        chunk = (bytes[mainLength] << 8) | bytes[mainLength + 1];
        a = (chunk & 64512) >> 10;
        b = (chunk & 1008) >> 4;
        c = (chunk & 15) << 2;
        base64 += this._keyStr[a] + this._keyStr[b] + this._keyStr[c] + '=';
      }
      return base64;
    }
  };

  global.netstream.LOGGER = function(msg) {
    //console.log("-");return;
    if (typeof(console.log) == "function") {
      console.log(msg);
    }
    else if (typeof(global.status) == "string") {
      global.status = msg;
    }
  };

} (this));