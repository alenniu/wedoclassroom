import { validate_email, validate_password } from "../Utils";
import { api } from "../Utils/api";
import { set_config } from "./AppActions";
import { SET_ACCOUNTS, SET_ADMINS, SET_STUDENTS, SET_TEACHERS, SET_CREATE_ACCOUNT_ERROR, EDIT_NEW_ACCOUNT, CREATE_ACCOUNT, INIT_EDIT_ACCOUNT, CANCEL_ACCOUNT_EDIT, EDIT_ACCOUNT, SET_SESSIONS, EDIT_EXISTING_ACCOUNT, EDIT_CONFIG_VALUE, EDIT_INIT_CONFIG, UPDATE_CONFIG, SET_EDIT_ACCOUNT_ERROR } from "./types";

export const set_admins = (admins=[], total=0) => {
    return {type: SET_ADMINS, payload: {admins, total: total || admins.length}};
}

export const set_teachers = (teachers=[], total=0) => {
    return {type: SET_TEACHERS, payload: {teachers, total: total || teachers.length}};
}

export const set_sessions = (sessions=[], total=0) => {
    return {type: SET_SESSIONS, payload: {sessions, total: total || sessions.length}};
}

export const set_students = (students=[], total=0) => {
    return {type: SET_STUDENTS, payload: {students, total: total || students.length}};
}

export const set_accounts = (accounts=[], total=0) => {
    return {type: SET_ACCOUNTS, payload: {accounts, total: total || accounts.length}};
}

export const set_create_account_error = (error) => {
    return {type: SET_CREATE_ACCOUNT_ERROR, payload: {error}};
}

export const set_edit_account_error = (error) => {
    return {type: SET_EDIT_ACCOUNT_ERROR, payload: {error}};
}

export const init_edit_account = (account) => {
    return {type: INIT_EDIT_ACCOUNT, payload:{account}};
}

export const cancel_account_edit = () => {
    return {type: CANCEL_ACCOUNT_EDIT};
}

export const edit_new_account = (keys=[], value) => {
    return {type: EDIT_NEW_ACCOUNT, payload:{keys, value}};
}

export const edit_existing_account = (keys=[], value) => {
    return {type: EDIT_EXISTING_ACCOUNT, payload:{keys, value}};
}

export const edit_init_config = (config) => {
    return {type: EDIT_INIT_CONFIG, payload: {config}};
}

export const edit_config_value = (keys=[], value) => {
    return {type: EDIT_CONFIG_VALUE, payload: {keys, value}};
}

export const get_admins = (limit=20, offset=0, search="", sort="{}", filters="{}") => async (dispatch) => {
    try{
        const res = await api("get", `/api/admin/admins?limit=${limit}&offset=${offset}&search=${search}&sort=${sort}&filters=${filters}`);

        if(res.data){
            if(res.data.success){
                const {admins=[], total=0} = res.data;

                dispatch(set_admins(admins, total));

                return res.data;
            }
            
            console.log(res.data);
        }else{
            console.log(res);
        }
    }catch(e){
        console.error(e);
    }
}

export const get_teachers = (limit=20, offset=0, search="", sort="{}", filters="{}") => async (dispatch) => {
    try{
        const res = await api("get", `/api/admin/teachers?limit=${limit}&offset=${offset}&search=${search}&sort=${sort}&filters=${filters}`);

        if(res.data){
            if(res.data.success){
                const {teachers=[], total=0} = res.data;

                dispatch(set_teachers(teachers, total));

                return res.data;
            }
            
            console.log(res.data);
        }else{
            console.log(res);
        }
    }catch(e){
        console.error(e);
    }
}

export const get_students = (limit=20, offset=0, search="", sort="{}", filters="{}") => async (dispatch) => {
    try{
        const res = await api("get", `/api/admin/students?limit=${limit}&offset=${offset}&search=${search}&sort=${sort}&filters=${filters}`);

        if(res.data){
            if(res.data.success){
                const {students=[], total=0} = res.data;

                dispatch(set_students(students, total));

                return res.data;
            }
            
            console.log(res.data);
        }else{
            console.log(res);
        }
    }catch(e){
        console.error(e);
    }
}

export const get_accounts = (limit=20, offset=0, search="", sort="{}", filters="{}") => async (dispatch) => {
    try{
        const res = await api("get", `/api/admin/accounts?limit=${limit}&offset=${offset}&search=${search}&sort=${sort}&filters=${filters}`);

        if(res.data){
            if(res.data.success){
                const {accounts=[], total=0} = res.data;

                dispatch(set_accounts(accounts, total));

                return res.data;
            }
            
            console.log(res.data);
        }else{
            console.log(res);
        }
    }catch(e){
        console.error(e);
    }
}

