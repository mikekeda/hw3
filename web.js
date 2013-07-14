var fs = require("fs");

var file_name = "index.html";
var text = fs.readFileSync( file_name ).toString();

var express = require('express');

var app = express.createServer(express.logger());

app.get('/', function(request, response) {	
  response.send(text);
});

var port = process.env.PORT || 8080;
app.listen(port, function() {
  console.log("Listening on " + port);
});