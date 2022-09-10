import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { connect } from 'react-redux';
import { create_new_class, edit_new_class_value, get_teachers, set_loading, set_teachers } from '../../Actions';
import {RiImageAddLine, RiCloseCircleFill, RiCalendar2Line, RiCloseLine} from "react-icons/ri";
import {BsCurrencyDollar} from "react-icons/bs";
import {MenuItem, Select, Switch, TextField} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { DatePicker } from '@mui/x-date-pickers';
import { DAY, DAYS } from '../../Data';
import { debounce, get_full_image_url, throttle, unique_filter } from '../../Utils';
import { TypeSelect, FileUploadDropArea, ListInput, TableHead } from '../../Components/Common';


import "./Class.css";
import "./NewClass.css";
import { api } from '../../Utils/api';
import ColorPicker from '../../Components/Class/ColorPicker';
import DateRangeModal from '../../Components/Class/DateRangeModal';
import EditLessonModal from '../../Components/Class/EditLessonModal';

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

const RenderStudentItem = ({item:student}) => {
    return (
        <div style={{display: "flex", alignItems: "center"}}>
            <div className='teacher-image-container' style={{height: "20px", width: "20px", overflow: 'hidden', backgroundColor: "black", borderRadius: "50%", marginRight: "10px"}}>
                <img src={get_full_image_url(student.photo_url || '/Assets/Images/AuthBackground.png')} style={{height: "100%", width: "100%", objectFit: "cover"}} />
            </div>

            <span>{student.name.first} {student.name.last}</span>
        </div>
    )
}

const class_type_options = [{label: "Group Class", value: "group"}, {label: "Private Class", value: "private"}];
const pricing_type_options = [{label: "Hourly", value: "hourly"}, {label: "Per Session", value: "session"}, {label: "Semester", value: "semester"}];

const schedules = [{days: [], start_time: "", end_time: ""}];

