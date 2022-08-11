import { api } from "../Utils/api";
import { get_class } from "./ClassActions";

const { SET_CLASS, SET_USER_CLASSES, SET_USER_REQUESTS, SET_USER_CLASS, SET_CLASS_REQUESTS, SET_USER_ASSIGNMENTS, SET_CLASS_ATTENDANCE, UPDATE_STUDENT_CLASS_ATTENDANCE, SET_CLASSES_SCHEDULES } = require("./types");

export const set_user_classes = (classes=[], total=0) => {
    return {type: SET_USER_CLASSES, payload: {classes, total: total || classes.length}};
}

export const set_user_class = (_class={}) => {
    return {type: SET_USER_CLASS, payload: {_class}};
}

export const set_user_requests = (requests=[], total=0) => {
    return {type: SET_USER_REQUESTS, payload: {requests, total: total || requests.length}};
}

export const set_class_requests = (requests=[], total=0) => {
    return {type: SET_CLASS_REQUESTS, payload: {requests, total: total || requests.length}};
}

export const set_user_assignments = (assignments=[], total=0) => {
    return {type: SET_USER_ASSIGNMENTS, payload: {assignments, total: total || assignments.length}};
}

export const set_class_attendance = (attendance=[]) => {
    return {type: SET_CLASS_ATTENDANCE, payload: {attendance}};
}

export const set_classes_schedules = (classes_schedules) => {
    return {type: SET_CLASSES_SCHEDULES, payload: {classes_schedules}};
}

export const get_user_class = (class_id) => async (dispatch) => {
    try{
        const data = await get_class(class_id)(dispatch);

        if(data.success){
            const {_class} = data;
            dispatch(set_user_class(_class));

            return data;
        }

        console.error(data);
    }catch(e){
        console.error(e);
    }
}

export const get_my_classes = (limit=20, offset=0, search="") => async (dispatch) => {
    const res = await api("get", `/api/user/classes?limit=${limit}&offset=${offset}&search=${search}`);

    if(res.data){
        if(res.data.success){
            const {classes, total} = res.data;

            dispatch(set_user_classes(classes, total));

            return res.data
        }

        console.log(res.data);
    }else{
        console.log(res);
    }
}

export const get_class_requests = (limit=20, offset=0, sort="{}", _class) => async (dispatch) => {
    try{
        const res = await api("get", `/api/user/requests?limit=${limit}&offset=${offset}&sort=${sort}&filters={"_class": "${_class._id}", "accepted": false, "declined": false}`)
        
        if(res.data){
            if(res.data.success){
                const {requests=[], total=0} = res.data;
                dispatch(set_class_requests(requests, total));
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

export const get_my_requests = (limit=20, offset=0, sort="{}", filters="{}") => async (dispatch) => {
    try{
        const res = await api("get", `/api/user/requests?limit=${limit}&offset=${offset}&sort=${sort}&filters=${filters}`)
        
        if(res.data){
            if(res.data.success){
                const {requests=[], total=0} = res.data;
                dispatch(set_user_requests(requests, total));
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

export const get_user_assignments = (limit=20, offset=0, search="", sort="{}", filters="{}") => async (dispatch) => {
    try{
        const res = await api("get", `/api/assignments/class`, {params: {limit, offset, search, sort, filters}});
        if(res.data){
            if(res.data.success){
                const {assignments=[], total=0} = res.data;

                dispatch(set_user_assignments(assignments, total));

                return res.data;
            }

            console.log(res.data);
        }else{
            console.log(res);
        }
    }catch(e){

    }
}

export const get_class_attendance = (class_id, filters) => async (dispatch) => {
    try{
        const res = await api("get", "/api/classes/attendance", {params: {class_id, filters}});

        if(res.data){
            if(res.data.success){
                const {attendance} = res.data;
                dispatch(set_class_attendance(attendance))
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

export const get_classes_schedules = ({startPeriod, endPeriod}, filters="{}", search="") => async (dispatch) => {
    try{
        const res = await api("get", "/api/classes/schedules", {params: {startPeriod, endPeriod, filters, search}});

        if(res.data){
            if(res.data.success){
                const {classes_schedules=[]} = res.data;
                dispatch(set_classes_schedules(classes_schedules))
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

export const create_student_class_attendance = ({_class, student, remarks="", early=false, present=false}) => async (dispatch) => {
    try{
        const res = await api("post", "/api/classes/attendance", {_class, student, remarks, early, present});

        if(res.data){
            if(res.data.success){
                const {student_attendance} = res.data;
                dispatch({type: UPDATE_STUDENT_CLASS_ATTENDANCE, payload: {student_attendance}});

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

export const update_student_class_attendance = ({_class, student, remarks="", early=false, present=false}) => async (dispatch) => {
    try{
        const res = await api("put", "/api/classes/attendance", {_class, student, remarks, early, present});

        if(res.data){
            if(res.data.success){
                const {student_attendance} = res.data;
                dispatch({type: UPDATE_STUDENT_CLASS_ATTENDANCE, payload: {student_attendance}});

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