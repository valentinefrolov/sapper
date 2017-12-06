import React from "react";

export default function Cell(props) {
    let className = "board__cell";

    if(props.data.open) className += " board__cell_open";

    if(props.data.open && props.data.level) className += " board__cell_level board__cell_level_" + props.data.level;

    if(props.data.flagged) className += " board__cell_flag";
    if(props.data.pressed) className += " board__cell_pressed";

    if(props.data.status.bomb) className += " board__cell_bomb";
    if(props.data.status.blown) className += " board__cell_blown";
    if(props.data.status.wrong) className += " board__cell_wrong";

    return (
        <div className={className}
             onMouseDown={(e) => props.onMouseDown(e, props.index)}
             onMouseUp={(e) => props.onMouseUp(e, props.index)}
             onMouseOver={(e) => props.onMouseOver(e, props.index)}
             onClick={(e) => {
                 e.preventDefault()
             }}
             onContextMenu={(e) => {
                 e.preventDefault()
             }}
        > </div>
    );
}