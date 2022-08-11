import React, { useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { get_classes_schedules, get_my_classes, set_loading } from '../Actions';
import Tabs from '../Components/Common/Tabs';
import Class from '../Components/Dashboard/Class';
import "./Dashboard.css";
import Schedule from '../Components/Dashboard/Schedule';
import { useNavigate } from 'react-router-dom';
import InfiniteScroller from '../Components/Common/InfiniteScroller';
import NewSchedule from '../Components/Dashboard/NewSchedule';
import { DAY, get_week_date_range, MONTHS } from '../Data';

const Dashboard = ({classes=[], total=0, classes_schedules=[], get_classes_schedules, get_my_classes, set_loading}) => {
    const [pageLimit, setPageLimit] = useState(20);
    const [page, setPage] = useState(0);
    const [search, setSearch] = useState("");

    const [classtype, setClasstype] = useState("")

    
    const [scrollerDimensions, setScrollerDimensions] = useState({width: "100%", height: 0});
    const scrollerRef = useRef(null);
    
    const schedules = classes_schedules.flatMap(({schedules, ...c}) => {
        return  schedules.map((s) => ({...s, ...c}));
    });
    
    const [weekRange, setWeekRange] = useState(null)

    // console.log({classes_schedules, schedules});
    
    const navigate = useNavigate();

    useEffect(() => {
        const init = async () => {
            set_loading(true);
            await get_my_classes(pageLimit, page * pageLimit);
            set_loading(false);
        }

        const current_date = new Date();
        const current_day = current_date.getDay();
        const month = current_date.getMonth();
        const date = current_date.getDate();
        const {min, max} = get_week_date_range(month, date);

        const starts_in_previous_month = min < 1;
        const month_obj = MONTHS[month - (starts_in_previous_month?1:0)];

        const goes_into_next_month = !starts_in_previous_month && max>month_obj.days;

        setWeekRange({min: new Date(current_date.getTime() - (current_day * DAY)), max: new Date(current_date.getTime() + ((7-current_day) * DAY))});
        
        init();
    }, []);

    useEffect(() => {
        const get_schedules = async () => {
            if(weekRange){
                const {min, max} = weekRange;
                await get_classes_schedules({startPeriod: min, endPeriod: max});
            }
        };

        get_schedules();
    }, [weekRange])
    
    useEffect(() => {
        const init = async () => {
            set_loading(true);
            await get_my_classes(pageLimit, page * pageLimit);
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
                <NewSchedule schedules={schedules} date_range={weekRange} />
                <Schedule schedules={schedules} />
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
    return {classes: User.classes, total: User.total_classes, classes_schedules: User.classes_schedules}
}

export default connect(map_state_to_props, {get_my_classes, get_classes_schedules, set_loading})(Dashboard);