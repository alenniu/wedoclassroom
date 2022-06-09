import React, { useEffect, useState } from 'react';
import {BsCurrencyDollar} from "react-icons/bs";
import { connect } from 'react-redux';
import { useParams } from 'react-router-dom';
import { get_user_class, set_loading } from '../Actions';
import Announcement from '../Components/Class/Announcement';
import Tabs from '../Components/Common/Tabs';
import { DAYS } from '../Data';

import "./Class.css";

const assignments = [{_id: "12345", title: "Read Chapter 5", description: "Instructions:\n\nPlease Read \"How to kill and never get caught\" and perform the things described in the book", due_date: Date.now() - 5 * 3600000}];

const announcements = [{title: "", message: "Hello All, Welcome to my class. First lets start by each killing a fellow classmate. Cuts the class in half early on.", assignment: null, createdAt: Date.now()}, {title: "", message: "", assignment: "12345", createdAt: Date.now()}];


const Class = ({_class, user, is_teacher, is_admin, get_user_class, set_loading}) => {
    const [tab, setTab] = useState("announcements")
    const {_id:class_id="", title, subject, teacher, meeting_link="", schedules=[]} = _class;
    const {id} = useParams();
    
    const teach_only_tabs = is_teacher?[{label: "Attendance", id: "attendance"}, {label: "Students", id: "students"}]:[];

    useEffect(() => {
        const init = async () => {
            set_loading(true);
            if(id && (class_id !== id)){
                get_user_class(id);
            }
            set_loading(false);
        }

        init();
    }, []);

    const onPressTab = (e, {label, id}, index) => {
        setTab(id);
    }

    return (
        <div className='page class'>
            <div className='main-col'>
                <Tabs tabs={[{label: "Announcements", id: "announcements"}, {label: "Assignments", id: "assignments"}, ...teach_only_tabs]}  />

                {is_teacher && <>
                    <div className='input-container announcement'>
                        <label>Post a new announcement</label>

                        <textarea placeholder='Type Here' />

                        <button className='button secondary'>Post</button>
                    </div>
                </>}

                {announcements.map((a) => {
                    const assignment = assignments.find((ass) => ass._id === a.assignment);

                    return <Announcement announcement={a} _class={_class} user={user} assignment={assignment} />
                })}

            </div>

            <div className='misc-col'>
                <div className='class-info'>
                    <h3 style={{margin: "20px 0"}}>Class Information</h3>
                    <p><span className='info-title'>{title}</span></p>

                    <p><span className='info-title'>meeting link :</span> {meeting_link?<a className='meeting-link' href={meeting_link}>{meeting_link}</a> : "None"}</p>
                    
                    <p><span className='info-title'>Teacher :</span> {teacher?.name?.first} {teacher?.name?.last}</p>
                    
                    <p><span className='info-title'>Email :</span> {teacher?.email}</p>
                    
                    <p><span className='info-title'>Class Dates :</span> {schedules.map((s) => <span className='schedule'>{s.days.map((d) => DAYS[d].long).join(", ")} @ {(new Date(s.daily_start_time)).toLocaleTimeString(undefined, {hour: "2-digit", minute: "2-digit"})} - {(new Date(s.daily_end_time)).toLocaleTimeString(undefined, {hour: "2-digit", minute: "2-digit"})}</span>)}</p>

                    <div className='upcoming-assignments'>
                        <h3 style={{margin: "20px 0"}}>Upcoming Assignments</h3>
                        {assignments.map((a) => {
                            return (
                                <div>
                                    <p>DUE TOMORROW</p>
                                    <p className='assignment'>{a.title}</p>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}

function map_state_to_props({App, User, Auth}){
    return {_class: User.current_class, user: App.user, is_teacher: Auth.is_teacher, is_admin: Auth.is_admin}
}

export default connect(map_state_to_props, {get_user_class, set_loading})(Class);