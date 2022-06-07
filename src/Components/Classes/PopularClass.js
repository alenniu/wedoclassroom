import React from 'react';
import { get_full_image_url } from '../../Utils';

import "./PopularClass.css";

const PopularClass = ({_class}) => {
    const {_id, subject, students=[], schedule, tags, max_students=1, cover_image="/Assets/Images/AuthBackground.png"} = _class;
    
    return (
        <div className='popular-class-container'>
            <div className='left-column'>
                <div className='class-image-container'>
                    <img src={get_full_image_url(cover_image)} />
                </div>

                <button className='button primary fullwidth join'>JOIN CLASS</button>
            </div>

            <div className='right-column'>
                <p className='class-subject'>{subject}</p>

                <div className='tags'>{[...tags, ...tags].map((t) => <span key={t} className="class-tag">#{t}</span>)}</div>

                <p className='class-capacity'>{students.length}/{max_students} Students</p>
            </div>
        </div>
    );
}
 
export default PopularClass;