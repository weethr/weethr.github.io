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
                            description = (
                                <span>
                                    { city.name }: { formatTemp(city.weather.temp) } <span> ({(new Date(city.weather.dt)).toGMTString()})</span>
                                </span>
                            )
                        }
                        else {
                            description = (
                                <span>
                                    { city.name }: no data yet
                                </span>
                            )
                        }
                        return (
                            <div key={city.name} className="city">
                                {description}
                                <button onClick={this.onRemove(city.name)}>Remove</button>
                            </div>
                        )
                    })
                }
            </div>
        )
    }
});
