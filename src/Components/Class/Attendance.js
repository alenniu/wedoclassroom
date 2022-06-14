import React from 'react';

import "./Attendance.css";

const Attendance = ({_class={}, attendance=[]}) => {
    const {students=[]} = _class;
    return (
        <div className='attendance'>
            <h3>Attendance For Today</h3>
            <ul className='attendance-list'>
                {students.map((s) => {
                    const {_id, name={}, email, phone} = s;

                    return (
                        <li className='attendance-container'>
                            <p className='student-name'>{name.first} {name.last}</p>

                            <div className='input-container attendance-select on-time'>
                                <select>
                                    <option>On time</option>
                                    <option>Absent</option>
                                    <option>Late</option>
                                </select>
                            </div>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}
 
export default Attendance;