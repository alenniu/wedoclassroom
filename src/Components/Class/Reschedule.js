import React, { useState } from 'react';
import { RiArrowDownSLine, RiArrowRightLine, RiArrowUpSLine } from 'react-icons/ri';
import { FaCalendarCheck, FaCalendarTimes } from 'react-icons/fa';
import { MONTHS } from '../../Data';
import { ordinal_suffix } from '../../Utils';

import "./Reschedule.css";

const Reschedule = ({reschedule, onAccept, onReject, is_admin}) => {
    const [showReason, setShowReason] = useState(false);

    const {_id, old_date, new_date, new_start_time, new_end_time, reason, accepted, rejected} = reschedule;
    
    const oldDate = new Date(old_date);
    const newDate = new_date && new Date(new_date);
    const newStartTime = new_start_time && new Date(new_start_time);
    const newEndTime = new_end_time && new Date(new_end_time);

    const time_range = (newStartTime && newEndTime)?`${newStartTime.toLocaleTimeString(undefined, {hour12: true, hour: "numeric", minute: "2-digit"})} - ${newEndTime.toLocaleTimeString(undefined, {hour12: true, hour: "numeric", minute: "2-digit"})}`:"N/A - N/A"

    const onClickAccept = () => {
        typeof(onAccept) === "function" && onAccept(reschedule);
    }

    const onClickReject = () => {
        typeof(onReject) === "function" && onReject(reschedule);
    }

    return (
        <div key={_id} title={reason} className={`reschedule-request ${accepted?"accepted":rejected?"rejected":"unhandled"}`}>
            {(is_admin && !accepted && !rejected) && <>
                <span title='decline' onClick={onClickReject} className='actions reject clickable'><FaCalendarTimes /></span>

                <span title='accept' onClick={onClickAccept} className='actions accept clickable'><FaCalendarCheck /></span>
            </>}
            
            <p className='reschedule-date'>{MONTHS[oldDate.getMonth()].short} {ordinal_suffix(oldDate.getDate())} <RiArrowRightLine style={{position: "relative", top: "3px"}} /> {newDate?`${MONTHS[newDate.getMonth()].short} ${ordinal_suffix(newDate.getDate())}`:"N/A"}</p>

            <p className='reschedule-time'>{time_range}</p>

            <div className={`reschedule-reason ${showReason?"show":"hide"}`}>
                <p style={{color: "red", marginTop: "10px", padding: "10px", borderTop: "1px solid #ECECEC"}}>Reason</p>
                <p className={`reason ${reason?"":"none"}`}>{reason || "No Reason Provided"}</p>
            </div>

            <span className="reason-toggle clickable" onClick={() => setShowReason((s) => !s)}>{showReason?<RiArrowUpSLine />:<RiArrowDownSLine />}</span>
        </div>
    )
}
 
export default Reschedule;