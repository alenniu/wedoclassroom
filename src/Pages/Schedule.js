import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { get_classes_schedules, get_my_classes, set_loading } from '../Actions';
import { useNavigate } from 'react-router-dom';
import NewSchedule from '../Components/Dashboard/NewSchedule';
import { DAY, get_week_date_range, MONTHS } from '../Data';
import { debounce, get_full_image_url, get_week_end, get_week_start } from '../Utils';
import { api } from '../Utils/api';
import { TypeSelect } from '../Components/Common';

import "./Schedule.css";
import { is_same_lesson } from '../Utils/app';

const RenderUserOption = ({label, value, user}) => {
    return (
        <div style={{display: "flex", alignItems: "center"}}>
            <div className='user-image-container' style={{flexShrink: 0, height: "30px", width: "30px", overflow: 'hidden', backgroundColor: "black", borderRadius: "50%", marginRight: "10px"}}>
                <img src={get_full_image_url(user.photo_url || '/Assets/Images/AuthBackground.png')} style={{height: "100%", width: "100%", objectFit: "cover"}} />
            </div>

            <span>{label}</span>
        </div>
    )
}

const RenderUserValue = ({label, value, user}) => {
    return (
        <div style={{display: "flex", alignItems: "center", whiteSpace: "nowrap", overflowX: "hidden"}}>
            <div className='user-image-container' style={{flexShrink: 0, height: "calc(var(--input-height, 40px) - 10px)", width: "calc(var(--input-height, 40px) - 10px)", overflow: 'hidden', backgroundColor: "black", borderRadius: "50%", marginRight: "10px"}}>
                <img src={get_full_image_url(user.photo_url || '/Assets/Images/AuthBackground.png')} style={{height: "100%", width: "100%", objectFit: "cover"}} />
            </div>

            <span>{label}</span>
        </div>
    )
}

const RenderClassOption = ({label, value, _class}) => {
    return (
        <div style={{display: "flex", alignItems: "center"}}>
            <div className='class-image-container' style={{flexShrink: 0, height: "30px", width: "30px", overflow: 'hidden', backgroundColor: "black", borderRadius: "50%", marginRight: "10px"}}>
                <img src={get_full_image_url(_class.cover_image || '/Assets/Images/AuthBackground.png')} style={{height: "100%", width: "100%", objectFit: "cover"}} />
            </div>

            <span>{label}</span>
        </div>
    )
}

const RenderClassValue = ({label, value, _class}) => {
    return (
        <div style={{display: "flex", alignItems: "center", whiteSpace: "nowrap", overflowX: "hidden"}}>
            <div className='class-image-container' style={{flexShrink: 0, height: "calc(var(--input-height, 40px) - 10px)", width: "calc(var(--input-height, 40px) - 10px)", overflow: 'hidden', backgroundColor: "black", borderRadius: "50%", marginRight: "10px"}}>
                <img src={get_full_image_url(_class.cover_image || '/Assets/Images/AuthBackground.png')} style={{height: "100%", width: "100%", objectFit: "cover"}} />
            </div>

            <span>{label}</span>
        </div>
    )
}

const CALENDAR_FILTERS = [{label: "Student", name: "students", renderOption: RenderUserOption, renderValue: RenderUserValue}, {label: "Teacher", name: "teacher", renderOption: RenderUserOption, renderValue: RenderUserValue}, {label: "Class", name: "_id", renderOption: RenderClassOption, renderValue: RenderClassValue}, {label: "Subject", name: "subject", renderOption: null}, {label: "Level", name: "level", renderOption: null}, {label: "Class Type", name: "class_type", renderOption: null}];

