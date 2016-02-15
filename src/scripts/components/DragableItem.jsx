/**
 * Copyright (c) 2016 Nikolai Mavrenkov <koluch@koluch.ru>
 *
 * Distributed under the MIT License (See accompanying file LICENSE or copy at http://opensource.org/licenses/MIT).
 *
 * Created: 14.02.2016 14:34
 */
import React from 'react'
import {findDOMNode} from 'react-dom'
import {DragSource, DropTarget} from 'react-dnd'
import strftime from 'strftime'

const ITEM_TYPE =  "drag_types_city" //todo: get from props?


const component = React.createClass({
    render: function() {
        const {connectDragSource, connectDropTarget, isDragging, offset} = this.props

        let className = "dragable-item"
        if(isDragging) {
            className += " dragable-item--dragging"
        }

        var previewStyle = {
            display:isDragging ? "block" : "none",
            position: "absolute",
            top: offset + "px",
            left: "0",
            "box-shadow": "0 0 10px black",
        };
        return (
            <div style={{position:"relative"}}>
                {
                    connectDragSource(connectDropTarget(
                        <div className={className}>
                            {
                                this.props.children
                            }
                        </div>
                    ))
                }
                {
                    <div style={previewStyle}>
                        {
                            this.props.children
                        }
                    </div>
                }
            </div>
        )

    }
});

/*
    Source props
 */

const sourceSpec = {
    beginDrag: (props, monitor, component) => {
        return {item: props.item, index: props.index}
    },

    endDrag: (props, monitor, component) => {
        console.log("endDrag: not imlemented");
    },
};

const sourceCollect = (connect, monitor) => ({
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging(),
})

var sourced = DragSource(ITEM_TYPE, sourceSpec, sourceCollect)(component);

/*
    Target props
 */


const targetSpec = {
    hover: (props, monitor, component) => {
        const dragI = monitor.getItem().index;
        const currentI = props.index;

        const componentRect = findDOMNode(component).getBoundingClientRect();
        const middleY = componentRect.bottom - (componentRect.height / 2)

        const mouseY = monitor.getClientOffset().y;

        if (dragI > currentI && mouseY < middleY
          || dragI < currentI && mouseY > middleY ) {
            props.onSwap(dragI, currentI)
            monitor.getItem().index = currentI
        }

    },

    drop: (props, monitor, component) => {
        console.log("on drop: not implemented");
    },
};

const targetCollect = (connect, monitor) => {
    var offset = 0
    if(monitor.isOver()) {
        var y = monitor.getClientOffset().y;
        var initY = monitor.getInitialClientOffset().y;
        offset = y - initY
    }
    return {
        connectDropTarget: connect.dropTarget(),
        offset: offset,
    }
}

var targeted = DropTarget(ITEM_TYPE, targetSpec, targetCollect)(sourced);

export default targeted


