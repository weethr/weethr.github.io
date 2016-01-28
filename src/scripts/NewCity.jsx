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
                selectValue: "",
                error: null,
                waiting: false
            });
        });

        result.catch((error) => {
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
                waiting: false,
                error: "Unable to add city '"+error.city+"': " + message
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
        //val = val || { value: '', label: '' };
        //this.setState({
        //    selectValue: val
        //});
        console.log(selectedOption)
        this.setState({
            selectValue: selectedOption
        });
    },

    render: function () {

        return (
            <div className="new-city">
                <form onSubmit={this.onSubmit} >
                    <label>
                        <span>New city: </span>
                        <DynamicSelect loadOptions={this.loadOptions}
                                       value={this.state.selectValue}
                                       onChange={this.onFinishSearch}/>
                    </label>
                    <button type="submit"
                            disabled={this.props.disabled || this.state.waiting || this.state.selectValue === null || this.state.selectValue.value === ""}>Add</button>
                    <img src="images/ajax-loader.gif"
                         style={{visibility:this.state.waiting ? "visible" : "hidden"}}/>
                </form>
                <div className="error">{this.state.error}</div>
            </div>

        )
    }
});
