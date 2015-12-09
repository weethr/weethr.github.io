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

module.exports = React.createClass({

    getInitialState: function () {
        return {

            cityList: [
                {name: "London", weather: {temp:12}},
                {name: "Saint Petersburg", weather: {temp:-5}}
            ]
        }
    },
    
    onNewCity: function(name) {
        nanoajax.ajax({url:'/weather?q=' + name}, (code, responseText) => {
            if(code===200) {
                var weatherData = JSON.parse(responseText); //todo: check for errors
                console.log(weatherData);
                var newCity = {
                    name: name,
                    weather: {
                        temp: weatherData.main.temp
                    }
                };
                this.setState(update(this.state, {
                    cityList: {$push: [newCity]}
                }))
            }
            else {
                throw new Error(responseText);
            }
        });
    },

    render: function () {
        return (
            <div>
                <NewCity onAdd={this.onNewCity}/>
                <CityList data={this.state.cityList}/>
            </div>
        )
    }
});