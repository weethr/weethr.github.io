"use strict";
/**
 * Copyright (c) 2015 Nikolai Mavrenkov <koluch@koluch.ru>
 *
 * Distributed under the MIT License (See accompanying file LICENSE or copy at http://opensource.org/licenses/MIT).
 *
 * Created: 09.12.2015 22:31
 */

import React from 'react'

import {fetchCityList} from '../data_access'
import DynamicSelect from './DynamicSelect'

export default React.createClass({

    onSubmit: function (e) {
        e.preventDefault();
        this.onAdd();
        return false;
    },

    onAdd: function () {

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
        return fetchCityList(input).then((cities) => (
            cities.map((city) => (
                {
                    value: city.name,
                    label: city.name
                }
            ))
        ))
    },

    onFinishSearch: function(selectedOption) {
        this.setState({
            selectValue: selectedOption
        }, () => {
            this.onAdd()
        })
    },

    onSelectReset: function() {
        this.setState({
            selectValue: null
        })
    },

    render: function () {

        //todo: change placeholder text
        return (
            <div className="new-city">
                <form onSubmit={this.onSubmit} className="new-city__form">
                    <div className="new-city__item">
                        <label htmlFor="city">
                            <span>Add city: </span>
                        </label>
                    </div>
                    <div className="new-city__item">
                        <DynamicSelect id="city"
                                       loadOptions={this.loadOptions}
                                       value={this.state.selectValue}
                                       onReset={this.onSelectReset}
                                       onChange={this.onFinishSearch}
                                       placeholder="Begin writing city name"
                                       ref="select"
                                       tabIndex="1"
                        />
                    </div>
                    <div className="new-city__item new-city__item--empty" style={{display:this.state.waiting ? "inherit" : "none"}} >
                        <div  className="new-city__loader">
                            <i className="dynamic-select__state-icon fa fa-spinner"></i>
                        </div>
                    </div>
                </form>
                {
                    this.state.error
                      ? <div className="error">{this.state.error}</div>
                      : null
                }
            </div>

        )
    }
});
