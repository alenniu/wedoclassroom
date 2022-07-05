import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {RiArrowDownSLine} from "react-icons/ri";

import "./TypeSelect.css";

const ARROW_UP = 38;
const ARROW_DOWN = 40;
const ARROW_LEFT = 37;
const ARROW_RIGHT = 39;

const KEY_ENTER = 13;
const KEY_SHIFT = 16;
const KEY_ESCAPE = 27;

const TypeSelect = ({options=[], value, textValue, placeholder="Select", disabled=false, onChange, onChangeText, renderOption, renderSelected, placeholderAsOption=true, DrowDownIcon=RiArrowDownSLine }) => {
    const [open, setOpen] = useState(false);
    const [text, setText] = useState("");
    const [currentValue, setCurrentValue] = useState(undefined);
    const [suggestionIndex, setSuggestionIndex] = useState(-1);

    const inputRef = useRef(null);
    const containerRef = useRef(null);

    const usedValue = value || currentValue;
    const usedText = textValue || text;

    const selected_option = options.find((o) => o.value === usedValue);

    const incrementSuggestionIndex = () => {
        setSuggestionIndex((i) => (i===(options.length-1)) ? 0 : i+1);
    }
    
    const decrementSuggestionIndex = () => {
        setSuggestionIndex((i) => i ? Math.max(0, i-1) : options.length-1);
    }

    const openSelect = () => setOpen(!disabled);
    const closeSelect = () => setOpen(false);

    const onClickOutside = (e) => {
        if(!containerRef.current?.contains(e.target)){
            closeSelect()
        }
    }
    
    const onNewText = (e) => {
        const {value} = e.target;
        
        setText(value);
        (typeof(onChangeText) === "function") && onChangeText(e, value);
    }
    
    const onSelectValue = (value, index) => {
        setCurrentValue(value);
        (typeof(onChange) === "function") && onChange(value, index);
        
        closeSelect();
    }

    const onKeyPress = (e: React.KeyboardEvent) => {
        // console.log(e);
        switch (e.which){
            case ARROW_UP:
                decrementSuggestionIndex();
            break;

            case ARROW_DOWN:
                incrementSuggestionIndex();
            break;

            case KEY_ESCAPE:
                closeSelect();
            break;

            case KEY_ENTER:
                const value = options[suggestionIndex].value;
                onSelectValue(value, suggestionIndex);
            break;
        }
    }
    
    useEffect(() => {
        window.addEventListener("click", onClickOutside);
        
        return () => {
            window.removeEventListener("click", onClickOutside);
        }
    }, []);
    
    useEffect(() => {
        if(!open){
            inputRef.current?.blur();
            setSuggestionIndex(-1);
            onNewText({target: {value: ""}});
        }
        
        if(open){
            inputRef.current?.focus()
        }
    }, [open]);
    
    const toggleSelect = () => {
        !disabled && setOpen(o => !o);
    }
    
    const renderSel = (option) => {
        const {label, value} = option;
        const render = (typeof(renderOption) === "function") && renderSelected;
        
        return <span className='option selected'>{render?render(option):label}</span>
    };

    const Option = ({option, index}) => {
        const {label, value} = option;
        const render = (typeof(renderOption) === "function") && renderOption;
        const suggested = index === suggestionIndex;

        if(placeholderAsOption && (index === 0)){
            return <span key={value} className={`option clickable ${suggested?"suggested":""}`} onClick={() => onSelectValue(value, index)}>{label}</span>    
        }

        return <span key={value} className={`option clickable ${suggested?"suggested":""}`} onClick={() => onSelectValue(value, index)}>{render?render(option):label}</span>
    };


    return (
        <div ref={containerRef} className={`type-select-container ${open?"open":"close"} ${disabled?"disabled":""}`}>
            <div className='input-container'>
                <input type="text" disabled={disabled} value={usedText} ref={inputRef} onChange={onNewText} onFocus={openSelect} placeholder={!selected_option && placeholder} onKeyDown={onKeyPress} />

                {!open && selected_option && renderSel(selected_option)}

                <div className='input-adornment end clickable' style={{backgroundColor: "transparent"}} onClick={toggleSelect}>
                    <DrowDownIcon size={"16px"} pointerEvents="none" />
                </div>
            </div>

            {open && <div className='options-container'>{(placeholderAsOption?[{label: placeholder, value: null}, ...options]:options).map((o, i) => <Option option={o} index={i} />)}</div>}
        </div>
    );
}
 
export default TypeSelect;