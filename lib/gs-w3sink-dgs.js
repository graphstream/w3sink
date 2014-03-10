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

    exports.GS.Graph.prototype.dgs = function(url, callback) {
        var dgs = new DGSParser(this);

        exports.jQuery.get(url).then(function(data) {
            dgs.setData(data);
            dgs.parse();
            if (callback !== undefined) {
                callback();
            }
        }, function(err) {
            throw new Error(err);
        });
    };

    function DGSParser(graph) {
        this.graph = graph;
        this.lines = [];
        this.line = '';
    }

    DGSParser.prototype.setData = function(data) {
        var re, line;
        this.lines = data.split('\n').reverse();

        line = this.lines.pop();
        re = /^DGS00\d$/;
        if (!re.test(line))
            throw new Error('invalid dgs header "' + line + '"');

        line = this.lines.pop();
        re = /^\S+ \d+ \d+$/;
        if (!re.test(line))
            throw new Error('invalid dgs header "' + line + '"');

        var i = 0;

        while (i < this.lines.length) {
            if (this.lines[i] === '' || this.lines[i].charAt(0) === '#') {
                this.lines.splice(i, 1);
            } else i++;
        }
    };

    DGSParser.prototype.ready = function() {
        return (this.lines.length > 0);
    };

    DGSParser.prototype.next = function() {
        this.line = this.lines.pop();
        return this;
    };

    DGSParser.prototype.dir = function() {
        if (this.line.match(/^\s*#/) !== null) {
            return '#';
        }
        var dir = this.line.substr(0, 2).toLowerCase();
        this.line = this.line.substr(3, this.line.length - 3);
        return dir;
    };

    DGSParser.prototype.parse = function() {
        var dir,
            id,
            source,
            target,
            directed;

        while (this.ready()) {
            this.next();

            dir = this.dir();

            //
            // Execute directive
            //
            switch (dir) {
                case 'an':
                    id = this.nextId();
                    this.graph.an(id);
                    this.parseAttributes('node', id);
                    break;
                case 'cn':
                    id = this.nextId();
                    this.parseAttributes('node', id); // was this.graph.sn(id)
                    break;
                case 'dn':
                    id = this.nextId();
                    this.graph.dn(id);
                    break;
                case 'ae':
                    id = this.nextId();
                    source = this.nextId();
                    directed = this.isDirectedEdge();
                    target = this.nextId();
                    this.graph.ae(id, source, target);
                    this.parseAttributes('edge', id);
                    break;
                case 'ce':
                    id = this.nextId();
                    this.parseAttributes('edge', id); // was this.graph.se(id)
                    break;
                case 'de':
                    id = this.nextId();
                    this.graph.de(id);
                    //this.parseAttributes('edge', id);
                    break;
                case 'cg':
                    break;
                case 'st':
                    this.graph.st(this.nextReal());
                    break;
                case 'cl':
                    this.graph.cl();
                    break;
                case '#':
                    break;
                default:
                    throw new Error('unknown directive "' + dir + '"');
            }
        }
    };

    DGSParser.prototype.nextId = function() {
        var re = /^\s*(?:'([^']+)'|"([^"]+)"|([\w\d-_]+))(?:(.*))?$/;
        var ex = re.exec(this.line);
        if (ex === null) {
            throw new Error('DSG Parser Problem with ids reading that line :' + this.line);
        } else {
            this.line = ex[4];
            return ex[1] || ex[2] || ex[3];
        }
    };

    DGSParser.prototype.isDirectedEdge = function() {
        var re = /^\s*(>)(?:(.*))?$/;
        var ex = re.exec(this.line);
        if (ex === null) {
            return false;
        }

        if (ex[1] !== undefined && ex[1] === '>') {
            this.line = ex[2];
            return true;
        } else
            return false;
    };

    DGSParser.prototype.nextReal = function() {
        var re = /^(\d+(?:\.\d+)?)$/;
        var ex = re.exec(this.line);

        return ex[1];
    };

    DGSParser.prototype.parseAttributes = function(type, e) {
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
                        in_re = /^([a-fA-F0-9]{6}|[a-fA-F0-9]{3})(.*)/;
                        in_ex = in_re.exec(ex[3]); // exec on the rest (no starting #)
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
                        in_re = /\s*(?:([+-]?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)|(\w[-\w.]*)|"([^"]*)"|'([^']*)')(.*)$/;
                        in_ex = in_re.exec(ex[1]);
                        if (in_ex === null) {
                            throw new Error('Could not read a word or number on line: ' + that.line);
                        }
                        var tmp = ((typeof(in_ex[1]) !== 'undefined') ? parseFloat(in_ex[1], 10) : in_ex[2] || in_ex[3] || in_ex[4]);

                        o.push(tmp);
                        that.line = in_ex[5];
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


        if (typeof this.line === 'undefined' || this.line.match(/^\s*$/) !== null) {
            // exports.console.log('No attributes for ' + type + ' ' + e + '. Moving on.');
            return;
        }
        var re = /^\s*([+-]?)(?:"([^"]*)"|'([^']*)'|(\w[[\w.]*))(.*?)$/;
        var ex = re.exec(this.line);
        var isRemove,
            attrName,
            attrVal;

        if (ex === null) {
            // exports.console.log('No attributes for ' + type + ' ' + e + '. Moving on.');
            return;
        }
        // exports.console.log(ex);
        isRemove = ex[1] === '-' ? true : false;

        // Get attribute name and value. No quotes. 
        attrName = ex[2] || ex[3] || ex[4];

        // go on with the rest.
        this.line = ex[5];

        re = /\s*([:=])?(.*?)$/;
        ex = re.exec(this.line);
        // exports.console.log(ex);

        if (typeof(ex[1]) !== 'undefined') {
            // we have a value.
            this.line = ex[2];

            attrVal = readValue(true);

        }

        // exports.console.log('attrName: ' + attrName);
        // exports.console.log('attrVal: ' + attrVal);

        if (isRemove) {
            switch (type) {
                case 'node':
                    switch (attrName) {
                        case 'x':
                            delete this.graph.nodes[e].x;
                            break;
                        case 'y':
                            delete this.graph.nodes[e].y;
                            break;
                        case 'z':
                            delete this.graph.nodes[e].z;
                            break;
                        case 'xy':
                            delete this.graph.nodes[e].x;
                            delete this.graph.nodes[e].y;
                            break;
                        case 'xyz':
                            delete this.graph.nodes[e].x;
                            delete this.graph.nodes[e].y;
                            delete this.graph.nodes[e].z;
                            break;
                        default:
                            this.graph.nodes[e].removeAttribute(attrName);
                    }
                    break;
                case 'edge':
                    this.graph.edges[e].removeAttribute(attrName);
            }
        } else {
            switch (type) {
                case 'node':
                    // For now, x, y and z attributes are treated distinctly from any other attributes.
                    switch (attrName) {
                        case 'x':
                            this.graph.nodes[e].x = attrVal;
                            break;
                        case 'y':
                            this.graph.nodes[e].y = attrVal;
                            break;
                        case 'z':
                            this.graph.nodes[e].y = attrVal;
                            break;
                        case 'xy':
                            this.graph.nodes[e].x = attrVal[0];
                            this.graph.nodes[e].y = attrVal[1];
                            break;
                        case 'xyz':
                            this.graph.nodes[e].x = attrVal[0];
                            this.graph.nodes[e].y = attrVal[1];
                            this.graph.nodes[e].z = attrVal[2];
                            break;
                        default:
                            this.graph.nodes[e].setAttribute(attrName, attrVal || true);
                    }
                    break;
                case 'edge':
                    this.graph.edges[e].setAttribute(attrName, attrVal || true);
                    break;
            }
        }

        // maybe there are some extra attributes. Let's call the method recursively.
        if (this.line !== '') {
            this.parseAttributes(type, e);
        }
    };
})(window);
