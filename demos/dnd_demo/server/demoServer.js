var http = require('http'),
    fs = require('fs'),
	querystring = require('querystring');

var site = /^\/site\/([\w-._\d]+(?:\/[\w-._\d]+)*\.(html|js|css|png|svg|woff))(?:\?(.*))?$/;
var ajax = /^\/ajax(?:\?(.*))?$/;

var mime = {
	html: 'text/html',
	js: 'text/javascript',
	css: 'text/css',
	png: 'image/png',
	svg: 'image/svg+xml',
	woff: 'application/x-font-woff',
	json: 'application/json'
};

http.createServer(function (request, response) {
    console.log('request starting... '+request.url);
     
    if (site.test(request.url)) {
		var info = site.exec(request.url),
			file = './' + info[1];
		
		console.log("request file '" + file + "'");
		
		fs.readFile(file, function(error, content) {
			if (error) {
				response.writeHead(500);
				response.end();
			}
			else {
				response.writeHead(200, { 'Content-Type': mime[info[2]] });
				response.end(content, 'utf-8');
			}
		});
	}
	else if (ajax.test(request.url)) {
		console.log("*** ajax request ***");
		var info = ajax.exec(request.url);
		var query = querystring.parse(info[1]);
		console.log(query);
		response.writeHead(200, { 'Content-Type': mime.json });
		response.end('{status:"success"}', 'utf-8');
	}
    else {
		response.writeHead(500, { 'Content-Type': 'text/html' });
		response.end();
	}
}).listen(8080);
