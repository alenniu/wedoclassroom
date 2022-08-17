import React, { useEffect, useRef, useState } from 'react';
import {RiArrowLeftSLine, RiArrowRightSLine, RiCalendarLine} from "react-icons/ri";
import { useNavigate } from 'react-router-dom';

import { DAY, DAYS, get_day, get_week_date_range, MONTHS } from '../../Data';
import { isWebkit, ordinal_suffix, randomColor, ranges_overlaps } from '../../Utils';

import "./NewSchedule.css";

const EVENTS = [
    {
        name: "English class",
        days: [1, 2, 5],
        time: "8AM - 2PM",
        startTime: new Date(2022, 7, 8, 8, 30, 0, 0),
        endTime: new Date(2022, 7, 8, 10, 0, 0, 0),
        bg_color: randomColor()
    },
    {
        name: "Math class",
        days: [1, 2, 3, 4],
        time: "4PM - 6PM",
        startTime: new Date(2022, 7, 9, 16, 0, 0, 0),
        endTime: new Date(2022, 7, 9, 18, 0, 0, 0),
        bg_color: randomColor()
    },
    {
        name: "Economics class",
        days: [3, 4, 5],
        time: "4PM - 6PM",
        startTime: new Date(2022, 7, 9, 16, 30, 0, 0),
        endTime: new Date(2022, 7, 19, 18, 30, 0, 0),
        bg_color: randomColor()
    },
    {
        name: "Lessons",
        days: [6],
        time: "4PM - 6PM",
        startTime: new Date(2022, 7, 10, 16, 0, 0, 0),
        endTime: new Date(2022, 7, 10, 18, 0, 0, 0),
        bg_color: randomColor()
    },
]

const HOURS_PER_DAY = 24;

const HOUR_SECTION_HEIGHT = 100;

const is_webkit = isWebkit();

