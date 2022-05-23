import { SET_CLASSES } from "../Actions/types";

const INITIAL_STATE = {classes: [], total_classes: 0};

export default (state=INITIAL_STATE, action) => {
    const {type, payload} = action;
    
    const new_state = {...state};

    switch(type){

        case SET_CLASSES:
            new_state.classes = payload.classes;
            new_state.total_classes = payload.total;
        break;

        default:
            return state;
    }

    return new_state;
}