import React, { useState } from 'react';
import { connect } from 'react-redux';
import { create_announcement, create_assignment, edit_class_announcement, edit_class_assignment, set_loading } from '../../Actions';
import FileUploadDropArea from '../Common/FileUploadDropArea';
import Announcement from './Announcement';

import "./Announcements.css";

const Announcements = ({_class={}, announcement={}, assignment={}, tab, user={}, announcements=[], assignments=[], is_teacher=false, create_announcement, create_assignment, edit_class_announcement, edit_class_assignment, set_loading}) => {

    const [assingmentAttachments, setAssignmentAttachment] = useState([]);

    const onEditAnnouncement = (keys) => (e) => {
        edit_class_announcement(keys, e.target.value);
    }

    const onEditAssignment = (keys) => (e) => {
        edit_class_assignment(keys, e.target.value);
    }

    const createAnnouncement = async () => {
        set_loading(true);
        
        const {title="", message, assignment=null} = announcement;
        await create_announcement({_class, title: title || `${user.name?.first} ${user.name?.last}`, message, assignment})
        
        set_loading(false);
    }

    const createAssignment = async () => {
        set_loading(true);
        
        const {title="", message, assignment=null} = announcement;
        await create_announcement({_class, title: title || `${user.name?.first} ${user.name?.last}`, message, assignment})

        set_loading(false);
    }

    return (
        <div>
            {is_teacher && (
                tab==="announcements"?
                <div className='input-container announcement'>
                    <label>Post a new announcement</label>

                    <textarea value={announcement.message || ""} onChange={onEditAnnouncement(["message"])} placeholder='Type Here' />

                    <button className='button secondary' onClick={createAnnouncement}>Post</button>

                    {announcement.error && <p className='error'>{announcement.error}</p>}
                </div>
                :
                <form onSubmit={(e) => {e.preventDefault()}} enctype="multipart/form-data">
                    <div className='input-container announcement'>
                        <label>Post a new assignment</label>

                        <textarea placeholder='Type Here' />
                    </div>

                    <div className='input-container file-input'>
                        <label>Attachment</label>

                        <input type="file" multiple />

                        <FileUploadDropArea />
                    </div>

                    {(assignment.attachments || []).map((a) => {
                        <small>attachment</small>
                    })}

                    {assignment.error && <p className='error'>{assignment.error}</p>}
                </form>
            )}

            {announcements.map((a) => {
                const assignment = assignments.find((ass) => ass._id === a.assignment);

                return <Announcement announcement={a} _class={_class} user={user} assignment={assignment} />
            })} 
        </div>
    );
}

function map_state_to_props({Class}){
    return ({announcement: Class.announcement, assignment: Class.assignment})
}

export default connect(map_state_to_props, {create_announcement, create_assignment, edit_class_announcement, edit_class_assignment, set_loading})(Announcements);