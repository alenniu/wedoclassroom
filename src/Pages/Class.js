import React, { useEffect, useMemo, useState } from 'react';
import {BsCurrencyDollar} from "react-icons/bs";
import { connect } from 'react-redux';
import { useParams } from 'react-router-dom';
import { accept_join_request, decline_join_request, get_class_requests, get_user_class, set_loading } from '../Actions';
import Announcements from '../Components/Class/Announcements';
import Attendance from '../Components/Class/Attendance';
import ClassInfo from '../Components/Class/ClassInfo';
import Students from '../Components/Class/Students';
import Tabs from '../Components/Common/Tabs';

import "./Class.css";

const assignments = [{_id: "12345", title: "Read Chapter 5", description: "Instructions:\nPlease Read \"How to kill and never get caught\" and perform the things described in the book", due_date: Date.now() - 5 * 3600000}];

const announcements = [{title: "", message: "Hello All, Welcome to my class. First lets start by each killing a fellow classmate. Cuts the class in half early on.", assignment: null, createdAt: Date.now()}, {title: "", message: "", assignment: "12345", createdAt: Date.now()}];


const Class = ({_class, user, is_teacher, is_admin, requests=[], accept_join_request, decline_join_request, get_user_class, get_class_requests, set_loading}) => {
    const [tab, setTab] = useState("announcements")
    const {_id:class_id="", title, subject, teacher, meeting_link="", schedules=[]} = _class;
    const {id} = useParams();
    
    const teacher_only_tabs = is_teacher?[{label: "Students", id: "students"}]:[];

    const current_announcements = useMemo(() => {
        return (tab === "assignments")?announcements.filter((a) => a.assignment):announcements;
    }, [tab]);

    useEffect(() => {
        const init = async () => {
            set_loading(true);
            if(id && (class_id !== id)){
                await get_user_class(id);
                await get_class_requests(20, 0, undefined, {_id: id});
            }
            set_loading(false);
        }

        init();
    }, []);

    const onPressTab = (e, {label, id}, index) => {
        setTab(id);
    }

    const onAcceptRequest = async (request) => {
        set_loading(true);
        await accept_join_request(request)
        set_loading(false);
    }

    const onDeclineRequest = async (request) => {
        set_loading(true);
        await decline_join_request(request)
        set_loading(false);
    }

    const onRemoveStudent = async () => {

    }

    return (
        <div className='page class'>
            <div className='main-col'>
                <Tabs tabs={[{label: "Announcements", id: "announcements"}, {label: "Assignments", id: "assignments"}, ...teacher_only_tabs]} onPressTab={onPressTab} />

                {(tab !== "students")?<Announcements _class={_class} user={user} announcements={current_announcements} assignments={assignments} is_teacher={is_teacher} />:<Students _class={_class} attendance={[]} requests={requests} onAcceptRequest={onAcceptRequest} onDeclineRequest={onDeclineRequest} onRemoveStudent={onRemoveStudent} />}

            </div>

            <div className='misc-col'>
            {(tab !== "students")?<ClassInfo _class={_class} assignments={assignments} />:<Attendance _class={_class} attendance={[]} />}
            </div>
        </div>
    );
}

function map_state_to_props({App, User, Auth}){
    return {_class: User.current_class, user: App.user, is_teacher: Auth.is_teacher, is_admin: Auth.is_admin, requests: User.current_class_requests}
}

export default connect(map_state_to_props, {get_user_class, accept_join_request, decline_join_request, get_class_requests, set_loading})(Class);