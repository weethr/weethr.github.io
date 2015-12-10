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

        this.setState(update(this.state, {
            waiting: {$set: true}
        }));

        var result = this.props.onAdd(this.state.text);

        result.then(() => {
            this.setState(update(this.state, {
                text: {$set: ""},
                error: {$set: null},
                waiting: {$set: false}
            }));
        });

        result.fail((error) => {
            var message;
            if(error.code == 404) {
                message = "city have not found";
            }
            else if(error.code == 500) {
                message = "internal server error. Sorry :(";
            }
            else {
                message = error.message;
            }
            this.setState(update(this.state, {
                waiting: {$set: false},
                error: {$set: "Unable to add city '"+error.city+"': " + message}
            }));
        })
    },

    getInitialState: function () {
        return {
            text: "",
            waiting: false,
            error: null
        }
    },

    updateText: function (e) {
        this.setState(update(this.state, {
            text: {$set: e.target.value},
            error: {$set: null}
        }));
    },

    render: function () {
        return (
            <form onSubmit={this.onSubmit}>
                <label>
                    <span>New city: </span>
                    <input type="text" value={this.state.text} disabled={this.state.waiting} onChange={this.updateText}/>
                    <button type="submit" disabled={this.state.waiting || this.state.text === ""}>Add</button>
                    <img src="images/ajax-loader.gif" style={{display:this.state.waiting ? "inline" : "none"}}/>
                </label>
                <p style={{color: 'red'}}>{this.state.error}</p>
            </form>
        )
    }
});