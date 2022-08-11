import React from 'react';
import { DAYS } from '../../Data';

import {formatDistance, formatRelative} from "date-fns"

import "./ClassInfo.css";

const ClassInfo = ({_class={}, assignments=[]}) => {
    const {_id:class_id="", title, subject, teacher, meeting_link="", schedules=[]} = _class;
    
    return (
        <div className='class-info'>
            <h3 style={{margin: "20px 0"}}>Class Information</h3>
            <p><span className='info-title'>{title}</span></p>

            <p><span className='info-title'>meeting link :</span> {meeting_link?<a className='meeting-link' href={meeting_link}>{meeting_link}</a> : "None"}</p>
            
            <p><span className='info-title'>Teacher :</span> {teacher?.name?.first} {teacher?.name?.last}</p>
            
            <p><span className='info-title'>Email :</span> {teacher?.email}</p>
            
            <p><span className='info-title'>Class Dates :</span> {schedules.map((s) => <span className='schedule'>{s.days.map((d) => DAYS[d].long).join(", ")} @ {(new Date(s.daily_start_time)).toLocaleTimeString(undefined, {hour: "numeric", minute: "2-digit"})} - {(new Date(s.daily_end_time)).toLocaleTimeString(undefined, {hour: "numeric", minute: "2-digit"})}</span>)}</p>

            <div className='upcoming-assignments'>
                <h3 style={{margin: "20px 0"}}>Upcoming Assignments</h3>
                {assignments.map((a) => {
                    
                    return (
                        <div>
                            <p className='due-date'>Due {formatDistance(new Date(a.due_date), new Date(), {addSuffix: true})}</p>
                            <p className='assignment'>{a.title}</p>
                        </div>
                    )
                })}
            </div>
        </div>
    );
}
 
export default ClassInfo;