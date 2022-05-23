import { LOGOUT, SET_CLASS, SET_LOADING, SET_USER } from "../Actions/types";

const INITIAL_STATE = {user: null, current_class: null, loading: false};

export default (state=INITIAL_STATE, action) => {
    const {type, payload} = action;
    
    const new_state = {...state};

    switch(type){

        case SET_USER:
            new_state.user = payload.user;
        break;

        case SET_LOADING:
            new_state.loading = payload.loading;
        break;

        case SET_CLASS:
            new_state.current_class = payload._class;
        break;

        case LOGOUT:
            new_state.user = null;
        break;

        default:
            return state;
    }

    return new_state;
}