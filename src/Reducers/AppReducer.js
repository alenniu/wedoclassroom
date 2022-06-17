import { CREATE_CLASS_ANNOUNCEMENT, CREATE_CLASS_ASSIGNMENT, LOGOUT, SET_CLASS, SET_CLASS_ANNOUNCEMENTS, SET_CLASS_ASSIGNMENTS, SET_CURRENT_CLASS, SET_LOADING, SET_USER } from "../Actions/types";

const INITIAL_STATE = {user: null, current_class: {}, class_assignments: [], total_class_assignments: 0, class_announcements: [], total_class_announcements: 0, loading: false};

export default (state=INITIAL_STATE, action) => {
    const {type, payload} = action;
    
    const new_state = {...state};

    switch(type){

        case SET_USER:
            new_state.user = payload.user;
        break;

        case SET_CURRENT_CLASS:
            new_state.current_class = payload._class;
        break;

        case SET_LOADING:
            new_state.loading = payload.loading;
        break;

        case SET_CLASS:
            new_state.current_class = payload._class;
        break;

        case SET_CLASS_ANNOUNCEMENTS:
            new_state.class_announcements = payload.announcements;
            new_state.total_class_announcements = payload.total;
        break;

        case SET_CLASS_ASSIGNMENTS:
            new_state.class_assignments = payload.assignments;
            new_state.total_class_assignments = payload.total;
        break;

        case CREATE_CLASS_ANNOUNCEMENT:
            new_state.class_announcements = [payload.announcement, ...new_state.class_announcements];
        break;
            
        case CREATE_CLASS_ASSIGNMENT:       
            new_state.class_assignments = [payload.assignment, ...new_state.class_assignments];
        break;

        case LOGOUT:
            new_state.user = null;
        break;

        default:
            return state;
    }

    return new_state;
}