import React, { Component, useEffect, useRef, useState } from 'react';
import "./ListInput.css";

const KEY_ENTER = 13;

const ListInput = ({items=[], renderItem, search_array=[], search_property="", render_property, always_show_matches=false, localSearch=true, allowOnlySearchResults=false, className, match_button_container_classname, match_button_classname, item_container_className="", item_button_className="", remove_button_className="", add_button_container_className="", add_button_className="", save_button_container_className="", save_button_className="", cancel_button_container_className="", cancel_button_className="", input_container_className="", input_className="", add_input_type="text", disabled=false, onAddItem, onRemoveItem, disableAdding=false}) => {
    const search_prop = search_property;
    const render_prop = render_property;

    const [matches, setMatches] = useState([]);
    const [typing, setTyping] = useState(false);
    const [matchSelected, setMatchSelected] = useState(false);
    const [addInputValue, setAddInputValue] = useState("");
    const [pressIndex, setPressedIndex] = useState(-1);

    const addInputRef = useRef(null);

    const type_search = () => {
        const regex = new RegExp(`^${addInputValue}`, "i");
        console.log(search_array);
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
            setTyping(true);
        }else{
            setMatches([]);
        }
    }

    useEffect(() => {
        if(typing){
            addInputRef.current?.focus()
            type_search();
        }
    }, [addInputValue, typing]);

    const onChange_add_input_text = ({target: {value:new_value}}) => {
        setMatchSelected(false);
        setAddInputValue(new_value);
    }

    const onPress_item = (i) => {
        setPressedIndex(i);
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
                onAddItem(search_prop?item[search_prop]:item);
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
                            <span className={`item-button-text `}>{render_prop?item[render_prop].toString():item.toString()}</span>
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
                        <span className={`item-button-text `}>{render_prop?item[render_prop].toString():item.toString()}</span>
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
            {((matches.length > 0 && typing)&&!matchSelected)?<div className="search-matches-container">
                {matches.map((match, i) => {
                    return (
                        <div className={`match-item-container ${match_button_container_classname}`}>
                            <button className={`match-item-button ${match_button_classname}`} onClick={() => onPress_match(match)}>
                                <span className={"match-item-text"}>{search_prop?match[search_prop]:match}</span>
                            </button>
                        </div>
                    )
                })
                }
            </div>:null}
        </>
    );
}

// class ListInput extends Component {
//     state = { pressed_index: -1, typing: false, add_input_value: "", match_selected: false, matches: []}

//     constructor(props){
//         super(props);
//         this.onPress_add = this.onPress_add.bind(this);
//         this.onPress_item = this.onPress_item.bind(this);
//         this.onPress_cancel = this.onPress_cancel.bind(this);
//         this.onPress_remove = this.onPress_remove.bind(this)
//         this.onPress_add_item = this.onPress_add_item.bind(this);
//         this.onPress_match = this.onPress_match.bind(this);
//         this.onChange_add_input_text = this.onChange_add_input_text.bind(this);
//     }

//     type_search(){
//         const {search_array=[], search_property} = this.props;
//         const {add_input_value} = this.state;
//         const regex = new RegExp(`^${add_input_value}`, "i");
        
//         const matches = search_array.filter((item,i)=>{
//             const regex_matches = search_property?item[search_property].match(regex):item.match(regex);
            
//             if(regex_matches){
//                 return true;
//             }else{
//                 return false;
//             }
//         });

//         if(matches){
//             this.setState({matches, typing: true});
//         }else{
//             this.setState({matches: []});
//         }

//         // alert(match);
//     }

//     onChange_add_input_text({target: {value:new_value}}){
//         this.setState({add_input_value: new_value, match_selected: false}, ()=>{
//             this.type_search();
//         });
//     }

//     onPress_item(i){
//         this.setState({pressed_index: i})
//     }

//     onPress_add(){
//         this.setState({typing: true, add_input_value: ""}, ()=>{this.add_input.focus(); this.type_search()});
//     }

//     onPress_add_item(){
//         const {onAddItem} = this.props;
//         const {match_selected, add_input_value} = this.state;
//         // if(match_selected){
//             if(onAddItem && typeof onAddItem === "function"){
//                 onAddItem(add_input_value);
//                 // console.log("item added");
//             }
//             this.setState({typing: false, match_selected: false, add_input_value: ""});
//         // }
//     }

//     onPress_match(item){
//         const {onAddItem, search_prop} = this.props;
//         // if(match_selected){
//             if(onAddItem && typeof onAddItem === "function"){
//                 onAddItem(search_prop?item[search_prop]:item);
//                 // console.log("item added");
//             }
//             this.setState({typing: false, match_selected: false, add_input_value: ""});
//         // }
//     }

//     onPress_cancel(){
//         const {always_show_matches=false} = this.props;
//         const {matches} = this.state;

