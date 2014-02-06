/*
 * A dead simple script to serve static local pages in http. 
 * 
 * Listening to port 1337. 
 * 
 * Same result in python with the following command line : 
 * python -m SimpleHTTPServer 1337
 *
 */

var express = require('express');
var app = express();

app.use( express.static(__dirname + '/'));

app.listen(1337);