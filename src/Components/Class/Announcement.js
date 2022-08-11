import React, { useEffect, useState } from 'react';
import { get_full_image_url, get_time_left } from '../../Utils';

import "./Announcement.css";

const padStart = (num_or_str, maxLength, fillStr) => num_or_str.toString().padStart(maxLength, fillStr)

const Announcement = ({_class, announcement={}, assignment=null, user={}}) => {
    const [update, forceUpdate] = useState(0)
    assignment = assignment || announcement.assignment;
    
    const {user:teacher=user, message, createdAt} = announcement;
    const {description, due_date=Date.now()} = (assignment || {});

    const title = assignment?`${teacher.name?.first} posted a new assignment: `:announcement.title || `${teacher.name?.first}`;

    useEffect(() => {
        let interval = setInterval(() => {
            forceUpdate((u) => u+1);
        }, 1000);
        
        return () => {
            clearInterval(interval);
        }
    }, []);

    const {days, hours, minutes, seconds, milliseconds, duration} = get_time_left(due_date, Date.now());

    return (
        <div className='announcement-container'>
            <div className='user-image-container'>
                <img src={get_full_image_url(_class.cover_image || teacher.photo_url)} />
            </div>

            <div className='announcement-content'>
                <p className='announcement-title'>{title}{assignment && <span className='assignment'>{assignment.title}</span>}</p>
                <p className='announcement-date'>{(new Date(createdAt)).toLocaleDateString(undefined, {hour: "numeric", minute: "2-digit"})}</p>

                <p className='announcement-message'>{message || description}</p>

                {assignment && <div className='assignment-buttons'>
                    <button disabled className='button primary time-left'>{duration > 0?(<>DUE IN {days?padStart(days, 2, "0")+"D ":""}{days || hours?padStart(hours, 2, "0")+"H ":""}{hours || minutes?padStart(minutes, 2, "0")+"M ":""}{!days && (minutes || seconds)?padStart(seconds, 2, "0")+"S ":""}</>):"PAST DUE"}</button>    
                    <button className='button primary'>SUBMIT ASSIGNMENT</button>
                </div>}
            </div>


        </div>
    );
}
 
export default Announcement;