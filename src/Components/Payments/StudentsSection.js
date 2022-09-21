import React, { useCallback, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { TableHead } from '../Common/TableHead';

import {get_sessions, set_loading, get_students} from "../../Actions";
import { TypeSelect } from '../Common/TypeSelect';
import { debounce, get_full_image_url, is_same_day, toMoneyString } from '../../Utils';
import { formatDuration, intervalToDuration } from 'date-fns';
import { api } from '../../Utils/api';
import Pagination from '../Common/Pagination';
import { HOUR } from 'my-server/values';

const RenderStudentOption = ({label, value, student}) => {
    return (
        <div style={{display: "flex", alignItems: "center"}}>
            <div className='student-image-container' style={{height: "30px", width: "30px", overflow: 'hidden', backgroundColor: "black", borderRadius: "50%", marginRight: "10px", flexShrink: 0}}>
                <img src={get_full_image_url(student.photo_url || '/Assets/Images/AuthBackground.png')} style={{height: "100%", width: "100%", objectFit: "cover"}} />
            </div>

            <span>{label}</span>
        </div>
    )
}

const StudentsSections = ({sessions=[], total_sessions=0, students=[], total_students=0, is_admin, get_sessions, get_students, set_loading}) => {

    const [studentSearch, setStudentSearch] = useState("");
    const [selectedStudent, setSelectedStudent] = useState(null);

    const [selectStudents, setSelectStudents] = useState([]);

    const [studentsPage, setStudentsPage] = useState(0);
    const [studentsPageCount, setStudentsPageCount] = useState(20);

    const [page, setPage] = useState(0);
    const [pageCount, setPageCount] = useState(20);
    const [sort, setSort] = useState({start_time: "asc"});
    const [filters, setFilters] = useState({});

    const onTypeStudentSelect = (e, value) => {
        setStudentSearch(value);
    };
    
    const onSelectStudent = (value) => {
        setSelectedStudent(selectStudents.find((s) => s._id === value));
        setFilters((f) => ({...f, students: value || undefined}));
    }

    const getStudents = useCallback(debounce(async (search) => {
        const res = await api("get", "/api/admin/accounts", {params: {search, limit: 20, offset: 0, filters: JSON.stringify({type: "student"})}});
    
        return setSelectStudents(res?.data?.accounts || []);
    }, 300), []);

    useEffect(() => {
        const init = async () => {
            set_loading(true);
            if(selectedStudent){
                await get_sessions(pageCount, page*pageCount, JSON.stringify(sort), JSON.stringify(filters));
            }
            set_loading(false);
        }

        init();
    }, [page, pageCount, selectedStudent, sort, filters]);

    useEffect(() => {
        const init = async () => {
            set_loading(true);
            if(!selectedStudent){
                await get_students(studentsPageCount, studentsPage*studentsPageCount, "", "{}", "{}");
            }
            set_loading(false);
        }

        init();
    }, [studentsPage, studentsPageCount, selectedStudent, sort, filters]);

    useEffect(() => {
        if(is_admin){
            getStudents(studentSearch);
        }
    }, [studentSearch, is_admin]);

    const tableHeaders = selectedStudent?[{label: "Date", id: "createdAt", sortable: false}, {label: "Subject", id: "title", sortable: false}, {label: "Teacher", id: "teacher", sortable: false}, {label: "Duration (hours)", id: "duration", sortable: false}, {label: "Hourly Rate", id: "hourly", sortable: false}, {label: "Total Rate", id: "total", sortable: false}, {label: "Payment Date", id: "payment_date", sortable: false}, {label: "Payment", id: "payment", sortable: false}, {label: "Balance", id: "balance", sortable: false}, {label: "Comment", id: "comment", sortable: false}]:[{label: "Student", id: "student", sortable: false}];

    return (
        <div className='students-section'>
            <div className='filters-search-container'>
                <div className='filters-container'>
                    <div className='input-container select student'>
                        <TypeSelect options={selectStudents.map((s) => ({label: `${s.name.first} ${s.name.last}`, value: s._id, student: s}))} placeholder="Select Student" onChangeText={onTypeStudentSelect} textValue={studentSearch} renderOption={RenderStudentOption} renderSelected={RenderStudentOption} onChange={onSelectStudent} placeholderAsOption value={selectedStudent?._id} />
                    </div>
                </div>
            </div>

            <div className='table-container'>
                <div className='table-container has-pagination'>
                    <table>
                        <TableHead headers={tableHeaders} />

                        <tbody>
                            {selectedStudent?sessions.map((s, i) => {
                                const {_id, _class, teacher, students=[], start_time, end_time, active, meeting_link, scheduled_duration_hrs=0, students_session_info=[]} = s;
                                const {students_info=[]} = _class;

                                const student_info = students_info.find((si) => si.student === selectedStudent._id);
                                const session_info = students_session_info.find((ssi) => ssi.student === selectedStudent._id);
                                
                                const {credit_logs=[]} = selectedStudent;
                                const {credit_log={}} = session_info || {};
                                
                                const startTime = new Date(start_time);
                                const endTime = end_time && new Date(end_time);

                                const payment = credit_logs.find((cl) => is_same_day(startTime, cl.date) && startTime.getTime() && (cl.new_amount > cl.previous_amount))

                                const duration = endTime && endTime.getTime() && intervalToDuration({start: startTime, end: endTime});

                                const duration_hrs = scheduled_duration_hrs || (endTime && Number(((endTime.getTime() - startTime.getTime()) / HOUR).toPrecision(2)));

                                const hourly_rate = student_info?.price_paid ?? _class.price;
                                const total_rate = credit_log?.difference ?? (hourly_rate * duration_hrs);
                                

                                return (
                                    <tr key={_id}>
                                        <td>{startTime.toLocaleDateString()}</td>
                                        <td>{_class.title}</td>
                                        <td>{teacher.name.first} {teacher.name.last}</td>
                                        <td>{duration_hrs || "Ongoing"}</td>
                                        <td>{toMoneyString(hourly_rate)}</td>
                                        <td>{toMoneyString(Math.abs(total_rate))}</td>
                                        <td>{payment && (new Date(payment.date).toLocaleDateString())}</td>
                                        <td>{payment && toMoneyString(payment.difference)}</td>
                                        <td style={{textAlign: "end"}}>{toMoneyString(credit_log.new_amount || 0)}</td>
                                        <td>{payment?.note}</td>
                                    </tr>
                                )
                            }):students.map((s) => {
                                const {_id, name={}} = s;

                                return (
                                    <tr className='clickable' onClick={() => onSelectStudent(_id)} key={_id}>
                                        <td>{name.first} {name.last}</td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>

                <Pagination total={selectedStudent?total_sessions:total_students} page={selectedStudent?page:studentsPage} perPage={selectedStudent?pageCount:studentsPageCount} onChangePage={(e, page) => {selectedStudent?setPage(page):setStudentsPage(page)}} onChangePerPage={(e, pageCount) => {selectedStudent?setPageCount(pageCount):setStudentsPageCount(pageCount)}} />
            </div>
        </div>
    );
}

function map_state_to_props({Auth, Admin}){
    return {sessions: Admin.sessions, total_sessions: Admin.total_sessions, students: Admin.students, total_students: Admin.total_students, is_admin: Auth.is_admin, is_teacher: Auth.is_teacher};
}

export default connect(map_state_to_props, {get_students, get_sessions, set_loading})(StudentsSections);