import React, { useCallback, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { get_sessions, get_teachers, set_loading } from '../Actions';
import { debounce, get_full_image_url, toMoneyString } from '../Utils';
import { formatDistance, formatDuration, intervalToDuration } from 'date-fns';
import { TypeSelect, TableHead } from '../Components/Common';

import "./Sessions.css";

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

const Sessions = ({sessions=[], total_sessions=0, teachers=[], total_teachers=0, is_admin, is_teacher, get_teachers, get_sessions, set_loading}) => {
    const [teacherSearch, setTeacherSearch] = useState("");
    const [selectedTeacher, setSelectedTeacher] = useState(null);

    const [page, setPage] = useState(0);
    const [pageCount, setPageCount] = useState(20);
    const [sort, setSort] = useState({start_time: "desc"});
    const [filters, setFilters] = useState({});

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

    useEffect(() => {
        if(is_admin){
            searchTeachers(teacherSearch);
        }
    }, [teacherSearch, is_admin]);

    return (
        <div className='page sessions'>
            <div className='main-col fullwidth'>
                <h3>Sessions</h3>

                <div className='input-container select teacher'>
                    <TypeSelect disabled={is_teacher} options={teachers.map((t) => ({label: `${t.name.first} ${t.name.last}${is_teacher?" (You)":""}`, value: t._id, teacher: t}))} placeholder="Select Teacher" onChangeText={onTypeTeacherSelect} textValue={teacherSearch} renderOption={RenderTeacherOption} renderSelected={RenderTeacherOption} onChange={onSelectTeacher} value={selectedTeacher} />
                </div>

                <table>
                    <TableHead headers={[{label: "Teacher", id: "teacher", sortable: false}, {label: "Class", id: "_class", sortable: false}, {label: "Date", id: "start_time", sortable: true}, {label: "Duration", id: "d", sortable: false}, {label: "Price", id: "price", sortable: false}, {label: "No. of Students", id: "students", sortable: false}, {label: "Total", id: "total", sortable: false}]} />

                    <tbody>
                        {sessions.map((s, i) => {
                            const {_id, _class, teacher, students, start_time, end_time, active, meeting_link} = s;
                            const startTime = new Date(start_time);
                            const endTime = end_time && new Date(end_time);

                            const duration = endTime && endTime.getTime() && intervalToDuration({start: startTime, end: endTime});

                            return (
                                <tr key={_id}>
                                    <td>{teacher.name.first} {teacher.name.last}</td>
                                    <td>{_class.title}</td>
                                    <td>{startTime.toLocaleString(undefined, {dateStyle: "medium", timeStyle: "short"})}</td>
                                    <td>{duration?formatDuration(duration, {}).replace(/hours?/, "h").replace(/minutes?/, "m").replace(/seconds?/, "s"):"Ongoing"}</td>
                                    <td>{toMoneyString(_class.price)}</td>
                                    <td><center>{students.length}</center></td>
                                    <td>{toMoneyString(_class.price * students.length)}</td>
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
    return {sessions: Admin.sessions, total_sessions: Admin.total_sessions, teachers: Admin.teachers, total_teachers: Admin.total_teachers, is_admin: Auth.is_admin, is_teacher: Auth.is_teacher};
}

export default connect(map_state_to_props, {get_teachers, get_sessions, set_loading})(Sessions);