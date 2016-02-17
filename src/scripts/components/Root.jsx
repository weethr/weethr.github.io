"use strict";
/**
 * Copyright (c) 2015 Nikolai Mavrenkov <koluch@koluch.ru>
 *
 * Distributed under the MIT License (See accompanying file LICENSE or copy at http://opensource.org/licenses/MIT).
 *
 * Created: 09.12.2015 22:31
 */

import React from 'react'
import update from 'react-addons-update'
import {Promise} from 'es6-promise'
import HTML5Backend from 'react-dnd-html5-backend'
import TouchBackend from 'react-dnd-touch-backend'
import {DragDropContext} from 'react-dnd'

import NewCity from './NewCity'
import CityList from './CityList'
import {fetchWeather, fetchCurrentCity} from '../data_access.js'


const Root = React.createClass({

    getInitialState: function () {
        var defaultState = {
            initialized: false,
            cityList: [],
            displayMode: "short"
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

            fetchCurrentCity().then((cityName) => {
                    return fetchWeather(cityName);
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
                .catch((error) => {
                    console.error(error);
                })
                .then(() => {
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
            var newCityPromiseList = this.state.cityList.map((city) => fetchWeather(city.name));

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
                    .catch((reason) => {
                        console.error(reason);
                    })
            });

            // Resolve all promises, even if some of them failed
            newCityPromiseList = newCityPromiseList.map((newCityPromise) => {
                return newCityPromise.catch((error) => Promise.resolve(error))
            });

            // When all requests finished
            Promise.all(newCityPromiseList).then(() => {
                this.saveState();
                setTimeout(updateList, 5 * 60 * 1000);
            })
        };
        updateList();
    },

    onNewCity: function (cityName) {
        var promise = fetchWeather(cityName);
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

    onSwapCities: function(i1, i2) {
        this.setState((state) => {
            const newCityList = state.cityList.slice(0);
            const tmp = newCityList[i1]
            newCityList[i1] = newCityList[i2]
            newCityList[i2] = tmp;
            this.saveState(update(state, {
                cityList: {$set: newCityList}
            }));
            return {
                cityList: newCityList
            }
        })
    },

    render: function () {
        return (
            <div className="l-root">
                <div className="l-row ">
                    <div className="l-cell l-header">
                        {
                            (!this.state.initialized)
                                ? <p className="initializing-msg">Determining current city...</p>
                                : null
                        }
                        <NewCity onAdd={this.onNewCity}/>
                    </div>
                </div>
                <div className="l-row">
                    <div className="l-cell">
                        <div className="l-content">
                            <CityList data={this.state.cityList}
                                      displayMode={this.state.displayMode}
                                      onRemove={this.onRemoveCity}
                                      onSwap={this.onSwapCities}
                            />
                        </div>
                    </div>
                </div>
                <div className="l-row">
                    <div className="l-cell l-footer">
                        <div className="l-content">
                            <div className="display-settings">
                                <label><input type="checkbox"
                                              checked={this.state.displayMode === "full"}
                                              onChange={this.onChangeDisplayMode}
                                              tabIndex="-1"
                                />show detailed information</label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
});

export default DragDropContext(TouchBackend({ enableMouseEvents: true }))(Root)
