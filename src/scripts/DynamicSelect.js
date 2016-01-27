"use strict";
/**
 * Copyright (c) 2016 Nikolai Mavrenkov <koluch@koluch.ru>
 *
 * Distributed under the MIT License (See accompanying file LICENSE or copy at http://opensource.org/licenses/MIT).
 *
 * Created: 27.01.2016 21:38
 */
"use strict";
/**
 * Copyright (c) 2015 Nikolai Mavrenkov <koluch@koluch.ru>
 *
 * Distributed under the MIT License (See accompanying file LICENSE or copy at http://opensource.org/licenses/MIT).
 *
 * Created: 09.12.2015 22:31
 */

var React = require('react'),
    update = require('react-addons-update');

module.exports = React.createClass({

    getInitialState: function(){
        return {
            focused: false
        }
    },

    onFocus: function() {
        this.setState(update(this.state, {
            focused: {$set: true}
        }))
    },

    onBlur: function() {
        this.setState(update(this.state, {
            focused: {$set: false}
        }))
    },

    render: function () {

        var className = "dynamic-select";
        if(this.state.focused) {
            className += " dynamic-select--focused"
        }

        return (
            <div className={className}>
                <input className="dynamic-select__input" type="text" onFocus={this.onFocus} onBlur={this.onBlur}/>
                <div className="dynamic-select__options">
                    <div className="dynamic-select__options__option">first</div>
                    <div className="dynamic-select__options__option">second</div>
                    <div className="dynamic-select__options__option">third</div>
                </div>
            </div>
        )
    }
});
