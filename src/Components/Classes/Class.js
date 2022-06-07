import React from 'react';
import { get_full_image_url } from '../../Utils';

import "./Class.css";

const Class = ({_class}) => {
    const {_id, students=[], subject, schedule={}, max_students=1, tags=[], cover_image="/Assets/Images/support-badge.svg"} = _class;

    const {daily_start_time=7, daily_end_time=9} = schedule;
    
    return (
        <div className='classes-class-container'>
            <div className='class-image-container'>
                <img src={get_full_image_url(cover_image)} />
            </div>

            <div className='subject-tags-container'>
                <p className='class-subject'>{subject}</p>

                <div className='tags'>{[...tags, ...tags].map((t) => <span key={t} className="class-tag">#{t}</span>)}</div>
            </div>

            <div className='schedule-join-container'>
                <p className='class-schedule'>{daily_start_time} - {daily_end_time}PM</p>

                <button className='button primary join'>JOIN</button>
            </div>
        </div>
    );
}
 
export default Class;