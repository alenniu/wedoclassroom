import React, { useEffect, useMemo, useState } from 'react';
import { connect } from 'react-redux';
import { useParams } from 'react-router-dom';
import { accept_join_request, decline_join_request, end_class, get_class_announcements, get_class_assignments, get_class_attendance, get_class_requests, get_current_class, remove_student_from_class, set_loading, set_meeting_link, start_class } from '../Actions';
import { Modal } from '@mui/material';
import Announcements from '../Components/Class/Announcements';
import Attendance from '../Components/Class/Attendance';
import ClassInfo from '../Components/Class/ClassInfo';
import Students from '../Components/Class/Students';
import { HOUR } from '../Data';
import { is_full_url } from '../Utils';
import { Tabs } from '../Components/Common';

import "./Class.css";

const Class = ({_class, announcements=[], assignments=[], attendance=[], user, is_teacher, is_admin, requests=[], accept_join_request, decline_join_request, get_current_class, get_class_announcements, get_class_assignments, get_class_requests, get_class_attendance, start_class, end_class, set_meeting_link, remove_student_from_class, set_loading}) => {
    const [tab, setTab] = useState("announcements")
    const {_id:class_id="", title, subject, teacher, meeting_link="", schedules=[], current_session} = _class;
    const {id} = useParams();

    const [assignmentLimit, setAssignmentLimit] = useState(20);
    const [assignmentPage, setAssignmentPage] = useState(0);
    const [assignmentSearch, setAssignmentSearch] = useState("");
    const [assignmentSort, setAssignmentSort] = useState({createdAt: "desc"});
    const [assignmentFilters, setAssignmentFilters] = useState({});

    const [announcementLimit, setAnnouncementLimit] = useState(20);
    const [announcementPage, setAnnouncementPage] = useState(0);
    const [announcementSort, setAnnouncementSort] = useState({createdAt: "desc"});
    const [announcementFilters, setAnnouncementFilters] = useState({});

    const [showStartModal, setShowStartModal] = useState(false);
    const [newMeetingLink, setNewMeetingLink] = useState(meeting_link);
    const [newMeetingLinkError, setNewMeetingLinkError] = useState("");

    const [attendanceDay, setAttendanceDay] = useState(new Date());
    
    const teacher_only_tabs = is_teacher?[{label: "Students", id: "students"}]:[];

    const current_announcements = useMemo(() => {
        return (tab === "assignments")?announcements.filter((a) => a.assignment):announcements;
    }, [tab, announcements]);

    useEffect(() => {
        const init = async () => {
            set_loading(true);
            if(id && (class_id !== id)){
                await get_current_class(id);
                await get_class_assignments(id, assignmentLimit, assignmentPage * assignmentLimit, assignmentSearch, JSON.stringify(assignmentSort), JSON.stringify(assignmentFilters));
                await get_class_announcements(id, announcementLimit, announcementPage * announcementLimit, JSON.stringify(announcementSort), JSON.stringify(announcementFilters));
                await get_class_requests(20, 0, undefined, {_id: id});

            }
            set_loading(false);
        }
        
        init();
    }, [class_id]);
    
    useEffect(() => {
        if(class_id === id && is_teacher && current_session){
            setNewMeetingLink(_class.meeting_link);
            get_class_attendance(id, JSON.stringify({current_session: current_session._id}));
        }
    }, [_class, is_teacher]);

    useEffect(() => {
        setNewMeetingLinkError("");
    }, [newMeetingLink])

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

    const onRemoveStudent = async (student) => {
        set_loading(true);
        await remove_student_from_class({_class, student_id: student._id})
        set_loading(false);
    }

    const openStartModal = () => {
        setShowStartModal(true);
    }
    
    const closeStartModal = () => {
        setShowStartModal(false);
    }

    const startClass = async () => {
        set_loading(true);
        if(!newMeetingLink || is_full_url(newMeetingLink)){
            await start_class({_class, meeting_link: newMeetingLink});
            setNewMeetingLink("");
            closeStartModal();
        }else{
            setNewMeetingLinkError("Must be a valid url");
        }
        set_loading(false);
    }
    
    const endClass = async () => {
        set_loading(true);
        await end_class({_class});
        set_loading(false);
    }
    
    const setMeetingLink = async () => {
        set_loading(true);
        if(is_full_url(newMeetingLink)){
            await set_meeting_link({_class, meeting_link: newMeetingLink});
            setNewMeetingLink("");
        }else{
            setNewMeetingLinkError("Must be a valid url");
        }
        set_loading(false);
    }

    const jsx = <div></div>;

    return (
        <div className='page class'>
            <div className='main-col'>
                <div className='page-title'>
                    <h2>{title}</h2>

                    {is_teacher && <button onClick={current_session?endClass:openStartModal} className={`button ${current_session?"error":"primary"}`} >{current_session?"End Class":"Start Class"}</button>}
                </div>
                <Tabs tabs={[{label: "Announcements", id: "announcements"}, {label: "Assignments", id: "assignments"}, ...teacher_only_tabs]} onPressTab={onPressTab} />

                {(tab !== "students")?<Announcements _class={_class} user={user} announcements={current_announcements} assignments={assignments} is_teacher={is_teacher} tab={tab} />:<Students _class={_class} requests={requests} onAcceptRequest={onAcceptRequest} onDeclineRequest={onDeclineRequest} onRemoveStudent={onRemoveStudent} />}

            </div>

            <div className='misc-col'>
            {(tab !== "students")?<ClassInfo _class={_class} assignments={assignments} />:<Attendance _class={_class} attendance={attendance} />}
            </div>

            <Modal sx={{display: "grid", placeItems: "center"}} open={showStartModal} onClose={closeStartModal}>
                <div className='start-class-modal'>
                    <h1 style={{textAlign: "center"}}>Meeting Link</h1>

                    <div className='input-container fullwidth meeting'>
                        <input type="url" placeholder='Video Conference URL' value={newMeetingLink} onChange={(e) => {setNewMeetingLink(e.target.value)}} />
                        {newMeetingLinkError && <p className='error'>{newMeetingLinkError}</p>}
                    </div>

                    <button className='button primary fullwidth' onClick={startClass}>Start Class</button>
                </div>
            </Modal>
        </div>
    );
}

function map_state_to_props({App, User, Auth}){
    return {_class: App.current_class, user: App.user, is_teacher: Auth.is_teacher, is_admin: Auth.is_admin, requests: User.current_class_requests, announcements: App.class_announcements, assignments: App.class_assignments, attendance: User.class_attendance}
}

export default connect(map_state_to_props, {get_current_class, get_class_announcements, get_class_assignments, accept_join_request, decline_join_request, get_class_requests, get_class_attendance, start_class, end_class, set_meeting_link, remove_student_from_class, set_loading})(Class);