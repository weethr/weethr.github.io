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
    ajax = require('./ajax');


var NewCity = require('./NewCity'),
    CityList = require('./CityList');

function requestWeather(city) {

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

module.exports = React.createClass({

    getInitialState: function () {
        var defaultState = {
            initialized: false,
            cityList: [],
            displayMode: "full"
        };
        var state;
        var savedState = localStorage.getItem("reactState");
        if (localStorage.getItem("reactState") !== null) {
            try {
                state = JSON.parse(localStorage.getItem("reactState"));
            } catch (e) {
                console.error("Unable to parse old state, use default");
                state = defaultState
            }
        }
        else {
            state = defaultState;
        }

        // If state is not initialized - try to determine user's city and load weather for it
        if (!state.initialized) {


            var stopInitializing = () => {
                this.setState((oldState) => {
                    var newState = update(oldState, {
                        initialized: {$set: true}
                    });
                    this.saveState(newState);
                    return newState;
                })
            };

            // Stop initilizing if it lasts to long
            setTimeout(stopInitializing, 12000)

            navigator.geolocation.getCurrentPosition((position) => {
                var url = 'http://maps.googleapis.com/maps/api/geocode/json?latlng=' + position.coords.latitude + ',' + position.coords.longitude + '&sensor=true&language=en';
                ajax.get(url).then((geoInfo) => {
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
                    return requestWeather(cityName);
                })
                .then((cityWeather) => {
                    this.setState((oldState) => {
                        // If app is already initialized (for example, by timeout) - do nothing
                        if(oldState.initialized) return oldState;
                        var newState;
                        newState = update(oldState, {
                            cityList: {$push: [cityWeather]}
                        });
                        this.saveState(newState);
                        return newState;
                    })
                })
                .fail((error) => {
                    console.error(error);
                })
                .fin(() => {
                    stopInitializing();
                })
            }, (error) => {
                console.error(error);
                stopInitializing();
            });
        }
        this.saveState(state);
        return state;
    },

    saveState: function (state) {
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
                })
                .fail((reason) => {
                    console.error("Failed to update '" + reason.city + "': " + reason.message);
                })
            });

            // Resolve all promises, even if some of them failed
            newCityPromiseList = newCityPromiseList.map((newCityPromise) => {
                return newCityPromise.fail((error) => Q.resolve(error))
            });

            // When all requests finished
            Q.all(newCityPromiseList).then(() => {
                this.saveState();
                setTimeout(updateList, 10000);
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

    onChangeDisplayMode: function(e, a) {
        this.setState((oldState) => {
            var newMode = this.state.displayMode === "full" ? "short" : "full";
            var newState = update(oldState, {
                displayMode: {$set: newMode}
            });
            this.saveState(newState);
            return newState;
        })
    },

    onMoveCityUp: function (cityName) {
        this.setState((oldState) => {
            var newCityList = oldState.cityList.slice(0);
            for (var i = 1; i < newCityList.length; i++) {
                if(newCityList[i].name === cityName) {
                    var tmp = newCityList[i-1];
                    newCityList[i-1] = newCityList[i]
                    newCityList[i] = tmp;
                    break;
                }
            }
            return update(oldState, {
                cityList: {$set: newCityList}
            })
        })
    },

    onMoveCityDown: function(cityName) {
        this.setState((oldState) => {
            var newCityList = oldState.cityList.slice(0);
            for (var i = 0; i < newCityList.length - 1; i++) {
                if(newCityList[i].name === cityName) {
                    var tmp = newCityList[i+1];
                    newCityList[i+1] = newCityList[i]
                    newCityList[i] = tmp;
                    break;
                }
            }
            return update(oldState, {
                cityList: {$set: newCityList}
            })
        })
    },

    render: function () {
        return (
            <div className="root">
                {
                    (!this.state.initialized)
                    ? <p className="initializing-msg">Determining current city...</p>
                    : ""
                }
                <NewCity onAdd={this.onNewCity}/>
                <div className="display-settings">
                    <label><input type="checkbox" checked={this.state.displayMode === "full"} onChange={this.onChangeDisplayMode}/> show detailed information</label>
                </div>
                <CityList data={this.state.cityList}
                    displayMode={this.state.displayMode}
                    onRemove={this.onRemoveCity}
                    onMoveUp={this.onMoveCityUp}
                    onMoveDown={this.onMoveCityDown}
                    />
            </div>
        )
    }
});