export const get_account = (account_id, action_to_dispatch) => async (dispatch) => {
    try{
        const res = await api("get", `/api/admin/accounts/${account_id}`);

        if(res.data){
            if(res.data.success){
                action_to_dispatch && dispatch({type: action_to_dispatch, payload: {account: res.data.account}})
                return res.data;
            }

            console.log(res.data);
        }else{
            console.log(res);
        }
    }catch(e){
        console.log(e);
    }
}

export const create_account = ({name, photo_url, email, phone, gender, school, grade, date_enrolled, type, password, emergency_contact={name: "", email: "", phone: "", relation: ""}, credits=0}) => async (dispatch) => {
    try{
        if(name && name.first && name.last && validate_email(email) && validate_password(password) && type){
            const res = await api("post", "/api/admin/accounts", {name, photo_url, email, phone, gender, school, grade, date_enrolled, type, password, emergency_contact, credits});

            if(res.data){
                if(res.data.success){
                    const {new_user} = res.data;

                    dispatch({type: CREATE_ACCOUNT, payload: {account: new_user}});
                    return res.data;
                }

                console.log(res.data);
                dispatch(set_create_account_error(res.data.msg));
            }else{
                console.log(res);
                dispatch(set_create_account_error(res?.message || res));
            }
        }else{
            throw new Error("name (first and last), valid email, valid password and account type must be provided");
        }
    }catch(e){
        console.error(e);
        dispatch(set_create_account_error(e.message));
    }
}

export const update_account = (account) => async (dispatch) => {
    try{
        if(account.name && account.name.first && account.name.last && validate_email(account.email) && (!account.password || validate_password(account.password)) && account.type){
            const res = await api("put", "/api/admin/accounts", {account});

            if(res.data){
                if(res.data.success){
                    const {updated_user} = res.data;

                    dispatch({type: EDIT_ACCOUNT, payload: {account: updated_user}});
                    return res.data;
                }

                console.log(res.data);
                dispatch(set_edit_account_error(res.data.msg));
            }else{
                console.log(res);
                dispatch(set_edit_account_error(res?.message || res));
            }
        }else{
            throw new Error("name (first and last), valid email, valid password and account type must be provided");
        }
    }catch(e){
        console.error(e);
        dispatch(set_edit_account_error(e.message));
    }
}

export const update_config = (formData) => async (dispatch) => {
    try{
        const res = await api("put", "/api/config", formData);
    
        if(res && res.data){
            if(res.data.success){
                const {config} = res.data;
                
                console.log(config);
                dispatch(set_config(config));
                dispatch({type: UPDATE_CONFIG, payload: {config}});
    
                return res.data;
            }

            dispatch(edit_config_value(["error"], res.data.msg));
            
            console.error(res.data);
        }else{
            dispatch(edit_config_value(["error"], res?.message || res));
            console.error(res);
        }
    }catch(e){
        console.error(e);
        dispatch(edit_config_value(["error"], e.message));
    }
}

export const get_sessions = (limit=20, offset, sort="{}", filters="{}") => async (dispatch) => {
    try{
        const res = await api("get", "/api/sessions", {params: {limit, offset, sort, filters}});
    
        if(res && res.data){
            if(res.data.success){
                const {sessions, total} = res.data;
                
                dispatch(set_sessions(sessions, total));
    
                return res.data;
            }
    
            console.error(res.data);
        }else{
            console.error(res);
        }
    }catch(e){
        console.error(e);
    }
}

export const accept_class_reschedule = (reschedule_id, {new_date, new_start_time, new_end_time}) => async (dispatch) => {
    try{
        const res = await api("post", `/api/reschedules/accept/${reschedule_id}`, {new_date, new_start_time, new_end_time});
        
        if(res.data){
            const {success, msg, reshedule} = res.data
            if(success){
                // dispatch({type: , payload: {reshedule}})
                return res.data;
            }
            console.log(msg);
        }else{
            console.log(res);
        }
    }catch(e){
        console.log(e);
    }
}

export const reject_class_reschedule = (reschedule_id) => async (dispatch) => {
    try{
        const res = await api("post", `/api/reschedules/reject/${reschedule_id}`, {});
        
        if(res.data){
            const {success, msg, reshedule} = res.data
            if(success){
                // dispatch({type: , payload: {reshedule}})
                return res.data;
            }
            console.log(msg);
        }else{
            console.log(res);
        }
    }catch(e){
        console.log(e);
    }
}