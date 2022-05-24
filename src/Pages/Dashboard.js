import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import {RiCalendarLine} from "react-icons/ri";
import { get_classes, set_loading } from '../Actions';
import Tabs from '../Components/Common/Tabs';
import Class from '../Components/Dashboard/Class';
import "./Dashboard.css";
import { get_week_date_range, MONTHS } from '../Data';

const Dashboard = ({classes=[], total=0, get_classes, set_loading}) => {
    const [pageLimit, setPageLimit] = useState(20);
    const [page, setPage] = useState(0);
    const [search, setSearch] = useState("");

    const [classtype, setClasstype] = useState("")

    useEffect(() => {
        const init = async () => {
            set_loading(true);
            await get_classes(pageLimit, page);
            set_loading(false);
        }

        init();
    }, []);

    useEffect(() => {
        const init = async () => {
            set_loading(true);
            await get_classes(pageLimit, page);
            set_loading(false);
        }

        init();
    }, [classtype]);

    const onPressTab = (e, {label, id}, index) => {
        setClasstype(id);
    }

    const current_date = new Date();
    const {min, max} = get_week_date_range(current_date.getMonth(), current_date.getDate());
    return (
        <div className='page dashboard'>
            <div className='main-col'>
                <div className='schedule-container'>
                    <p className='schedule-date-range'>
                        <RiCalendarLine color='#99C183' size={24} /> {MONTHS[current_date.getMonth()].long} {min} - {max}, {current_date.getFullYear()}
                    </p>

                    <div className='scedule-calender'>
                        
                    </div>
                </div>
            </div>

            <div className='misc-col'>
                <Tabs tabs={[{label: "All Classes", id: ""}, {label: "Group Lessons", id: "group"}, {label: "One on One", id: "individual"}]} />

                <ul className='class-list'>
                    {[...classes, ...classes, ...classes, ...classes, ...classes, ...classes, ...classes, ...classes].map((c, i) => {
                        return <li key={c.subject+i} className='class-item clickable'><Class _class={c} index={i} onPressTab={onPressTab} /></li>
                    })}
                </ul>
            </div>
        </div>
    );
}

function map_state_to_props({User}){
    return {classes: User.classes, total: User.total_classes}
}

export default connect(map_state_to_props, {get_classes, set_loading})(Dashboard);