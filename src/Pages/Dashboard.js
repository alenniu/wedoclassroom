import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { get_my_classes, set_loading } from '../Actions';
import Tabs from '../Components/Common/Tabs';
import Class from '../Components/Dashboard/Class';
import "./Dashboard.css";
import Schedule from '../Components/Dashboard/Schedule';
import { useNavigate } from 'react-router-dom';

const Dashboard = ({classes=[], total=0, get_my_classes, set_loading}) => {
    const [pageLimit, setPageLimit] = useState(20);
    const [page, setPage] = useState(0);
    const [search, setSearch] = useState("");

    const [classtype, setClasstype] = useState("")
    
    const navigate = useNavigate();

    useEffect(() => {
        const init = async () => {
            set_loading(true);
            await get_my_classes(pageLimit, page);
            set_loading(false);
        }

        init();
    }, []);

    useEffect(() => {
        const init = async () => {
            set_loading(true);
            await get_my_classes(pageLimit, page);
            set_loading(false);
        }

        init();
    }, [classtype]);

    const onPressTab = (e, {label, id}, index) => {
        setClasstype(id);
    }

    return (
        <div className='page dashboard'>
            <div className='main-col'>
                <Schedule />
            </div>

            <div className='misc-col'>
                <Tabs tabs={[{label: "All Classes", id: ""}, {label: "Group Lessons", id: "group"}, {label: "One on One", id: "private"}]} />

                <ul className='class-list'>
                    {classes.map((c, i) => {
                        return <li key={c._id + i} onClick={() => {navigate(`/dashboard/my-class/${c._id}`)}} className='class-item clickable'><Class _class={c} index={i} onPressTab={onPressTab} /></li>
                    })}
                </ul>
            </div>
        </div>
    );
}

function map_state_to_props({User}){
    return {classes: User.classes, total: User.total_classes}
}

export default connect(map_state_to_props, {get_my_classes, set_loading})(Dashboard);