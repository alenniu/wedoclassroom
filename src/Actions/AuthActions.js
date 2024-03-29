import {EDIT_AUTH_VALUE, LOGIN, REGISTER, LOGOUT, SET_USER} from "./types";
import { api } from "../Utils/api";
import { validate_email, validate_password } from "../Utils";

export const edit_auth_value = (keys=[], value="") => {
    return {type: EDIT_AUTH_VALUE, payload: {keys, value}};
}

export const register = ({name, email, password, phone, type="admin", role="", addresses=[]}) => async (dispatch) => {
    try{
        if(name && name.first && name.last && validate_email(email) && validate_password(password) && type /* && phone */){
            const res = await api("post", "/api/auth/signup", {name, email, password, phone, type, role, addresses}).catch((e) => {
                console.log(e);
                return e;
            });

            if(res.data){
                if(res.data.success){
                    const {type} = res.data.user;

                    dispatch({type: REGISTER, payload: {user: res.data.user, is_admin: type === "admin", is_teacher: type === "teacher", is_student: type === "student", is_sales: type === "sales"}})
                    dispatch({type: SET_USER, payload: {user: res.data.user}});
                    
                    return res.data
                }else{
                    dispatch(edit_auth_value(["error"], res.data.msg));
                }
            }else{
                dispatch(edit_auth_value(["error"], res?.message || res));
            }  
        }else{
            dispatch(edit_auth_value(["error"], "first name, last name, phone*, account type, valid email and valid password must be provided"));
        }
    }catch(e){
        dispatch(edit_auth_value(["error"], e.message));
    }
}

export const login = ({email, password, is_sso}) => async (dispatch) => {
    try{
        if(validate_email(email) && password){
            const res = await api("post", "/api/auth/login", {email, password, is_sso});
    
            if(res.data){
                if(res.data.success){
                    const {type} = res.data.user;

                    dispatch({type: LOGIN, payload: {user: res.data.user, is_admin: type === "admin", is_teacher: type === "teacher", is_student: type === "student", is_sales: type === "sales"}});
                    dispatch({type: SET_USER, payload: {user: res.data.user}});
                    
                    return res.data;
                }

                dispatch(edit_auth_value(["error"], res.data.msg));
            }else{
                dispatch(edit_auth_value(["error"], res?.message || res));
            }
        }else{
            dispatch(edit_auth_value(["error"], "Valid email and password/SSO code must be provided"));
        }
    }catch(e){
        console.error(e);
        dispatch(edit_auth_value(["error"], e.message));
    }
}

export const logout = () => async (dispatch) => {
    try{
        const res = await api("get", "/api/auth/logout").catch((e) => {
            console.log(e);
            return e;
        });
        
        if(res.data){
            if(res.data.success){
                dispatch({type: LOGOUT});

                return res.data;
            }
        }
    }catch(e){
        dispatch(edit_auth_value(["error"], e.message));
    }
}

export const check_login = () => async (dispatch) => {
    try{
        const res = await api("get", "/api/auth/login/check").catch((e) => {
            console.log(e);
            return e;
        });
        
        if(res.data){
            if(res.data.success){
                if(res.data.logged_in){
                    const {type} = res.data.user;

                    dispatch({type: LOGIN, payload: {user: res.data.user, is_admin: type === "admin", is_teacher: type === "teacher", is_student: type === "student", is_sales: type === "sales"}})
                    dispatch({type: SET_USER, payload: {user: res.data.user}});
                }
                return res.data;
            }
        }
    }catch(e){
        dispatch(edit_auth_value(["error"], e.message));
    }
}