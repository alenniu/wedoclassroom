import React, { useCallback, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { create_new_class, edit_new_class_value, get_teachers, set_loading, set_teachers } from '../../Actions';
import TypeSelect from '../../Components/Common/TypeSelect';
import { debounce, get_full_image_url, throttle } from '../../Utils';
import {RiImageAddLine, RiCloseCircleFill} from "react-icons/ri";
import {BsCurrencyDollar} from "react-icons/bs";
import {TextField} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';

import { ListInput } from '../../Components/Common/ListInput';
import { DAYS } from '../../Data';
import FileUploadDropArea from '../../Components/Common/FileUploadDropArea';
import { DatePicker } from '@mui/x-date-pickers';

import "./Class.css";
import "./NewClass.css";
import { useNavigate } from 'react-router-dom';

const RenderTeacherOption = ({label, value, teacher}) => {
    return (
        <div style={{display: "flex", alignItems: "center"}}>
            <div className='teacher-image-container' style={{height: "30px", width: "30px", overflow: 'hidden', backgroundColor: "black", borderRadius: "50%", marginRight: "10px"}}>
                <img src={get_full_image_url(teacher.photo_url || '/Assets/Images/AuthBackground.png')} style={{height: "100%", width: "100%", objectFit: "cover"}} />
            </div>

            <span>{label}</span>
        </div>
    )
}

const class_type_options = [{label: "Group Class", value: "group"}, {label: "Private Class", value: "private"}];
const pricing_type_options = [{label: "Hourly", value: "hourly"}, {label: "Per Session", value: "session"}, {label: "Semester", value: "semester"}];

const schedules = [{days: [], start_time: "", end_time: ""}];

const NewClass = ({user, teachers=[], total_teachers=0, new_class={}, app_config={}, is_admin, is_teacher, get_teachers, edit_new_class_value, create_new_class, set_teachers, set_loading}) => {

    const [teacherSearch, setTeacherSearch] = useState("");
    const [coverPreview, setCoverPreview] = useState({file: null, url: ""});
    const [errors, setErrors] = useState({});

    const {subjects=[], tags:configTags=["AP, K12"], levels=[]} = app_config;

    const {title="", subject="", cover_image="", description="", level="", class_type="", teacher=is_teacher?user._id:"", price=0, max_students=1, bg_color="#CCEABB", text_color="#3F3F44", tags=[], schedules=[], start_date=(new Date()), end_date=(new Date()), meeting_link="", billing_schedule="", error} = new_class;

    const navigate = useNavigate();

    useEffect(() => {
        is_teacher && set_teachers([{...user}]);
    }, []);

    // console.log(teachers);
    // console.log(new_class);

    const onChangeValueEvent = (keys=[], numeric=false) => (e, val) => {
        const value = val || e.target.value;

        // console.log(value, keys);

        edit_new_class_value(keys, numeric?(Number(value) || value):value);
        setErrors(err => ({...err, [keys.join(".")]: ""}));
    }

    const onChangeValue = (keys=[], numeric=false) => (val) => {
        const value = val;
        console.log(keys, value);

        edit_new_class_value(keys, numeric?(Number(value) || value):value);
        setErrors(err => ({...err, [keys.join(".")]: ""}));
    }

    const onAddTag = (tag) => {
        tags.push(tag);
        edit_new_class_value(["tags"], tags);
        setErrors(err => ({...err, tags: ""}));
    }

    const onRemoveTag = (index, tag) => {
        tags.splice(index, 1);

        edit_new_class_value(["tags"], tags);
        setErrors(err => ({...err, tags: ""}));
    }
    
    const AddNewSchedule = () => {
        schedules.push({days: [], daily_start_time: new Date(), daily_end_time: new Date()})
        edit_new_class_value(["schedules"], schedules);
    }
    
    const RemoveNewSchedule = (index) => {
        schedules.splice(index, 1);
        edit_new_class_value(["schedules"], schedules);
    }
    
    const onTypeTeacherSelect = (e, value) => {
        setTeacherSearch(value);
    };
    
    const onAddScheduleDay = (scehdule_index, day) => {
        // console.log({day});
        schedules[scehdule_index].days.push(day.number);
        
        edit_new_class_value(["schedules", scehdule_index, "days"], schedules[scehdule_index].days);
    }

    const onRemoveScheduleDay = (scehdule_index, index, day) => {
        schedules[scehdule_index].days.splice(index, 1);
            
        edit_new_class_value(["schedules", scehdule_index, "days"], schedules[scehdule_index].days);
    }

    const onSelectImage = (e) => {
        const file = e.target.files[0];
        const fileReader = new FileReader();
        
        if(file){
            // console.log(file);
            
            fileReader.onload = function(){
                setCoverPreview({url: fileReader.result, file: file});
                edit_new_class_value(["cover_image"], file.name);
            }
            
            fileReader.readAsDataURL(file);
        }
    }
    
    const onClickRemoveCover = () => {
        setCoverPreview({url: "", file: null});
        edit_new_class_value(["cover_image"], "");
    }

    const createClass = async () => {
        set_loading(true);
        const formData = new FormData();
        formData.append("_class", JSON.stringify({title, subject, cover_image, description, level, class_type, teacher, price, max_students, bg_color, text_color, tags, schedules, start_date, end_date, meeting_link, billing_schedule}));
        if(coverPreview.file){
            formData.append("cover", coverPreview.file);
        }
        

        if(await create_new_class(formData)){
            navigate("/dashboard");
        }

        set_loading(false);
    }

    const searchTeachers = useCallback(debounce((s) => {
        get_teachers(20, 0, s);
    }), []);

    useEffect(() => {
        if(is_admin){
            searchTeachers(teacherSearch);
        }
    }, [teacherSearch, is_admin]);

    return (
        <div className='page new-class'>
            <form onSubmit={(e) => {e.preventDefault()}} enctype="multipart/form-data" className='main-col'>
                <h3>Create New Class</h3>

                <div className='input-container'>
                    <label>Title</label>
                    
                    <input placeholder='Class Name' value={title} onChange={onChangeValueEvent(["title"])} />
                </div>

                <div className='input-container cover-file-input'>
                    <label>Cover Image</label>
                    
                    <input type="file" multiple={false} onChange={onSelectImage} />
                    <FileUploadDropArea title='Upload Cover Image' />
                    {/* <div className='upload-content-container'>
                        <span className='add-icon-container'><RiImageAddLine size={"24px"} /></span>

                        <div>
                            <p className='upload-cover-text'>Upload Cover Image</p>
                            <p className='upload-drop-text'>Drop your file here or browse</p>
                        </div>
                    </div> */}
                    {(cover_image || coverPreview.url) && <div className='cover-preview'>
                        <img src={coverPreview.url || (cover_image && get_full_image_url(cover_image))} />
                        <RiCloseCircleFill color='red' size={20} className='clickable remove' onClick={onClickRemoveCover} />
                    </div>}
                </div>

                <div className='input-container'>
                    <label>Description</label>
                    
                    <textarea placeholder='Class Description' value={description} onChange={onChangeValueEvent(["description"])} />
                </div>

                <div className='input-container select subject'>
                    <label>Subject</label>
                    
                    <TypeSelect options={subjects.map((s) => ({label: s, value: s}))} placeholder="Subject" value={subject} onChange={onChangeValue(["subject"])} />
                    {/* <select placeholder='Class Subject' value={subject} onChange={onChangeValueEvent(["subject"])}>
                        <option value={""}>Select</option>
                        {subjects.map((s) => {
                            return <option value={s} key={s}>{s}</option>
                        })}
                    </select> */}
                </div>

                <div className='input-container select level'>
                    <label>Level</label>
                    
                    <TypeSelect options={levels.map((l) => ({label: l, value: l}))} placeholder="Level" value={level} onChange={onChangeValue(["level"])} />
                    {/* <select placeholder='Proficiency Level' value={level} onChange={onChangeValueEvent(["level"])}>
                        <option value={""}>Select</option>
                        {levels.map((l) => {
                            return <option value={l} key={l}>{l}</option>
                        })}
                    </select> */}
                </div>

                <div className='input-container select'>
                    <label>Type</label>
                    
                    <TypeSelect options={class_type_options} placeholder="Class Type" value={class_type} onChange={onChangeValue(["class_type"])} />
                </div>

                <div className='input-container select'>
                    <label>Teacher</label>
                    
                    <TypeSelect disabled={is_teacher} options={(is_teacher?[user]:teachers).map((t) => ({label: `${t.name.first} ${t.name.last}${is_teacher?" (You)":""}`, value: t._id, teacher: t}))} placeholder="Select Teacher" onChangeText={onTypeTeacherSelect} textValue={teacherSearch} renderOption={RenderTeacherOption} renderSelected={RenderTeacherOption} onChange={onChangeValue(["teacher"])} value={teacher} localSearch={false} />
                </div>

                <div className='input-container price'>
                    <label>Price</label>
                    
                    <input placeholder='00000' style={{paddingLeft: "50px"}} value={price} onChange={onChangeValueEvent(["price"])} />
                    
                    <div className='input-adornment start' style={{backgroundColor: "transparent", borderRight: "2px solid rgba(0,0,0,0.1)"}}>
                        <BsCurrencyDollar color='rgba(0,0,0,0.3)' size={"20px"} />
                    </div>
                </div>

                <div className='input-container max-students'>
                    <label>Max Students</label>
                    
                    <input placeholder='1' min={1} type="number" disabled={class_type === "private"} value={max_students} onChange={onChangeValueEvent(["max_students"])}  />
                </div>

                <div className='input-container select pricing-type'>
                    <label>Pricing Type</label>
                    
                    <TypeSelect placeholder='Select' options={pricing_type_options} value={billing_schedule} onChange={onChangeValue(["billing_schedule"])}  />
                </div>

                <div className='input-container background color'>
                    <label>Background Color</label>
                    
                    <input type="color" value={bg_color} onChange={onChangeValueEvent(["bg_color"])} />
                </div>

                <div className='input-container color'>
                    <label>Text Color</label>
                    
                    <input type="color" value={text_color} onChange={onChangeValueEvent(["text_color"])} />
                </div>

                <div className='input-container color-preview'>
                    <label>Color Preview</label>
                    
                    <input style={{backgroundColor: bg_color, color: text_color, fontWeight: "700"}} value={"Look On Schedule Calendar"} disabled />
                </div>

                <div className='input-container'>
                    <label>Tags</label>
                    
                    {/* <input type="text" placeholder='math, english, beginner, advance etc...' /> */}
                    <ListInput always_show_matches items={tags} search_array={configTags} onAddItem={onAddTag} onRemoveItem={onRemoveTag} />
                </div>

                <div className='input-container meeting-link'>
                    <label>Meeting Link</label>
                    
                    <input placeholder='Meeting Link' value={meeting_link} onChange={onChangeValueEvent(["meeting_link"])} />
                </div>

                <div className='input-container'>
                    <label>Start Date</label>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                        // label="Start Time"
                        value={start_date}
                        onChange={(v) => onChangeValue(["start_date"])((v || (new Date())).getTime())}
                        renderInput={(params) => <TextField {...params} />}
                    />
                    </LocalizationProvider>
                </div>

                <div className='input-container'>
                    <label>End Date</label>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                        // label="Start Time"
                        value={end_date}
                        onChange={(v) => onChangeValue(["end_date"])((v || (new Date())).getTime())}
                        renderInput={(params) => <TextField {...params} />}
                    />
                    </LocalizationProvider>
                </div>

                <h3>Weekly Schedule</h3>
                <ul className='schedules'>
                    {schedules.map((s, i) => {
                        const {days=[], daily_start_time, daily_end_time} = s;
                        return (
                            <li key={i.toString()}>
                                <div className='input-container'>
                                    <label>Days</label>
                                    <ListInput allowOnlySearchResults always_show_matches search_array={DAYS.slice(1)} search_property={"long"} items={days.map(d => DAYS[d].long)} onAddItem={(day) => onAddScheduleDay(i, day)} onRemoveItem={(index, day) => onRemoveScheduleDay(i, index, day)} />
                                </div>

                                <div className='input-container'>
                                    <label>Start Time</label>
                                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                                    <TimePicker
                                        // label="Start Time"
                                        value={daily_start_time}
                                        onChange={(v) => onChangeValue(["schedules", i, "daily_start_time"])((v || (new Date())).getTime())}
                                        renderInput={(params) => <TextField {...params} />}
                                    />
                                    </LocalizationProvider>
                                </div>

                                <div className='input-container'>
                                    <label>End Time</label>
                                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                                    <TimePicker
                                        // label="End Time"
                                        value={daily_end_time}
                                        onChange={(v) => onChangeValue(["schedules", i, "daily_end_time"])((v || (new Date())).getTime())}
                                        renderInput={(params) => <TextField {...params} />}
                                    />
                                    </LocalizationProvider>
                                </div>

                                {(schedules.length > 1) && <div className='input-container' style={{verticalAlign: "bottom"}}>
                                    <button className='button error fullheight fullwidth remove' onClick={() => {RemoveNewSchedule(i)}}>Remove</button>
                                </div>}
                            </li>
                        )
                    })}
                </ul>

                <button className='button primary' onClick={AddNewSchedule}>New Schedule</button>
                
                <div style={{display: "flex", justifyContent: "flex-end", marginTop: 50}}>
                    <button onClick={createClass} className='button primary'>Create Class</button>
                </div>

                {error && <p className='error' style={{textAlign: "end"}}>{error}</p>}
            </form>

            <div className='misc-col'>
                <h3>New Class</h3>
            </div>
        </div>
    );
}

function map_state_to_props({App, Auth, Class, Admin}){
    return {user: App.user, teachers: Admin.teachers, total_teachers: Admin.total_teachers, is_admin: Auth.is_admin, is_teacher: Auth.is_teacher, new_class: Class.create, app_config: App.config};
}
 
export default connect(map_state_to_props, {get_teachers, edit_new_class_value, create_new_class, set_teachers, set_loading})(NewClass);