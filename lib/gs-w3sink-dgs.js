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
                    this.parseAttributes('node', this.graph.sn(id));
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

                    this.parseAttributes('edge', this.graph.se(id));
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
        var i = 0;
        if (ex[++i] !== undefined || ex[++i] !== undefined || ex[++i] !== undefined) {
            this.line = ex[4];
            return ex[i];
        } else return undefined;
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
        } else return false;
    };

    DGSParser.prototype.nextReal = function() {
        var re = /^(\d+(?:\.\d+)?)$/;
        var ex = re.exec(this.line);

        return ex[1];
    };

    DGSParser.prototype.parseAttributes = function(type, e, attributes) {
        var re = /[+-]?("[^"]*"|'[^']*'|\w[[\w.]*)([:=](\d+([.]\d+)?|\w[[\w.]*|"[^"]*"|'[^']*'|#[a-fA-F0-9]{6}))?/g;
        switch (type) {
            case 'node':
                break;
            case 'edge':
                break;
        }
    };
})(window);
