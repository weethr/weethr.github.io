/**
 * Copyright (c) 2016 Nikolai Mavrenkov <koluch@koluch.ru>
 *
 * Distributed under the MIT License (See accompanying file LICENSE or copy at http://opensource.org/licenses/MIT).
 *
 * Created: 14.02.2016 14:34
 */
import React from 'react'
import {DragSource, DropTarget} from 'react-dnd'
import strftime from 'strftime'

const ITEM_TYPE =  "drag_types_city" //todo: get from props?


const component = React.createClass({
    render: function() {
        const {connectDragSource, connectDropTarget, isDragging} = this.props

        return connectDragSource(connectDropTarget(
            <div className="dragable" style={{opacity: isDragging ? 0.1 : 1}}>
                {
                    this.props.children
                }
            </div>
        ))
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
        var dragI = monitor.getItem().index;
        var currentI = props.index;
        console.log("on hover", dragI, currentI);
    },

    drop: (props, monitor, component) => {
        console.log("on drop: not implemented");
    },
};

const targetCollect = (connect, monitor) => ({
    connectDropTarget: connect.dropTarget(),
})

var targeted = DropTarget(ITEM_TYPE, targetSpec, targetCollect)(sourced);

export default targeted


