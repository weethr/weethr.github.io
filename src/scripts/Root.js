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
    Q = require('kew'),
    nanoajax = require('nanoajax');


var NewCity = require('./NewCity'),
    CityList = require('./CityList');

function requestWeather(city) {

    var promise = new Q.defer();
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
            promise.resolve(newCity);
        }
        else {
            promise.reject({
                code: code,
                city: city,
                message: responseText
            });
        }
    });

    return promise;
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
        var updateList = () => {
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
                    });
                }).fail((reason) => {
                    console.log("Failed to update '"+reason.city+"': " + reason.message);
                })
            });

            // Resolve all promises, even if some of them failed
            newCityPromiseList = newCityPromiseList.map((newCityPromise) => {
                return newCityPromise.then((newCity) => {
                    return newCityPromise;
                }, (error) => {
                    return Q.resolve(error);
                })
            });

            // When all requests finished - set timeout for next update
            Q.all(newCityPromiseList).then(() => {
                setTimeout(updateList, 3000);
            })
        };
        updateList();
    },

    onNewCity: function (cityName) {
        return requestWeather(cityName)
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