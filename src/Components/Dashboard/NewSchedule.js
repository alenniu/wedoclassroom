import React, { useEffect, useRef, useState } from 'react';
import {RiArrowLeftSLine, RiArrowRightSLine, RiCalendarLine} from "react-icons/ri";
import { useNavigate } from 'react-router-dom';

import { DAY, DAYS, get_day, get_week_date_range, MONTHS } from '../../Data';
import { isWebkit, is_same_day, ordinal_suffix, randomColor, ranges_overlaps } from '../../Utils';

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

const NewSchedule = ({lessons=[], reschedules=[], date_range={}, onClickNextDateRange, onClickPrevDateRange, is_admin, is_teacher, is_sales}) => {

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
        const earliestStartTime = lessons.map(({start_time}) => start_time.getHours() + (start_time.getMinutes()/60)).sort((a, b) => a - b)[0];

        if(earliestStartTime){
            const earliestTop = HOUR_SECTION_HEIGHT * earliestStartTime;

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
    }, [lessons]);

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

                {lessons.map(({_id, title, days=[], time, date, start_time:startTime, end_time:endTime, bg_color, text_color, cancelled=false, is_custom_date=false}, i, arr) => {

                    const day = date.getDay();
                    const d = day;
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

                    const startDayTime = startTime.getHours() + (startTime.getMinutes()/60);
                    const endDayTime = endTime.getHours() + (endTime.getMinutes()/60);
                    const time_range = `${startTime.toLocaleTimeString(undefined, {hour12: true, hour: "numeric", minute: "2-digit"})} - ${endTime.toLocaleTimeString(undefined, {hour12: true, hour: "numeric", minute: "2-digit"})}`

                    const currentDate = new Date(min.getTime() + (d * DAY));

                    const overlapping_items_before_lt_30_mins = arr.filter((s, si) => {

                        const sStartDayTime = s.start_time.getHours() + (s.start_time.getMinutes()/60);
                        const sEndDayTime = s.end_time.getHours() + (s.end_time.getMinutes()/60);


                        return si < i && (is_same_day(date, s.date) && (Math.abs(sStartDayTime - startDayTime) < 0.5) && ranges_overlaps({min: startDayTime, max: endDayTime}, {min: sStartDayTime, max: sEndDayTime+0.6}))
                    });

                    const overlapping_items_before_gt_30_mins = arr.filter((s, si) => {

                        const sStartDayTime = s.start_time.getHours() + (s.start_time.getMinutes()/60);
                        const sEndDayTime = s.end_time.getHours() + (s.end_time.getMinutes()/60);


                        return si < i && (is_same_day(date, s.date) && (Math.abs(sStartDayTime - startDayTime) >= 0.5) && ranges_overlaps({min: startDayTime, max: endDayTime}, {min: sStartDayTime, max: sEndDayTime+0.6}))
                    });


                    const top = HOUR_SECTION_HEIGHT * startDayTime;
                    
                    const timeLeftOffset = is_webkit?65:70;

                    let leftOffset = (overlapping_items_before_lt_30_mins.length * 50) + (5 * overlapping_items_before_lt_30_mins.length);

                    leftOffset += (overlapping_items_before_gt_30_mins.length * 8);

                    const height = HOUR_SECTION_HEIGHT * (endDayTime - startDayTime);

                    return (
                        <div key={_id+d+time_range} title={`${title} | ${time_range} ${cancelled?"(rescheduled)":is_custom_date?"(New Date)":""}`} className={`schedule-event clickable ${cancelled?"rescheduled":is_custom_date?"custom":""}`} onClick={() => {(is_admin || is_sales || is_teacher) && navigate(`/dashboard/class/edit/${_id}`)}} style={{left: `calc(75px + (((100% - ${timeLeftOffset}px)/7) * ${d}) + ${leftOffset}px)`, top: `${top}px`, height: `${height}px`, maxWidth: `calc(((100% - ${timeLeftOffset}px) / 7) - ${leftOffset}px)`, backgroundColor: bg_color, color: text_color, zIndex: Math.ceil(top)}}>
                            <p><b>{startTime.toLocaleTimeString(undefined, {hour12: true, hour: "numeric", minute: "2-digit"})} - {endTime.toLocaleTimeString(undefined, {hour12: true, hour: "numeric", minute: "2-digit"})}</b></p>
                            <p>{title}</p>
                            {/* <p>{DAYS[d].short}</p> */}
                        </div>
                    )
                })}
            </div>
        </div>
    );
}
 
export default NewSchedule;