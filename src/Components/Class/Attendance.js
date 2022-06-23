import React, { useState } from 'react';
import { connect } from 'react-redux';
import {MdEdit} from "react-icons/md"
import { set_loading, update_student_class_attendance } from '../../Actions';

import "./Attendance.css";

const Attendance = ({_class={}, attendance=[], update_student_class_attendance, set_loading}) => {
    const [editingAttendance, setEditingAttendance] = useState(null);

    const {students=[]} = _class;

    const onSelectAttendance = (value, student_id, remarks="") => {
        if(value === "on-time"){
            setEditingAttendance((a) => ({...a, early: true, present: true, student: student_id, remarks}));
        }
        
        if(value === "late"){
            setEditingAttendance((a) => ({...a, early: false, present: true, student: student_id, remarks}));
        }

        if(value === "absent"){
            setEditingAttendance((a) => ({...a, early: false, present: false, student: student_id, remarks}));
        }
    }

    const onEditAttendace = (prop, value) => {
        setEditingAttendance((a) => ({...a, [prop]: value}))
    }

    const cancelEditAttendance = () => {
        setEditingAttendance(null);
    }

    const updateAttendance = async () => {
        if(editingAttendance){
            set_loading(true);
            
            const {early, present, remarks, student} = editingAttendance;
            
            await update_student_class_attendance({_class, student, early, present, remarks })
            setEditingAttendance(null);

            set_loading(false);
        }
    }

    return (
        <div className='attendance'>
            <h3>Attendance For Today</h3>

            <ul className='attendance-list'>
                {students.filter((s) => attendance.findIndex((a) => a.student === s._id) !== -1).map((s) => {
                    const {_id, name={}, email, phone} = s;
                    const editing = editingAttendance?.student === _id;

                    const {early, present, remarks=""} = editing?editingAttendance:attendance.find((a) => a.student === _id);
                    const value = present?(early?"on-time":"late"):"absent";
                    return (
                        <li className='attendance-container'>
                            <p className='student-name'>{name.first} {name.last}</p>

                            <div className={`input-container attendance-select ${value}`}>
                                <select value={value} onChange={(e) => onSelectAttendance(e.target.value, _id, remarks)}>
                                    <option value={"on-time"}>On time</option>
                                    <option value={"absent"}>Absent</option>
                                    <option value={"late"}>Late</option>
                                </select>
                            </div>

                            <div className={`input-container remarks ${editing?"show":"hide"}`}>
                                <textarea placeholder='Remarks' value={remarks} onChange={(e) => {onEditAttendace("remarks", e.target.value)}} />
                            </div>

                            {editing && <div style={{textAlign: "end", width: "100%"}}>
                                <button className='button error' onClick={cancelEditAttendance}>Cancel</button>
                                <button className='button primary' onClick={updateAttendance} style={{marginLeft: 20}}>Save</button>
                            </div>}

                            <span className='edit-icon clickable' onClick={() => {onSelectAttendance(value, _id, remarks)}}><MdEdit size={14} /></span>
                        </li>
                    );
                })}
            </ul>

            <h3>Absent Students</h3>

            <ul className='attendance-list'>
                {students.filter((s) => attendance.findIndex((a) => a.student === s._id) === -1).map((s) => {
                    const {_id, name={}, email, phone} = s;
                    
                    const editing = editingAttendance?.student === _id;

                    const {early, present, remarks=""} = editing?editingAttendance:{};
                    const value = present?(early?"on-time":"late"):"absent";

                    return (
                        <li className='attendance-container'>
                            <p className='student-name'>{name.first} {name.last}</p>

                            <div className={`input-container attendance-select ${value}`}>
                                <select value={value} onChange={(e) => onSelectAttendance(e.target.value, _id, remarks)}>
                                    <option value={"on-time"}>On time</option>
                                    <option value={"absent"}>Absent</option>
                                    <option value={"late"}>Late</option>
                                </select>
                            </div>

                            <div className={`input-container remarks ${editing?"show":"hide"}`}>
                                <textarea placeholder='Remarks' value={remarks} onChange={(e) => {onEditAttendace("remarks", e.target.value)}} />
                            </div>

                            {editing && <div style={{textAlign: "end", width: "100%"}}>
                                <button className='button error' onClick={cancelEditAttendance}>Cancel</button>
                                <button className='button primary' onClick={updateAttendance} style={{marginLeft: 20}}>Save</button>
                            </div>}

                            <span className='edit-icon clickable' onClick={() => {onSelectAttendance(value, _id, remarks)}}><MdEdit size={14} /></span>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}

export default connect(null, {update_student_class_attendance, set_loading})(Attendance);