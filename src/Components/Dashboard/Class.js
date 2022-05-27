import React from 'react';

import "./Class.css"

const Class = ({_class={}, index=0}) => {
    const {subject, image="/Assets/Images/AuthBackground.png"} = _class
    return ( 
        <div className='dashboard-class-container'>
            <p className='class-subject'>{subject}</p>
            <p className='class-schedule'><span>Thursday</span> <span>7-9PM</span></p>
            
            <div className='class-image'>
                <img src={image} />
            </div>
        </div>
    );
}
 
export default Class;