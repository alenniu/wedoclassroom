import React from "react";

import { connect } from "react-redux";
import "./Class.css";
import { request_join_class } from "../../Actions";

const Class = ({ _class, request_join_class }) => {
    const {
        _id,
        students = [],
        subject,
        schedule = {},
        max_students = 1,
        tags = [],
        cover_image = "/Assets/Images/support-badge.svg",
    } = _class;

    const onPressClass = async () => {
        console.log(_class);
        await request_join_class(_class);
    };

    const { daily_start_time = 7, daily_end_time = 9 } = schedule;

    return (
        <div className="classes-class-container">
            <div className="class-image-container">
                <img src={cover_image} />
            </div>

            <div className="subject-tags-container">
                <p className="class-subject">{subject}</p>

                <div className="tags">
                    {[...tags, ...tags].map((t) => (
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

                <button className="button primary join" onClick={onPressClass}>
                    JOIN
                </button>
            </div>
        </div>
    );
};

function map_state_to_props({ User }) {
    return { classes: User.classes, total: User.total_classes };
}

// export default Class;
export default connect(map_state_to_props, { request_join_class })(Class);
