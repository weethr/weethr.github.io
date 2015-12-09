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

    onSubmit: function (e) {
        e.preventDefault();
        this.props.onAdd(this.state.text);
        this.setState(update(this.state, {
            text: {$set: ""}
        }));
    },

    getInitialState: function () {
        return {
            text: ""
        }
    },

    updateText: function (e) {
        this.setState(update(this.state, {
            text: {$set: e.target.value}
        }));
    },

    render: function () {
        return (
            <form onSubmit={this.onSubmit}>
                <label>
                    <span>New city: </span>
                    <input type="text" value={this.state.text} onChange={this.updateText}/>
                    <button type="submit">Add</button>
                </label>
            </form>
        )
    }
});