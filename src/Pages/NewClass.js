import React, { useCallback, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { get_teachers, set_loading } from '../Actions';
import TypeSelect from '../Components/Common/TypeSelect';
import { debounce, throttle } from '../Utils';
import {RiImageAddLine} from "react-icons/ri";
import {BsCurrencyDollar} from "react-icons/bs";

import "./NewClass.css";

const RenderTeacherOption = ({label, value, teacher}) => {
    return (
        <div style={{display: "flex", alignItems: "center"}}>
            <div className='teacher-image-container' style={{height: "30px", width: "30px", overflow: 'hidden', backgroundColor: "black", borderRadius: "50%", marginRight: "10px"}}>
                <img src='/Assets/Images/AuthBackground.png' style={{height: "100%", width: "100%", objectFit: "cover"}} />
            </div>

            <span>{label}</span>
        </div>
    )
}

const class_type_options = [{label: "Group Class", value: "group"}, {label: "Private Class", value: "private"}];

const NewClass = ({user, teachers=[], total_teachers=0, is_admin, is_teacher, get_teachers, set_loading}) => {
    const [teacherSearch, setTeacherSearch] = useState("");

    const onTypeTeacherSelect = (e, value) => {
        setTeacherSearch(value);
    };

    const searchTeachers = useCallback(debounce(() => {
        get_teachers(20, 0, teacherSearch);
    }), [teacherSearch]);

    useEffect(() => {
        if(is_admin){
            searchTeachers()
        }
    }, [teacherSearch, is_admin]);

    return (
        <div className='page new-class'>
            <div className='main-col'>
                <h3>Create New Class</h3>

                <div className='input-container'>
                    <label>Title</label>
                    
                    <input placeholder='Class Name' />
                </div>

                <div className='input-container cover-file-input'>
                    <label>Cover Image</label>
                    
                    <input type="file" multiple={false} />
                    <div className='upload-content-container'>
                        <span className='add-icon-container'><RiImageAddLine size={"24px"} /></span>

                        <div>
                            <p className='upload-cover-text'>Upload Cover Image</p>
                            <p className='upload-drop-text'>Drop your file here or browse</p>
                        </div>
                    </div>
                </div>

                <div className='input-container'>
                    <label>Description</label>
                    
                    <textarea placeholder='Class Description' />
                </div>

                <div className='input-container subject'>
                    <label>Subject</label>
                    
                    <input placeholder='Class Subject' />
                </div>

                <div className='input-container level'>
                    <label>Level</label>
                    
                    <input placeholder='Proficiency Level' />
                </div>

                <div className='input-container select'>
                    <label>Type</label>
                    
                    <TypeSelect options={class_type_options} placeholder="Class Type" />
                </div>

                <div className='input-container select'>
                    <label>Teacher</label>
                    
                    <TypeSelect disabled={is_teacher} options={(is_teacher?[user]:teachers).map((t) => ({label: `${t.name.first} ${t.name.last}${is_teacher?" (You)":""}`, value: t._id, teacher: t}))} placeholder="Select Teacher" onChangeText={onTypeTeacherSelect} textValue={teacherSearch} renderOption={RenderTeacherOption} renderSelected={RenderTeacherOption} />
                </div>

                <div className='input-container price'>
                    <label>Price</label>
                    
                    <input placeholder='00000' style={{paddingLeft: "50px"}} />
                    
                    <div className='input-adornment start' style={{backgroundColor: "transparent", borderRight: "2px solid rgba(0,0,0,0.1)"}}>
                        <BsCurrencyDollar color='rgba(0,0,0,0.3)' size={"20px"} />
                    </div>
                </div>

                <div className='input-container max-students'>
                    <label>Max Students</label>
                    
                    <input placeholder='1' min={1} type="number" disabled={"class_type" === "private"} />
                </div>

                <div className='input-container color'>
                    <label>Background Color</label>
                    
                    <input type="color" value={"#CCEABB"} />
                </div>

                <div className='input-container color'>
                    <label>Text Color</label>
                    
                    <input type="color" value={"#3F3F44"} />
                </div>

                <div className='input-container'>
                    <label>Tags</label>
                    
                    <input type="text" placeholder='math, english, beginner, advance etc...' />
                </div>

                <div className='input-container'>
                    <label>Color Preview</label>
                    
                    <input style={{backgroundColor: "#CCEABB", color: "#3F3F44"}} value={"Look On Schedule Calendar"} disabled />
                </div>

                <div className='input-container fullwidth'>
                    <label>Schedules</label>
                    
                    <input type="text" disabled />
                </div>
            </div>

            <div className='misc-col'>
                <h3>New Class</h3>
            </div>
        </div>
    );
}

function map_state_to_props({App, Auth, Admin}){
    return {user: App.user, teachers: Admin.teachers, total_teachers: Admin.total_teachers, is_admin: Auth.is_admin, is_teacher: Auth.is_teacher};
}
 
export default connect(map_state_to_props, {get_teachers, set_loading})(NewClass);