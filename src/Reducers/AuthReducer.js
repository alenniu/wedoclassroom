import { CHECK_LOGIN, LOGIN, LOGOUT, REGISTER, REQUEST_SSO, EDIT_AUTH_VALUE } from "../Actions/types";
import { update_object } from "../Utils";

const INITIAL_STATE = {logged_in: false, is_admin: false, email: "", name: {first: "", last: ""}, phone: "", type: "customer", role: "", has_password: false, is_sso: false, error: "", bbr_data: {}, email_changed: false};

export default (state=INITIAL_STATE, action) => {
    const {type, payload} = action;
    
    const new_state = {...state};

    switch(type){
        case EDIT_AUTH_VALUE:{
            const {keys=[], value=""} = payload;
            new_state.error = "";
            // console.log(keys, value);
            update_object(keys, value, new_state);
        }
        break;

        case REQUEST_SSO:
            new_state.is_sso = true;
        break;

        case LOGIN:{
            const {is_admin} = payload;
            new_state.logged_in = true;
            new_state.is_admin = is_admin;
        }
        break;

        case CHECK_LOGIN:{
            const {logged_in, is_admin} = payload;
            new_state.logged_in = logged_in;
            new_state.is_admin = is_admin;
        }
        break;
        
        case REGISTER:{
            const {is_admin} = payload;
            new_state.logged_in = true;
            new_state.is_admin = is_admin;
        }
        break;

        case LOGOUT:
            return INITIAL_STATE;
        break;

        default:
            return state;
    }

    return new_state;
}