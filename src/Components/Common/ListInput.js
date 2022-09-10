import React, { Component, useEffect, useRef, useState } from 'react';
import "./ListInput.css";

const KEY_ENTER = 13;

const ListInput = ({items=[], search_array=[], search_property="", render_property, always_show_matches=false, localSearch=true, allowOnlySearchResults=false, className, match_button_container_classname, match_button_classname, item_container_className="", item_button_className="", remove_button_className="", add_button_container_className="", add_button_className="", save_button_container_className="", save_button_className="", cancel_button_container_className="", cancel_button_className="", input_container_className="", input_className="", add_input_type="text", disabled=false, onAddItem, onRemoveItem, disableAdding=false, RenderItem, RenderSuggestion, onChangeText}) => {
    const search_prop = search_property;
    const render_prop = render_property;

    const [matches, setMatches] = useState([]);
    const [typing, setTyping] = useState(false);
    const [matchSelected, setMatchSelected] = useState(false);
    const [addInputValue, setAddInputValue] = useState("");
    const [pressIndex, setPressedIndex] = useState(-1);

    const addInputRef = useRef(null);

    const type_search = () => {
        if(localSearch){
            const regex = new RegExp(`^${addInputValue}`, "i");
            // console.log(search_array);
            const matches = search_array.filter((item,i)=>{
                const regex_matches = search_prop?item[search_prop].match(regex):item.match(regex);
                
                if(regex_matches){
                    return true;
                }else{
                    return false;
                }
            });
    
            if(matches){
                setMatches(matches)
            }else{
                setMatches([]);
            }
        }
        setTyping(true);
    }

    useEffect(() => {
        if(typing){
            addInputRef.current?.focus()
            type_search();
        }
    }, [addInputValue, typing]);

    const onChange_add_input_text = (e) => {
        const {value} = e.target;
        setMatchSelected(false);
        setAddInputValue(value);
        typeof(onChangeText) === "function" && onChangeText(e);
    }

    const onPress_item = (i) => {
        !disabled && setPressedIndex(i);
    }

    const onPress_add = () => {
        setTyping(true);
        setAddInputValue("");
    }

    const onPress_add_item = () => {
        // if(match_selected){
            if(onAddItem && typeof onAddItem === "function"){
                onAddItem(addInputValue);
                // console.log("item added");
            }
            setTyping(false);
            setMatchSelected(false);
            setAddInputValue(false);
        // }
    }

    const onPress_match = (item) => {
        // if(match_selected){
            if(onAddItem && typeof onAddItem === "function"){
                onAddItem(item);
                // console.log("item added");
            }
            setTyping(false);
            setMatchSelected(false);
            setAddInputValue("");
        // }
    }

    const onPress_cancel = () => {
        setTyping(false);
        setAddInputValue("");
        setMatches(always_show_matches?matches:[]);
    }

    const onPress_remove = (e) => {
        e.preventDefault();

        if(onRemoveItem && typeof(onRemoveItem) === "function" && !disabled){
            onRemoveItem(pressIndex, items[pressIndex])
        }
    }

    const onPressEnter = () => {
        if(!allowOnlySearchResults || matchSelected){
            if(onAddItem && typeof onAddItem === "function"){
                onAddItem(addInputValue);
                // console.log("item added");
            }
            setTyping(false);
            setAddInputValue("");
        }
    }

    const render_items = () => {
        return items.map((item, i) => {
            if(pressIndex === i){
                return (
                    <div className={`item-container ${item_container_className} selected`} key={render_prop?item[render_prop]:item}>
                        <div className={`item-button-container ${item_button_className}`}>
                            <button className={`item-button ${item_button_className}`} onClick={()=>{onPress_item(-1)}}>
                                {typeof(RenderItem) === "function"?(
                                    <RenderItem item={item} />
                                ):(
                                    <span className={`item-button-text `}>{render_prop?item[render_prop].toString():item.toString()}</span>
                                )}
                            </button>
                        
                            <button className={`remove-button ${remove_button_className}`} type="button" onClick={disabled === true?(e)=>{e.preventDefault()}:onPress_remove}>
                                <span className={`remove-button-text`}>X</span>
                            </button>
                        </div>
                    </div>
                );
            }

            return (
                <div className={`item-container item-button-container ${item_container_className}`} key={render_prop?item[render_prop]:item}>
                    <button className={`item-button ${item_button_className}`} onClick={()=>{onPress_item(i)}}>
                        {typeof(RenderItem) === "function"?(
                            <RenderItem item={item} />
                        ):(
                            <span className={`item-button-text `}>{render_prop?item[render_prop].toString():item.toString()}</span>
                        )}
                    </button>
                </div>
            )
        });
    }

    const render_add = () => {
        if(typing){
            return (
                <div className={`add-input-container ${input_container_className}`}>

                    <div className={`cancel-button-container ${cancel_button_container_className}`}>
                        <button className={`cancel-button ${cancel_button_className}`} onClick={onPress_cancel}>
                            <span className={`cancel-button-text`}>x</span>
                        </button>
                    </div>

                    <input className={`add-input ${input_className}`} onChange={onChange_add_input_text} onKeyDown={(e) => {if(e.which === KEY_ENTER){onPressEnter()}}} value={addInputValue} ref={addInputRef} style={{width: `${addInputValue.length + 2}ch`}} type={add_input_type} />

                    <div className={`save-button-container ${save_button_container_className}`}>
                        <button className={`save-button ${save_button_className}`} onClick={onPress_add_item}>
                            <span className={`save-button-text`}>+</span>
                        </button>
                    </div>

                </div>
            );
        }else{
            return (
                <div className={`add-button-container ${add_button_container_className}`} /* style={add_style} */>
                    <button className={`add-button ${add_button_className}`} onClick={onPress_add}>
                        <span className={`add-button-text`}>+</span>
                    </button>
                </div>
            );
        }
    }

    return (
        <>
            <div className={`selected-values-container ${className}`}>
                {render_items()}
                {(!disabled && !disableAdding) && render_add()}
            </div>
            {((((localSearch && matches.length) || search_array.length) > 0 && typing)&&!matchSelected)?<div className="search-matches-container">
                {(localSearch?matches:search_array).map((match, i) => {
                    return (
                        <div key={search_array?match[search_prop]:match} className={`match-item-container ${match_button_container_classname}`}>
                            <button className={`match-item-button ${match_button_classname}`} onClick={() => onPress_match(match)}>
                            {typeof(RenderSuggestion) === "function"?(
                                <RenderSuggestion item={match} />
                            ):(
                                <span className={"match-item-text"}>{search_prop?match[search_prop]:match}</span>
                            )}
                            </button>
                        </div>
                    )
                })
                }
            </div>:null}
        </>
    );
}

export {ListInput};