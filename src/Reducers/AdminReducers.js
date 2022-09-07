import { ADMIN_SEARCH, CANCEL_ACCOUNT_EDIT, CREATE_ACCOUNT, EDIT_ACCOUNT, EDIT_CONFIG_VALUE, EDIT_EXISTING_ACCOUNT, EDIT_INIT_CONFIG, EDIT_NEW_ACCOUNT, INIT_EDIT_ACCOUNT, SET_ACCOUNTS, SET_ADMINS, SET_CREATE_ACCOUNT_ERROR, SET_EDIT_ACCOUNT_ERROR, SET_SESSIONS, SET_STUDENTS, SET_TEACHERS, UPDATE_CONFIG } from "../Actions/types";
import { update_object } from "../Utils";

const NEW_ACCOUNT_PROPS = {name: {first: "", last: ""}, email: "", phone: "", type: ""}

const INITIAL_STATE = {accounts: [], total_accounts: 0, search: {students: [], teachers: [], classes: []}, sessions: [], total_sessions: 0, teachers: [], total_teachers: 0, students: [], total_students: 0, admins: [], total_admins: 0, edit_account: {error: ""}, editing_account: false, new_account: {error: ""}, edit_config: {error: ""}};

export default (state=INITIAL_STATE, action) => {
    const {type, payload} = action;
    
    const new_state = {...state};

    switch(type){

        case SET_ADMINS:
            new_state.admins = payload.admins;
            new_state.total_admins = payload.total;
        break;

        case SET_TEACHERS:
            new_state.teachers = payload.teachers;
            new_state.total_teachers = payload.total;
        break;

        case SET_SESSIONS:
            new_state.sessions = payload.sessions;
            new_state.total_sessions = payload.total;
        break;

        case SET_STUDENTS:
            new_state.students = payload.students;
            new_state.total_students = payload.total;
        break;

        case SET_ACCOUNTS:
            new_state.accounts = payload.accounts;
            new_state.total_accounts = payload.total;
        break;

        case ADMIN_SEARCH:{
            const {students=[], teachers=[], classes=[]} = payload;

            new_state.search = {students, teachers, classes}
        }
        break;

        case EDIT_NEW_ACCOUNT:{
            const {keys=[], value} = payload;
            new_state.new_account = {...new_state.new_account, error: ""};
            update_object(keys, value, new_state.new_account);
        }
        break;

        case EDIT_CONFIG_VALUE:{
            const {keys=[], value} = payload;
            new_state.edit_config = {...new_state.edit_config, error: ""}
            update_object(keys, value, new_state.edit_config);
        }
        break;

        case EDIT_INIT_CONFIG:
            new_state.edit_config = payload.config;
        break;

        case UPDATE_CONFIG:
            new_state.edit_config = payload.config;
        break;

        case EDIT_EXISTING_ACCOUNT:{
            const {keys=[], value} = payload;
            new_state.edit_account = {...new_state.edit_account, error: ""};
            update_object(keys, value,new_state.edit_account);
        }
        break;

        case INIT_EDIT_ACCOUNT:
            new_state.edit_account = {...payload.account, name: {...payload.account.name}, error: ""};
            new_state.editing_account = true;
        break;

        case CREATE_ACCOUNT:
            new_state.new_account = {error: ""};
        break;

        case EDIT_ACCOUNT:
            new_state.edit_account = payload.account;
            // new_state.editing_account = false;
        break;

        case CANCEL_ACCOUNT_EDIT:
            new_state.edit_account = {error: ""};
            new_state.editing_account = false;
        break;

        case SET_CREATE_ACCOUNT_ERROR:
            new_state.new_account.error = payload.error;
        break;

        case SET_EDIT_ACCOUNT_ERROR:
            new_state.edit_account.error = payload.error;
        break;

        default:
            return state;
    }

    return new_state;
}