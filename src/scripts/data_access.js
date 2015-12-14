"use strict";
/**
 * Copyright (c) 2015 Nikolai Mavrenkov <koluch@koluch.ru>
 *
 * Distributed under the MIT License (See accompanying file LICENSE or copy at http://opensource.org/licenses/MIT).
 *
 * Created: 14.12.2015 05:14
 */
var Q = require('kew'),
    ajax = require('./ajax');

module.exports.requestWeather = (city) => {

    return ajax.get('/weather?q=' + city).then((weatherData) => {
        return {
            name: city,
            weather: {
                temp: weatherData.main.temp || 0 ,
                pressure: weatherData.main.pressure,
                humidity: weatherData.main.humidity,
                dt: weatherData.dt * 1000,
                wind: weatherData.wind,
                desc: weatherData.weather[0]
            }
        };
    }, (error) => {
        return Q.reject({
            code: error.code,
            city: city,
            message: error.responseText
        })
    });
}

module.exports.fetchCurrentCity = () => {
    var promise = new Q.defer();

    navigator.geolocation.getCurrentPosition((position) => {
        promise.resolve(position);
    }, (error) => {
        promise.reject(error);
    });

    return promise.then((position) => {
        var url = 'http://maps.googleapis.com/maps/api/geocode/json?latlng='
            + position.coords.latitude + ','
            + position.coords.longitude + '&sensor=true&language=en';
        return ajax.get(url);
    })
    .then((geoInfo) => {
        if (!geoInfo.results.length > 0) {
            throw new Error("Google hasn't found anything");
        }
        var result = geoInfo.results[0]
        var components = result.address_components;
        components = components.filter((comp) => {
            return comp.types.indexOf("administrative_area_level_1") != -1
                && comp.types.indexOf("political") != -1;
        });
        if (!components.length > 0) {
            throw new Error("City component hasn't found");
        }
        var cityComponent = components[0];
        var cityName = cityComponent.long_name;
        return cityName;
    })
}
