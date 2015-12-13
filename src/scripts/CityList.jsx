"use strict";
/**
 * Copyright (c) 2015 Nikolai Mavrenkov <koluch@koluch.ru>
 *
 * Distributed under the MIT License (See accompanying file LICENSE or copy at http://opensource.org/licenses/MIT).
 *
 * Created: 09.12.2015 22:31
 */

var React = require('react');

function formatTemp(temp) {
    temp = Math.round(temp);
    if (temp > 0) {
        return "+" + temp;
    }
    else {
        return temp;
    }
}

module.exports = React.createClass({
    onRemove: function(name) {
        return () => {
            this.props.onRemove(name)
        }
    },

    render: function () {
        return (
            <div className="city-list">
                {
                    this.props.data.map((city) => {
                        var description;
                        if (city.weather) {
                            /*description = (

                                <div className="city__description">
                                    <div className="city__description__main-info">
                                        <span className="city__description__name">{ city.name }: </span>
                                        <span className="city__description__temp"> { formatTemp(city.weather.temp) }</span>
                                    </div>
                                    <div className="city__description__aux-param">
                                        <img src={"http://openweathermap.org/img/w/"+city.weather.desc.icon +".png"}/>
                                        Description: {city.weather.desc.main } ({city.weather.desc.description})
                                    </div>
                                    <div className="city__description__aux-param">
                                        Pressure: {city.weather.pressure} hPa
                                    </div>
                                    <div className="city__description__aux-param">
                                        Humidity: {city.weather.humidity}%
                                    </div>
                                    <div className="city__description__aux-param">
                                        Wind: {city.weather.wind.speed} m/s ({city.weather.wind.deg}°)
                                    </div>
                                    <div className="city__description__last-update">
                                        {(new Date(city.weather.dt)).toGMTString()}
                                    </div>
                                </div>
                            )*/
                        }
                        else {
                            description = (
                                <div className="city__description">
                                    <div className="city__description__main-info">
                                        <span className="city__description__name">{ city.name }: </span>
                                        <span>
                                            no data yet
                                        </span>
                                    </div>
                                </div>
                            )
                        }
                        return (
                            <table key={city.name} className="city">
                                <tbody>
                                    <tr>
                                        <td className="city__icon"><img src={"http://openweathermap.org/img/w/"+city.weather.desc.icon +".png"}/></td>
                                        <td className="city__name">{ city.name }</td>
                                        <td><button onClick={this.onRemove(city.name)}>Remove</button></td>
                                    </tr>
                                    <tr>
                                        <td className="city__temp">{ formatTemp(city.weather.temp) }</td>
                                        <td className="city__details">
                                            <div className="city__aux-param">
                                                Pressure: {city.weather.pressure} hPa
                                            </div>
                                            <div className="city__aux-param">
                                                Humidity: {city.weather.humidity}%
                                            </div>
                                            <div className="city__aux-param">
                                                Wind: {city.weather.wind.speed} m/s ({city.weather.wind.deg}°)
                                            </div>
                                            <div className="city__last-update">
                                                {(new Date(city.weather.dt)).toGMTString()}
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        )
                    })
                }
            </div>
        )
    }
});
