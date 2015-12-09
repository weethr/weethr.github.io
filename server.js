"use strict";
/**
 * Copyright (c) 2015 Nikolai Mavrenkov <koluch@koluch.ru>
 *
 * Distributed under the MIT License (See accompanying file LICENSE or copy at http://opensource.org/licenses/MIT).
 *
 * Created: 09.12.2015 19:24
 */
var express = require('express'),
    http = require('http');

var app = express();

var apiKey = ''; // NEED TO PUT API KEY HERE

var publicDir = process.argv[2] || "public";

app.use(express.static(publicDir));

app.get('/weather', (req, res) => {
    var params = require('url').parse(req.url, true).query;
    if(params.q) {
        http.get('http://api.openweathermap.org/data/2.5/weather?q='+encodeURIComponent(params.q)+'&appid=' + apiKey, (apiRes) => {
            var data = "";
            apiRes.on('data', (chunk) => { if(chunk) {data += chunk} });
            apiRes.on('end', () => {
                var dataJson = JSON.parse(data);
                if(dataJson.cod == 200) {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(data);
                }
                else {
                    res.writeHead(dataJson.cod, { 'Content-Type': 'text/plain' });
                    res.end(dataJson.message);
                }
            });

        }).on('error', (e) => {
            console.log(e);
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end("Error: " + e.message);
        });
    }
    else {
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        res.end("Error: you have to supply 'q' parameter");
    }

});

var server = app.listen(3001, () => {
    var host = server.address().address;
    var port = server.address().port;

    console.log('Server listening at http://%s:%s', host, port);
    console.log('Serving static files in: ' + publicDir);
});

