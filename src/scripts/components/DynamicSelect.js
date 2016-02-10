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

import React from 'react';

export default React.createClass({

    getInitialState: function(){
        return {
            text: "",
            focused: false,
            blurDisabled: false,
            highlightedOption: null,
            optionList: [],
            waiting: false
        }
    },

    onFocus: function(e) {
        this.setState({
            focused: true
        })
    },

    onBlur: function(e) {
        if(!this.state.blurDisabled) {
            this.setState({
                focused: false,
                text: "",
                optionList:[],
            })
        }
    },

    onInput: function(e) {
        var newText = e.target.value;
        this.setState({
            text: newText,
            highlightedOption: null,
            waiting: true
        }, () => {
            //todo: handle failed future
            this.props.loadOptions(this.state.text).then(result => {
                this.setState( oldState => {
                    if(oldState.text === newText) {
                        var dedupResult = [];
                        result.forEach((x) => {
                            if(dedupResult.filter((y) => x.value === y.value).length === 0) {
                                dedupResult.push(x)
                            }
                        })
                        return {
                            optionList: dedupResult
                        }
                    }
                    else {
                        return oldState
                    }
                })
            }, (err) => {
                this.setState( oldState => {
                    if(oldState.text === newText) {
                        return {
                            optionList: []
                        }
                    }
                    else {
                        return oldState
                    }
                })
            }).then(() => {
                this.setState({
                    waiting: false,
                })
            });
        });
    },

    onSelect: function(option) {
        this.setState({
            text: "",
            optionList: [],
            blurDisabled: false,
        }, () => {
            this.props.onChange(option)
        })
    },

    onMouseOverOptionList: function() {
        this.setState({
            blurDisabled: true,
        })
    },

    onMouseOutOptionList: function() {
        this.setState({
            blurDisabled: false,
        })
    },

    onMouseOverOption: function(option) {
        this.setState({
            highlightedOption: option,
        })
    },

    onMouseOutOption: function() {
        this.setState({
            highlightedOption: null,
        })
    },    

    onReset: function() {
        this.setState({
            text: "",
            optionList: []
        }, () => {
            if(this.props.onReset) {
                this.props.onReset()
            }
        })
    },

    onKeyDown: function(e) {
        if(e.keyCode === 40) { //down
            this.setState((state) => {
                var optionList = state.optionList;
                var highlightedOption = state.highlightedOption;
                if(optionList.length !== 0) {
                    if(highlightedOption === null) {
                        return {
                            highlightedOption: optionList[0]
                        }
                    }
                    else {
                        for(var i = 0; i < optionList.length; ++i) {
                            if(optionList[i].value === highlightedOption.value) {
                                if(i === optionList.length - 1) {
                                    return {
                                        highlightedOption: optionList[0]
                                    }
                                }
                                else {
                                    return {
                                        highlightedOption: optionList[i+1]
                                    }
                                }
                            }
                        }
                    }
                }
                return state
            })
            e.preventDefault();
        }
        else if(e.keyCode === 38) { //up
            this.setState((state) => {
                var optionList = state.optionList;
                var highlightedOption = state.highlightedOption;
                if(optionList.length !== 0) {
                    if(highlightedOption === null) {
                        return {
                            highlightedOption: optionList[0]
                        }
                    }
                    else {
                        for(var i = 0; i < optionList.length; ++i) {
                            if(optionList[i].value === highlightedOption.value) {
                                if(i === 0) {
                                    return {
                                        highlightedOption: optionList[optionList.length - 1]
                                    }
                                }
                                else {
                                    return {
                                        highlightedOption: optionList[i-1]
                                    }
                                }
                            }
                        }
                    }
                }
                return state
            })
            e.preventDefault();
        }
        else if(e.keyCode === 13) {
            if(this.state.highlightedOption !== null) {
                this.onSelect(this.state.highlightedOption)
            }
            e.preventDefault();
        }
        else if(e.keyCode === 9) {
            if(this.state.highlightedOption !== null) {
                this.onSelect(this.state.highlightedOption)
            }
        }
        else if(e.keyCode === 27) {
            this.onReset();
            e.preventDefault();
        }
    },

    focus: function() {
        this.refs.inp.focus()
    },

    onOptionClick: function(e, option) {
        e.preventDefault()
        this.setState({
            focused: false,
            blurDisabled: false,
        }, () => {
            this.onSelect(option)
        })
    },

    render: function () {
        var className = "dynamic-select";
        if(this.state.focused) {
            className += " dynamic-select--focused"
        }

        var value = this.props.value || {value:"",label:""};

        /* todo: is it save to use symbol like this &#10006; */

        return (
            <div className={className}>
                <div className="dynamic-select__pseudo-input">
                    <div className="dynamic-select__icon">
                    {
                        this.state.waiting
                            ? <i className="fa fa-spinner"></i>
                            : <i className="fa fa-search"></i>
                    }
                    </div>
                    <input tabIndex={this.props.tabIndex}
                           autoComplete="off"
                           autoCorrect="off"
                           autoCapitalize="off"
                           spellCheck="false"
                           id={this.props.id}
                           className="dynamic-select__input"
                           type="text"
                           placeholder={(!this.state.focused && this.state.text === "") ? this.props.placeholder : ""}
                           value={this.state.focused ? this.state.text : value.label}
                           onFocus={this.onFocus}
                           onBlur={this.onBlur}
                           onChange={this.onInput}
                           onClick={this.onClick}
                           onKeyDown={this.onKeyDown}
                           ref="inp"
                    />
                    <div className="dynamic-select__icon" onClick={this.onReset}><i className="fa fa-times"></i></div>
                </div>
                <div className="dynamic-select__option-list" onMouseOver={this.onMouseOverOptionList} onMouseOut={this.onMouseOutOptionList} >
                    {
                        (this.state.optionList.length === 0)
                        ? (<div className="dynamic-select__option dynamic-select__option--nothing-found">Nothing found</div>)
                        : this.state.optionList.map(option => {
                            var className = "dynamic-select__option";
                            if(this.state.highlightedOption !== null && this.state.highlightedOption.value === option.value) {
                                className += " dynamic-select__option--highlighted";
                            }
                            return <div key={option.value}
                                        className={className}
                                        onMouseOver={e => this.onMouseOverOption(option)}
                                        onMouseOut={e => this.onMouseOutOption()}
                                        onClick={e => this.onOptionClick(e, option)}
                                    >{option.label}</div>
                        })
                    }
                </div>
            </div>
        )
    }
});
