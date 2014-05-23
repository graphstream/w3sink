/*
 * A dead simple script to serve static local pages in http. 
 * 
 * Listening to port 1337. 
 * 
 * Same result in python with the following command line : 
 * python -m SimpleHTTPServer 1337
 *
 */

var express = require('express'),
	app = express(),
	PORT = 1337;

app.use(express.logger({ immediate: false, format: 'dev' }));
app.use( express.static(__dirname + '/'));
app.use( express.static(__dirname + '/../'));
app.use( express.static(__dirname + '/../../'));

app.listen(PORT, function(){
	console.log("Server listening on http://localhost:" + PORT);
});