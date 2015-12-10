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
    Q = require('kew'),
    nanoajax = require('nanoajax');

var Select = require('react-select');

function ajax(url) {
    var promise = new Q.defer();

    nanoajax.ajax({url: url}, (code, responseText) => {

        if (code === 200) {
            promise.resolve(JSON.parse(responseText)); //todo: check for errors
        }
        else {
            promise.reject({
                code:code,
                responseText:responseText
            });
        }
    });

    return promise;
}

module.exports = React.createClass({

    onSubmit: function (e) {
        e.preventDefault();

        this.setState(update(this.state, {
            waiting: {$set: true}
        }));

        var result = this.props.onAdd(this.state.selectValue.value);

        result.then(() => {
            this.setState(update(this.state, {
                selectValue: {$set: ""},
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
            selectValue: { value: ''},
            waiting: false,
            error: null
        }
    },

    loadOptions: function(input, callback) {
        ajax('/cities?q=' + input).then((cities) => {
            var options = cities.map((item) => {
                return {
                    value: item.city,
                    label: item.city
                }
            });
            callback(null, {
                options: options,
                complete: false
            });
        });
    },

    onFinishSearch: function(val) {
        val = val || { value: '', label: '' };
        this.setState(update(this.state, {
            selectValue: {$set:val}
        }));
    },

    render: function () {

        return (
            <form onSubmit={this.onSubmit} className="new-city">
                <label>
                    <span>New city: </span>
                    <Select.Async
                        name="form-field-name"
                        value={this.state.selectValue}
                        onChange={this.onFinishSearch}
                        multi={false}
                        className="new-city__select"
                        loadOptions={this.loadOptions}
                        />
                    <button type="submit"
                            disabled={this.state.waiting || this.state.selectValue.value === ""}>Add</button>
                    <img src="images/ajax-loader.gif"
                         style={{display:this.state.waiting ? "inline" : "none"}}/>
                </label>
                <p style={{color: 'red'}}>{this.state.error}</p>
            </form>
        )
    }
});