"use strict";
/**
 * Copyright (c) 2015 Nikolai Mavrenkov <koluch@koluch.ru>
 *
 * Distributed under the MIT License (See accompanying file LICENSE or copy at http://opensource.org/licenses/MIT).
 *
 * Created: 09.12.2015 22:31
 */

var React = require('react'),
    ajax = require('./ajax');

var DynamicSelect = require('./DynamicSelect');

module.exports = React.createClass({

    onSubmit: function (e) {
        e.preventDefault();

        this.setState({
            waiting: true
        });

        var result = this.props.onAdd(this.state.selectValue.value);

        result.then(() => {
            this.setState({
                error: null
            });
        }).catch(error => {
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
            this.setState({
                error: "Unable to add city '"+error.city+"': " + message
            });
        }).then(() => {
            this.setState({
                selectValue: null,
                waiting: false
            });
        })
    },

    getInitialState: function () {
        return {
            selectValue: null,
            waiting: false,
            error: null
        }
    },

    loadOptions: function(input) {
        return ajax.get('/cities?q=' + input).then((cities) => {
            return cities.map((item) => {
                return {
                    value: item.city,
                    label: item.city
                }
            });
        });
    },

    onFinishSearch: function(selectedOption) {
        this.setState({
            selectValue: selectedOption
        });
        //this.refs.add_button.focus()
    },

    onSelectReset: function() {
        this.setState({
            selectValue: null
        });
    },

    render: function () {

        //todo: change placeholder text
        return (
            <div className="new-city">
                <form onSubmit={this.onSubmit} className="new-city__form">
                    <label htmlFor="city">
                        <span>New city: </span>
                    </label>
                    <DynamicSelect id="city"
                                   loadOptions={this.loadOptions}
                                   value={this.state.selectValue}
                                   onReset={this.onSelectReset}
                                   onChange={this.onFinishSearch}
                                   placeholder="Begin writing city name"
                    />
                    <button type="submit"
                            disabled={this.props.disabled || this.state.waiting || this.state.selectValue === null || this.state.selectValue.value === ""}
                            ref="add_button"
                            >Add</button>
                    <img src="images/ajax-loader.gif"
                         style={{visibility:this.state.waiting ? "visible" : "hidden"}}/>
                </form>
                <div className="error">{this.state.error}</div>
            </div>

        )
    }
});
