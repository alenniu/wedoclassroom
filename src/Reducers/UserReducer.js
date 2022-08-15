import { SET_USER_REQUESTS, SET_USER_CLASSES, CREATE_CLASS, REQUEST_JOIN_CLASS, ACCEPT_JOIN_REQUEST, SET_USER_CLASS, SET_CLASS_REQUESTS, SET_USER_ASSIGNMENTS, SET_CLASS_ATTENDANCE, UPDATE_STUDENT_CLASS_ATTENDANCE, DECLINE_JOIN_REQUEST, SET_CLASSES_SCHEDULES } from "../Actions/types";

const INITIAL_STATE = {classes: [], total_classes: 0, current_class: {}, current_class_requests: [], total_class_requests: 0, requests: [], total_requests: 0, assignments: [], total_assignments: 0, class_attendance: [], classes_schedules: [], reschedules: []};

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

        case SET_CLASSES_SCHEDULES:
            new_state.classes_schedules = payload.classes_schedules;
            new_state.reschedules = payload.reschedules;
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
            new_state.classes.push(payload._class);
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