//         this.setState({typing: false, add_input_value: "", matches: always_show_matches?matches:[]});
//     }

//     onPress_remove(e){
//         e.preventDefault();
        
//         const {onRemoveItem, items=[], disabled=false} = this.props;
//         const {pressed_index} = this.state;

//         if(onRemoveItem && typeof(onRemoveItem) === typeof(Function) && !disabled){
//             onRemoveItem(pressed_index, items[pressed_index])
//         }
//     }

//     onPressEnter = () => {
//         const {onAddItem, allowOnlySearchResults=false} = this.props;
//         const {match_selected, add_input_value} = this.state;
//         if(!allowOnlySearchResults || match_selected){
//             if(onAddItem && typeof onAddItem === "function"){
//                 onAddItem(add_input_value);
//                 // console.log("item added");
//             }
//             this.setState({typing: false, add_input_value: ""});
//         }
//     }

//     render_items(){
//         const {pressed_index} = this.state;
//         const {items=[], item_container_className="", item_button_className="", remove_button_className="", render_property:render_prop, disabled=false} = this.props;

//         return items.map((item, i) => {
//             if(pressed_index === i){
//                 return (
//                     <div className={`item-container ${item_container_className} selected`} key={render_prop?item[render_prop]:item}>
//                         <div className={`item-button-container ${item_button_className}`}>
//                         <button className={`item-button ${item_button_className}`} onClick={()=>{this.onPress_item(-1)}}>
//                             <span className={`item-button-text `}>{render_prop?item[render_prop].toString():item.toString()}</span>
//                         </button>
                        
//                         <button className={`remove-button ${remove_button_className}`} type="button" onClick={this.props.disabled === true?(e)=>{e.preventDefault()}:this.onPress_remove}>
//                             <span className={`remove-button-text`}>X</span>
//                         </button>
//                         </div>
//                     </div>
//                 );
//             }

//             return (
//                 <div className={`item-container item-button-container ${item_container_className}`} key={render_prop?item[render_prop]:item}>
//                     <button className={`item-button ${item_button_className}`} onClick={()=>{this.onPress_item(i)}}>
//                         <span className={`item-button-text `}>{render_prop?item[render_prop].toString():item.toString()}</span>
//                     </button>
//                 </div>
//             )
//         });
//     }

//     render_add(){
//         const {typing, add_input_value} = this.state;
//         const {add_button_container_className="", add_button_className="", save_button_container_className="", save_button_className="", cancel_button_container_className="", cancel_button_className="", input_container_className="", input_className="", add_input_type="text"} = this.props;

//         if(typing){
//             return (
//                 <div className={`add-input-container ${input_container_className}`}>

//                     <div className={`cancel-button-container ${cancel_button_container_className}`}>
//                         <button className={`cancel-button ${cancel_button_className}`} onClick={this.onPress_cancel}>
//                             <span className={`cancel-button-text`}>x</span>
//                         </button>
//                     </div>

//                     <input className={`add-input ${input_className}`} onChange={this.onChange_add_input_text} onKeyDown={(e) => {if(e.which === KEY_ENTER){this.onPressEnter()}}} value={add_input_value} ref={(input) => {this.add_input = input}} style={{width: `${add_input_value.length + 2}ch`}} type={add_input_type} />

//                     <div className={`save-button-container ${save_button_container_className}`}>
//                         <button className={`save-button ${save_button_className}`} onClick={this.onPress_add_item}>
//                             <span className={`save-button-text`}>+</span>
//                         </button>
//                     </div>

//                 </div>
//             );
//         }else{
//             return (
//                 <div className={`add-button-container ${add_button_container_className}`} /* style={add_style} */>
//                     <button className={`add-button ${add_button_className}`} onClick={this.onPress_add}>
//                         <span className={`add-button-text`}>+</span>
//                     </button>
//                 </div>
//             );
//         }
//     }

//     render() {
//         const {matches, typing, match_selected} = this.state;
//         const {search_property:search_prop, always_show_matches=false, className="", match_button_container_classname="", match_button_classname="", disabled=false} = this.props;
//         return (
//             <>
//                 <div className={`selected-values-container ${className}`}>
//                     {this.render_items()}
//                     {!disabled && this.render_add()}
//                 </div>
//                 {((matches.length > 0 && typing)&&!match_selected)?<div className="search-matches-container">
//                     {matches.map((match, i) => {
//                         return (
//                             <div className={`match-item-container ${match_button_container_classname}`}>
//                                 <button className={`match-item-button ${match_button_classname}`} onClick={() => this.onPress_match(match)}>
//                                     <span className={"match-item-text"}>{search_prop?match[search_prop]:match}</span>
//                                 </button>
//                             </div>
//                         )
//                     })
//                     }
//                 </div>:null}
//             </>
//         );
//     }
// }

export {ListInput};