import { SET_CLASSES, SET_POPULAR_CLASSES } from "../Actions/types";

const INITIAL_STATE = {classes: [], total: 0, popular_classes: []};

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

        default:
            return state;
    }

    return new_state;
}