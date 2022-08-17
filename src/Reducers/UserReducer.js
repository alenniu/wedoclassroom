import { SET_USER_REQUESTS, SET_USER_CLASSES, CREATE_CLASS, REQUEST_JOIN_CLASS, ACCEPT_JOIN_REQUEST, SET_USER_CLASS, SET_CLASS_REQUESTS, SET_USER_ASSIGNMENTS, SET_CLASS_ATTENDANCE, UPDATE_STUDENT_CLASS_ATTENDANCE, DECLINE_JOIN_REQUEST, SET_CLASSES_SCHEDULES, SET_NOTIFICATIONS, SET_UNREAD_NOTIFICATIONS_COUNT, NEW_NOTIFICATION, REMOVE_INCOMING_NOTIFICATION, REMOVE_ALL_INCOMING_NOTIFICATION, READ_NOTIFICATIONS, UNREAD_NOTIFICATIONS, HIDE_INCOMING_NOTIFICATION, UPDATE_CLASS, ADD_NEW_CLASS_RESCHEDULE, UPDATE_CLASS_RESCHEDULE, ADD_NEW_CLASS_ASSIGNMENT, UPDATE_CLASS_ASSIGNMENT } from "../Actions/types";

const INITIAL_STATE = {classes: [], total_classes: 0, current_class: {}, current_class_requests: [], total_class_requests: 0, requests: [], total_requests: 0, assignments: [], total_assignments: 0, class_attendance: [], classes_schedules: [], reschedules: [], notifications: [], incoming_notifications: [], total_notifications: 0, unread_notifications_count: 0};

export default (state=INITIAL_STATE, action) => {
    const {type, payload} = action;
    
    const new_state = {...state};

    switch(type){

        case SET_USER_CLASSES:
            new_state.classes = payload.classes;
            new_state.total_classes = payload.total;
        break;

        case SET_USER_REQUESTS:
            new_state.requests = payload.requests;
            new_state.total_requests = payload.total;
        break

        case SET_CLASS_REQUESTS:
            new_state.current_class_requests = payload.requests;
            new_state.total_class_requests = payload.total;
        break

        case SET_USER_ASSIGNMENTS:
            new_state.assignments = payload.assignments;
            new_state.total_assignments = payload.total;
        break;

        case ADD_NEW_CLASS_ASSIGNMENT:
            new_state.assignments = [payload.assignment, ...new_state.assignments];
        break;

        case UPDATE_CLASS_ASSIGNMENT:{
            const {assignment} = payload;
            new_state.assignments = new_state.assignments.map((a) => (a._id === assignment._id)?assignment:a);
        }
        break;

        case SET_CLASSES_SCHEDULES:
            new_state.classes_schedules = payload.classes_schedules;
            new_state.reschedules = payload.reschedules;
        break;

        case SET_NOTIFICATIONS:
            new_state.notifications = payload.notifications;
            new_state.total_notifications = payload.total;
        break;

        case NEW_NOTIFICATION:
            new_state.incoming_notifications = [...new_state.incoming_notifications, payload.notification];
            new_state.notifications = [payload.notification, ...new_state.notifications];
            new_state.unread_notifications_count += 1;
        break;

        case REMOVE_INCOMING_NOTIFICATION:
            new_state.incoming_notifications = new_state.incoming_notifications.filter((n) => n._id !== payload.notification._id);
        break;

        case ADD_NEW_CLASS_RESCHEDULE:
            new_state.reschedules = [...new_state.reschedules, payload.reschedule];
        break;

        case UPDATE_CLASS_RESCHEDULE:{
            const {reschedule} = payload;
            new_state.reschedules = new_state.reschedules.map((r) => (r._id === reschedule._id)?reschedule:r);
        }
        break;

        // case HIDE_INCOMING_NOTIFICATION:
        //     new_state.incoming_notifications = new_state.incoming_notifications.map((n) => n._id === payload.notification._id?({...n, hide: true}):n);
        // break;

        case REMOVE_ALL_INCOMING_NOTIFICATION:
            new_state.incoming_notifications = [];
        break;

        case READ_NOTIFICATIONS:
            new_state.unread_notifications_count -= payload.count;
        break;

        case UNREAD_NOTIFICATIONS:
            new_state.unread_notifications_count += payload.count;
        break;

        case SET_UNREAD_NOTIFICATIONS_COUNT:
            new_state.unread_notifications_count = payload.count;
        break;

        case UPDATE_STUDENT_CLASS_ATTENDANCE:{
            const {student_attendance} = payload;
            const updated_index = new_state.class_attendance.findIndex((a) => a._id === student_attendance._id);

            if(updated_index !== -1){
                new_state.class_attendance[updated_index] = student_attendance;
            }else{
                new_state.class_attendance.push(student_attendance);
            }

            new_state.class_attendance = [...new_state.class_attendance];
        }
        break;

        case CREATE_CLASS:
            new_state.classes = [...new_state.classes, payload._class];
        break;

        case UPDATE_CLASS:
            new_state.classes = new_state.classes.map((c) => (c._id === payload._class._id)?payload._class:c)
        break;

        case REQUEST_JOIN_CLASS:
            new_state.requests.push(payload.request);
            new_state.total_requests += 1
        break

        case ACCEPT_JOIN_REQUEST:
            new_state.classes = new_state.classes.map(x => (x._id === payload._class._id)?payload._class:x);

            new_state.requests = new_state.requests.filter(r => r._id !== payload.request._id);
            
            new_state.current_class_requests = new_state.current_class_requests.filter(r => r._id !== payload.request._id);
        break;
            
        case DECLINE_JOIN_REQUEST:
            new_state.requests = new_state.requests.filter(r => r._id !== payload.request._id);

            new_state.current_class_requests = new_state.current_class_requests.filter(r => r._id !== payload.request._id);
        break;

        default:
            return state;
    }

    return new_state;
}