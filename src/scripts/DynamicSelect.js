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
            blurDisabled: false,
            highlightedOption: null,
            options: []
        }
    },

    onFocus: function(e) {
        this.setState(update(this.state, {
            focused: {$set: true}
        }))
    },

    onBlur: function(e) {
        if(!this.state.blurDisabled) {
            this.setState(update(this.state, {
                focused: {$set: false}
            }))
        }
        else {
            this.setState(update(this.state, {
                focused: {$set: true}
            }))
        }
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
        this.setState(update(this.state, {
            value: {$set: option.label},
            blurDisabled: {$set: false},
            focused: {$set: false},
        }), () => {
            this.props.onChange(option)
            this.refs["inp"].blur()
        })
    },

    onMouseOverOptionList: function() {
        this.setState(update(this.state, {
            blurDisabled: {$set: true},
        }))
    },

    onMouseOutOptionList: function() {
        this.setState(update(this.state, {
            blurDisabled: {$set: false},
        }))
    },

    onMouseOverOption: function(option) {
        console.log("highlight", option)
        this.setState(update(this.state, {
            highlightedOption: {$set: option},
        }))
    },

    onMouseOutOption: function() {
        console.log("highlight off")
        this.setState(update(this.state, {
            highlightedOption: {$set: null},
        }))
    },    
    
    render: function () {

        console.log("render!")
        console.log(this.state)

        var className = "dynamic-select";
        if(this.state.focused) {
            className += " dynamic-select--focused"
        }

        //todo: check default option text
        return (
            <div className={className}>
                <input className="dynamic-select__input"
                       type="text"
                       value={this.state.value}
                       onFocus={this.onFocus}
                       onBlur={this.onBlur}
                       onChange={this.onInput}
                       onClick={this.onClick}
                        />
                <div className="dynamic-select__options" onMouseOver={this.onMouseOverOptionList} onMouseOut={this.onMouseOutOptionList} >
                    {
                        (this.state.options.length === 0)
                        ? (<div className="dynamic-select__options__option">Begin input city name</div>)
                        : this.state.options.map(option => {
                            var className = "dynamic-select__options__option";
                            if(this.state.highlightedOption) {
                                console.log(this.state.highlightedOption.label, "!=", option.label)
                            }
                            if(this.state.highlightedOption !== null && this.state.highlightedOption.value === option.value) {
                                className += " dynamic-select__options__option--highlighted";
                            }
                            return <div key={option.label}
                                        className={className}
                                        onMouseOver={e => this.onMouseOverOption(option)}
                                        onMouseOut={e => this.onMouseOutOption()}
                                        onClick={(e) => {e.preventDefault();this.onSelect(option)}}
                                    >{option.label}</div>
                        })
                    }
                </div>
            </div>
        )
    }
});
