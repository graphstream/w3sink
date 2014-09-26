/*
The GDS Grammar:

<DGS>        ::= <header> ( <event> | <comment> | <EOL> )*
<header>     ::= <magic> <EOL> <id> <int> <int> <EOL>
<magic>      ::= "DGS004" | "DGS003"
<event>      ::= ( <an> | <cn> | <dn> | <ae> | <ce> | <de> | <cg> | <st> | <cl> ) ( <comment> | <EOL> )
<an>         ::= "an" <id> <attributes>
<cn>         ::= "cn" <id> <attributes>
<dn>         ::= "dn" <id>
<ae>         ::= "ae" <id> <id> ( <direction> )? <id> <attributes>
<ce>         ::= "ce" <id> <attributes>
<de>         ::= "de" <id>
<cg>         ::= "cg" <attributes>
<st>         ::= "st" <real>
<cl>         ::= "cl"
<attributes> ::= ( <attribute> )*
<attribute>  ::= ( "+" | "-" )? <id> ( <assign> <value> ( "," <value> )* )?
<value>      ::= <string> | <real> | "" | <array> | <map>
<array>      ::= "{" ( <value> ( "," <value> )* )? "}"
<map>        ::= "[" ( <mapping> ( "," <mapping> )* )? "]"
<mapping>    ::= <id> <assign> <value>
<direction>  ::= '<' | '>' | ''
<assign>     ::= '=' | ':'
<id>         ::= <string> | <int> | <word> ( '.' <word> )*

<comment>    ::= "#" ( . )* <EOL>
<int>        ::= '0' | ( '1' .. '9' ) ( '0' .. '9' )*
<real>       ::= <int> ( "." ( "0" )* <int> )?
<word>       ::= ( 'a' .. 'z' | 'A' .. 'Z' ) ( 'a' .. 'z' | 'A' .. 'Z' | '0' .. '9' | '-' | '_' )*
<string>     ::= '"' ( [^'"'] | '\"' )* '"'

*/

