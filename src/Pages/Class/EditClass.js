import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { connect } from 'react-redux';
import { update_class, edit_class_value, get_class, get_teachers, set_loading, set_teachers, get_class_reschedules, request_class_reschedule, accept_class_reschedule, reject_class_reschedule } from '../../Actions';
import {RiImageAddLine, RiCloseCircleFill, RiCalendar2Line, RiCloseLine} from "react-icons/ri";
import {BsCurrencyDollar} from "react-icons/bs";
import {MenuItem, Select, Switch, TextField} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { DatePicker, StaticDatePicker } from '@mui/x-date-pickers';
import {formatDistance, formatDistanceToNow, intervalToDuration} from "date-fns";
import { DAY, DAYS, MONTHS } from '../../Data';
import { INIT_EDIT_CLASS } from '../../Actions/types';
import RescheduleModal from '../../Components/Class/RescheduleModal';
import Reschedule from '../../Components/Class/Reschedule';
import { debounce, get_full_image_url, ordinal_suffix, throttle, unique_filter } from '../../Utils';
import { ListInput, TypeSelect, TableHead, FileUploadDropArea } from '../../Components/Common';

import "./Class.css";
import "./EditClass.css";
import { api } from '../../Utils/api';
import ColorPicker from '../../Components/Class/ColorPicker';
import EditLessonModal from '../../Components/Class/EditLessonModal';
import DateRangeModal from '../../Components/Class/DateRangeModal';
import { is_same_lesson } from '../../Utils/app';

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

