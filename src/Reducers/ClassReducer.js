import { CREATE_CLASS, EDIT_CLASS_VALUE, SET_CLASSES, SET_CREATE_CLASS_ERROR, SET_EDITING_CLASS, SET_POPULAR_CLASSES } from "../Actions/types";
import { update_object } from "../Utils";

const INITIAL_STATE = {classes: [], total: 0, popular_classes: [], create: {schedules: [{days: [], daily_start_time: new Date(), daily_end_time: new Date()}], error: ""}, edit: {error: ""}};

export default (state=INITIAL_STATE, action) => {
    const {type, payload} = action;
    
    const new_state = {...state};

    switch(type){

        case SET_CLASSES:
            new_state.classes = payload.classes;
            new_state.total = payload.total;
        break;

        case SET_POPULAR_CLASSES:
            new_state.popular_classes = payload.classes;
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

        case CREATE_CLASS:
            new_state.create = {schedules: [{days: [], daily_start_time: new Date(), daily_end_time: new Date()}], error: ""};
        break;

        case SET_CREATE_CLASS_ERROR:
            new_state.create.error = payload.error;
        break;

        default:
            return state;
    }

    return new_state;
}