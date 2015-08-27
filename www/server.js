'use strict';

var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    path = require('path'),
    router = express.Router(); 

app.use(express.static(__dirname));

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html');
});

app.listen(4000, function() {
  console.log('Server listening on port 4000.');
});
