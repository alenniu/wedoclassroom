import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { get_classes_schedules, get_my_classes, set_loading } from '../Actions';
import Tabs from '../Components/Common/Tabs';
import Class from '../Components/Dashboard/Class';
import "./Dashboard.css";
import Schedule from '../Components/Dashboard/Schedule';
import { useNavigate } from 'react-router-dom';
import InfiniteScroller from '../Components/Common/InfiniteScroller';
import NewSchedule from '../Components/Dashboard/NewSchedule';
import { DAY, get_week_date_range, MONTHS } from '../Data';
import { debounce, get_full_image_url } from '../Utils';
import TypeSelect from '../Components/Common/TypeSelect';
import { api } from '../Utils/api';

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

const CALENDAR_FILTERS = [{label: "Student", name: "students", renderOption: RenderUserOption}, {label: "Teacher", name: "teacher", renderOption: RenderUserOption}, {label: "Class", name: "_id", renderOption: RenderClassOption}, {label: "Subject", name: "subject", renderOption: null}, {label: "Level", name: "level", renderOption: null}, {label: "Class Type", name: "class_type", renderOption: null}];

const Dashboard = ({classes=[], total=0, app_config={}, classes_schedules=[], reschedules=[], get_classes_schedules, get_my_classes, is_admin, is_teacher, is_sales, is_student, user, set_loading}) => {
    const [pageLimit, setPageLimit] = useState(20);
    const [page, setPage] = useState(0);

    const [classtype, setClasstype] = useState("")
    
    const [scrollerDimensions, setScrollerDimensions] = useState({width: "100%", height: 0});
    const scrollerRef = useRef(null);
    const pageRef = useRef(null);
    
    const schedules = useMemo(() => classes_schedules.flatMap(({schedules, ...c}) => {
        return schedules.map((s) => ({...s, ...c}));
    }), [classes_schedules]);

    const {subjects=[], levels=[]} = app_config || {};
    
    const [calendarSearch, setCalendarSearch] = useState("");
    const [calendarFilters, setCalendarFilters] = useState({});
    const [timeSpan, setTimeSpan] = useState(7 * DAY);
    const [dateRange, setDateRange] = useState(null);

    const [selectTeachers, setSelectTeachers] = useState([]);
    const [SelectStudents, setSelectStudents] = useState([]);
    const [selectClasses, setSelectClasses] = useState([]);

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

    const get_schedules = useCallback(debounce(async (dateRange, filters={}, search="") => {
        const {min, max} = dateRange;
        set_loading(true);
        await get_classes_schedules({startPeriod: min, endPeriod: max}, JSON.stringify(filters), search);
        set_loading(false);
    }, 300), []);

    useEffect(() => {
        const init = async () => {
            set_loading(true);
            await get_my_classes(pageLimit, page * pageLimit);
            set_loading(false);
        }

        const current_date = new Date();
        const current_day = current_date.getDay();
        const min = new Date(current_date.getTime() - (current_day * DAY));
        const max = new Date(current_date.getTime() + ((7-current_day) * DAY));

        min.setHours(0, 0, 0);
        max.setHours(23, 59, 59);

        setDateRange({min, max});
        
        init();
    }, []);

    useEffect(() => {
        get_schedules(dateRange, calendarFilters, calendarSearch);
    }, [dateRange, calendarFilters, calendarSearch])
    
    useEffect(() => {
        const init = async () => {
            set_loading(true);
            await get_my_classes(pageLimit, page * pageLimit);
            set_loading(false);
        }

        init();
    }, [classtype]);

    const onPressTab = (e, {label, id}, index) => {
        setClasstype(id);
    }

    function onLayout({pageOffsetY, pageOffsetX, top, left, width, height, windowWidth, windowHeight}){
        const {scrollHeight} = pageRef.current;
        const {offsetTop} = scrollerRef.current;
        
        setScrollerDimensions((s) => ({...s, height: scrollHeight - (offsetTop + 20)}));
    }

    return (
        <div className='page dashboard'>
            <div ref={pageRef} className='main-col'>
                <div className='filters-search-container'>
                    <div className='filters-container'>
                        {CALENDAR_FILTERS.map((f) => {
                            const options = getSelectOptions(f);

                            return (
                                <div className='input-container select' key={f.name}>
                                    <TypeSelect options={options} placeholder={f.label} value={calendarFilters[f.name] || ""} localSearch={false} onChange={setFilter(f.name)} renderOption={f.renderOption} renderSelected={f.renderOption} onChangeText={onChangeSelectText} placeholderAsOption name={f.name} onOpen={(e) => {!options.length && onChangeSelectText(e)}} />
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
                {/* <NewSchedule schedules={schedules} date_range={dateRange} onClickNextDateRange={getNextDateRange} onClickPrevDateRange={getPrevDateRange} is_admin={is_admin} is_teacher={is_teacher} is_sales={is_sales} /> */}
                <Schedule schedules={schedules} reschedules={reschedules} date_range={dateRange} onClickNextDateRange={getNextDateRange} onClickPrevDateRange={getPrevDateRange} is_admin={is_admin} is_teacher={is_teacher} is_sales={is_sales} />
            </div>

            <div className='misc-col'>
                <Tabs tabs={[{label: "All Classes", id: ""}, {label: "Group Lessons", id: "group"}, {label: "One on One", id: "private"}]} />

                <InfiniteScroller onLayout={onLayout} width={scrollerDimensions.width} height={scrollerDimensions.height} ref={scrollerRef}>
                    <ul className='class-list'>
                        {classes.length && Array.from({length: 20}).fill(classes).flat(1).map((c, i) => {
                            return <li key={c._id + i} onClick={() => {navigate(`/dashboard/my-class/${c._id}`)}} className='class-item clickable'><Class _class={c} index={i} onPressTab={onPressTab} /></li>
                        })}
                    </ul>
                </InfiniteScroller>
            </div>
        </div>
    );
}

function map_state_to_props({App, Auth, User}){
    return {classes: User.classes, total: User.total_classes, classes_schedules: User.classes_schedules, reschedules: User.reschedules, app_config: App.config, user: App.user, is_admin: Auth.is_admin, is_sales: Auth.is_sales, is_teacher: Auth.is_teacher, is_student: Auth.is_student}
}

export default connect(map_state_to_props, {get_my_classes, get_classes_schedules, set_loading})(Dashboard);