const NewClass = ({user, teachers=[], total_teachers=0, new_class={}, app_config={}, is_admin, is_teacher, get_teachers, edit_new_class_value, create_new_class, set_teachers, set_loading}) => {

    const [studentToAdd, setStudentToAdd] = useState("");
    const [studentSearch, setStudentSearch] = useState("");
    
    const [teacherSearch, setTeacherSearch] = useState("");
    const [coverPreview, setCoverPreview] = useState({file: null, url: ""});
    const [errors, setErrors] = useState({});

    const current_date = new Date();

    const [showDateRange, setShowDateRange] = useState(false);

    const [showEditLesson, setShowEditLesson] = useState(false);
    const [EditLessonIndex, setEditLessonIndex] = useState(-1);
    const [editLesson, setEditLesson] = useState({date: null, start_time: new Date(), end_time: new Date()});

    const [lessonsRangeStart, setLessonsRangeStart] = useState(new Date(current_date.getFullYear(), current_date.getMonth(), current_date.getDate() - (current_date.getDay()), 0, 0, 0));
    const [lessonsRangeEnd, setLessonsRangeEnd] = useState(new Date(lessonsRangeStart.getTime() + (DAY * 7)));

    const {subjects=[], tags:configTags=["AP, K12"], levels=[], class_colors=["gold", "red", "grey", "orange", "blue", "green"]} = app_config || {};

    const {title="", subject="", cover_image="", description="", level="", class_type="", teacher=is_teacher?user._id:"", price=0, max_students=1, bg_color="#CCEABB", text_color="white", tags=[], schedules=[], custom_dates=[], cancelled_dates=[], start_date=(new Date()), end_date=(new Date()), meeting_link="", billing_schedule="", error, archived=false, students=[], students_info=[]} = new_class;

    const navigate = useNavigate();

    useEffect(() => {
        is_teacher && set_teachers([{...user}]);
    }, []);

    useEffect(() => {
        if(lessonsRangeStart.getTime() >= lessonsRangeEnd.getTime()){
            setLessonsRangeEnd(new Date(lessonsRangeStart.getTime() + DAY));
        }
    }, [lessonsRangeStart]);

    // console.log(teachers);
    // console.log(new_class);

    const [studentResults, setStudentResults] = useState([]);

    const getStudents = useCallback(debounce(async (search) => {
        const res = await api("get", "/api/admin/accounts", {params: {search, limit: 20, offset: 0, filters: JSON.stringify({type: "student"})}});
    
        setStudentResults(res?.data?.accounts || []);
    }, 300), []);

    useEffect(() => {
        if(studentSearch){
            getStudents(studentSearch);
        }
    }, [studentSearch]);

    const onChangeStudentListText = (e) => {
        const {name, value, checked, type} = e.target;

        setStudentSearch(value)
    }

    const onChangeValueEvent = (keys=[], numeric=false) => (e, val) => {
        const {name, value, checked, type} = e.target;
        const is_checkbox = type === "checkbox";
        const is_number = (type === "number") || numeric;

        edit_new_class_value(keys, is_checkbox?checked:is_number?(Number(value)||""):value);
        setErrors(err => ({...err, [keys.join(".")]: ""}));
    }

    const onChangeValue = (keys=[], numeric=false) => (val) => {
        const value = val;
        // console.log(keys, value);

        edit_new_class_value(keys, numeric?(Number(value) || value):value);
        setErrors(err => ({...err, [keys.join(".")]: ""}));
    }

    const onEditLessonValue = (key) => (value) => {
        setEditLesson((el) => ({...el, [key]: value}));
    }

    const initEditLesson = (lesson, index) => {
        setEditLesson({...lesson, index});
    }

    const onClickDoneEditLesson = () => {
        if(EditLessonIndex !== -1){
            custom_dates[EditLessonIndex] = {...editLesson, index: undefined}
        }else{
            custom_dates.push(editLesson);
        }

        edit_new_class_value(["custom_dates"], [...custom_dates]);

        closeEditLesson();
    }

    const closeEditLesson = () => {
        setShowEditLesson(false);

        setEditLessonIndex(-1);
        setEditLesson({date: null, start_time: new Date(), end_time: new Date()});
    }

    const openEditLesson = () => {
        setShowEditLesson(true);
    }

    const closeDateRange = () => {
        setShowDateRange(false);
    }

    const openDateRange = () => {
        setShowDateRange(true);
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

    const onAddStudent = (student) => {
        if(student && !students.some((s) => s._id === student._id)){
            students.push(student);
            students_info.push({student: student._id, price_paid: price, date_requested: new Date(), date_joined: new Date(), form_type: "new"})
        }
        
        setStudentToAdd("");
        
        edit_new_class_value(["students"], students);
        edit_new_class_value(["students_info"], students_info);
        setErrors(err => ({...err, students: ""}));
    }

    const onRemoveStudent = (index, student) => {
        students.splice(index, 1);

        const student_info_index = students_info.findIndex((si) => si.student === student._id);
        
        if(student_info_index !== -1){
            students_info.splice(student_info_index, 1);
        }

        edit_new_class_value(["students"], students);
        edit_new_class_value(["students_info"], students_info);
        setErrors(err => ({...err, students: ""}));
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
        formData.append("_class", JSON.stringify({title, subject, cover_image, description, level, class_type, teacher, price, max_students, bg_color, text_color, tags, schedules, custom_dates, cancelled_dates, start_date, end_date, meeting_link, billing_schedule, archived, students_info, students: students.map((s) => s?._id || s).filter(unique_filter)}));
        if(coverPreview.file){
            formData.append("cover", coverPreview.file);
        }
        
        const res = await create_new_class(formData);
        if(res){
            const {_class} = res;
            if(_class){
                navigate(`/dashboard/class/edit/${_class._id}`);
            }
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

    const lessonsInRange = useMemo(() => {
        const lessons = [];
        lessonsRangeEnd.setHours(23, 59, 59);
        const startDate = new Date(start_date);

        if(lessonsRangeEnd.getTime() >= startDate.getTime()){
            schedules.forEach((s) => {
                const {days=[], daily_start_time, daily_end_time} = s;
                // days.sort();

                let current_lesson_date = new Date(lessonsRangeStart);
                let current_lesson_day = current_lesson_date.getDay();

                while(current_lesson_date.getTime() < lessonsRangeEnd.getTime()){
                    current_lesson_day = current_lesson_date.getDay();

                    if((startDate.getTime() <= current_lesson_date.getTime()) && days.includes(current_lesson_day)){
                        lessons.push({date: new Date(current_lesson_date), start_time: new Date(daily_start_time), end_time: new Date(daily_end_time)});
                    }

                    const matching_custom_dates = custom_dates.filter((cd) => {
                        let {date, start_time, end_time} = cd;
                        date = new Date(date);
                        const dateDay = date.getDay();

                        if((dateDay === current_lesson_day) && (Math.abs(date.getTime() - current_lesson_date.getTime()) <= DAY)){
                            return true;
                        }

                        return false;
                    });

                    lessons.push(...matching_custom_dates.map((cd) => ({date: new Date(cd.date), start_time: new Date(cd.start_time), end_time: new Date(cd.end_time), is_custom_date: true})))

                    current_lesson_date.setDate(current_lesson_date.getDate() + 1);
                }
            });
        }

        lessons.sort((a, b) => {
            return (a.date.getTime() + a.start_time.getTime()) - (b.date.getTime() + b.start_time.getTime());
        });

        return lessons;
    }, [lessonsRangeStart, custom_dates, lessonsRangeEnd]);

    return (
        <div className='page edit-class new'>
            <form onSubmit={(e) => {e.preventDefault()}} enctype="multipart/form-data" className='main-col'>
                <h3>Create New Class</h3>

                <div style={{"--mr": 0}} className='input-container fullwidth'>
                    <label>Color</label>
                    
                    <ColorPicker onChange={onChangeValue(["bg_color"])} value={bg_color} colors={class_colors} />
                </div>

                <div style={{"--mr": 1}} className='input-container'>
                    <label>Title</label>
                    
                    <input placeholder='Class Name' value={title} onChange={onChangeValueEvent(["title"])} />
                </div>

                <div style={{"--mr": 0}} className='input-container'>
                    <label>Description</label>
                    
                    <textarea placeholder='Class Description' value={description} onChange={onChangeValueEvent(["description"])} />
                </div>

                <div style={{"--mr": 1}} className='input-container select subject'>
                    <label>Subject</label>
                    
                    <TypeSelect options={subjects.map((s) => ({label: s, value: s}))} placeholder="Subject" value={subject} onChange={onChangeValue(["subject"])} />
                </div>

                <div style={{"--mr": 0}} className='input-container select level'>
                    <label>Level</label>
                    
                    <TypeSelect options={levels.map((l) => ({label: l, value: l}))} placeholder="Level" value={level} onChange={onChangeValue(["level"])} />
                </div>

                <div style={{"--mr": 1}} className='input-container select'>
                    <label>Type</label>
                    
                    <TypeSelect options={class_type_options} placeholder="Class Type" value={class_type} onChange={onChangeValue(["class_type"])} />
                </div>

                <div style={{"--mr": 0}} className='input-container select'>
                    <label>Teacher</label>
                    
                    <TypeSelect disabled={is_teacher} options={(is_teacher?[user]:teachers).map((t) => ({label: `${t.name.first} ${t.name.last}${is_teacher?" (You)":""}`, value: t._id, teacher: t}))} placeholder="Select Teacher" onChangeText={onTypeTeacherSelect} textValue={teacherSearch} renderOption={RenderTeacherOption} renderSelected={RenderTeacherOption} onChange={onChangeValue(["teacher"])} value={teacher} localSearch={false} />
                </div>

                <div style={{"--mr": 1}} className='input-container price'>
                    <label>Price</label>
                    
                    <input placeholder='00000' style={{paddingLeft: "50px"}} value={price} onChange={onChangeValueEvent(["price"])} />
                    
                    <div className='input-adornment start' style={{backgroundColor: "transparent", borderRight: "2px solid rgba(0,0,0,0.1)"}}>
                        <BsCurrencyDollar color='rgba(0,0,0,0.3)' size={"20px"} />
                    </div>
                </div>

                <div style={{"--mr": 1}} className='input-container max-students'>
                    <label>Max Students</label>
                    
                    <input placeholder='1' min={1} type="number" disabled={class_type === "private"} value={max_students} onChange={onChangeValueEvent(["max_students"])}  />
                </div>

                <div style={{"--mr": 0}} className='input-container select pricing-type'>
                    <label>Pricing Type</label>
                    
                    <TypeSelect placeholder='Select' options={pricing_type_options} value={billing_schedule} onChange={onChangeValue(["billing_schedule"])}  />
                </div>

                <div style={{"--mr": 1}} className='input-container meeting-link'>
                    <label>Meeting Link</label>
                    
                    <input placeholder='Meeting Link' value={meeting_link} onChange={onChangeValueEvent(["meeting_link"])} />
                </div>

                <div style={{"--mr": 0}} className='input-container'>
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

                <div style={{"--mr": 1}} className='input-container'>
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

                <div style={{"--mr": 0}} className='input-container'>
                    <label>Archived</label>
                    {is_admin?<Switch
                        // label="Start Time"
                        checked={archived}
                        onChange={onChangeValueEvent(["archived"])}
                    />:<input type="text" value={archived?"Yes":"No"} readOnly style={{color: archived?"red":"green"}} />}
                </div>

                {is_admin && <div className="students-container">
                    <h2>Students</h2>
                    
                    <div style={{marginBottom: 20}} className='filters-search-container'>
                        <div className='filters-container'>
                            <div className='input-container select' style={{margin: 0}}>
                                <TypeSelect options={studentResults.map((t) => ({label: `${t.name.first} ${t.name.last}`, value: t._id, teacher: t}))} placeholder="Select Student" onChangeText={onChangeStudentListText} renderOption={RenderTeacherOption} renderSelected={RenderTeacherOption} onChange={(value, index) => {setStudentToAdd(studentResults[index])}} value={studentToAdd?._id || ""} onOpen={() => {getStudents("")}} localSearch={false} />
                            </div>

                            <button className='button primary lesson-date-range' onClick={() => {onAddStudent(studentToAdd)}}>
                                Add Student
                            </button>
                        </div>
                    </div>

                    <div className='table-container' style={{marginBlock: 20}}>
                        <table>
                            <TableHead headers={[{label: "Student", id: "student", sortable: false}, {label: "Price Paid", id: "price_paid", sortable: false}, {label: "Date Joined", id: "date_joined", sortable: false}, {label: "Form Type", id: "form_type", sortable: false}]} />

                            <tbody>
                            {students.map((s, i) => {
                                const {_id, name={}} = s;
                                let student_info_index = students_info.findIndex((si) => si.student === _id);

                                if(student_info_index === -1){
                                    students_info.push({student: _id, price_paid: price, date_requested: new Date(), date_joined: new Date(), form_type: "new"});

                                    edit_new_class_value(["students_info"], students_info);

                                    return null
                                }

                                const student_info = students_info[student_info_index] || {};
                                const {price_paid=0, date_joined=new Date(), form_type=""} = student_info;

                                return (
                                    <tr key={_id}>
                                        <td><button className='button error' onClick={() => {onRemoveStudent(i, s)}}><RiCloseLine /></button> {name.first} {name.last}</td>

                                        <td><div className='input-container' style={{margin: 0, width: "unset", "--input-height": "40px"}}><input type="number" min="" placeholder="Price Paid" style={{paddingLeft: 50}} onChange={onChangeValueEvent(["students_info", student_info_index, "price_paid"])} value={price_paid} /><div className='input-adornment start' style={{backgroundColor: "transparent", borderRight: "2px solid rgba(0,0,0,0.1)"}}><BsCurrencyDollar color='rgba(0,0,0,0.3)' size={"20px"} /></div></div></td>
                                        
                                        <td>{(new Date(date_joined)).toLocaleDateString()}</td>
                                        
                                        <td><div className='input-container select' style={{margin: 0}}><Select options={[{label: "Trial", value: "trial"}, {label: "Addition", value: "addition"}, {label: "New", value: "new"}, {label: "Credits", value: "credits"}]} onChange={onChangeValueEvent(["students_info", student_info_index, "form_type"])} value={form_type} localSearch={false}>
                                            <MenuItem value="trial" id="trial">Trial</MenuItem>
                                            <MenuItem value="addition" id="addition">Addition</MenuItem>
                                            <MenuItem value="new" id="new">New</MenuItem>
                                            <MenuItem value="credits" id="credits">Credits</MenuItem>
                                        </Select></div></td>
                                    </tr>
                                )
                            })}
                            </tbody>
                        </table>
                    </div>
                    
                    {/* <input disabled={!is_admin || !is_class_teacher} type="text" placeholder='math, english, beginner, advance etc...' /> */}
                    {/* <ListInput items={students} RenderItem={RenderStudentItem} RenderSuggestion={RenderStudentItem} render_property="_id" onAddItem={onAddStudent} onRemoveItem={onRemoveStudent} disableAdding={!is_admin || (max_students <= (students?.length || 0))} onChangeText={onChangeStudentListText} search_array={studentResults} localSearch={false} /> */}
                </div>}

                <h3>Weekly Schedule</h3>
                <ul className='schedules'>
                    {schedules.map((s, i) => {
                        const {days=[], daily_start_time, daily_end_time} = s;
                        return (
                            <li key={i.toString()}>
                                <div style={{"--mr": 1}} className='input-container'>
                                    <label>Days</label>
                                    <ListInput allowOnlySearchResults always_show_matches search_array={DAYS.slice(1)} search_property={"long"} items={days.map(d => DAYS[d].long)} onAddItem={(day) => onAddScheduleDay(i, day)} onRemoveItem={(index, day) => onRemoveScheduleDay(i, index, day)} />
                                </div>

                                <div style={{"--mr": 0}} className='input-container'>
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

                                <div style={{"--mr": 1}} className='input-container'>
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

                <h3 style={{marginBlock: 20}}>Lessons</h3>

                <div style={{marginBottom: 20}} className='filters-search-container'>
                    <div className='filters-container'>
                            <button className='button secondary lesson-date-range' onClick={openDateRange}>
                                {lessonsRangeStart.toLocaleDateString()} - {lessonsRangeEnd.toLocaleDateString()} <RiCalendar2Line style={{marginLeft: 10}} size={20} />
                            </button>

                            <button className='button primary lesson-date-range' /* onClick={openEditLesson} */ disabled title="Add lessons on edit page after creating">
                                Add Lesson
                            </button>

                            <EditLessonModal show={showEditLesson} onClose={closeEditLesson} newDate={editLesson.date} newStartTime={editLesson.start_time} newEndTime={editLesson.end_time} onClickDone={onClickDoneEditLesson} onPickNewDate={onEditLessonValue("date")} onPickNewStartTime={onEditLessonValue("start_time")} onPickNewEndTime={onEditLessonValue("end_time")} />

                            <DateRangeModal show={showDateRange} onClose={closeDateRange} startDate={lessonsRangeStart} endDate={lessonsRangeEnd} onClickDone={closeDateRange} onPickStartDate={(v) => setLessonsRangeStart(v)} onPickEndDate={(v) => setLessonsRangeEnd(v)} />
                    </div>
                </div>
                
                <div className='table-container'>
                    <table>
                        <TableHead headers={[{label: "Date", id: "date", sortable: false}, {label: "Day", id: "day", sortable: false}, {label: "Start - End (Time)", id: "time", sortable: false}]} />

                        <tbody>
                            {lessonsInRange.map((l) => {
                                const {date, start_time, end_time, is_custom_date=false} = l;
                                return (
                                    <tr style={{backgroundColor: is_custom_date?"rgba(0, 100, 255, 0.3)":"transparent"}}>
                                        <td>{date.toLocaleDateString()}</td>
                                        <td>{DAYS[date.getDay()].long}</td>
                                        <td>{start_time.toLocaleTimeString(undefined, {hour12: true, hour: "numeric", minute: "2-digit"})} - {end_time.toLocaleTimeString(undefined, {hour12: true, hour: "numeric", minute: "2-digit"})}</td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>

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