const NewSchedule = ({schedules=[], reschedules=[], date_range={}, onClickNextDateRange, onClickPrevDateRange, is_admin, is_teacher, is_sales}) => {

    const calendarRef = useRef(null);
    const [calendarheight, setCalendarHeight] = useState(200);

    const navigate = useNavigate()

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

    const getCalendarHeight = () => {
        const {innerWidth, innerHeight, scrollY, scrollX} = window;
        const { x, y, top, left, width, height, } = calendarRef.current?.getBoundingClientRect();

        setCalendarHeight(innerHeight - (top + scrollY + 20))
    }

    const scrollToEarliestTime = () => {
        const earliestStartTime = schedules.map(({daily_start_time}) => new Date(daily_start_time)).sort()[0];

        if(earliestStartTime){
            const earlieststartTimeHours = earliestStartTime.getHours() + (earliestStartTime.getMinutes()/60);

            const earliestTop = HOUR_SECTION_HEIGHT * earlieststartTimeHours;

            calendarRef.current?.scrollTo(0, earliestTop - 20)
        }
    }

    useEffect(() => {
        getCalendarHeight();
        window.addEventListener("resize", getCalendarHeight);

        return () => {
            window.removeEventListener("resize", getCalendarHeight);
        }
    }, []);

    useEffect(() => {
        scrollToEarliestTime()
    }, [schedules]);

    return (
        <div className='new-schedule-container' style={{"--calendar-height": calendarheight+"px"}}>
            <p className='schedule-date-range'>
                <span onClick={onClickPrevRange} className='schedule-range-arrow prev clickable'><RiArrowLeftSLine color='#99C183' size={24} /></span>
                <RiCalendarLine color='#99C183' size={24} /> {minMonth.long} {ordinal_suffix(minDate)} - {(maxMonth.short !== minMonth.short)?maxMonth.long+" ":""}{ordinal_suffix(maxDate)}, {min.getFullYear()}
                <span onClick={onClickNextRange} className='schedule-range-arrow next clickable'><RiArrowRightSLine color='#99C183' size={24} /></span>
            </p>

            <div className='schedule-days-columns'>
                {Array.from({length: 7}).map((_, i) => {
                    const this_date = new Date(min.getTime() + (i * DAY));
                    return (
                        <span key={this_date.toDateString()} className='new-schedule-column-container'>
                            <span className='day'>
                                <p>{DAYS[this_date.getDay()].short} {ordinal_suffix(this_date.getDate())}</p>
                            </span>
                            {/* <div className='schedule-column-day top'></div>
                            <div className='schedule-column-day main'>
                            </div>
                            <div className='schedule-column-day bottom'></div> */}
                        </span>
                    )
                })}
            </div>

            <div ref={calendarRef} className='new-schedule-calender'>
                <ul className='schedule-hours'>
                    {Array.from({length: HOURS_PER_DAY * 2}).map((_, i) => {
                        const is_half_hour = i % 2;
                        const hour = i/2;
                        const hour12Time = hour > 12 ? (hour-12) : hour || 12
                        const suffix = hour >= 12 ? "PM" : "AM"
                        return (
                            <li key={hour.toString()} style={{"--section-height": (HOUR_SECTION_HEIGHT/2)+"px"}} className={`schedule-calendar-hour-period ${is_half_hour?"half":"full"}`}>
                                {!is_half_hour && <span className='schedule-time'>{hour12Time}{suffix}</span>}
                            </li>
                        )
                    })}
                </ul>

                {schedules.map(({_id, title, days=[], time, daily_start_time, daily_end_time, bg_color, text_color}, i, arr) => {
                    // const ordered_days = days.sort((a, z) => a - z);

                    // console.log(bg_color);

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

                    const startTime = new Date(daily_start_time);
                    const endTime = new Date(daily_end_time);
                    const startDayTime = startTime.getHours() + (startTime.getMinutes()/60);
                    const endDayTime = endTime.getHours() + (endTime.getMinutes()/60);
                    const time_range = `${startTime.toLocaleTimeString(undefined, {hour12: true, hour: "numeric", minute: "2-digit"})} - ${endTime.toLocaleTimeString(undefined, {hour12: true, hour: "numeric", minute: "2-digit"})}`

                    return days.map((d) => {
                        const currentDate = new Date(min.getTime() + (d * DAY));

                        const overlapping_items_before = arr.filter((s, si) => {

                            const sStartTime = new Date(s.daily_start_time); 
                            const sEndTime = new Date(s.daily_end_time); 
                            const sStartDayTime = sStartTime.getHours() + (sStartTime.getMinutes()/60);
                            const sEndDayTime = sEndTime.getHours() + (sEndTime.getMinutes()/60);
                            
                            return (si < i && s.days.includes(d) && ranges_overlaps({min: startDayTime, max: endDayTime}, {min: sStartDayTime, max: sEndDayTime}))
                        });

                        // console.log("overlapping_items_before", overlapping_items_before);

                        const top = HOUR_SECTION_HEIGHT * startDayTime;
                        const leftOffset = overlapping_items_before.length * 30;

                        const height = HOUR_SECTION_HEIGHT * (endDayTime - startDayTime);

                        const is_rescheduled = reschedules.find((r) => {
                            const {old_date, _class} = r;
                            const oldDate = new Date(old_date);

                            return _class === _id && (oldDate.getDay() === currentDate.getDay()) && ((currentDate.getTime() - oldDate.getTime()) < DAY);
                        });

                        return (
                            <div key={_id+d+time_range} title={`${title} | ${time_range} ${is_rescheduled?"(rescheduled)":""}`} className={`schedule-event clickable ${is_rescheduled?"rescheduled":""}`} onClick={() => {(is_admin || is_sales || is_teacher) && navigate(`/dashboard/class/edit/${_id}`)}} style={{left: `calc(75px + (((100% - ${is_webkit?65:70}px)/7) * ${d}) + ${leftOffset}px)`, width: `50px`, top: `${top}px`, height: `${height}px`, backgroundColor: bg_color, color: text_color, zIndex: top}}>
                                <p>{title}</p>
                                <p>{startTime.toLocaleTimeString(undefined, {hour12: true, hour: "numeric", minute: "2-digit"})} - {endTime.toLocaleTimeString(undefined, {hour12: true, hour: "numeric", minute: "2-digit"})}</p>
                                <p>{DAYS[d].short}</p>
                            </div>
                        )
                    })
                })}
            </div>
        </div>
    );
}
 
export default NewSchedule;