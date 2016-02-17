"use strict";
/**
 * Copyright (c) 2015 Nikolai Mavrenkov <koluch@koluch.ru>
 *
 * Distributed under the MIT License (See accompanying file LICENSE or copy at http://opensource.org/licenses/MIT).
 *
 * Created: 09.12.2015 22:31
 */

import React from 'react'

import City from './City'
import DragableItem from './DragableItem'

export default React.createClass({
    onRemove: function(name) {
        return () => {
            this.props.onRemove(name)
        }
    },

    render: function () {

        return (
            <div className="city-list">
                {
                    this.props.data.length > 0
                    ? this.props.data.map((city, i) => {
                        return (
                            <DragableItem key={city.name}
                                          item={city}
                                          index={i}
                                          onSwap={this.props.onSwap}>
                                <City city={city}
                                      onRemove={this.onRemove}
                                      displayMode={this.props.displayMode}/>
                            </DragableItem>
                        )
                    })
                    : <div className="city-list__empty">There are no cities added yet</div>
                }
            </div>
        )
    }
});
