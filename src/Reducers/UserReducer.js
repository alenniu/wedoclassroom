import { SET_USER_REQUESTS, SET_USER_CLASSES, CREATE_CLASS, REQUEST_JOIN_CLASS, ACCEPT_JOIN_REQUEST, SET_USER_CLASS } from "../Actions/types";

const INITIAL_STATE = {classes: [], total_classes: 0, current_class: {}, requests: [], total_requests: 0};

export default (state=INITIAL_STATE, action) => {
    const {type, payload} = action;
    
    const new_state = {...state};

    switch(type){

        case SET_USER_CLASSES:
            new_state.classes = payload.classes;
            new_state.total_classes = payload.total;
        break;

        case SET_USER_CLASS:
            new_state.current_class = payload._class;
        break;

        case SET_USER_REQUESTS:
            new_state.requests = payload.requests;
            new_state.total_requests = payload.total;
        break

        case CREATE_CLASS:
            new_state.classes.push(payload._class);
        break;

        case REQUEST_JOIN_CLASS:
            new_state.requests.push(payload.request);
            new_state.total_requests += 1
        break

        case ACCEPT_JOIN_REQUEST:
            const index = new_state.classes.findIndex(x => x._id === payload.class._id)
            new_state.classes[index] = payload.class
        break

        default:
            return state;
    }

    return new_state;
}