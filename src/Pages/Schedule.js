import React, { useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { get_classes_schedules, get_my_classes, set_loading } from '../Actions';
import Schedule from '../Components/Dashboard/Schedule';
import { useNavigate } from 'react-router-dom';
import NewSchedule from '../Components/Dashboard/NewSchedule';
import { DAY, get_week_date_range, MONTHS } from '../Data';

import "./Schedule.css";

const SchedulePage = ({classes=[], total=0, classes_schedules=[], get_classes_schedules, get_my_classes, set_loading}) => {    
    const schedules = classes_schedules.flatMap(({schedules, ...c}) => {
        return  schedules.map((s) => ({...s, ...c}));
    });
    
    const [weekRange, setWeekRange] = useState(null)

    // console.log({classes_schedules, schedules});
    
    const navigate = useNavigate();

    useEffect(() => {
        const current_date = new Date();
        const current_day = current_date.getDay();
        const month = current_date.getMonth();
        const date = current_date.getDate();
        const {min, max} = get_week_date_range(month, date);

        const starts_in_previous_month = min < 1;
        const month_obj = MONTHS[month - (starts_in_previous_month?1:0)];

        const goes_into_next_month = !starts_in_previous_month && max>month_obj.days;

        setWeekRange({min: new Date(current_date.getTime() - (current_day * DAY)), max: new Date(current_date.getTime() + ((7-current_day) * DAY))});
    }, []);

    useEffect(() => {
        const get_schedules = async () => {
            if(weekRange){
                const {min, max} = weekRange;
                await get_classes_schedules({startPeriod: min, endPeriod: max});
            }
        };

        get_schedules();
    }, [weekRange]);

    return (
        <div className='page schedule'>
            <div className='main-col fullwidth'>
                <NewSchedule schedules={schedules} date_range={weekRange} />
                <Schedule schedules={schedules} />
            </div>
        </div>
    );
}

function map_state_to_props({User}){
    return {classes: User.classes, total: User.total_classes, classes_schedules: User.classes_schedules}
}

export default connect(map_state_to_props, {get_my_classes, get_classes_schedules, set_loading})(SchedulePage);