"use strict";
/**
 * Copyright (c) 2015 Nikolai Mavrenkov <koluch@koluch.ru>
 *
 * Distributed under the MIT License (See accompanying file LICENSE or copy at http://opensource.org/licenses/MIT).
 *
 * Created: 09.12.2015 19:24
 */
var express = require('express');
var app = express();

var publicDir = process.argv[2] || "public";

app.use(express.static(publicDir));

app.get('/weather', function(req, res) {
    res.send('hello world');
});

var server = app.listen(3001, function(){
    var host = server.address().address;
    var port = server.address().port;

    console.log('Server listening at http://%s:%s', host, port);
    console.log('Serving static files in: ' + publicDir);
});

