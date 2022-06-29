import { ADD_SUBJECT_CLASSES, CREATE_CLASS, CREATE_CLASS_ANNOUNCEMENT, CREATE_CLASS_ASSIGNMENT, EDIT_CLASS_ANNOUNCEMENT, EDIT_CLASS_ASSIGNMENT, EDIT_CLASS_VALUE, SET_CLASSES, SET_CLASS_ANNOUNCEMENT_ERROR, SET_CLASS_ASSIGNMENT_ERROR, SET_CREATE_CLASS_ERROR, SET_EDITING_CLASS, SET_POPULAR_CLASSES, SET_SUBJECT_CLASSES } from "../Actions/types";
import { update_object } from "../Utils";

const INITIAL_STATE = {classes: [], total: 0, popular_classes: [], create: {schedules: [{days: [], daily_start_time: new Date(), daily_end_time: new Date()}], error: ""}, edit: {error: ""}, announcement: {error: ""}, assignment: {error: ""}, subject_classes: {}};

export default (state=INITIAL_STATE, action) => {
    const {type, payload} = action;
    
    const new_state = {...state};

    switch(type){

        case SET_CLASSES:
            new_state.classes = payload.classes;
            new_state.total = payload.total;
        break;

        case SET_SUBJECT_CLASSES:
            new_state.subject_classes[payload.subject] = {classes: payload.classes, total: payload.total};
            new_state.subject_classes = {...new_state.subject_classes};
        break;
            
        case ADD_SUBJECT_CLASSES:
            new_state.subject_classes[payload.subject].classes = [...new_state.subject_classes[payload.subject].classes, ...payload.classes];    
        break;

        case SET_POPULAR_CLASSES:
            new_state.popular_classes = payload.classes;
        break;

        case ADD_SUBJECT_CLASSES:
            new_state.popular_classes = [...new_state.popular_classes, ...payload.classes]
        break;

        case EDIT_CLASS_VALUE:{
            const {keys=[], value} = payload;

            if(keys.length > 1){
                new_state[keys[0]] = {...new_state[keys[0]]};
                update_object(keys, value, new_state);
            }
        }
        break;

        case SET_EDITING_CLASS:
            new_state.edit = payload._class;
        break;

        case EDIT_CLASS_ANNOUNCEMENT:{
            const {keys=[], value} = payload;
            
            new_state.announcement = {...new_state.announcement};
            new_state.announcement.error = "";

            update_object(keys, value, new_state.announcement);
        }
        break;
        
        case EDIT_CLASS_ASSIGNMENT:{
            const {keys=[], value} = payload;
            
            new_state.assignment = {...new_state.assignment};
            new_state.assignment.error = "";

            update_object(keys, value, new_state.assignment);
        }
        break;

        case SET_CLASS_ANNOUNCEMENT_ERROR:
            new_state.announcement.error = payload.error;
        break;

        case SET_CLASS_ASSIGNMENT_ERROR:
            new_state.assignment.error = payload.error;
        break;

        case CREATE_CLASS:
            new_state.create = {schedules: [{days: [], daily_start_time: new Date(), daily_end_time: new Date()}], error: ""};
        break;

        case SET_CREATE_CLASS_ERROR:
            new_state.create.error = payload.error;
        break;

        case CREATE_CLASS_ANNOUNCEMENT:
            new_state.announcement = {error: ""}
        break;
            
        case CREATE_CLASS_ASSIGNMENT:        
            new_state.assignment = {error: ""}
        break;

        default:
            return state;
    }

    return new_state;
}