const EditClass = ({user, teachers=[], total_teachers=0, edit_class={}, app_config={}, is_admin, is_teacher, get_teachers, edit_class_value, update_class, set_teachers, get_class_reschedules, get_class, request_class_reschedule, accept_class_reschedule, reject_class_reschedule, set_loading}) => {
    const current_date = new Date();

    const [showDateRange, setShowDateRange] = useState(false);

    const [showEditLesson, setShowEditLesson] = useState(false);
    const [EditLessonIndex, setEditLessonIndex] = useState(-1);
    const [editLesson, setEditLesson] = useState({date: null, start_time: new Date(), end_time: new Date()});

    const [allLessonsSelected, setAllLessonsSelected] = useState(false);
    const [selectedLessons, setSelectedlessons] = useState([]);

    const [currentReschedule, setCurrentReschedule] = useState(null);
    const [showReschedule, setShowReschedule] = useState(false);
    
    const [rescheduleNewDate, setRescheduleNewDate] = useState(null);
    const [rescheduleNewStartTime, setRescheduleNewStartTime] = useState(new Date());
    const [rescheduleNewEndTime, setRescheduleNewEndTime] = useState(new Date());
    const [rescheduleReason, setRescheduleReason] = useState("");

    const [lessonsRangeStart, setLessonsRangeStart] = useState(new Date(current_date.getFullYear(), current_date.getMonth(), current_date.getDate() - (current_date.getDay()), 0, 0, 0));
    const [lessonsRangeEnd, setLessonsRangeEnd] = useState(new Date(lessonsRangeStart.getTime() + (DAY * 7)));

    const [studentToAdd, setStudentToAdd] = useState("");
    const [studentSearch, setStudentSearch] = useState("");

    const [teacherSearch, setTeacherSearch] = useState("");
    const [coverPreview, setCoverPreview] = useState({file: null, url: ""});
    const [errors, setErrors] = useState({});

    const {subjects=[], tags:configTags=["AP", "K12"], levels=[], class_colors=["gold", "red", "grey", "orange", "blue", "green"]} = app_config || {};

    const {_id, title="", subject="", cover_image="", description="", level="", class_type="", teacher=is_teacher?user._id:"", price=0, max_students=1, bg_color="#CCEABB", text_color="white", tags=[], schedules=[], custom_dates=[], cancelled_dates=[], students=[], students_info=[], start_date=(new Date()), end_date=(new Date()), meeting_link="", billing_schedule="", archived=false, sessions=[], reschedules=[], error} = edit_class;

    const is_class_teacher = user._id === (teacher?._id || teacher)

    const total_session_time = sessions.reduce((prev, curr, i, arr) => {
        return prev + (((new Date(curr.end_time)).getTime()) - ((new Date(curr.start_time)).getTime()));
    }, 0);

    const avg_session_time = sessions.length && (total_session_time/sessions.length);

    // console.log(edit_class);

    const navigate = useNavigate();
    const {class_id} = useParams();

    useEffect(() => {
        if(lessonsRangeStart.getTime() >= lessonsRangeEnd.getTime()){
            setLessonsRangeEnd(new Date(lessonsRangeStart.getTime() + DAY));
        }
    }, [lessonsRangeStart]);

    useEffect(() => {
        const init = async () => {
            if(class_id && class_id !== _id){
                set_loading(true);
                await get_class(class_id, INIT_EDIT_CLASS);
                await get_class_reschedules(class_id, 20, 0, JSON.stringify({createdAt: "desc"}), "{}");
                set_loading(false);
            }
        }
        
        is_teacher && set_teachers([{...user}]);

        init();
    }, [class_id]);

    useEffect(() => {
        if(selectedLessons.length !== 1){
            setShowReschedule(false);
        }
    }, [selectedLessons]);

    const onSelectLesson = (e, lesson) => {
        const {id, date, start_time} = lesson;

        const index = selectedLessons.findIndex((sl) => sl.id === id);

        if(index === -1){
            setSelectedlessons((s) => [...s, lesson]);
        }else{
            setSelectedlessons((s) => s.filter((l) => l.id !== id));
        }
    }

    const onEditLessonValue = (key) => (value) => {
        setEditLesson((el) => ({...el, [key]: value}));
    }

    const initEditLesson = (lesson, index) => {
        setEditLesson({...lesson, index});
    }

    const onClickDoneEditLesson = () => {
        if(EditLessonIndex !== -1){
            custom_dates[EditLessonIndex] = {...editLesson}
        }else{
            custom_dates.push(editLesson);
        }

        edit_class_value(["custom_dates"], [...custom_dates]);

        closeEditLesson();
    }

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

    useEffect(() => {
        setSelectedlessons([]);
    }, [lessonsRangeStart, lessonsRangeEnd]);

    const onChangeStudentListText = (e) => {
        const {name, value, checked, type} = e.target;

        setStudentSearch(value)
    }

    const onClickReschedule = (e) => {
        setShowReschedule(s => !s);
    }

    const closeRescheduleModal = () => {
        setShowReschedule(false);
    }

    const openRescheduleModal = () => {
        setShowReschedule(true);
    }

    const closeEditLesson = () => {
        setShowEditLesson(false);

        setEditLessonIndex(-1);
        setEditLesson({date: null, start_time: new Date(), end_time: new Date()});
    }

    const cancelLessons = () => {
        cancelled_dates.push(...selectedLessons);
        const new_custom_dates = custom_dates.map((cd) => selectedLessons.some((sl) => is_same_lesson(sl, cd))?{...cd, cancelled: true}:cd);

        edit_class_value(["cancelled_dates"], [...cancelled_dates]);
        edit_class_value(["custom_dates"], new_custom_dates);
        setSelectedlessons([]);
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

    const acceptRescheduleRequestNewDate = async () => {
        if(currentReschedule && rescheduleNewDate && rescheduleNewStartTime && rescheduleNewEndTime){
            set_loading(true);
            
            const {_id} = currentReschedule;
            
            if(await accept_class_reschedule(_id, {new_date: rescheduleNewDate, new_start_time: rescheduleNewStartTime, new_end_time: rescheduleNewEndTime})){
                console.log("CLOSE MODAL");
                // await get_class_reschedules(class_id, 20, 0, JSON.stringify({createdAt: "desc"}), "{}");
                
                closeRescheduleModal();
                setRescheduleNewDate(null);
                setCurrentReschedule(null);
            }
            
            set_loading(false);
        }
    }

    const onAcceptReschedule = async (r) => {
        const {_id, new_date, new_start_time, new_end_time} = r;

        if(new_date && new_start_time && new_end_time){
            set_loading(true);
            if(await accept_class_reschedule(_id, {new_date, new_start_time, new_end_time})){
                // await get_class_reschedules(class_id, 20, 0, JSON.stringify({createdAt: "desc"}), "{}");
            }
            set_loading(false);
        }else{
            setCurrentReschedule(r);
            openRescheduleModal();
        }
    }

    const onRejectReschedule = async (r) => {
        set_loading(true);
        if(await reject_class_reschedule(r._id)){
            await get_class_reschedules(class_id, 20, 0, JSON.stringify({createdAt: "desc"}), "{}");
        }
        set_loading(false);
    }

    const onRequestReschedule = async () => {
        set_loading(true);

        if(await request_class_reschedule({_class: edit_class, old_date: selectedLessons[0].date, old_start_time: selectedLessons[0].start_time, old_end_time: selectedLessons[0].end_time, new_date: rescheduleNewDate, new_start_time: rescheduleNewStartTime, new_end_time: rescheduleNewEndTime, reason: rescheduleReason})){
            closeRescheduleModal();
            setRescheduleNewDate(null);
            setSelectedlessons([]);
            setRescheduleReason("");

            await get_class_reschedules(class_id, 20, 0, JSON.stringify({createdAt: "desc"}), "{}");
        }

        set_loading(false);
    }

    const onChangeValueEvent = (keys=[], numeric=false) => (e, val) => {
        const {name, value, checked, type} = e.target;
        const is_checkbox = type === "checkbox";
        const is_number = (type === "number") || numeric;

        edit_class_value(keys, is_checkbox?checked:is_number?(Number(value)||""):value);
        setErrors(err => ({...err, [keys.join(".")]: ""}));
    }

    const onChangeValue = (keys=[], numeric=false) => (val) => {
        const value = val;
        // console.log(keys, value);

        edit_class_value(keys, numeric?(Number(value) || value):value);
        setErrors(err => ({...err, [keys.join(".")]: ""}));
    }

    const onAddTag = (tag) => {
        tags.push(tag);
        edit_class_value(["tags"], tags);
        setErrors(err => ({...err, tags: ""}));
    }

    const onRemoveTag = (index, tag) => {
        tags.splice(index, 1);

        edit_class_value(["tags"], tags);
        setErrors(err => ({...err, tags: ""}));
    }

    const onAddStudent = (student) => {
        if(student && !students.some((s) => s._id === student._id)){
            students.push(student);
            students_info.push({student: student._id, price_paid: price, date_requested: new Date(), date_joined: new Date(), form_type: "new"})
        }
        
        setStudentToAdd("");
        
        edit_class_value(["students"], students);
        edit_class_value(["students_info"], students_info);
        setErrors(err => ({...err, students: ""}));
    }

    const onRemoveStudent = (index, student) => {
        students.splice(index, 1);

        const student_info_index = students_info.findIndex((si) => si.student === student._id);
        
        if(student_info_index !== -1){
            students_info.splice(student_info_index, 1);
        }

        edit_class_value(["students"], students);
        edit_class_value(["students_info"], students_info);
        setErrors(err => ({...err, students: ""}));
    }
    
    const AddNewSchedule = () => {
        schedules.push({days: [], daily_start_time: new Date(), daily_end_time: new Date()})
        edit_class_value(["schedules"], schedules);
    }
    
    const RemoveNewSchedule = (index) => {
        schedules.splice(index, 1);
        edit_class_value(["schedules"], schedules);
    }
    
    const onTypeTeacherSelect = (e, value) => {
        setTeacherSearch(value);
    };
    
    const onAddScheduleDay = (scehdule_index, day) => {
        schedules[scehdule_index].days.push(day.number);
        
        edit_class_value(["schedules", scehdule_index, "days"], schedules[scehdule_index].days);
    }

    const onRemoveScheduleDay = (scehdule_index, index, day) => {
        schedules[scehdule_index].days.splice(index, 1);
            
        edit_class_value([schedules, scehdule_index, "days"], schedules[scehdule_index].days);
    }

    const onSelectImage = (e) => {
        const file = e.target.files[0];
        const fileReader = new FileReader();
        
        if(file){
            // console.log(file);
            
            fileReader.onload = function(){
                setCoverPreview({url: fileReader.result, file: file});
                edit_class_value(["cover_image"], file.name);
            }
            
            fileReader.readAsDataURL(file);
        }
    }
    
    const onClickRemoveCover = () => {
        setCoverPreview({url: "", file: null});
        edit_class_value(["cover_image"], "");
    }

    const updateClass = async () => {
        set_loading(true);
        const formData = new FormData();
        formData.append("_class", JSON.stringify({_id, title, subject, cover_image, description, level, class_type, teacher: teacher?._id || teacher, price, max_students, bg_color, text_color, tags, schedules, custom_dates, cancelled_dates, start_date, end_date, meeting_link, billing_schedule, archived, students_info, students: students.map((s) => s?._id || s).filter(unique_filter)}));
        if(coverPreview.file){
            formData.append("cover", coverPreview.file);
        }
        

        if(await update_class(formData)){
            // navigate("/dashboard");
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
        const startDate = new Date(start_date);
        const endDate = new Date(end_date);
        lessonsRangeEnd.setHours(23, 59, 59);
        endDate.setHours(23, 59, 59);

        if(lessonsRangeEnd.getTime() >= startDate.getTime()){
            schedules.forEach((s) => {
                const {days=[], daily_start_time, daily_end_time} = s;
                // days.sort();

                let current_lesson_date = new Date(lessonsRangeStart);
                let current_lesson_day = current_lesson_date.getDay();

                while((current_lesson_date.getTime() < lessonsRangeEnd.getTime()) && (current_lesson_date.getTime() < endDate.getTime())){
                    current_lesson_day = current_lesson_date.getDay();

                    if((startDate.getTime() <= current_lesson_date.getTime()) && days.includes(current_lesson_day)){
                        const lesson = {date: new Date(current_lesson_date), start_time: new Date(daily_start_time), end_time: new Date(daily_end_time)};

                        lessons.push({...lesson, is_custom_date: false, cancelled: cancelled_dates.some((cad) => is_same_lesson(lesson, cad))});
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

                    lessons.push(...matching_custom_dates.map((cd) => ({date: new Date(cd.date), start_time: new Date(cd.start_time), end_time: new Date(cd.end_time), is_custom_date: true, cancelled: cd.cancelled || cancelled_dates.some((cad) => is_same_lesson(cd, cad))})))

                    current_lesson_date.setDate(current_lesson_date.getDate() + 1);
                }
            });
        }

        lessons.sort((a, b) => {
            const aDate = new Date(a.date); aDate.setHours(0, 0, 0, 0);
            const bDate = new Date(b.date); bDate.setHours(0, 0, 0, 0);

            const aHours = a.start_time.getHours() + (a.start_time.getMinutes()/60);
            const bHours = b.start_time.getHours() + (b.start_time.getMinutes()/60);

            return (aDate.getTime() + aHours) - (bDate.getTime() + bHours);
        });

        return lessons;
    }, [lessonsRangeStart, custom_dates, cancelled_dates, lessonsRangeEnd]);

    return (
        <div className='page edit-class'>
            <form onSubmit={(e) => {e.preventDefault()}} enctype="multipart/form-data" className='main-col'>
                <h3>Edit Class</h3>

                <div style={{"--mr": 0}} className='input-container fullwidth'>
                    <label>Color</label>
                    
                    <ColorPicker onChange={onChangeValue(["bg_color"])} value={bg_color} colors={class_colors} />
                </div>

                <div style={{"--mr": 1}} className='input-container'>
                    <label>Title</label>
                    
                    <input disabled={!is_admin && !is_class_teacher && !is_class_teacher} placeholder='Class Name' value={title} onChange={onChangeValueEvent(["title"])} />
                </div>

                {/* <div className='input-container cover-file-input'>
                    <label>Cover Image</label>
                    
                    <input disabled={!is_admin && !is_class_teacher && !is_class_teacher} type="file" multiple={false} onChange={onSelectImage} />
                    <FileUploadDropArea title='Upload Cover Image' />
                </div> */}

                <div style={{"--mr": 0}} className='input-container'>
                    <label>Description</label>
                    
                    <textarea disabled={!is_admin && !is_class_teacher && !is_class_teacher} placeholder='Class Description' value={description} onChange={onChangeValueEvent(["description"])} />
                </div>

                <div style={{"--mr": 1}} className='input-container select subject'>
                    <label>Subject</label>
                    
                    <TypeSelect options={subjects.map((s) => ({label: s, value: s}))} placeholder="Subject" value={subject} onChange={onChangeValue(["subject"])} />
                </div>

                <div style={{"--mr": 0}} className='input-container select level'>
                    <label>Level</label>
                    
                    <TypeSelect options={levels.map((l) => ({label: l, value: l}))} placeholder="Level" value={level} onChange={onChangeValue(["level"])} />
                    {/* <select placeholder='Proficiency Level' value={level} onChange={onChangeValueEvent(["level"])}>
                        <option value={""}>Select</option>
                        {levels.map((l) => {
                            return <option value={l} key={l}>{l}</option>
                        })}
                    </select> */}
                </div>

                <div style={{"--mr": 1}} className='input-container select'>
                    <label>Type</label>
                    
                    <TypeSelect options={class_type_options} placeholder="Class Type" value={class_type} onChange={onChangeValue(["class_type"])} />
                </div>

                <div style={{"--mr": 0}} className='input-container select'>
                    <label>Teacher</label>
                    
                    <TypeSelect disabled={is_teacher} options={(is_teacher?[user]:teachers).map((t) => ({label: `${t.name.first} ${t.name.last}${is_teacher?" (You)":""}`, value: t._id, teacher: t}))} placeholder="Select Teacher" onChangeText={onTypeTeacherSelect} textValue={teacherSearch} renderOption={RenderTeacherOption} renderSelected={RenderTeacherOption} onChange={onChangeValue(["teacher"])} value={teacher?._id || teacher} localSearch={false} />
                </div>

                <div style={{"--mr": 1}} className='input-container price'>
                    <label>Price</label>
                    
                    <input disabled={!is_admin && !is_class_teacher && !is_class_teacher} placeholder='00000' style={{paddingLeft: "50px"}} value={price} onChange={onChangeValueEvent(["price"])} />
                    
                    <div className='input-adornment start' style={{backgroundColor: "transparent", borderRight: "2px solid rgba(0,0,0,0.1)"}}>
                        <BsCurrencyDollar color='rgba(0,0,0,0.3)' size={"20px"} />
                    </div>
                </div>

                <div style={{"--mr": 1}} className='input-container max-students'>
                    <label>Max Students</label>
                    
                    <input disabled={!is_admin && !is_class_teacher || class_type === "private"} placeholder='1' min={1} type="number" value={max_students} onChange={onChangeValueEvent(["max_students"])}  />
                </div>

                <div style={{"--mr": 0}} className='input-container select pricing-type'>
                    <label>Pricing Type</label>
                    
                    <TypeSelect placeholder='Select' options={pricing_type_options} value={billing_schedule} onChange={onChangeValue(["billing_schedule"])}  />
                </div>

                {/* <div className='input-container background color'>
                    <label>Background Color</label>
                    
                    <input disabled={!is_admin && !is_class_teacher && !is_class_teacher} type="color" value={bg_color} onChange={onChangeValueEvent(["bg_color"])} />
                </div>

                <div className='input-container color'>
                    <label>Text Color</label>
                    
                    <input disabled={!is_admin && !is_class_teacher && !is_class_teacher} type="color" value={text_color} onChange={onChangeValueEvent(["text_color"])} />
                </div>

                <div className='input-container color-preview'>
                    <label>Color Preview</label>
                    
                    <input style={{backgroundColor: bg_color, color: text_color, fontWeight: "700"}} value={"Look On Schedule Calendar"} disabled />
                </div> */}

                <div style={{"--mr": 1}} className='input-container meeting-link'>
                    <label>Meeting Link</label>
                    
                    <input disabled={!is_admin && !is_class_teacher && !is_class_teacher} placeholder='Meeting Link' value={meeting_link} onChange={onChangeValueEvent(["meeting_link"])} />
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
                            <TableHead headers={[{label: "Student", id: "student", sortable: false}, {label: "Price Paid", id: "price_paid", sortable: false}, {label: "Date Joined", id: "date_joined", sortable: false}, {label: "Form Type", id: "form_type", sortable: false}, {label: "Note", id: "note", sortable: false}]} />

                            <tbody>
                            {students.map((s, i) => {
                                const {_id, name={}} = s;
                                
                                let student_info_index = students_info.findIndex((si) => si.student === _id);

                                if(student_info_index === -1){
                                    students_info.push({student: _id, price_paid: price, date_requested: new Date(), date_joined: new Date(), form_type: "new"});

                                    edit_class_value(["students_info"], students_info);

                                    return null
                                }

                                const student_info = students_info[student_info_index] || {};
                                const {price_paid=0, date_joined=new Date(), form_type="", note=""} = student_info;

                                return (
                                    <tr key={_id}>
                                        <td style={{whiteSpace: "nowrap"}}><button className='button error' onClick={() => {onRemoveStudent(i, s)}}><RiCloseLine /></button> {name.first} {name.last}</td>

                                        <td><div className='input-container' style={{margin: 0, width: "unset", "--input-height": "40px"}}><input type="number" min="" placeholder="Price Paid" style={{paddingLeft: 50}} onChange={onChangeValueEvent(["students_info", student_info_index, "price_paid"])} value={price_paid} /><div className='input-adornment start' style={{backgroundColor: "transparent", borderRight: "2px solid rgba(0,0,0,0.1)"}}><BsCurrencyDollar color='rgba(0,0,0,0.3)' size={"20px"} /></div></div></td>
                                        
                                        <td>{(new Date(date_joined)).toLocaleDateString()}</td>
                                        
                                        <td><div className='input-container select' style={{margin: 0}}><Select options={[{label: "Trial", value: "trial"}, {label: "Addition", value: "addition"}, {label: "New", value: "new"}, {label: "Credits", value: "credits"}]} onChange={onChangeValueEvent(["students_info", student_info_index, "form_type"])} value={form_type} localSearch={false}>
                                            <MenuItem value="trial" id="trial">Trial</MenuItem>
                                            <MenuItem value="addition" id="addition">Addition</MenuItem>
                                            <MenuItem value="new" id="new">New</MenuItem>
                                            <MenuItem value="credits" id="credits">Credits</MenuItem>
                                        </Select></div></td>

                                        <td><div className='input-container' style={{margin: 0, width: "100%"}}><textarea onChange={onChangeValueEvent(["students_info", student_info_index, "note"])} style={{height: 60, resize: "none"}} value={note} placeholder="Note" /></div></td>
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
                <ul className='schedules' title='cannot edit class schedule'>
                    {schedules.map((s, i) => {
                        const {days=[], daily_start_time, daily_end_time} = s;
                        return (
                            <li key={i.toString()}>
                                <div style={{"--mr": 1}} className='input-container'>
                                    <label>Days</label>
                                    <ListInput disabled disableAdding allowOnlySearchResults always_show_matches search_array={DAYS.slice(0, 7)} search_property={"long"} items={days.map(d => DAYS[d].long)} /* onAddItem={(day) => onAddScheduleDay(i, day)} onRemoveItem={(index, day) => onRemoveScheduleDay(i, index, day)} */ />
                                </div>

                                <div style={{"--mr": 0}} className='input-container'>
                                    <label>Start Time</label>
                                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                                    <TimePicker
                                        // label="Start Time"
                                        disabled
                                        value={daily_start_time}
                                        // onChange={(v) => onChangeValue(["schedules", i, "daily_start_time"])((v || (new Date())).getTime())}
                                        renderInput={(params) => <TextField {...params} />}
                                    />
                                    </LocalizationProvider>
                                </div>

                                <div style={{"--mr": 1}} className='input-container'>
                                    <label>End Time</label>
                                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                                    <TimePicker
                                        // label="End Time"
                                        disabled
                                        value={daily_end_time}
                                        // onChange={(v) => onChangeValue(["schedules", i, "daily_end_time"])((v || (new Date())).getTime())}
                                        renderInput={(params) => <TextField {...params} />}
                                    />
                                    </LocalizationProvider>
                                </div>

                                {(schedules.length > 1) && <div className='input-container' style={{verticalAlign: "bottom"}}>
                                    <button disabled className='button error fullheight fullwidth remove' /* onClick={() => {RemoveNewSchedule(i)}} */>Remove</button>
                                </div>}
                            </li>
                        )
                    })}
                </ul>

                <button className='button primary' disabled onClick={AddNewSchedule} title="cannot edit class schedule">New Schedule</button>
                
                <div style={{display: "flex", justifyContent: "flex-end", marginTop: 50}}>
                    <button onClick={updateClass} disabled={!is_admin && !is_class_teacher} className='button primary'>Update Class</button>
                </div>

                {error && <p className='error' style={{textAlign: "end"}}>{error}</p>}

                <h3 style={{marginBlock: 20}}>Lessons</h3>

                <div style={{marginBottom: 20}} className='filters-search-container'>
                    <div className='filters-container'>
                            <button className='button secondary lesson-date-range' onClick={openDateRange}>
                                {lessonsRangeStart.toLocaleDateString()} - {lessonsRangeEnd.toLocaleDateString()} <RiCalendar2Line style={{marginLeft: 10}} size={20} />
                            </button>

                            <button className='button primary' onClick={openEditLesson}>
                                Add Lesson
                            </button>

                            {(!!selectedLessons.length && is_admin) && <button className='button error' onClick={cancelLessons}>
                                Cancel Lesson
                            </button>}

                            {((selectedLessons.length === 1) && (is_teacher)) && <button className='button error' onClick={onClickReschedule}>
                                Reschedule
                            </button>}

                            <EditLessonModal show={showEditLesson} onClose={closeEditLesson} newDate={editLesson.date} newStartTime={editLesson.start_time} newEndTime={editLesson.end_time} onClickDone={onClickDoneEditLesson} onPickNewDate={onEditLessonValue("date")} onPickNewStartTime={onEditLessonValue("start_time")} onPickNewEndTime={onEditLessonValue("end_time")} />

                            <DateRangeModal show={showDateRange} onClose={closeDateRange} startDate={lessonsRangeStart} endDate={lessonsRangeEnd} onClickDone={closeDateRange} onPickStartDate={(v) => setLessonsRangeStart(v)} onPickEndDate={(v) => setLessonsRangeEnd(v)} />
                    </div>
                </div>
                
                <div className='table-container'>
                    <table>
                        <TableHead headers={[{label: "Date", id: "date", sortable: false}, {label: "Day", id: "day", sortable: false}, {label: "Start - End (Time)", id: "time", sortable: false}]} />

                        <tbody>
                            {lessonsInRange.map((l) => {
                                const {date, start_time, end_time, is_custom_date=false, cancelled=false} = l;
                                const id = `${(date.getTime())}-${(start_time.getTime())}`;
                                
                                const selectable = !cancelled;
                                const is_selected = selectedLessons.some((sl) => sl.id === id);

                                return (
                                    <tr style={{backgroundColor: cancelled?"rgba(255, 0, 100, 0.3)":is_custom_date?"rgba(0, 100, 255, 0.3)":"transparent"}}>
                                        <td>{selectable && <label style={{display: "unset"}} className="checkbox-container" htmlFor={id}><input type="checkbox" name={id} id={id} checked={is_selected} onChange={(e) => {onSelectLesson(e, {...l, id})}}/><span className="checkmark"></span></label>} {date.toLocaleDateString()}</td>
                                        <td>{DAYS[date.getDay()].long}</td>
                                        <td>{start_time.toLocaleTimeString(undefined, {hour12: true, hour: "numeric", minute: "2-digit"})} - {end_time.toLocaleTimeString(undefined, {hour12: true, hour: "numeric", minute: "2-digit"})}</td>
                                        {/* <td></td> */}
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>

                <div style={{display: "flex", justifyContent: "flex-end", marginTop: 50}}>
                    <button onClick={updateClass} disabled={!is_admin && !is_class_teacher && !is_class_teacher} className='button primary'>Update Class</button>
                </div>

                {error && <p className='error' style={{textAlign: "end"}}>{error}</p>}
            </form>

            <div className='misc-col'>
                <h3 style={{marginBottom: "20px"}}>Session Info</h3>

                <p>Total Sessions: {sessions.length}</p>
                <p>Total Session time: {total_session_time && formatDistance(total_session_time, 0, {includeSeconds: true, addSuffix: false})}</p>
                <p>Average Session time: {total_session_time && formatDistance(avg_session_time, 0, {includeSeconds: true, addSuffix: false})}</p>
                
                <div style={{marginBlock: "20px"}} className='table-container'>
                    <table>
                        <TableHead headers={[{label: "Date", id: "start_time", sortable: true}, {label: "# Students", id: "students", sortable: false}, {label: "Total", id: "price", sortable: false}]} />

                        <tbody>
                            {sessions.slice(0, 10).map((s) => {
                                const {_id, _class, teacher, students, start_time, end_time, active, meeting_link} = s;
                                const startTime = new Date(start_time);
                                const endTime = new Date(end_time);

                                const duration = endTime && intervalToDuration({start: startTime, end: endTime});

                                return (
                                    <tr>
                                        <td>{startTime.toLocaleString(undefined, {dateStyle: "short", timeStyle: "short"})}</td>
                                        <td><center>{students.length}</center></td>
                                        <td>{price * students.length}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                <h3 style={{marginBlock: "20px"}}>Reschedules</h3>

                <ul className='reschedules'>
                    {reschedules.map((r) => {
                        const {_id, reason} = r;

                        return (
                            <li key={_id} title={reason}>
                                <Reschedule reschedule={r} is_admin={is_admin} onAccept={onAcceptReschedule} onReject={onRejectReschedule} />
                            </li>
                        )
                    })}
                </ul>

                {is_teacher && <>
                    {/* <button className='button primary fullwidth' onClick={onClickReschedule}>Reschedule</button> */}

                    <RescheduleModal show={showReschedule} onClose={closeRescheduleModal} end_date={end_date} newDate={rescheduleNewDate} onPickNewDate={setRescheduleNewDate} onPickNewStartTime={setRescheduleNewStartTime} newStartTime={rescheduleNewStartTime} onPickNewEndTime={setRescheduleNewEndTime} newEndTime={rescheduleNewEndTime} onChangeReason={(e) => setRescheduleReason(e.target.value)} reason={rescheduleReason} validDays={schedules.flatMap((s) => s.days).filter(unique_filter)} onRequestReschedule={onRequestReschedule} />
                </>}

                {is_admin && <RescheduleModal show={showReschedule} onClose={closeRescheduleModal} end_date={end_date} newDate={rescheduleNewDate} onPickNewDate={setRescheduleNewDate} onPickNewStartTime={setRescheduleNewStartTime} newStartTime={rescheduleNewStartTime} onPickNewEndTime={setRescheduleNewEndTime} newEndTime={rescheduleNewEndTime} acceptRequest={acceptRescheduleRequestNewDate} newTimeOnly />}
            </div>
        </div>
    );
}

function map_state_to_props({App, Auth, Class, Admin}){
    return {user: App.user, teachers: Admin.teachers, total_teachers: Admin.total_teachers, is_admin: Auth.is_admin, is_teacher: Auth.is_teacher, edit_class: Class.edit, app_config: App.config};
}
 
export default connect(map_state_to_props, {get_teachers, edit_class_value, update_class, set_teachers, get_class, get_class_reschedules, request_class_reschedule, accept_class_reschedule, reject_class_reschedule, set_loading})(EditClass);