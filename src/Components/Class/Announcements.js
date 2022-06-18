import { TextField } from '@mui/material';
import { DateTimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import React, { useState } from 'react';
import { ImFileText2 } from 'react-icons/im';
import { RiCloseCircleFill } from 'react-icons/ri';
import { connect } from 'react-redux';
import { create_announcement, create_assignment, edit_class_announcement, edit_class_assignment, set_loading } from '../../Actions';
import FileUploadDropArea from '../Common/FileUploadDropArea';
import Announcement from './Announcement';

import "./Announcements.css";

const Announcements = ({_class={}, announcement={}, assignment={}, tab, user={}, announcements=[], assignments=[], is_teacher=false, create_announcement, create_assignment, edit_class_announcement, edit_class_assignment, set_loading}) => {

    const [assingmentAttachments, setAssignmentAttachments] = useState([]);

    const onEditAnnouncement = (keys) => (e) => {
        edit_class_announcement(keys, e.target.value);
    }

    const onEditAssignment = (keys) => (e) => {
        edit_class_assignment(keys, e.target.value);
    }

    const onSelectFiles = (e) => {
        const files = [...e.target.files];
        assignment.attachments = assignment.attachments || [];

        files.forEach((file) => {
            if(file.type.includes("image")){
                const fileReader = new FileReader();
                
                fileReader.onload = function(){
                    setAssignmentAttachments((a) => [...a, {url: fileReader.result, file: file}]);
                }
                
                fileReader.readAsDataURL(file);
            }else{
                setAssignmentAttachments((a) => [...a, {url: "", file: file}]);
            }
        });

        assignment.attachments.push(...files.map((f) => f.name));
        edit_class_assignment(["attachments"], assignment.attachments)
    }
    
    const onRemoveAttachment = (file, index) => {
        let file_index = assingmentAttachments.findIndex((aa) => file.name === aa.file.name);
        
        if(file_index !== -1){
            assingmentAttachments.splice(file_index, 1);
            setAssignmentAttachments([...assingmentAttachments]);
        }
        
        file_index = assignment.attachments.findIndex((a) => a === file.name);
        if(file_index !== -1){
            assignment.attachments.splice(file_index, 1);
            edit_class_assignment(["attachments"], assignment.attachments);
        }
    }

    const createAnnouncement = async () => {
        set_loading(true);
        
        const {title="", message, assignment=null} = announcement;
        await create_announcement({_class, title: title || `${user.name?.first} ${user.name?.last}`, message, assignment})
        
        set_loading(false);
    }

    const createAssignment = async () => {
        set_loading(true);

        const formData = new FormData();

        formData.append("_class", JSON.stringify(_class))
        formData.append("assignment", JSON.stringify(assignment))

        assingmentAttachments.forEach((a) => {
            formData.append("attachments", a.file);
        })
        
        await create_assignment(formData);

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
                <form className='assignment-form' onSubmit={(e) => {e.preventDefault()}} enctype="multipart/form-data">
                    <div className='assignment-inputs'>
                        <div className='input-container'>
                            <label>Assignment Title</label>

                            <input type="text" value={assignment.title || ""} onChange={onEditAssignment(["title"])} placeholder='Title' />
                        </div>

                        <div className='input-container'>
                            <label>Due Date</label>
                            <LocalizationProvider dateAdapter={AdapterDateFns}>
                            <DateTimePicker
                                // label="Due Date"
                                value={assignment.due_date || Date.now()}
                                onChange={(v) => edit_class_assignment(["due_date"], v?.getTime() || 0)}
                                renderInput={(params) => <TextField {...params} />}
                            />
                            </LocalizationProvider>
                        </div>
                        
                        <div className='input-container'>
                            <label>Instrutions</label>

                            <textarea value={assignment.description || ""} onChange={onEditAssignment(["description"])} placeholder='Type Here' />
                        </div>

                        <div className='input-container file-input'>
                            <label>Attachment</label>

                            <input type="file" multiple onChange={onSelectFiles} />

                            <FileUploadDropArea />
                        </div>
                    </div>

                    <div className='assignment-submit'>
                        <button className='button secondary' onClick={createAssignment}>Post</button>
                    </div>

                    <ul className='assignment-attachments'>
                        {(assignment.attachments || []).map((a, i) => {
                            const file_attachment = assingmentAttachments.find((as) => as.file.name === a);

                            return (
                                <li key={a+i}>
                                    <div className='attachment-preview'>
                                        {file_attachment?.file.type.includes("image")?<img src={file_attachment.url} />:<ImFileText2 />}

                                    </div>
                                    <div className='attachment-name'>
                                        <p>{a}</p>
                                    </div>
                                    <RiCloseCircleFill color='red' size={20} className='clickable remove' onClick={() => onRemoveAttachment(file_attachment?.file, i)} />
                                </li>
                            )
                        })}

                        {assignment.error && <p className='error'>{assignment.error}</p>}
                    </ul>
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