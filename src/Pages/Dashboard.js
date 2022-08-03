import React, { useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { get_my_classes, set_loading } from '../Actions';
import Tabs from '../Components/Common/Tabs';
import Class from '../Components/Dashboard/Class';
import "./Dashboard.css";
import Schedule from '../Components/Dashboard/Schedule';
import { useNavigate } from 'react-router-dom';
import InfiniteScroller from '../Components/Common/InfiniteScroller';

const Dashboard = ({classes=[], total=0, get_my_classes, set_loading}) => {
    const [pageLimit, setPageLimit] = useState(20);
    const [page, setPage] = useState(0);
    const [search, setSearch] = useState("");

    const [classtype, setClasstype] = useState("")
    
    const [scrollerDimensions, setScrollerDimensions] = useState({width: "100%", height: 0});
    const scrollerRef = useRef(null);
    
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

    function onLayout({pageOffsetY, pageOffsetX, top, left, width, height, windowWidth, windowHeight}){
        setScrollerDimensions((s) => ({...s, height: windowHeight - (pageOffsetY + 10)}));
    }

    return (
        <div className='page dashboard'>
            <div className='main-col'>
                <Schedule />
            </div>

            <div className='misc-col'>
                <Tabs tabs={[{label: "All Classes", id: ""}, {label: "Group Lessons", id: "group"}, {label: "One on One", id: "private"}]} />

                <InfiniteScroller onLayout={onLayout} width={scrollerDimensions.width} height={scrollerDimensions.height} ref={scrollerRef}>
                    <ul className='class-list'>
                        {classes.length && Array.from({length: 20}).fill(classes).flat(1).map((c, i) => {
                            return <li key={c._id + i} onClick={() => {navigate(`/dashboard/my-class/${c._id}`)}} className='class-item clickable'><Class _class={c} index={i} onPressTab={onPressTab} /></li>
                        })}
                    </ul>
                </InfiniteScroller>
            </div>
        </div>
    );
}

function map_state_to_props({User}){
    return {classes: User.classes, total: User.total_classes}
}

export default connect(map_state_to_props, {get_my_classes, set_loading})(Dashboard);