const SchedulePage = ({app_config, classes_schedules=[], reschedules=[], get_classes_schedules, is_admin, is_sales, is_teacher, is_student, set_loading}) => {

    
    const current_date = new Date();
    
    const [calendarSearch, setCalendarSearch] = useState("");
    const [calendarFilters, setCalendarFilters] = useState({});
    const [timeSpan, setTimeSpan] = useState(7 * DAY);
    const [dateRange, setDateRange] = useState({min: get_week_start(current_date), max: get_week_end(current_date)});
    
    const [selectTeachers, setSelectTeachers] = useState([]);
    const [SelectStudents, setSelectStudents] = useState([]);
    const [selectClasses, setSelectClasses] = useState([]);
    
    const {subjects=[], levels=[]} = app_config || {};

    const schedules = useMemo(() => classes_schedules.flatMap(({schedules, ...c}) => {
        return  schedules.map((s) => ({...s, ...c}));
    }), [classes_schedules]);

    const lessonsInRange = useMemo(() => {
        const lessons = [];
        // dateRange.max.setHours(23, 59, 59);
        
        schedules.forEach((s) => {
            const {days=[], daily_start_time, daily_end_time, timzone, ..._class} = s;
            const {start_date, end_date, custom_dates=[], cancelled_dates=[]} = _class;

            const startDate = new Date(start_date);
            const endDate = new Date(end_date);

            if(dateRange.max.getTime() >= startDate.getTime()){
                endDate.setHours(23, 59, 59);

                let current_lesson_date = new Date(dateRange.min);
                let current_lesson_day = current_lesson_date.getDay();

                while((current_lesson_date.getTime() < dateRange.max.getTime() && (current_lesson_date.getTime() < endDate.getTime()))){
                    current_lesson_day = current_lesson_date.getDay();

                    if((startDate.getTime() <= current_lesson_date.getTime()) && days.includes(current_lesson_day)){
                        const lesson = {date: new Date(current_lesson_date), start_time: new Date(daily_start_time), end_time: new Date(daily_end_time), ..._class};

                        lessons.push({...lesson, is_custom_date: false, is_cancelled: cancelled_dates.some((cad) => is_same_lesson(lesson, cad))});
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

                    lessons.push(...matching_custom_dates.map((cd) => ({date: new Date(cd.date), start_time: new Date(cd.start_time), end_time: new Date(cd.end_time), is_custom_date: true, is_cancelled: cancelled_dates.some((cad) => is_same_lesson(cd, cad)), ..._class})))

                    current_lesson_date.setDate(current_lesson_date.getDate() + 1);
                }
            }
        });

        lessons.sort((a, b) => {
            const aDate = new Date(a.date); aDate.setHours(0, 0, 0);
            const bDate = new Date(b.date); bDate.setHours(0, 0, 0);

            const aHours = a.start_time.getHours() + (a.start_time.getMinutes()/60);
            const bHours = b.start_time.getHours() + (b.start_time.getMinutes()/60);

            return (aDate.getTime() + aHours) - (bDate.getTime() + bHours);
        });

        return lessons;
    }, [schedules]);

    const getStudents = useCallback(debounce(async (search) => {
        const res = await api("get", "/api/admin/accounts", {params: {search, limit: 20, offset: 0, filters: JSON.stringify({type: "student"})}});
    
        setSelectStudents(res?.data?.accounts || []);
    }, 300), []);
    
    const getTeachers = useCallback(debounce(async (search) => {
        const res = await api("get", "/api/admin/accounts", {params: {search, limit: 20, offset: 0, filters: JSON.stringify({type: "teacher"})}});
    
        return setSelectTeachers(res?.data?.accounts || []);
    }, 300), []);
    
    const getClasses = useCallback(debounce(async (search) => {
        const res = await api("get", "/api/admin/classes", {params: {search, limit: 20, offset: 0}});
    
        return setSelectClasses(res?.data?.classes || []);
    }, 300), []);

    const getSelectOptions = ({label, name}) => {
        switch(name){
            case "students":
                return SelectStudents.map((s) => ({label: `${s.name.first} ${s.name.last}`, value: s._id, user: s}));
            break;

            case "teacher":
                return selectTeachers.map((t) => ({label: `${t.name.first} ${t.name.last}`, value: t._id, user: t}));;
            break;

            case "_id":
                return selectClasses.map((c) => ({label: c.title, value: c._id, _class: c}));;
            break;

            case "subject":
                return subjects.map((s) => ({label: s, value: s}));
            break;

            case "level":
                return levels.map((s) => ({label: s, value: s}));
            break;

            case "class_type":
                return [{label: "Group", value: "group"}, {label: "Private", value: "private"}];
            break;

            default:
                return [];
        }
    }

    const onChangeSelectText = async (e, text) => {
        switch(e.target.name){
            case "students":
                getStudents(text);
            break;

            case "teacher":
                getTeachers(text);
            break;

            case "_id":
                getClasses(text);
            break;

            case "subject":
                return subjects.map((s) => ({label: s, value: s}));
            break;

            case "level":
                return levels.map((s) => ({label: s, value: s}));
            break;

            case "class_type":
                return [{label: "Group", value: "group"}, {label: "Private", value: "private"}];
            break;

            default:
                return false;
        }
    }

    const get_schedules = useCallback(debounce(async (dateRange, filters={}, search="") => {
        const {min, max} = dateRange;
        set_loading(true);
        await get_classes_schedules({startPeriod: min, endPeriod: max}, JSON.stringify(filters), search);
        set_loading(false);
    }, 300), []);

    const getNextDateRange = () => {
        setDateRange((r) => ({min: new Date(r.min.getTime() + timeSpan), max: new Date(r.max.getTime() + timeSpan)}));
    }
    
    const getPrevDateRange = () => {
        setDateRange((r) => ({min: new Date(r.min.getTime() - timeSpan), max: new Date(r.max.getTime() - timeSpan)}));
    }

    const setFilter = (name) => (value) => {
        setCalendarFilters((cf) => ({...cf, [name]: value || undefined}));
    }

    const onChangeCalendarSearch = (e) => {
        setCalendarSearch(e.target.value);
    }

    // console.log({classes_schedules, schedules});
    
    const navigate = useNavigate();

    useEffect(() => {
        get_schedules(dateRange, calendarFilters, calendarSearch);
    }, [dateRange, calendarFilters, calendarSearch]);

    return (
        <div className='page schedule'>
            <div className='main-col fullwidth'>
                <div className='filters-search-container'>
                    <div className='filters-container'>
                        {CALENDAR_FILTERS.map((f) => {
                            const options = getSelectOptions(f);

                            return (
                                <div className='input-container select' key={f.name}>
                                    <TypeSelect options={options} placeholder={f.label} value={calendarFilters[f.name] || ""} localSearch={false} onChange={setFilter(f.name)} renderOption={f.renderOption} renderSelected={f.renderValue || f.renderOption} onChangeText={onChangeSelectText} placeholderAsOption name={f.name} onOpen={(e) => {!options.length && onChangeSelectText(e)}} />
                                </div>
                            )
                        })}
                    </div>
                    <div className='search-container'>
                        <div className='input-container'>
                            <input value={calendarSearch} onChange={onChangeCalendarSearch} placeholder="Search Classes" />
                        </div>
                    </div>
                </div>
                <NewSchedule lessons={lessonsInRange} reschedules={reschedules} date_range={dateRange} onClickNextDateRange={getNextDateRange} onClickPrevDateRange={getPrevDateRange} is_admin={is_admin} is_teacher={is_teacher} is_sales={is_sales} />
            </div>
        </div>
    );
}

function map_state_to_props({App, Auth, User}){
    return {classes: User.classes, total: User.total_classes, classes_schedules: User.classes_schedules, reschedules: User.reschedules, app_config: App.config, user: App.user, is_admin: Auth.is_admin, is_sales: Auth.is_sales, is_teacher: Auth.is_teacher, is_student: Auth.is_student}
}

export default connect(map_state_to_props, {get_classes_schedules, set_loading})(SchedulePage);