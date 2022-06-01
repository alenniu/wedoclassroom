import React from 'react';
import {RiCalendarLine} from "react-icons/ri";

import { DAYS, get_day, get_week_date_range, MONTHS } from '../../Data';
import { randomColor, ranges_overlaps } from '../../Utils';

import "./Schedule.css";

const EVENTS = [
    {
        name: "English class",
        days: [1, 2, 5],
        time: "8AM - 2PM",
        bgcolor: randomColor()
    },
    {
        name: "Math class",
        days: [1, 2, 3, 4],
        time: "4PM - 6PM",
        bgcolor: randomColor()
    },
    {
        name: "Economics class",
        days: [3, 4, 5],
        time: "4PM - 6PM",
        bgcolor: randomColor()
    },
    {
        name: "Lessons",
        days: [6],
        time: "4PM - 6PM",
        bgcolor: randomColor()
    },
]

const Schedule = ({schedule={}}) => {

    const current_date = new Date();
    const month = current_date.getMonth();
    const date = current_date.getDate();
    const {min, max} = get_week_date_range(month, date);
    const previous_month = min<1;
    const month_obj = MONTHS[month - (previous_month?1:0)] 

    const goes_into_next_month = !previous_month && max>month_obj.days;
    
    const subtract = goes_into_next_month?month_obj.days:0;

    return (
        <div className='schedule-container'>
            <p className='schedule-date-range'>
                <RiCalendarLine color='#99C183' size={24} /> {month_obj.long} {min + (previous_month ? month_obj.days : 0)} - {(goes_into_next_month || previous_month) && MONTHS[month + (goes_into_next_month ? 1 : 0)].long} {max - subtract}, {current_date.getFullYear()}
            </p>

            <div className='schedule-calender'>
                {Array(7).fill(null).map((_, i) => {
                    const this_date = min+i;
                    const subtract = this_date < 1 ? -month_obj.days : this_date > month_obj.days ? month_obj.days : 0;

                    return (
                        <span className='schedule-column-container'>
                            <span className='day'>{DAYS[i].short}</span>
                            <div className='schedule-column-day top'></div>
                            <div className='schedule-column-day main'>
                                {this_date - subtract}
                            </div>
                            <div className='schedule-column-day bottom'></div>
                        </span>
                    )
                })}

                {EVENTS.map(({name, days=[], time, bgcolor}, i, arr) => {
                    const ordered_days = days.sort((a, z) => a - z);

                    // console.log(bgcolor);

                    const consecutive_periods = ordered_days.reduce((prev, curr, i, arr) => {
                        const latest_period = prev.at(-1);
                        if(latest_period.length){
                            if((curr - latest_period.at(-1)) > 1){
                                prev.push([curr]);
                            }else{
                                latest_period.push(curr);
                            }
                        }else{
                            latest_period.push(curr);
                        }

                        return prev;
                    }, [[]]);

                    return consecutive_periods.map((days) => {
                        const items_on_same_day_before = arr.filter((a, ai) => ai < i && a.name !== name && ranges_overlaps({min: days[0], max: days.at(-1)}, {min: a.days[0], max: a.days.at(-1)}));

                        const items_on_same_day = arr.filter((a, ai) => ranges_overlaps({min: days[0], max: days.at(-1)}, {min: a.days[0], max: a.days.at(-1)}));

                        // console.log(items_on_same_day_before, items_on_same_day);

                        const maxHeight = 265 / (items_on_same_day.length || 1);

                        return (
                            <div className='schedule-event' style={{left: `calc(${((100/7)*days[0])}% + 5px)`, width: `calc(${(100/7) * days.length}% - 10px)`, top: `${160 + (items_on_same_day_before.length * maxHeight)}px`, maxHeight: `${maxHeight}px`, backgroundColor: bgcolor}}>
                                <p>{name}</p>
                                <p>{time}</p>
                                <p>{DAYS[days[0]].short}{days.length>1?" - " + DAYS[days.at(-1)].short:""}</p>
                            </div>
                        )
                    })
                })}
            </div>
        </div>
    );
}
 
export default Schedule;