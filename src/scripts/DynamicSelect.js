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
            value: "",
            focused: false,
            options: []
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

    onInput: function(e) {

        var newValue = e.target.value;
        this.setState(update(this.state, {
            value: {$set: newValue}
        }), () => {
            //todo: handle failed future
            this.props.loadOptions(this.state.value).then(result => {
                this.setState( oldState => {
                    if(oldState.value === newValue) {
                        var dedupResult = [];
                        result.forEach((x) => {
                            if(dedupResult.filter((y) => x.label === y.label).length === 0) {
                                dedupResult.push(x)
                            }
                        })

                        return update(oldState, {
                            options: {$set: dedupResult}
                        })
                    }
                    else {
                        return oldState
                    }
                })
            });
        });
    },

    onSelect: function(option) {
        if(this.props.onChange) {
            this.props.onChange(option)
        }
        this.setState(update(this.state, {
            focused: {$set: false},
            value: {$set: option.label},
        }))
    },

    render: function () {

        var className = "dynamic-select";
        if(this.state.focused) {
            className += " dynamic-select--focused"
        }

        //todo: check default option text
        return (
            <div className={className}>
                <input className="dynamic-select__input" type="text" value={this.value} onFocus={this.onFocus} onBlur={this.onBlur} onChange={this.onInput}/>
                <div className="dynamic-select__options">
                    {
                        (this.state.options.length === 0)
                        ? (<div className="dynamic-select__options__option">Begin input city name</div>)
                        : this.state.options.map(option => {
                            return <div key={option.label} className="dynamic-select__options__option" onClick={() => this.onSelect(option)}>{option.label}</div>
                        })
                    }
                </div>
            </div>
        )
    }
});
