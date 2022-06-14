import React from 'react';
import Announcement from './Announcement';

import "./Announcements.css";

const Announcements = ({_class={}, user={}, announcements=[], assignments=[], is_teacher=false}) => {
    return (
        <div>
            {is_teacher && <>
                <div className='input-container announcement'>
                    <label>Post a new announcement</label>

                    <textarea placeholder='Type Here' />

                    <button className='button secondary'>Post</button>
                </div>
            </>}

            {announcements.map((a) => {
                const assignment = assignments.find((ass) => ass._id === a.assignment);

                return <Announcement announcement={a} _class={_class} user={user} assignment={assignment} />
            })} 
        </div>
    );
}
 
export default Announcements;