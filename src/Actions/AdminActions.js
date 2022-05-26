import { validate_email, validate_password } from "../Utils";
import { api } from "../Utils/api";
import { SET_ACCOUNTS, SET_ADMINS, SET_STUDENTS, SET_TEACHERS, SET_CREATE_ACCOUNT_ERROR, EDIT_NEW_ACCOUNT, CREATE_ACCOUNT } from "./types";

export const set_admins = (admins=[], total=0) => {
    return {type: SET_ADMINS, payload: {admins, total: total || admins.length}};
}

export const set_teachers = (teachers=[], total=0) => {
    return {type: SET_TEACHERS, payload: {teachers, total: total || teachers.length}};
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

export const edit_new_account = (keys=[], value) => {
    return {type: EDIT_NEW_ACCOUNT, payload:{keys, value}};
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

export const create_account = ({name, email, phone, type, password}) => async (dispatch) => {
    try{
        if(name && name.first && name.last && validate_email(email) && validate_password(password) && type){
            const res = await api("post", "/api/admin/accounts", {name, email, phone, type, password});

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
                dispatch(set_create_account_error(res));
            }
        }else{
            throw new Error("name (first and last), valid email, valid password and account type must be provided");
        }
    }catch(e){
        console.error(e);
        dispatch(set_create_account_error(e.message));
    }
}