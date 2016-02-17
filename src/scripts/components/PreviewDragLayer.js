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
            transform: `translate(${initialOffset.x}px, ${currentOffset.y}px)`,
            border: "0px solid black",
        };

        return (
            <div style={layerStyle}>
                <div style={previewStyle}>

                    <div className="dragable-item">
                        <div className="dragable-item__holder"><i className="icon fa fa-sort"></i></div>
                        <div className="dragable-item__body">
                            <City city={data}
                                  onRemove={() => {}}
                                  onMoveUp={() => {}}
                                  onMoveDown={() => {}}/>
                        </div>
                    </div>

                </div>
            </div>
        )
    }
});


export default DragLayer(collect)(component)