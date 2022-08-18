import React, { forwardRef, useEffect, useState } from 'react';

import "./InfiniteScroller.css";

const InfiniteScroller = forwardRef(({children, onLayout, loadNext, loadPrev, horizontal=false, height=0, width=0, loadScrollPadding=20}, ref) => {
    const [loading, setLoading] = useState(false);

    async function onScroll(e: React.UIEvent<HTMLDivElement, UIEvent>){
        const {scrollTop, scrollLeft, scrollHeight, scrollWidth, clientHeight, clientWidth} = e.target;
        
        const deltaY = scrollHeight - (scrollTop + clientHeight);
        const deltaX = scrollWidth - (scrollLeft + clientWidth);

        if(deltaY <= loadScrollPadding && !horizontal){
            typeof(loadNext) === "function" && loadNext();
        }
        
        if(deltaX <= loadScrollPadding && horizontal){
            typeof(loadNext) === "function" && loadNext();
        }

        console.log({deltaX, deltaY, scrollTop, scrollLeft, scrollWidth, scrollHeight})
    }

    const onSize = (e) => {
        const {innerWidth, innerHeight, scrollY, scrollX} = window;
        const { x, y, top, left, width, height, } = ref.current.getBoundingClientRect();
        
        typeof(onLayout) === "function" && onLayout({pageOffsetY: top+scrollY, pageOffsetX: left+scrollX, top, left, width, height, windowWidth: innerWidth, windowHeight: innerHeight});
    }

    useEffect(() => {
        onSize();

        window.addEventListener("resize", onSize);

        return () => {
            window.removeEventListener("resize", onSize);
        }
    }, []);

    return (
        <div style={{paddingInline: 5, width: width || "unset", height: height || "unset"}} onScroll={onScroll} className='infinite-scroll-container' ref={ref}>
            {children}
        </div>
    );
})
 
export {InfiniteScroller};