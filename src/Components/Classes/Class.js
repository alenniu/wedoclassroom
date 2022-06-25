import React from 'react';
import { get_full_image_url } from '../../Utils';

import { connect } from "react-redux";
import "./Class.css";
import { request_join_class } from "../../Actions";

const Class = ({ _class, onPressJoin, can_join=true, request_join_class }) => {
    const {
        _id,
        price=0,
        title,
        students = [],
        subject,
        schedule = {},
        max_students = 1,
        tags = [],
        cover_image = "/Assets/Images/support-badge.svg",
    } = _class;

    const onJoin = () => {
        typeof(onPressJoin) === "function" && onPressJoin(_class);
    }

    const { daily_start_time = 7, daily_end_time = 9 } = schedule;

    return (
        <div className='classes-class-container'>
            <div className='class-image-container'>
                <img src={get_full_image_url(cover_image)} />
            </div>

            <div className="subject-tags-container">
                <p className="class-subject">{title || subject}</p>
                <p className="class-subject">{price?price.toLocaleString(undefined, {style: "currency", currency: "USD"}):"Free"}</p>

                <div className="tags">
                    {tags.map((t) => (
                        <span key={t} className="class-tag">
                            #{t}
                        </span>
                    ))}
                </div>
            </div>

            <div className="schedule-join-container">
                <p className="class-schedule">
                    {daily_start_time} - {daily_end_time}PM
                </p>

                <button disabled={!can_join} className="button primary join" onClick={onJoin}>
                    JOIN
                </button>
            </div>
        </div>
    );
};

export default Class;
