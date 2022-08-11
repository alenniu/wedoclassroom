import React from 'react';
import {RiCalendarLine} from "react-icons/ri";

import { DAYS, get_day, get_week_date_range, MONTHS } from '../../Data';
import { ordinal_suffix, randomColor, ranges_overlaps } from '../../Utils';

import "./NewSchedule.css";

const EVENTS = [
    {
        name: "English class",
        days: [1, 2, 5],
        time: "8AM - 2PM",
        startTime: new Date(2022, 7, 8, 8, 30, 0, 0),
        endTime: new Date(2022, 7, 8, 10, 0, 0, 0),
        bgcolor: randomColor()
    },
    {
        name: "Math class",
        days: [1, 2, 3, 4],
        time: "4PM - 6PM",
        startTime: new Date(2022, 7, 9, 16, 0, 0, 0),
        endTime: new Date(2022, 7, 9, 18, 0, 0, 0),
        bgcolor: randomColor()
    },
    {
        name: "Economics class",
        days: [3, 4, 5],
        time: "4PM - 6PM",
        startTime: new Date(2022, 7, 9, 16, 30, 0, 0),
        endTime: new Date(2022, 7, 19, 18, 30, 0, 0),
        bgcolor: randomColor()
    },
    {
        name: "Lessons",
        days: [6],
        time: "4PM - 6PM",
        startTime: new Date(2022, 7, 10, 16, 0, 0, 0),
        endTime: new Date(2022, 7, 10, 18, 0, 0, 0),
        bgcolor: randomColor()
    },
]

const HOURS_PER_DAY = 24;

const HOUR_SECTION_HEIGHT = 100;

const NewSchedule = ({schedule={}}) => {

    const current_date = new Date();
    const month = current_date.getMonth();
    const date = current_date.getDate();
    const {min, max} = get_week_date_range(month, date);
    const previous_month = min<1;
    const month_obj = MONTHS[month - (previous_month?1:0)] 

    const goes_into_next_month = !previous_month && max>month_obj.days;
    
    const subtract = goes_into_next_month?month_obj.days:0;

    return (
        <div className='new-schedule-container'>
            <p className='schedule-date-range'>
                <RiCalendarLine color='#99C183' size={24} /> {month_obj.long} {ordinal_suffix(min + (previous_month ? month_obj.days : 0))} - {(goes_into_next_month || previous_month) && MONTHS[month + (goes_into_next_month ? 1 : 0)].long} {ordinal_suffix(max - subtract)}, {current_date.getFullYear()}
            </p>

            <div className='schedule-days-columns'>
                {Array.from({length: 7}).map((_, i) => {
                    const this_date = min+i;
                    const subtract = this_date < 1 ? -month_obj.days : this_date > month_obj.days ? month_obj.days : 0;

                    return (
                        <span className='new-schedule-column-container'>
                            <span className='day'>
                                <p>{DAYS[i].short}</p>
                                <p>{ordinal_suffix(this_date - subtract)}</p>
                            </span>
                            {/* <div className='schedule-column-day top'></div>
                            <div className='schedule-column-day main'>
                            </div>
                            <div className='schedule-column-day bottom'></div> */}
                        </span>
                    )
                })}
            </div>

            <div className='new-schedule-calender'>

                <ul className='schedule-hours'>
                    {Array.from({length: HOURS_PER_DAY * 2}).map((_, i) => {
                        const is_half_hour = i % 2;
                        const hour = i/2;
                        const hour12Time = hour > 12 ? (hour-12) : hour || 12
                        const suffix = hour >= 12 ? "PM" : "AM"
                        return (
                            <li style={{"--section-height": (HOUR_SECTION_HEIGHT/2)+"px"}} className={`schedule-calendar-hour-period ${is_half_hour?"half":"full"}`}>
                                {!is_half_hour && <span className='schedule-time'>{hour12Time}{suffix}</span>}
                            </li>
                        )
                    })}
                </ul>

                {EVENTS.map(({name, days=[], time, startTime, endTime, bgcolor}, i, arr) => {
                    // const ordered_days = days.sort((a, z) => a - z);

                    // console.log(bgcolor);

                    // const consecutive_periods = ordered_days.reduce((prev, curr, i, arr) => {
                    //     const latest_period = prev.at(-1);
                    //     if(latest_period.length){
                    //         if((curr - latest_period.at(-1)) > 1){
                    //             prev.push([curr]);
                    //         }else{
                    //             latest_period.push(curr);
                    //         }
                    //     }else{
                    //         latest_period.push(curr);
                    //     }

                    //     return prev;
                    // }, [[]]);

                    return days.map((d) => {
                        // const items_on_same_day_before = arr.filter((a, ai) => ai < i && a.name !== name && ranges_overlaps({min: d[0], max: d.at(-1)}, {min: a.days[0], max: a.days.at(-1)}));

                        // const items_on_same_day = arr.filter((a, ai) => ranges_overlaps({min: d[0], max: d.at(-1)}, {min: a.days[0], max: a.days.at(-1)}));

                        // console.log(items_on_same_day_before, items_on_same_day);

                        // const maxHeight = 265 / (items_on_same_day.length || 1);

                        return (
                            <div className='schedule-event' style={{left: `calc(75px + (((100% - 70px)/7) * ${d}))`, width: `50px`, top: `${HOUR_SECTION_HEIGHT * (startTime.getHours() + (startTime.getMinutes()/60))}px`, height: `${HOUR_SECTION_HEIGHT * ((endTime.getHours() + (endTime.getMinutes()/60)) - (startTime.getHours() + (startTime.getMinutes()/60)))}px`, backgroundColor: bgcolor}}>
                                <p>{name}</p>
                                <p>{startTime.toLocaleTimeString(undefined, {hour12: true, hour: "2-digit", minute: "2-digit"})} - {endTime.toLocaleTimeString(undefined, {hour12: true, hour: "2-digit", minute: "2-digit"})}</p>
                                <p>{days.length>1?" - " + DAYS[days.at(-1)].short:""}</p>
                            </div>
                        )
                    })
                })}
            </div>
        </div>
    );
}
 
export default NewSchedule;