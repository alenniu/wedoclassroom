import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import "./Loading.css"

const Loading = ({loading=false}) => {
    // const [showStickers, setShowStickers] = useState(loading);

    useEffect(() => {
        // if(!loading){
        //     showStickers && setTimeout(() => setShowStickers(false), 300);
        // }else{
        //     setShowStickers(true);
        // }
    }, [loading]);

    return (
        <div className={`loading-container ${loading?"show":"hide"}`}>
            <div className='loading-images'>
                <div className='sticker small'>
                    <small className='loading-text'>LOADING</small>
                </div>

                <div className='sticker big'>
                    <small className='loading-text'>LOADING</small>
                    <small className='loading-text wait'>PLEASE WAIT</small>
                </div>
            </div>
        </div>
    );
}

function map_state_to_props({App}){
    return {loading: App.loading}
}
 
export default connect(map_state_to_props)(Loading);