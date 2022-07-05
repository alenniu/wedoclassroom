import React from 'react';
import { get_full_image_url } from '../../Utils';

import "./Class.css"

const Class = ({_class={}, index=0}) => {
    const {subject, cover_image="/Assets/Images/AuthBackground.png", current_session} = _class;

    return ( 
        <div className='dashboard-class-container'>
            <p className='class-subject'>{subject}</p>
            <p className='class-schedule'><span>Thursday</span> <span>7-9PM</span></p>
            
            <div className='class-image'>
                <img src={get_full_image_url(cover_image)} />
            </div>

            {current_session && <div className='active-class' />}
        </div>
    );
}
 
export default Class;