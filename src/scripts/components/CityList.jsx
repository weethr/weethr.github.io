"use strict";
/**
 * Copyright (c) 2015 Nikolai Mavrenkov <koluch@koluch.ru>
 *
 * Distributed under the MIT License (See accompanying file LICENSE or copy at http://opensource.org/licenses/MIT).
 *
 * Created: 09.12.2015 22:31
 */

import React from 'react'
import strftime from 'strftime'

function formatTemp(temp) {
    temp = Math.round(temp);
    if (temp > 0) {
        return "+" + temp;
    }
    else {
        return temp;
    }
}

export default React.createClass({
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

    getIconCode: function(name) {
        switch(name) {
             case "01d": return "B"
             case "02d": return "H"
             case "03d": return "N"
             case "04d": return "Y"
             case "09d": return "R"
             case "10d": return "Q"
             case "11d": return "P"
             case "13d": return "V"
             case "50d": return "M"
             case "01n": return "2"
             case "02n": return "4"
             case "03n": return "5"
             case "04n": return "%"
             case "09n": return "8"
             case "10n": return "7"
             case "11n": return "6"
             case "13n": return "\""
             case "50n": return "M"
             default: return ")"
        }
    },

    render: function () {
        function firstLetterUpperCase(str) {
            return str.substr(0,1).toUpperCase() + str.substr(1)
        }

        return (
            <div className="city-list">
                {
                    this.props.data.length > 0
                    ? this.props.data.map((city) => {
                        var tempClasses = "city__temp";
                        if(city.weather.temp > 0) {tempClasses += " city__temp--warm"}
                        else if(city.weather.temp < 0) {tempClasses += " city__temp--cold"}

                        if(this.props.displayMode === "full") {

                            return (
                                <div className="city city--full">
                                    <div className="city__main-info">
                                        <div className="city__icon" >
                                            <i aria-hidden="true" className="meteoicon" title={firstLetterUpperCase(city.weather.desc.description)}>{this.getIconCode(city.weather.desc.icon)}</i>
                                        </div>
                                        <div className="city__name">
                                            { city.name }
                                        </div>
                                    </div>
                                    <div className="city__details-row">
                                        <div className={tempClasses}>{ formatTemp(city.weather.temp) }</div>
                                        <div className="city__details">
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
                                        </div>
                                    </div>
                                    <div className="city__controls">
                                        <div className="arrow-up" onClick={this.onMoveUp(city.name)}></div>
                                        <div className="arrow-down" onClick={this.onMoveDown(city.name)}></div>
                                        <button onClick={this.onRemove(city.name)} tabIndex="-1"><i className="icon fa fa-trash-o" aria-hidden="true"></i></button>
                                    </div>
                                </div>

                            )
                        }
                        else {
                            return (
                                <div className="city city--short">
                                    <div className="city__icon">
                                        <i aria-hidden="true" className="meteoicon" title={firstLetterUpperCase(city.weather.desc.description)}>{this.getIconCode(city.weather.desc.icon)}</i>
                                    </div>
                                    <div className="city__name">
                                        { city.name }
                                    </div>
                                    <div  className={tempClasses}>
                                        { formatTemp(city.weather.temp) }
                                    </div>
                                    <div className="city__controls-parent" >
                                        <div  className="city__controls" >
                                            <div className="city__remove-button" rowSpan="2" >
                                                <button onClick={this.onRemove(city.name)} tabIndex="-1"><i className="icon fa fa-trash-o" aria-hidden="true"></i></button>
                                            </div>
                                            <div className="city__up-down-buttons" rowSpan="2" >
                                                <div className="arrow-up" onClick={this.onMoveUp(city.name)}></div>
                                                <div className="arrow-down" onClick={this.onMoveDown(city.name)}></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        }

                    })
                    : <div className="city-list__empty">There are no cities added yet</div>
                }
            </div>
        )
    }
});
