import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { TableHead } from '../Common/TableHead';

import {get_teachers, get_sessions, set_loading, admin_get_requests} from "../../Actions";
import { TypeSelect } from '../Common/TypeSelect';
import { debounce, get_full_image_url, ordinal_suffix, toMoneyString, unique_filter } from '../../Utils';
import { formatDuration, intervalToDuration } from 'date-fns';
import { get_months, MONTHS } from '../../Data';
import { RiArrowLeftSLine, RiArrowRightSLine, RiCalendarLine } from 'react-icons/ri';
import { Link } from 'react-router-dom';
import { api } from '../../Utils/api';

const RenderTeacherOption = ({label, value, teacher}) => {
    return (
        <div style={{display: "flex", alignItems: "center"}}>
            <div className='teacher-image-container' style={{height: "30px", width: "30px", overflow: 'hidden', backgroundColor: "black", borderRadius: "50%", marginRight: "10px", flexShrink: 0}}>
                <img src={get_full_image_url(teacher.photo_url || '/Assets/Images/AuthBackground.png')} style={{height: "100%", width: "100%", objectFit: "cover"}} />
            </div>

            <span>{label}</span>
        </div>
    )
}

const TeachersSection = ({sessions=[], total_sessions=0, requests=[], total_requests=0, teachers=[], total_teachers=0, user, is_admin, is_teacher, get_teachers, get_sessions, admin_get_requests, set_loading}) => {

    const current_date = new Date();
    const current_month = current_date.getMonth();

    const month = get_months(current_date.getFullYear())[current_month];

    const startMonthDate = current_date.getDate() < 15?1:15;
    const endMonthDate = current_date.getDate() < 15?15:month.days;

    const tableContainerRef = useRef(null);
    const [maxTableHeight, setMaxTableHeight] = useState(0);

    const [teacherSearch, setTeacherSearch] = useState("");
    const [selectedTeacher, setSelectedTeacher] = useState(is_teacher?user:null);

    const [selectTeachers, setSelectTeachers] = useState(is_teacher?[user]:[]);

    const [page, setPage] = useState(0);
    const [pageCount, setPageCount] = useState(0);
    const [sort, setSort] = useState({start_time: "desc"});
    const [filters, setFilters] = useState({});

    const [dateRange, setDateRange] = useState({min: new Date(current_date.getFullYear(), current_month, startMonthDate, 0, 0, 0, 0), max: new Date(current_date.getFullYear(), current_month, endMonthDate, 23, 59, 59, 0)});

    const {min=new Date(), max=new Date()} = dateRange;
    const minDate = min.getDate();
    const maxDate = max.getDate();
    const minMonth = MONTHS[min.getMonth()];
    const maxMonth = MONTHS[max.getMonth()];

    const can_go_back = !is_teacher;

    const can_go_forward = !is_teacher && (min.getFullYear() <= current_date.getFullYear()) && (min.getMonth() < current_date.getMonth()) || ((current_date.getDate() > 15) && (minDate < 15));

    const onClickNextRange = (e) => {
        can_go_forward && setDateRange(({min, max}) => {
            const newStartMonthDate = min.getDate() < 15?15:1;
            const new_month_index = newStartMonthDate === 1?min.getMonth()+1:min.getMonth();

            const new_min = new Date(min.getFullYear(), new_month_index, newStartMonthDate, 0, 0, 0, 0);
            const new_min_month = new_min.getMonth();

            const new_month = get_months(new_min.getFullYear())[new_min_month];
            const newEndMonthDate = min.getDate() < 15?new_month.days:15
            

            return {min: new_min, max: new Date(new_min.getFullYear(), new_min.getMonth(), newEndMonthDate, 23, 59, 59, 0)}
        });
    }
    
    const onClickPrevRange = (e) => {
        setDateRange(({min, max}) => {
            const newStartMonthDate = min.getDate() < 15?15:1;
            const new_month_index = newStartMonthDate === 1?min.getMonth():min.getMonth()-1;

            const new_min = new Date(min.getFullYear(), new_month_index, newStartMonthDate, 0, 0, 0, 0);
            const new_min_month = new_min.getMonth();
            const new_month = get_months(new_min.getFullYear())[new_min_month];
            
            const newEndMonthDate = min.getDate() < 15?new_month.days:15

            return {min: new_min, max: new Date(new_min.getFullYear(), new_min.getMonth(), newEndMonthDate, 23, 59, 59, 0)}
        });
    }

    const onSize = () => {
        const {innerWidth, innerHeight, scrollY, scrollX} = window;
        const { x, y, top, left, width, height, } = tableContainerRef.current.getBoundingClientRect();
        
        setMaxTableHeight(innerHeight - (top+scrollY+20));
    }

    useEffect(() => {
        onSize();

        window.addEventListener("resize", onSize);

        return () => {
            window.removeEventListener("resize", onSize);
        }
    }, []);

    useEffect(() => {
        const init = async () => {
            set_loading(true);
            await admin_get_requests(pageCount, page*pageCount, JSON.stringify({date_handled: "desc"}), JSON.stringify({accepted: true, date_handled: {$gte: min, $lte: max}}));
            await get_sessions(pageCount, page*pageCount, JSON.stringify(sort), JSON.stringify({...filters, start_time: {$gte: min, $lte: max}}));
            set_loading(false);
        }

        init();
    }, [page, pageCount, sort, filters, dateRange])

    const onTypeTeacherSelect = (e, value) => {
        setTeacherSearch(value);
    };
    
    const onSelectTeacher = (value) => {
        setSelectedTeacher(value);
        setFilters((f) => ({...f, teacher: value || undefined}));
    }

    const getTeachers = useCallback(debounce(async (search) => {
        const res = await api("get", "/api/admin/accounts", {params: {search, limit: 20, offset: 0, filters: JSON.stringify({type: "teacher"})}});
    
        return setSelectTeachers(res?.data?.accounts || []);
    }, 300), []);

    useEffect(() => {
        const init = async () => {
            set_loading(true);
            await get_sessions(pageCount, page*pageCount, JSON.stringify(sort), JSON.stringify(filters));
            set_loading(false);
        }

        init();
    }, []);

    useEffect(() => {
        get_sessions(pageCount, page*pageCount, JSON.stringify(sort), JSON.stringify(filters));
    }, [page, pageCount, sort, filters]);

    useEffect(() => {
        if(is_admin){
            getTeachers(teacherSearch);
        }
    }, [teacherSearch, is_admin]);

    const grossTotal = useMemo(() => {
        return sessions.reduce((prev, curr) => {
            const {_class, students} = curr;
            const {students_info=[]} = _class;

            const unknown_totals = students.length - students_info.length;
            const unknown_total = unknown_totals * _class.price;
            const known_total = students_info.reduce((prev, curr, i) => {
                const {price_paid=0} = curr;

                return prev + price_paid;
            }, 0);

            const total = unknown_total + known_total;
            return prev + total;
        }, 0);
    }, [sessions]);

    const teacherSummaries = useMemo(() => {
        const unique_teachers = sessions.map((s) => s.teacher._id).filter(unique_filter);

        return unique_teachers.map((teacher_id, i) => {
            const teacher_sessions = sessions.filter((s) => s.teacher._id === teacher_id);

            const teacher_total = teacher_sessions.reduce((prev, curr) => {
                const {_class, students} = curr;
                const {students_info=[]} = _class;
    
                const unknown_totals = students.length - students_info.length;
                const unknown_total = unknown_totals * _class.price;
                const known_total = students_info.reduce((prev, curr, i) => {
                    const {price_paid=0} = curr;
    
                    return prev + price_paid;
                }, 0);
    
                const total = unknown_total + known_total;
                return prev + total;
            }, 0);

            return {teacher: teacher_sessions[0].teacher, total: teacher_total}
        });
    }, [sessions]);

    const tableHeaders = useMemo(() => {
        return selectedTeacher?[{label: "Teacher", id: "teacher", sortable: false}, {label: "Class", id: "_class", sortable: false}, {label: "Date", id: "start_time", sortable: true}, {label: "Duration", id: "d", sortable: false}, {label: "Price", id: "price", sortable: false}, {label: "No. of Students", id: "students", sortable: false}, {label: "Total", id: "total", sortable: false}]:[{label: "Teacher", id: "teacher", sortable: false}, {label: "Total", id: "total", sortable: false}];
    }, [selectedTeacher]);

    console.log({teacherSummaries});

    return (
        <div className='teachers-section'>
            <div className='filters-search-container'>
                <div className='filters-container'>
                    <p style={{marginBottom: 10}} className='schedule-date-range'>
                        <span onClick={onClickPrevRange} className={`schedule-range-arrow prev ${can_go_back?"clickable":""}`}><RiArrowLeftSLine color={can_go_back?'#99C183':"#AAA"} size={24} /></span>
                        <RiCalendarLine color='#99C183' size={24} /> {minMonth.short} {ordinal_suffix(minDate)} - {(maxMonth.short !== minMonth.short)?maxMonth.long+" ":""}{ordinal_suffix(maxDate)}, {min.getFullYear()}
                        <span onClick={onClickNextRange} className={`schedule-range-arrow next ${can_go_forward?"clickable":""}`}><RiArrowRightSLine color={can_go_forward?'#99C183':"#AAA"} size={24} /></span>
                    </p>

                    {!is_teacher && <div className='input-container select teacher'>
                        <TypeSelect disabled={is_teacher} options={selectTeachers.map((t) => ({label: `${t.name.first} ${t.name.last}${is_teacher?" (You)":""}`, value: t._id, teacher: t}))} placeholder="Select Teacher" placeholderAsOption onChangeText={onTypeTeacherSelect} textValue={teacherSearch} renderOption={RenderTeacherOption} renderSelected={RenderTeacherOption} onChange={onSelectTeacher} value={selectedTeacher} />
                    </div>}
                </div>
            </div>

            <div ref={tableContainerRef} style={{maxHeight: maxTableHeight?maxTableHeight:"500px"}} className='table-container'>
                <table>
                    <TableHead headers={tableHeaders} />

                    <tbody>
                        {selectedTeacher?sessions.map((s, i) => {
                            const {_id, _class, teacher, students, start_time, end_time, active, meeting_link} = s;
                            const {students_info=[]} = _class;
                            const startTime = new Date(start_time);
                            const endTime = end_time && new Date(end_time);

                            const duration = endTime && endTime.getTime() && intervalToDuration({start: startTime, end: endTime});
                            
                            const unknown_totals = students.length - students_info.length;
                            const unknown_total = unknown_totals * _class.price;
                            const known_total = students_info.reduce((prev, curr, i) => {
                                const {price_paid=0} = curr;

                                return prev + price_paid;
                            }, 0);

                            const total = unknown_total + known_total;

                            return (
                                <tr key={_id}>
                                    <td><Link to={`/dashboard/accounts/edit/${teacher._id}`}>{teacher.name.first} {teacher.name.last}</Link></td>
                                    <td><Link to={`/dashboard/class/edit/${_class._id}`}>{_class.title}</Link></td>
                                    <td>{startTime.toLocaleString(undefined, {dateStyle: "medium", timeStyle: "short"})}</td>
                                    <td>{duration?formatDuration(duration, {}).replace(/hours?/, "h").replace(/minutes?/, "m").replace(/seconds?/, "s"):"Ongoing"}</td>
                                    <td>{toMoneyString(_class.price)}</td>
                                    <td><center>{students.length}</center></td>
                                    <td>{toMoneyString(total)}</td>
                                </tr>
                            )
                        }):teacherSummaries.map(({teacher, total}, i) => {
                            return (
                                <tr className='clickable' onClick={() => {
                                    setSelectedTeacher(teacher._id);
                                }} key={teacher._id}>
                                    <td>{teacher.name.first} {teacher.name.last}</td>
                                    <td>{toMoneyString(total)}</td>
                                </tr>
                            );
                        })}
                        {selectedTeacher && <tr>
                            <td colSpan={tableHeaders.length - 1}>Total:</td>
                            <td colSpan={1}>{toMoneyString(grossTotal)}</td>
                        </tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function map_state_to_props({App, Auth, Admin}){
    return {sessions: Admin.sessions, total_sessions: Admin.total_sessions, requests: Admin.requests, total_requests: Admin.total_requests, teachers: Admin.teachers, total_teachers: Admin.total_teachers, is_admin: Auth.is_admin, is_teacher: Auth.is_teacher, user: App.user};
}


export default connect(map_state_to_props, {get_teachers, get_sessions, admin_get_requests, set_loading})(TeachersSection);