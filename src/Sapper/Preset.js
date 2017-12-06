import React from 'react';

export default function Preset(props) {
    return (
        <button onClick={() => props.onClick(props.data)} className="preset">{props.title}</button>
    );
}