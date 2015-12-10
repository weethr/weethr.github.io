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

function ajax(url) {
    var promise = new Q.defer();

    nanoajax.ajax({url: url}, (code, responseText) => {

        if (code === 200) {
            promise.resolve(JSON.parse(responseText)); //todo: check for errors
        }
        else {
            promise.reject({
                code:code,
                responseText:responseText
            });
        }
    });

    return promise;
}

function requestWeather(city) {

    return ajax('/weather?q=' + city).then((weatherData) => {
        return {
            name: city,
            weather: {
                temp: weatherData.main.temp,
                dt: weatherData.dt * 1000
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

module.exports = React.createClass({

    getInitialState: function () {


        var defaultState = {
            cityList: []
        };
        var state = localStorage.getItem("reactState");
        if(state !== null) {
            try {
                return JSON.parse(state);
            } catch (e) {
                console.error("Unable to parse old state, use default");
                return defaultState
            }
        }
        else {
            navigator.geolocation.getCurrentPosition((position) => {
                console.log(position);
                var url = 'http://maps.googleapis.com/maps/api/geocode/json?latlng='+position.coords.latitude+','+position.coords.longitude+'&sensor=true&language=en';
                console.log(url);
                ajax(url).then((geoInfo) => {
                    if(geoInfo.results.length > 0) {
                        return geoInfo.results[0];
                    }
                    throw new Error("Google hasn't found anything");
                }).then((result) => {
                    var components = result.address_components;
                    components = components.filter((comp) => {
                        return comp.types.indexOf("administrative_area_level_1") != -1
                            && comp.types.indexOf("political") != -1;
                    });
                    if(components.length>0) {
                        return components[0];
                    }
                    throw new Error("City component hasn't found");
                }).then((cityComponent) => {
                    var cityName = cityComponent.long_name;
                    this.setState((oldState) => {
                        if(oldState.cityList.length === 0) {
                            return update(oldState, {
                                cityList: {$set: [{name:cityName}]}
                            })
                        }
                        else {
                            return oldState;
                        }
                    })
                }).fail((error) => {
                    console.log(error);
                })
            });

            return defaultState;
        }
    },

    saveState: function(state){
        state = state || this.state;
        localStorage.setItem("reactState", JSON.stringify(state));
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

            // When all requests finished
            Q.all(newCityPromiseList).then(() => {
                this.saveState();
                setTimeout(updateList, 3000);
            })
        };
        updateList();
    },

    onNewCity: function (cityName) {
        var promise = requestWeather(cityName);
        return promise.then((newCity) => {
            this.setState((oldState) => {
                var noSuchCity = oldState.cityList.filter((x) => x.name === cityName).length === 0;
                var newState;
                if (noSuchCity) {
                    newState = update(oldState, {
                        cityList: {$push: [newCity]}
                    });
                }
                else {
                    newState = oldState;
                }
                this.saveState(newState);
                return newState;
            });
            return promise;
        });
    },

    onRemoveCity: function (cityName) {
        this.setState((oldState) => {
            var newCityList = oldState.cityList.filter((x) => x.name !== cityName);
            var newState = update(oldState, {
                cityList: {$set: newCityList}
            });
            this.saveState(newState);
            return newState;
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