(function(exports) {
  'use strict';

  if (exports.GS === undefined)
    throw new Error('GS is not loaded');

  var parser = {
    lines: [],
    line: '',
    source:null
  };

  function FileSourceDGS() {
    exports.GS.FileSource.call(this, 'DGS');
    parser.source = this;
  }

  // If urlOrData is a dgs file *content*, isData needs to be true.
  // If urlOrData is a dgs file, isData needs to be false.
  FileSourceDGS.prototype.begin = function(urlOrData, isData) {
    var that = this;
    return new exports.Promise(
      function(resolve, reject) {
        var callback = function(data) {
          parser.setData(data);
          resolve(that);
        };

        if (isData) {
          callback(urlOrData);
        } else {
          exports.jQuery.get(urlOrData).then(callback, function(err) {
            reject(err);
          });
        }
      });
  };

  FileSourceDGS.prototype.nextEvents = function() {
    var result = parser.parseOneLine();
    return result;
  };

  FileSourceDGS.prototype.nextStep = function() {
    var stepRead = false;
    while(parser.ready() && parser.parseOneLine() !== 'st') {
      stepRead = true;
    }
    return stepRead;
  };

  FileSourceDGS.prototype.readAll = function() {
    parser.parseAll();
  };

  FileSourceDGS.prototype.end = function() {
    // nope
  };

  exports.GS.extend(exports.GS.FileSource.prototype, FileSourceDGS.prototype);



  parser.setData = function(data) {
    var re, line;
    parser.lines = data.split('\n').reverse();

    line = parser.lines.pop();
    re = /^DGS00\d$/;
    if (!re.test(line))
      throw new Error('invalid dgs header "' + line + '"');

    line = parser.lines.pop();
    re = /^\S+ \d+ \d+$/;
    if (!re.test(line))
      throw new Error('invalid dgs header "' + line + '"');

    var i = 0;

    while (i < parser.lines.length) {
      if (parser.lines[i] === '' || parser.lines[i].charAt(0) === '#') {
        parser.lines.splice(i, 1);
      } else i++;
    }
  };

  // exports.GS.Graph.prototype.dgs = function(url, callback) {
  //     var dgs = new DGSParser(this);
  //
  //     exports.jQuery.get(url).then(function(data) {
  //         dgs.setData(data);
  //         dgs.parse();
  //         if (callback !== undefined) {
  //             callback();
  //         }
  //     }, function(err) {
  //         throw new Error(err);
  //     });
  // };

  parser.setData = function(data) {
    var re, line;
    parser.lines = data.split('\n').reverse();

    line = parser.lines.pop();
    re = /^DGS00\d$/;
    if (!re.test(line))
      throw new Error('invalid dgs header "' + line + '"');

    line = parser.lines.pop();
    re = /^\S+ \d+ \d+$/;
    if (!re.test(line))
      throw new Error('invalid dgs header "' + line + '"');

    var i = 0;

    while (i < parser.lines.length) {
      if (parser.lines[i] === '' || parser.lines[i].charAt(0) === '#') {
        parser.lines.splice(i, 1);
      } else i++;
    }
  };

  parser.ready = function() {
    return (parser.lines.length > 0);
  };

  parser.next = function() {
    parser.line = parser.lines.pop();
    return this;
  };

  parser.dir = function() {
    if (parser.line.match(/^\s*#/) !== null) {
      return '#';
    }
    var dir = parser.line.substr(0, 2).toLowerCase();
    parser.line = parser.line.substr(3, parser.line.length - 3);
    return dir;
  };

  parser.parseOneLine = function() {
    var dir,
      id,
      source,
      target,
      directed;
    parser.next();

    dir = parser.dir();

    //
    // Execute directive
    //
    switch (dir) {
      case 'an':
        id = parser.nextId();
        parser.source.sendNodeAdded(id);
        parser.parseAttributes('node', id);
        break;
      case 'cn':
        id = parser.nextId();
        parser.parseAttributes('node', id); // was parser.graph.sn(id)
        break;
      case 'dn':
        id = parser.nextId();
        parser.source.sendNodeRemoved(id);
        break;
      case 'ae':
        id = parser.nextId();
        source = parser.nextId();
        directed = parser.isDirectedEdge();
        target = parser.nextId();
        parser.source.sendEdgeAdded(id, source, target, directed);
        parser.parseAttributes('edge', id);
        break;
      case 'ce':
        id = parser.nextId();
        parser.parseAttributes('edge', id); // was parser.graph.se(id)
        break;
      case 'de':
        id = parser.nextId();
        parser.source.sendEdgeRemoved(id);
        break;
      case 'cg':
        id = parser.nextId();
        parser.parseAttributes('graph', id);    // was parser.parseAttributes('graph');
        break;
      case 'st':
        parser.source.sendStepBegins(parser.nextReal());
        break;
      case 'cl':
        parser.source.sendGraphCleared.cl();
        break;
      case '#':
        break;
      default:
        throw new Error('DSG Parser unknown directive "' + dir + '"');
    }
    return dir;
  };

  parser.parseAll = function() {
    while (parser.ready()) {
      parser.parseOneLine();
    }
  };

  parser.nextId = function() {
    var re = /^\s*(?:'([^']+)'|"([^"]+)"|([\w\d-_]+))(?:(.*))?$/;
    var ex = re.exec(parser.line);
    if (ex === null) {
      throw new Error('DSG Parser Problem with ids reading that line :' +
        parser.line);
    } else {
      parser.line = ex[4];

      return ex[1] || ex[2] || ex[3];
    }
  };

  parser.isDirectedEdge = function() {
    var re = /^\s*(>)(?:(.*))?$/;
    var ex = re.exec(parser.line);
    if (ex === null) {
      return false;
    }

    if (ex[1] !== undefined && ex[1] === '>') {
      parser.line = ex[2];
      return true;
    } else
      return false;
  };

  parser.nextReal = function() {
    var re = /^(\d+(?:\.\d+)?)$/;
    var ex = re.exec(parser.line);

    return ex[1];
  };

  parser.parseAttributes = function(type, e) {
    var that = this;

    function readValue(isArray) {
      var re,
        ex,
        in_re,
        in_ex,
        o = [],
        map,
        nextChar;

      if (ex === null) {
        throw new Error('No value could be read on line: ' + that.line);
      }

      do {
        re = /^\s*(([^\s])(.*))/;
        ex = re.exec(that.line);
        // ex[1] is the all value
        // ex[2] is the first char
        // ex[3] is the rest

        switch (ex[2]) {
          case '\'':
          case '"':
            in_re = /^([^'^"]*)['"](.*)$/;
            in_ex = in_re.exec(ex[3]); // exec on the rest (no starting quote)
            if (in_ex === null) {
              throw new Error('Could not read a string on line: ' + that.line);
            }
            o.push(in_ex[1]);
            that.line = in_ex[2];
            break;
          case '#':
            in_re = /^(#[a-fA-F0-9]{6}|[a-fA-F0-9]{3})(.*)/;
            in_ex = in_re.exec(ex[1]); // exec on the rest (no starting #)
            if (in_ex === null) {
              throw new Error('Could not read a color on line: ' + that.line);
            }
            o.push(in_ex[1]);
            that.line = in_ex[2];
            break;
          case '{': // an array
            that.line = ex[3];
            var arr = readValue(true);
            in_re = /^\s*((\})(.*))/;
            in_ex = in_re.exec(that.line);
            if (in_ex === null) {
              throw new Error('Could not read a table on line: ' + that.line);
            }
            o.push(arr);

            that.line = in_ex[3];
            break;
          case '[': // a map
            map = {};
            in_re = /^\s*([^\s])/;
            in_ex = in_re.exec(ex[3]);
            that.line = ex[3];
            nextChar = in_ex[1];
            while (nextChar !== ']') {
              in_re = /^\s*(?:"([^"]*)"|'([^']*)'|(\w[[\w.]*))\s*[:=](.*)$/;
              in_ex = in_re.exec(that.line);
              if (in_ex === null) {
                throw new Error('Could not read a hash on line: ' + that.line);
              }
              var key = in_ex[1] || in_ex[2] || in_ex[3];
              that.line = in_ex[4];
              var value = readValue(false);
              map[key] = value;

              in_re = /^\s*(([^\s])(.*))/;
              in_ex = in_re.exec(that.line);

              // in_ex[1] is the all value
              // in_ex[2] is the first char
              // in_ex[3] is the rest
              nextChar = in_ex[2];
              if (nextChar !== ']' && nextChar !== ',') {
                throw new Error('Could not read a hash on line: ' + that.line);
              }
              that.line = in_ex[3];
            }
            o.push(map);
            break;

          default: // word or number
            in_re =
              /\s*(?:([+-]?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)|(\w[-\w.]*)|"([^"]*)"|'([^']*)')(.*)$/;
            in_ex = in_re.exec(ex[1]);
            if (in_ex === null) {
              throw new Error('Could not read a word or number on line: ' +
                that.line);
            }
            var tmp = ((typeof(in_ex[1]) !== 'undefined') ? parseFloat(in_ex[
              1], 10) : in_ex[2] || in_ex[3] || in_ex[4]);

            o.push(tmp);
            that.line = in_ex[5];
        }


        // If it is a graph attribute, directly return ex[3].
        // -> Because, as opposed to node and line commands, graph command lines have no ID,
        //    which would be a problem in the next part.
        if (type === 'graph') {
            // Remove last character, which is a closing quote.
            return ex[3].substring(0, ex[3].length - 1);
        }


        re = /^\s*(([^\s]|)(.*))/;
        ex = re.exec(that.line);
        // ex[1] is the all value
        // ex[2] is the first char
        // ex[3] is the rest

        if (ex === null) {
          throw new Error('No value could be read on line: ' + that.line);
        }

        if (ex[2] === ',' && isArray) {
          that.line = ex[3];
        }
      } while (ex[2] === ',' && isArray);

      if (o.length === 1) {
        return o[0];
      }
      return o;
    } // end readValue.


    if (typeof parser.line === 'undefined' || parser.line.match(/^\s*$/) !==
      null) {
      // exports.console.log('No attributes for ' + type + ' ' + e + '. Moving on.');
      return;
    }

    var re = /^\s*([+-]?)(?:"([^"]*)"|'([^']*)'|(\w[[\w.]*))(.*?)$/;

    var ex = re.exec(parser.line);
    var isRemove,
      attrName,
      attrVal;

    //////////////////
    // Ugly hack... //
    //////////////////
    // If cg ui.stylesheet:'...', then parser.line is .stylesheet:'...'
    if (parser.line.charAt(0) === '.') {
        ex = re.exec('ui' + parser.line);
    }
    // If "cg ui.stylesheet":"...", then parser.line is :"..."
    if (parser.line.charAt(0) === ':') {
        ex = re.exec('ui.stylesheet' + parser.line);
    }


    if (ex === null) {
      //exports.console.log('No attributes for ' + type + ' ' + e + '. Moving on.');
      return;
    }
    // exports.console.log(ex);
    isRemove = ex[1] === '-' ? true : false;

    // Get attribute name and value. No quotes.
    attrName = ex[2] || ex[3] || ex[4];

    // go on with the rest.
    parser.line = ex[5];

    re = /\s*([:=])?(.*?)$/;
    ex = re.exec(parser.line);
    // exports.console.log(ex);

    if (typeof(ex[1]) !== 'undefined') {
      // we have a value.
      parser.line = ex[2];

      attrVal = readValue(true);
    }

    // exports.console.log('attrName: ' + attrName);
    // exports.console.log('attrVal: ' + attrVal);

    if (isRemove) {
      switch (type) {
        case 'node':
          parser.source.sendNodeAttributeRemoved(e,attrName);
          break;
        case 'edge':
          parser.source.sendEdgeAttributeRemoved(e,attrName);
          break;
        case 'graph':
          parser.source.sendGraphAttributeRemoved(attrName);

      }
    } else {
      switch (type) {
        case 'node':
          parser.source.sendNodeAttributeAdded(e, attrName, attrVal);
          break;
        case 'edge':
          parser.source.sendEdgeAttributeAdded(e, attrName, attrVal);
          break;
        case 'graph':
          parser.source.sendGraphAttributeAdded(attrName, attrVal);
          break;
      }
    }

    // Maybe there are some extra attributes. Let's call the method recursively.

    // If there is a ')' in parser.line, ignore that. (ui.stylesheet stuff...)
    // TODO: Find a better way of dealing with that (regex?).
    if (parser.line !== '' && !parser.line.contains(')')) {
      parser.parseAttributes(type, e);
    }
  };

  exports.GS.FileSourceDGS = FileSourceDGS;

})(window);
