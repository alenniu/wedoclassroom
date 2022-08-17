import { NOTIFICATION_TYPE_ASSIGNMENT_PAST_DUE, NOTIFICATION_TYPE_ASSIGNMENT_SUBMISSION, NOTIFICATION_TYPE_CLASS_ANNOUNCEMENT, NOTIFICATION_TYPE_CLASS_END, NOTIFICATION_TYPE_CLASS_RESCHEDULE, NOTIFICATION_TYPE_CLASS_RESCHEDULE_DECLINE, NOTIFICATION_TYPE_CLASS_START, NOTIFICATION_TYPE_INFO, NOTIFICATION_TYPE_NEW_ASSIGNMENT, NOTIFICATION_TYPE_NEW_CLASS_STUDENT, NOTIFICATION_TYPE_REQUEST_CLASS_RESCHEDULE } from 'my-server/notification_types';
import React, { useEffect } from 'react';

import "./Notification.css";

const get_something_based_on_type = (type) => {
    switch(type){
        case NOTIFICATION_TYPE_CLASS_START:
            return

        case NOTIFICATION_TYPE_CLASS_END:
            return

        case NOTIFICATION_TYPE_REQUEST_CLASS_RESCHEDULE:
            return
        
        case NOTIFICATION_TYPE_CLASS_RESCHEDULE:
            return

        case NOTIFICATION_TYPE_CLASS_RESCHEDULE_DECLINE:
            return

        case NOTIFICATION_TYPE_NEW_ASSIGNMENT:
            return

        case NOTIFICATION_TYPE_ASSIGNMENT_SUBMISSION:
            return

        case NOTIFICATION_TYPE_ASSIGNMENT_PAST_DUE:
            return

        case NOTIFICATION_TYPE_CLASS_ANNOUNCEMENT:
            return

        case NOTIFICATION_TYPE_NEW_CLASS_STUDENT:
            return

        case NOTIFICATION_TYPE_INFO:
            return

        default:
            return "fallback"
    }
}

const Notification = ({notification={}, onMount}) => {
    const {_id, type, text, from, metadata={}} = notification;

    useEffect(() => {
        typeof(onMount) && onMount(notification);
    }, []);

    return (
        <div className='notification-container clickable'>
            <p>{type}</p>
            <p>{text}</p>
        </div>
    );
}
 
export default Notification;