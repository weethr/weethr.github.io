"use strict";
/**
 * Copyright (c) 2015 Nikolai Mavrenkov <koluch@koluch.ru>
 *
 * Distributed under the MIT License (See accompanying file LICENSE or copy at http://opensource.org/licenses/MIT).
 *
 * Created: 09.12.2015 19:24
 */
var express = require('express'),
    http = require('http'),
    https = require('https');

var app = express();

var cli = require('command-line-args')([
    { name: 'staticDir', alias: 's', type: String },
    { name: 'owmApiKey', alias: 'w', type: String },
    { name: 'googleApiKey', alias: 'g', type: String }
]);

var options = cli.parse();

app.use(express.static(options.staticDir));

app.get('/weather', (req, res) => {
    var params = require('url').parse(req.url, true).query;
    if(params.q) {
        http.get('http://api.openweathermap.org/data/2.5/weather?q='+encodeURIComponent(params.q)+'&appid=' + options.owmApiKey + '&units=metric', (apiRes) => {
            var data = "";
            apiRes.on('data', (chunk) => { if(chunk) {data += chunk} });
            apiRes.on('end', () => {
                var dataJson = JSON.parse(data);
                if(dataJson.cod == 200) {
                    setTimeout(() => {
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(data);
                    }, 2000 * Math.random());
    //                res.writeHead(200, { 'Content-Type': 'application/json' });
    //                res.end(data);
                }
                else {
                    res.writeHead(dataJson.cod, { 'Content-Type': 'text/plain' });
                    res.end(dataJson.message);
                }
            });
        }).on('error', (e) => {
            console.error(e);
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end("Error: " + e.message);
        });
    }
    else {
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        res.end("Error: you have to supply 'q' parameter");
    }

});

app.get('/cities', (req, res) => {
    var params = require('url').parse(req.url, true).query;
    if(params.q) {
        var url = 'https://maps.googleapis.com/maps/api/place/autocomplete/json?input=' + encodeURIComponent(params.q) + '&key=' + encodeURIComponent(options.googleApiKey) + '&language=en&types=(cities)';
        https.get(url, (apiRes) => {
            var data = "";
            apiRes.on('data', (chunk) => { if(chunk) {data += chunk} });
            apiRes.on('end', () => {
                var dataJson = JSON.parse(data);

                if(dataJson.status == "OK") {
                    var cityList = dataJson.predictions.map((prediction) => {
                        return {
                            city: prediction.terms[0].value
                        }
                    });
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(cityList));
                }
                else {
                    console.error("Error: " + dataJson.error_message);
                    res.writeHead(500, { 'Content-Type': 'text/plain' });
                    res.end("Error: " + dataJson.error_message);
                }

            });
        }).on('error', (e) => {
            console.error(e);
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end("Error: " + e.message);
        });
    }
    else {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify([]));
    }

});

var server = app.listen(3001, () => {
    var host = server.address().address;
    var port = server.address().port;

    console.log('Server listening at http://%s:%s', host, port);
});

