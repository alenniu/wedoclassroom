import React, { useCallback, useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { TableHead } from '../Common/TableHead';

import {get_teachers, get_sessions, set_loading, admin_get_requests} from "../../Actions";
import { TypeSelect } from '../Common/TypeSelect';
import { debounce, get_full_image_url, ordinal_suffix, toMoneyString } from '../../Utils';
import { formatDuration, intervalToDuration } from 'date-fns';
import { get_months, MONTHS } from '../../Data';
import { RiArrowLeftSLine, RiArrowRightSLine, RiCalendarLine } from 'react-icons/ri';

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

const TeachersSection = ({sessions=[], total_sessions=0, requests=[], total_requests=0, teachers=[], total_teachers=0, is_admin, is_teacher, get_teachers, get_sessions, admin_get_requests, set_loading}) => {

    const current_date = new Date();
    const current_month = current_date.getMonth();

    const month = get_months(current_date.getFullYear())[current_month];

    const tableContainerRef = useRef(null);
    const [maxTableHeight, setMaxTableHeight] = useState(0);

    const [teacherSearch, setTeacherSearch] = useState("");
    const [selectedTeacher, setSelectedTeacher] = useState(null);

    const [page, setPage] = useState(0);
    const [pageCount, setPageCount] = useState(0);
    const [sort, setSort] = useState({start_time: "desc"});
    const [filters, setFilters] = useState({});

    const [dateRange, setDateRange] = useState({min: new Date(current_date.getFullYear(), current_month, 1, 0, 0, 0, 0), max: new Date(current_date.getFullYear(), current_month, month.days, 23, 59, 59, 0)});

    const {min=new Date(), max=new Date()} = dateRange;
    const minDate = min.getDate();
    const maxDate = max.getDate();
    const minMonth = MONTHS[min.getMonth()];
    const maxMonth = MONTHS[max.getMonth()];

    const can_go_forward = (min.getFullYear() <= current_date.getFullYear()) && (min.getMonth() < current_date.getMonth());

    const onClickNextRange = (e) => {
        can_go_forward && setDateRange(({min, max}) => {
            const new_min = new Date(min.getFullYear(), min.getMonth() + 1, 1, 0, 0, 0, 0);
            const new_min_month = new_min.getMonth();
            const new_month = get_months(new_min.getFullYear())[new_min_month];

            return {min: new_min, max: new Date(new_min.getFullYear(), new_min.getMonth(), new_month.days, 0, 0, 0, 0)}
        });
    }
    
    const onClickPrevRange = (e) => {
        setDateRange(({min, max}) => {
            const new_min = new Date(min.getFullYear(), min.getMonth() - 1, 1, 0, 0, 0, 0);
            const new_min_month = new_min.getMonth();
            const new_month = get_months(new_min.getFullYear())[new_min_month];

            return {min: new_min, max: new Date(new_min.getFullYear(), new_min.getMonth(), new_month.days, 0, 0, 0, 0)}
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

    const searchTeachers = useCallback(debounce((s) => {
        get_teachers(20, 0, s);
    }), []);

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
    }, [page, pageCount, sort, filters])

    // useEffect(() => {
    //     if(is_admin){
    //         searchTeachers(teacherSearch);
    //     }
    // }, [teacherSearch, is_admin]);

    return (
        <div className='teachers-section'>
            {!is_teacher && <div className='filters-search-container'>
                <div className='filters-container'>
                    <p style={{marginBottom: 10}} className='schedule-date-range'>
                        <span onClick={onClickPrevRange} className='schedule-range-arrow prev clickable'><RiArrowLeftSLine color='#99C183' size={24} /></span>
                        <RiCalendarLine color='#99C183' size={24} /> {minMonth.short} {ordinal_suffix(minDate)} - {(maxMonth.short !== minMonth.short)?maxMonth.long+" ":""}{ordinal_suffix(maxDate)}, {min.getFullYear()}
                        <span onClick={onClickNextRange} className={`schedule-range-arrow next ${can_go_forward?"clickable":""}`}><RiArrowRightSLine color={can_go_forward?'#99C183':"#AAA"} size={24} /></span>
                    </p>

                    <div className='input-container select teacher'>
                        <TypeSelect disabled={is_teacher} options={teachers.map((t) => ({label: `${t.name.first} ${t.name.last}${is_teacher?" (You)":""}`, value: t._id, teacher: t}))} placeholder="Select Teacher" onChangeText={onTypeTeacherSelect} textValue={teacherSearch} renderOption={RenderTeacherOption} renderSelected={RenderTeacherOption} onChange={onSelectTeacher} value={selectedTeacher} />
                    </div>
                </div>
            </div>}

            <div ref={tableContainerRef} style={{maxHeight: maxTableHeight?maxTableHeight:"500px"}} className='table-container'>
                <table>
                    <TableHead headers={[{label: "Teacher", id: "teacher", sortable: false}, {label: "Class", id: "_class", sortable: false}, {label: "Date", id: "start_time", sortable: true}, {label: "Duration", id: "d", sortable: false}, {label: "Price", id: "price", sortable: false}, {label: "No. of Students", id: "students", sortable: false}, {label: "Total", id: "total", sortable: false}]} />

                    <tbody>
                        {sessions.map((s, i) => {
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
                                    <td>{teacher.name.first} {teacher.name.last}</td>
                                    <td>{_class.title}</td>
                                    <td>{startTime.toLocaleString(undefined, {dateStyle: "medium", timeStyle: "short"})}</td>
                                    <td>{duration?formatDuration(duration, {}).replace(/hours?/, "h").replace(/minutes?/, "m").replace(/seconds?/, "s"):"Ongoing"}</td>
                                    <td>{toMoneyString(_class.price)}</td>
                                    <td><center>{students.length}</center></td>
                                    <td>{toMoneyString(total)}</td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function map_state_to_props({Auth, Admin}){
    return {sessions: Admin.sessions, total_sessions: Admin.total_sessions, requests: Admin.requests, total_requests: Admin.total_requests, teachers: Admin.teachers, total_teachers: Admin.total_teachers, is_admin: Auth.is_admin, is_teacher: Auth.is_teacher};
}


export default connect(map_state_to_props, {get_teachers, get_sessions, admin_get_requests, set_loading})(TeachersSection);