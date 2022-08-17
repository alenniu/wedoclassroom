import React from 'react';
import {RiArrowLeftSLine, RiArrowRightSLine, RiCalendarLine} from "react-icons/ri";
import { useNavigate } from 'react-router-dom';

import { DAY, DAYS, get_day, get_week_date_range, MONTHS } from '../../Data';
import { ordinal_suffix, randomColor, ranges_overlaps } from '../../Utils';

import "./Schedule.css";

const EVENTS = [
    {
        name: "English class",
        days: [1, 2, 5],
        time: "8AM - 2PM",
        bg_color: randomColor()
    },
    {
        name: "Math class",
        days: [1, 2, 3, 4],
        time: "4PM - 6PM",
        bg_color: randomColor()
    },
    {
        name: "Economics class",
        days: [3, 4, 5],
        time: "4PM - 6PM",
        bg_color: randomColor()
    },
    {
        name: "Lessons",
        days: [6],
        time: "4PM - 6PM",
        bg_color: randomColor()
    },
]

const Schedule = ({schedules=[], reschedules=[], date_range={}, onClickNextDateRange, onClickPrevDateRange, is_admin, is_teacher, is_sales}) => {

    const navigate = useNavigate();

    const {min=new Date(), max=new Date()} = date_range || {};
    const minDate = min.getDate();
    const maxDate = max.getDate()-1;
    const minMonth = MONTHS[min.getMonth()];
    const maxMonth = MONTHS[max.getMonth()];

    const onClickNextRange = (e) => {
        typeof(onClickNextDateRange) === "function" && onClickNextDateRange(e);
    }
    
    const onClickPrevRange = (e) => {
        typeof(onClickPrevDateRange) === "function" && onClickPrevDateRange(e);
    }

    return (
        <div className='schedule-container'>
            <p className='schedule-date-range'>
                <span onClick={onClickPrevRange} className='schedule-range-arrow prev clickable'><RiArrowLeftSLine color='#99C183' size={24} /></span>
                <RiCalendarLine color='#99C183' size={24} /> {minMonth.long} {ordinal_suffix(minDate)} - {(maxMonth.short !== minMonth.short)?maxMonth.long+" ":""}{ordinal_suffix(maxDate)}, {min.getFullYear()}
                <span onClick={onClickNextRange} className='schedule-range-arrow next clickable'><RiArrowRightSLine color='#99C183' size={24} /></span>
            </p>

            <div className='schedule-calender'>
                {Array.from({length: 7}).map((_, i) => {
                    const this_date = new Date(min.getTime() + (i * DAY));
                    

                    return (
                        <span key={this_date.toDateString()} className='schedule-column-container'>
                            <span className='day'>{DAYS[this_date.getDay()].short}</span>
                            <div className='schedule-column-day top'></div>
                            <div className='schedule-column-day main'>
                                {ordinal_suffix(this_date.getDate())}
                            </div>
                            <div className='schedule-column-day bottom'></div>
                        </span>
                    )
                })}

                {schedules.map(({_id, title, days=[], daily_start_time, daily_end_time, bg_color, text_color}, i, arr) => {
                    const ordered_days = days.sort((a, z) => a - z);

                    // console.log(bg_color);

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

                    const startTime = new Date(daily_start_time)
                    const endTime = new Date(daily_end_time);
                    const time_range = `${startTime.toLocaleTimeString(undefined, {hour12: true, hour: "numeric", minute: "2-digit"})} - ${endTime.toLocaleTimeString(undefined, {hour12: true, hour: "numeric", minute: "2-digit"})}`

                    return consecutive_periods.map((days) => {
                        const items_on_same_day_before = arr.filter((a, ai) => ai < i && a.title !== title && ranges_overlaps({min: days[0], max: days.at(-1)}, {min: a.days[0], max: a.days.at(-1)}));

                        const items_on_same_day = arr.filter((a, ai) => ranges_overlaps({min: days[0], max: days.at(-1)}, {min: a.days[0], max: a.days.at(-1)}));

                        // console.log(items_on_same_day_before, items_on_same_day);

                        const maxHeight = 265 / (items_on_same_day.length || 1);

                        return (
                            <div key={_id+time_range} title={`${title} - ${time_range}`} className='schedule-event clickable' onClick={() => {(is_admin || is_sales || is_teacher) && navigate(`/dashboard/class/edit/${_id}`)}} style={{left: `calc(${((100/7)*days[0])}% + 5px)`, width: `calc(${(100/7) * days.length}% - 10px)`, top: `${160 + (items_on_same_day_before.length * maxHeight)}px`, maxHeight: `${maxHeight}px`, backgroundColor: bg_color, color: text_color}}>
                                <p>{title}</p>
                                <p>{time_range}</p>
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