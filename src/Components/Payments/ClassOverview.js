import React, { useCallback, useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { TableHead } from '../Common/TableHead';

import {get_teachers, get_sessions, set_loading, admin_get_requests} from "../../Actions";
import { TypeSelect } from '../Common/TypeSelect';
import { debounce, get_full_image_url, ordinal_suffix, toMoneyString } from '../../Utils';
import { formatDuration, intervalToDuration } from 'date-fns';
import { RiArrowLeftSLine, RiArrowRightSLine, RiCalendarLine } from 'react-icons/ri';
import { get_months, HOUR, MONTHS } from '../../Data';

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

const ClassOverView = ({sessions=[], total_sessions=0, requests=[], total_requests=0, teachers=[], total_teachers=0, is_admin, is_teacher, get_teachers, get_sessions, admin_get_requests, set_loading}) => {
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

    const can_go_forward = (min.getFullYear() <= current_date.getFullYear()) && (min.getMonth() < current_date.getMonth())

    const onTypeTeacherSelect = (e, value) => {
        setTeacherSearch(value);
    };
    
    const onSelectTeacher = (value) => {
        setSelectedTeacher(value);
        setFilters((f) => ({...f, teacher: value || undefined}));
    }

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

    const searchTeachers = useCallback(debounce((s) => {
        get_teachers(20, 0, s);
    }), []);

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

    // useEffect(() => {
    //     if(is_admin){
    //         searchTeachers(teacherSearch);
    //     }
    // }, [teacherSearch, is_admin]);

    return (
        <div className='teachers-section'>
            <div className='filters-search-container'>
                <div className='filters-container'>
                <p style={{marginBottom: 10}} className='schedule-date-range'>
                    <span onClick={onClickPrevRange} className='schedule-range-arrow prev clickable'><RiArrowLeftSLine color='#99C183' size={24} /></span>
                    <RiCalendarLine color='#99C183' size={24} /> {minMonth.short} {ordinal_suffix(minDate)} - {(maxMonth.short !== minMonth.short)?maxMonth.long+" ":""}{ordinal_suffix(maxDate)}, {min.getFullYear()}
                    <span onClick={onClickNextRange} className={`schedule-range-arrow next ${can_go_forward?"clickable":""}`}><RiArrowRightSLine color={can_go_forward?'#99C183':"#AAA"} size={24} /></span>
                </p>
                </div>
            </div>

            <div ref={tableContainerRef} style={{maxHeight: maxTableHeight?maxTableHeight:"500px"}} className='table-container'>
                <table>
                    <TableHead sticky headers={[{label: "Filled By", id: "handled_by", sortable: false}, {label: "Student", id: "student", sortable: false}, {label: "Teacher", id: "teacher", sortable: true}, {label: "Grade", id: "grade", sortable: false}, {label: "Form Type", id: "form_type", sortable: false}, {label: "Subject", id: "title", sortable: false}, {label: "Class Type", id: "class_type", sortable: false}, {label: "Hourly Rate", id: "hourly_rate", sortable: false}, {label: "Total Salary", id: "class_type", sortable: false}, {label: "Hourly Tuition", id: "price_paid", sortable: false}, {label: "Lesson Duration Hours (AVG)", id: "duration", sortable: false}, {label: "Total Lesson Sold", id: "total_lessons", sortable: false}, {label: "Gross Tuition", id: "gross", sortable: false}, {label: "Discount", id: "discount", sortable: false}, {label: "Discount Sum", id: "discount_sum", sortable: false}, {label: "Notes", id: "notes", sortable: false}]} />

                    <tbody>
                        {requests.map((r, i) => {
                            const {_id, _class, student, date_handled, handled_by} = r;
                            const {students_info=[], students=[], schedules=[], custom_dates=[], cancelled_dates=[], title, price, discount=0, class_type, teacher, start_date, end_date} = _class;

                            const startDate = new Date(start_date);
                            startDate.setHours(0,0,0,0)
                            const endDate = new Date(end_date);
                            endDate.setHours(23,59,59,0);

                            const {hourly_rate_1_3=0, hourly_rate_4_8=0} = teacher;

                            const class_sessions = sessions.filter((s) => s._class._id === _class._id);

                            const student_info = students_info.find((si) => si.student === student._id);
                            const {form_type="", price_paid=0, notes=""} = student_info || {};

                            const type = class_type === "private"?"1-on-1":"Group";

                            const hourly_rate = students.length < 4?hourly_rate_1_3:hourly_rate_4_8;

                            const total_hours = class_sessions.reduce((prev, {start_time, end_time}, i) => {
                                const startTime = new Date(start_time);
                                const endTime = end_time?new Date(end_time):new Date();

                                return prev + ((endTime.getTime() - startTime.getTime())/60);
                            }, 0);

                            const total_salary = total_hours * hourly_rate;

                            const lesson_duration = schedules.reduce((prev, {daily_start_time, daily_end_time}, i) => {
                                const startTime = new Date(daily_start_time);
                                const endTime = new Date(daily_end_time);

                                return prev + Number(((endTime.getTime() - startTime.getTime())/HOUR).toPrecision(2));
                            }, 0)/schedules.length;

                            let total_lessons_sold = schedules.reduce((prev, {days=[]}) => {
                                let new_date = new Date(startDate);

                                while(new_date.getTime() <= endDate.getTime()){
                                    const current_day = new_date.getDay();
                                    if(days.includes(current_day)){
                                        prev += 1;
                                    }

                                    new_date.setDate(new_date.getDate() + 1);
                                }

                                return prev;
                            }, 0) + custom_dates.length;

                            const gross_tuition = (price_paid || price) * lesson_duration * total_lessons_sold;

                            const discount_sum = gross_tuition - (discount * total_lessons_sold);

                            // const duration = endTime && endTime.getTime() && intervalToDuration({start: startTime, end: endTime});
                            
                            // const unknown_totals = students.length - students_info.length;
                            // const unknown_total = unknown_totals * _class.price;
                            // const known_total = students_info.reduce((prev, curr, i) => {
                            //     const {price_paid=0} = curr;

                            //     return prev + price_paid;
                            // }, 0);

                            // const total = unknown_total + known_total;

                            // console.log({students_info, unknown_total, known_total});

                            return (
                                <tr key={_id}>
                                    <td>{handled_by.name.first} {handled_by.name.last}</td>
                                    <td>{student.name.first} {student.name.last}</td>
                                    <td>{teacher.name.first} {teacher.name.last}</td>
                                    <td>{student.grade}</td>
                                    <td>{form_type || "Unknown"}</td>
                                    <td>{title}</td>
                                    <td>{type}</td>
                                    <td>{toMoneyString(hourly_rate)}</td>
                                    <td>{toMoneyString(total_salary)}</td>
                                    <td>{toMoneyString(price_paid)}</td>
                                    <td>{lesson_duration}</td>
                                    <td>{total_lessons_sold}</td>
                                    <td>{gross_tuition}</td>
                                    <td>{discount}</td>
                                    <td>{discount_sum}</td>
                                    <td style={{maxWidth: 200}}>{notes}</td>
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

export default connect(map_state_to_props, {get_teachers, admin_get_requests, get_sessions, set_loading})(ClassOverView);