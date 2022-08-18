import { api } from "../Utils/api";
import { get_class } from "./ClassActions";
import { SET_CLASS, SET_CONFIG, SET_CURRENT_CLASS, SET_LOADING, SET_NAV_OPEN, SET_OPEN_NOTIFICATIONS, SET_USER, TOGGLE_NAV, TOGGLE_NOTIFICATIONS } from "./types";

export const set_user = (user) => {
    return {type: SET_USER, payload: {user}};
}

export const set_loading = (loading) => {
    return {type: SET_LOADING, payload: {loading}};
}

export const set_class = (_class) => {
    return {type: SET_CLASS, payload: {_class}};
}

export const set_config = (config) => {
    return {type: SET_CONFIG, payload: {config}};
}

export const set_current_class = (_class) => {
    return {
        type: SET_CURRENT_CLASS,
        payload: { _class },
    };
};

export const set_nav_open = (open) => {
    return {type: SET_NAV_OPEN, payload: {open}};
}

export const toggle_nav = () => {
    return {type: TOGGLE_NAV};
}

export const open_nav = () => {
    return set_nav_open(true);
}

export const close_nav = () => {
    return set_nav_open(false);
}

export const set_open_notifications = (open=true) => {
    return {type: SET_OPEN_NOTIFICATIONS, payload: {open}};
}

export const open_notifications = () => {
    return {type: SET_OPEN_NOTIFICATIONS, payload: {open: true}};
}

export const close_notifications = () => {
    return {type: SET_OPEN_NOTIFICATIONS, payload: {open: false}};
}

export const toggle_notifications = () => {
    return {type: TOGGLE_NOTIFICATIONS};
}

export const get_current_class = (class_id) => async (dispatch) => {
    try{
        const data = await get_class(class_id)(dispatch);

        if(data.success){
            const {_class} = data;
            dispatch(set_current_class(_class));

            return data;
        }

        console.error(data);
    }catch(e){
        console.error(e);
    }
}

export const get_config = () => async (dispatch) => {
    try{
        const res = await api("get", "/api/config");
    
        if(res && res.data){
            if(res.data.success){
                const {config} = res.data;
                
                dispatch(set_config(config));
    
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