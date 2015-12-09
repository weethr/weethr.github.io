"use strict";
/**
 * Copyright (c) 2015 Nikolai Mavrenkov <koluch@koluch.ru>
 *
 * Distributed under the MIT License (See accompanying file LICENSE or copy at http://opensource.org/licenses/MIT).
 *
 * Created: 09.12.2015 22:31
 */

var React = require('react'),
    update = require('react-addons-update'),
    nanoajax = require('nanoajax');


var NewCity = require('./NewCity'),
    CityList = require('./CityList');

function requestWeather(city) {

    return new Promise((resolve, reject) => {
        nanoajax.ajax({url: '/weather?q=' + city}, (code, responseText) => {
            if (code === 200) {
                var weatherData = JSON.parse(responseText); //todo: check for errors
                var newCity = {
                    name: city,
                    weather: {
                        temp: weatherData.main.temp,
                        dt: weatherData.dt * 1000
                    }
                };
                resolve(newCity);
            }
            else {
                reject(responseText);
                throw new Error(responseText);
            }
        });
    });


}

module.exports = React.createClass({

    getInitialState: function () {
        return {
            cityList: [
                {name: "London"},
                {name: "Saint Petersburg"},
                {name: "New York"},
                {name: "Murmansk"},
                {name: "Sidney"},
                {name: "Dublin"},
                {name: "Berlin"},
                {name: "Moscow"}
            ]
        }
    },

    componentDidMount: function () {
        setInterval(() => {
            var newCityPromiseList = this.state.cityList.map((city) => requestWeather(city.name));
            newCityPromiseList.forEach((newCityPromise) => {
                newCityPromise.then((newCity) => {
                    // Atomically update old state, replacing old city with new, if this city is still in the list
                    this.setState((oldState) => {
                        var newCityList = oldState.cityList.map((oldCity) => {
                            if (oldCity.name === newCity.name) {
                                return newCity;
                            }
                            else {
                                return oldCity;
                            }
                        });
                        return update(oldState, {
                            cityList: {$set: newCityList}
                        })
                    })
                })
            });
        }, 1000)
    },

    onNewCity: function (cityName) {
        requestWeather(cityName)
            .then((newCity) => {
                this.setState((oldState) => {
                    var noSuchCity = oldState.cityList.filter((x) => x.name === cityName).length === 0;
                    if(noSuchCity) {
                        return update(oldState, {
                            cityList: {$push: [newCity]}
                        });
                    }
                });
            })
            .catch((reason) => {
                throw new Error(reason);
            });
    },

    onRemoveCity: function (cityName) {
        this.setState((oldState) => {
            var newCityList = oldState.cityList.filter((x) => x.name !== cityName);
            return update(oldState, {
                cityList: {$set: newCityList}
            });
        });
    },

    render: function () {
        return (
            <div>
                <NewCity onAdd={this.onNewCity}/>
                <CityList data={this.state.cityList} onRemove={this.onRemoveCity}/>
            </div>
        )
    }
});