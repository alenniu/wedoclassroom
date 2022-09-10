import { ADD_NEW_CLASS_ANNOUNCEMENT, ADD_NEW_CLASS_ASSIGNMENT, CREATE_CLASS_ANNOUNCEMENT, CREATE_CLASS_ASSIGNMENT, LOGOUT, SET_CLASS, SET_CLASS_ANNOUNCEMENTS, SET_CLASS_ASSIGNMENTS, SET_CONFIG, SET_CURRENT_CLASS, SET_LOADING, SET_NAV_OPEN, SET_OPEN_NOTIFICATIONS, SET_USER, TOGGLE_NAV, TOGGLE_NOTIFICATIONS, UPDATE_CLASS_ANNOUNCEMENT, UPDATE_CLASS_ASSIGNMENT } from "../Actions/types";

const INITIAL_STATE = {user: null, current_class: {}, class_assignments: [], total_class_assignments: 0, class_announcements: [], total_class_announcements: 0, loading: false, nav_open: false, open_notifications: false, config: null};

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

        case SET_CONFIG:
            new_state.config = payload.config;
        break;

        case SET_NAV_OPEN:
            new_state.nav_open = payload.open;
        break;

        case TOGGLE_NAV:
            new_state.nav_open = !new_state.nav_open;
        break;

        case SET_OPEN_NOTIFICATIONS:
            new_state.open_notifications = payload.open;
        break;

        case TOGGLE_NOTIFICATIONS:
            new_state.open_notifications = !new_state.open_notifications;
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

        case ADD_NEW_CLASS_ASSIGNMENT:{
            const {assignment} = payload;
            if(new_state.current_class._id === assignment._class){
                new_state.class_assignments = [assignment, ...new_state.class_assignments];
            }   
        }
        break;

        case UPDATE_CLASS_ASSIGNMENT:{
            const {assignment} = payload;
            if(new_state.current_class._id === assignment._class){
                new_state.class_assignments = new_state.class_assignments.map((a) => (a._id === assignment._id)?assignment:a);
            }
        }
        break;

        case CREATE_CLASS_ANNOUNCEMENT:
            new_state.class_announcements = [payload.announcement, ...new_state.class_announcements];
        break;
            
        case CREATE_CLASS_ASSIGNMENT:       
            new_state.class_assignments = [payload.assignment, ...new_state.class_assignments];
        break;

        case ADD_NEW_CLASS_ANNOUNCEMENT:{
            const {announcement} = payload;
            if(new_state.current_class._id === announcement._class){
                new_state.class_announcements = [announcement, ...new_state.class_announcements];
            }   
        }
        break;

        case UPDATE_CLASS_ANNOUNCEMENT:{
            const {announcement} = payload;
            if(new_state.current_class._id === announcement._class){
                new_state.class_announcements = new_state.class_announcements.map((a) => (a._id === announcement._id)?announcement:a);
            }
        }
        break;

        case LOGOUT:
            new_state.user = null;
        break;

        default:
            return state;
    }

    return new_state;
}