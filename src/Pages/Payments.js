import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { connect } from 'react-redux';
import { get_sessions, get_teachers, set_loading } from '../Actions';
import { debounce, get_full_image_url, toMoneyString } from '../Utils';
import { formatDistance, formatDuration, intervalToDuration } from 'date-fns';
import { Tabs } from '../Components/Common';
import ClassOverView from '../Components/Payments/ClassOverview';
import TeachersSection from '../Components/Payments/TeachersSection';
import StudentsSection from '../Components/Payments/StudentsSection';

import "./Payments.css";


const tabs = [{label: "Overview", id: "overview", Component: ClassOverView}, {label: "Teachers", id: "teachers", Component: TeachersSection}, {label: "Students", id: "students", Component: StudentsSection}];


const Payments = ({is_admin, is_teacher}) => {
    const [currentTab, setCurrentTab] = useState(is_teacher?tabs[1]:tabs[0]);

    const TabComponent = currentTab.Component;

    const tabIndex = useMemo(() => {
        return tabs.findIndex(({label, id}) => id === currentTab.id);
    }, [currentTab]);

    return (
        <div className='page payments'>
            <div className='main-col fullwidth'>
                {!is_teacher && <Tabs tabs={tabs} index={tabIndex!==-1?tabIndex:0} current_id={currentTab}  onPressTab={(e, tab, i) => {setCurrentTab(tab)}} />}

                <TabComponent />
            </div>
        </div>
    );
}

function map_state_to_props({Auth, Admin}){
    return {sessions: Admin.sessions, total_sessions: Admin.total_sessions, teachers: Admin.teachers, total_teachers: Admin.total_teachers, is_admin: Auth.is_admin, is_teacher: Auth.is_teacher};
}

export default connect(map_state_to_props, {get_teachers, get_sessions, set_loading})(Payments);