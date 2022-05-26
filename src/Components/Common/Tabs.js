import React, { useCallback, useRef, useState } from 'react';

import "./Tabs.css";

const Tabs = ({tabs=[], index, current_id, horizontal=true, onPressTab}) => {
    const [, updateState] = useState();
    const forceUpdate = useCallback(() => updateState({}), []);
    
    const [tabIndex, setTabIndex] = useState(0);
    const tabWidth = useRef(0);
    const tabX = useRef(-100);

    const current_index = typeof(index) !== "undefined"?index:tabIndex;

    const onRenderCurrentTab = (e) => {
        const {width} = e.target.parentElement.getBoundingClientRect();
        const x = e.target.parentElement.offsetLeft;
        tabWidth.current = width;
        tabX.current = x;

        forceUpdate();
    }

    const _onPressTab = (e:React.MouseEvent<HTMLSpanElement, MouseEvent>, {label, id}, index) => {
        const {width} = e.currentTarget.getBoundingClientRect();
        const x = e.currentTarget.offsetLeft;
        
        tabWidth.current = width;
        tabX.current = x;

        setTabIndex(index);
        typeof(onPressTab) === "function" && onPressTab(e, {label, id}, index);
    } 

    return (
        <div className={`tabs-container ${horizontal?"horizontal":"vertical"}`}>
            {tabs.map((tab, i) => {
                const {label, id} = tab;
                const is_current = (current_index === i);

                return(
                    <span key={id+i} className={`tab ${is_current?"active":"inactive"} clickable`} onClick={(e) => {_onPressTab(e, tab, i)}}>{label} <img src="" style={{display: "none"}} onError={(is_current && !tabWidth.current)?onRenderCurrentTab:undefined} /></span>
                )
            })}
            <div className='tab-indicator' style={{transform: `translate(calc(${tabX.current + (tabWidth.current/2)}px - 50%))`}} />
        </div>
    );
}
 
export default Tabs;