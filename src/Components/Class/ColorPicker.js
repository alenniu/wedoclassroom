import React from 'react';
import { RiCheckboxCircleFill } from 'react-icons/ri';

import "./ColorPicker.css";

const ColorPicker = ({colors=[], value, name, type="text", onChange}) => {
    if(value && (typeof(value) === "string") && !colors.includes(value)){
        colors = [...colors, value];
    }
    const onChangeColor = (color) => {
        typeof(onChange) === "function" && onChange(color, {type, name})
    }

    return (
        <div className='colors-container'>
            {colors.map((c) => {
                const selected = value === c;

                return <span key={c} onClick={() => {onChangeColor(c)}} className={`clickable color ${selected && "selected"}`} style={{backgroundColor: c}}>{selected && <RiCheckboxCircleFill className='checkmark' />}</span>
            })}
        </div>
    );
}
 
export default ColorPicker;