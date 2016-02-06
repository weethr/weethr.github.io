"use strict";
/**
 * Copyright (c) 2015 Nikolai Mavrenkov <koluch@koluch.ru>
 *
 * Distributed under the MIT License (See accompanying file LICENSE or copy at http://opensource.org/licenses/MIT).
 *
 * Created: 14.12.2015 05:14
 */
import {Promise} from 'es6-promise'
import {get} from './ajax'

export const fetchWeather = (city) => {

    return get(window.context.backend_url + '/weather?q=' + city).then((weatherData) => {
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
        return Promise.reject({
            code: error.code,
            city: city,
            message: error.responseText
        })
    });
}

export const fetchCurrentCity = () => {
    var promise = new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition((position) => {
            resolve(position);
        }, (error) => {
            reject(error);
        });
    })

    return promise.then((position) => {
        const proto = window.context.env === "DEBUG" ? "http" : "https"
        const latitude = position.coords.latitude
        const longitude = position.coords.longitude
        const url = `${proto}://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&sensor=true&language=en`;
        return get(url, {withCredentials:false});
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

export const fetchCityList = (prefix) => {
    return get(window.context.backend_url + '/cities?q=' + prefix)
}
