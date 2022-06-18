import React from 'react';
import { get_full_image_url } from '../../Utils';

import "./Announcement.css";

const Announcement = ({_class, announcement={}, assignment=null, user={}}) => {
    
    assignment = assignment || announcement.assignment;
    
    const {user:teacher=user, message, createdAt} = announcement;
    const {description} = (assignment || {});

    const title = assignment?`${teacher.name?.first} posted a new assignment: `:announcement.title || `${teacher.name?.first}`;

    return (
        <div className='announcement-container'>
            <div className='user-image-container'>
                <img src={get_full_image_url(_class.cover_image || teacher.photo_url)} />
            </div>

            <div className='announcement-content'>
                <p className='announcement-title'>{title}{assignment && <span className='assignment'>{assignment.title}</span>}</p>
                <p className='announcement-date'>{(new Date(createdAt)).toLocaleTimeString(undefined, {hour: "2-digit", minute: "2-digit"})}</p>

                <p className='announcement-message'>{message || description}</p>

                {assignment && <div className='assignment-buttons'>
                    <button disabled className='button primary time-left'>DUE IN 1d 5h 32m</button>    
                    <button className='button primary'>SUBMIT ASSIGNMENT</button>
                </div>}
            </div>


        </div>
    );
}
 
export default Announcement;