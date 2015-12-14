"use strict";
/**
 * Copyright (c) 2015 Nikolai Mavrenkov <koluch@koluch.ru>
 *
 * Distributed under the MIT License (See accompanying file LICENSE or copy at http://opensource.org/licenses/MIT).
 *
 * Created: 09.12.2015 22:31
 */

var React = require('react'),
    strftime = require('strftime');

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

    onMoveUp: function(name) {
        return () => {
            this.props.onMoveUp(name)
        }
    },

    onMoveDown: function(name) {
        return () => {
            this.props.onMoveDown(name)
        }
    },

    render: function () {
        return (
            <div className="city-list">
                {
                    this.props.data.map((city) => {
                        var tempClasses = "city__temp";
                        if(city.weather.temp > 0) {tempClasses += " city__temp--warm"}
                        else if(city.weather.temp < 0) {tempClasses += " city__temp--cold"}

                        if(this.props.displayMode === "full") {
                            return (
                                <table key={city.name} className="city city--full">
                                    <tbody>
                                        <tr>
                                            <td className="city__icon" title={city.weather.desc.description}>
                                                <img src={"http://openweathermap.org/img/w/"+city.weather.desc.icon +".png"}/>
                                            </td>
                                            <td className="city__name" colSpan="2">{ city.name }</td>
                                        </tr>
                                        <tr>
                                            <td className={tempClasses}>{ formatTemp(city.weather.temp) }</td>
                                            <td className="city__details">
                                                <div>
                                                    <span className="city__aux-param">
                                                        Pressure: {city.weather.pressure} hPa
                                                    </span>
                                                    <span className="city__aux-param">
                                                        Humidity: {city.weather.humidity}%
                                                    </span>
                                                    <span className="city__aux-param">
                                                        Wind: {city.weather.wind.speed} m/s ({city.weather.wind.deg}°)
                                                    </span>
                                                </div>
                                                <div className="city__last-update">
                                                    Last update: {strftime('%T %F', new Date(city.weather.dt))}
                                                </div>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="city__remove-button" colSpan="3" >
                                                <div className="arrow-up" onClick={this.onMoveUp(city.name)}></div>
                                                <div className="arrow-down" onClick={this.onMoveDown(city.name)}></div>
                                                <button onClick={this.onRemove(city.name)}>Remove</button>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            )
                        }
                        else {
                            return (
                                <table key={city.name} className="city city--short">
                                    <tbody>
                                        <tr>
                                            <td className="city__icon" title={city.weather.desc.description}><img src={"http://openweathermap.org/img/w/"+city.weather.desc.icon +".png"}/></td>
                                            <td className="city__name">{ city.name }</td>
                                            <td className={tempClasses}>{ formatTemp(city.weather.temp) }</td>
                                            <td className="city__remove-button" rowSpan="2" >
                                                <button onClick={this.onRemove(city.name)}>Remove</button>
                                            </td>
                                            <td className="city__up-down-buttons" rowSpan="2" >
                                                <div className="arrow-up" onClick={this.onMoveUp(city.name)}></div>
                                                <div className="arrow-down" onClick={this.onMoveDown(city.name)}></div>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            )
                        }

                    })
                }
            </div>
        )
    }
});
