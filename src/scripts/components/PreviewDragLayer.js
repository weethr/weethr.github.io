"use strict";
/**
 * Copyright (c) 2016 Nikolai Mavrenkov <koluch@koluch.ru>
 *
 * Distributed under the MIT License (See accompanying file LICENSE or copy at http://opensource.org/licenses/MIT).
 *
 * Created: 17.02.2016 20:27
 */
import React from 'react'
import {DragLayer} from 'react-dnd'

import City from './City'

var collect = (monitor) => ({
    item: monitor.getItem(),
    isDragging: monitor.isDragging(),
    initialOffset: monitor.getInitialSourceClientOffset(),
    currentOffset: monitor.getSourceClientOffset(),
});


var component = React.createClass({


    render: function() {
        if(!this.props.isDragging || !this.props.currentOffset) {
            return null;
        }

        const {item, isDragging, initialOffset, currentOffset, } = this.props;
        const {data} = item

        const layerStyle = {
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            display: isDragging ? "block" : "none",
            cursor: "move",
        };

        const previewStyle = {
            transform: `translate(${currentOffset.x}px, ${currentOffset.y}px)`
        };

        return (
            <div style={layerStyle}>
                <div style={previewStyle}>
                    <City city={data}
                          onRemove={() => {}}
                          onMoveUp={() => {}}
                          onMoveDown={() => {}}/>
                </div>
            </div>
        )
    }
});


export default DragLayer(collect)(component)