var express = require('express');
var app = express();
var path = require('path');

app.use(express.static(path.join(__dirname, 'public')));

var server = app.listen(3200,function(){
    console.log("We have started our server on port 3200");
});