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
        if (typeof this.line === 'undefined' || this.line.match(/^\s*$/) !== null) {
            // exports.console.log('No attributes for ' + type + ' ' + e + '. Moving on.');
            return;
        }
        var re = /^\s*[+-]?(?:"([^"]*)"|'([^']*)'|(\w[[\w.]*))\s*(?:[:=]\s*(?:([+-]?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)|(\w[[\w.]*)|"([^"]*)"|'([^']*)'|(#[a-fA-F0-9]{6})))?(?:(.*))?$/;
        var ex = re.exec(this.line);
        if (ex === null) {
            // exports.console.log('No attributes for ' + type + ' ' + e + '. Moving on.');
            return;
        }
        // exports.console.log(ex);

        // Get attribute name and value. No quotes. Value types are strings or numbers. No arrays yet.
        var attrName = ex[1] || ex[2] || ex[3],
            attrVal = ((typeof(ex[4]) !== 'undefined') ? parseFloat(ex[4], 10) : ex[4]) || ex[5] || ex[6] || ex[7] || ex[8];

        // exports.console.log('attrName: ' + attrName);
        // exports.console.log('attrVal: ' + attrVal);

        switch (type) {
            case 'node':
                // For now, x, y and z attributes are treated distinctly from any other attributes.
                if (attrName === 'x') {
                    this.graph.nodes[e].x = attrVal;
                } else if (attrName === 'y') {
                    this.graph.nodes[e].y = attrVal;
                } else if (attrName === 'z') {
                    this.graph.nodes[e].z = attrVal;
                } else {
                    this.graph.nodes[e].setAttribute(attrName, attrVal);
                }

                break;
            case 'edge':
                this.graph.edges[e].setAttribute(attrName, attrVal);
                break;
        }

        // maybe there are some extra attributes. Let's call the method recursively.
        if (typeof ex[9] !== 'undefined') {
            this.line = ex[9];
            this.parseAttributes(type, e);
        }
    };
})(window);
