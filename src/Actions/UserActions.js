import { api } from "../Utils/api";
import { get_class } from "./ClassActions";
import { Socket } from "socket.io-client";
import { SOCKET_EVENT_NOTIFICATION } from "my-server/socket_events";

const { SET_CLASS, SET_USER_CLASSES, SET_USER_REQUESTS, SET_USER_CLASS, SET_CLASS_REQUESTS, SET_USER_ASSIGNMENTS, SET_CLASS_ATTENDANCE, UPDATE_STUDENT_CLASS_ATTENDANCE, SET_CLASSES_SCHEDULES, NEW_NOTIFICATION, REMOVE_INCOMING_NOTIFICATION, SET_OPEN_NOTIFICATIONS, SET_NOTIFICATIONS, SET_UNREAD_NOTIFICATIONS_COUNT, READ_NOTIFICATIONS, UNREAD_NOTIFICATIONS, HIDE_INCOMING_NOTIFICATION } = require("./types");

export const add_new_notification = (notification) => {
    return {type: NEW_NOTIFICATION, payload: {notification}}
}

export const remove_incoming_notification = (notification) => {
    return {type: REMOVE_INCOMING_NOTIFICATION, payload: {notification}}
}

// export const hide_incoming_notification = (notification) => {
//     return {type: HIDE_INCOMING_NOTIFICATION, payload: {notification}}
// }

export const remove_all_incoming_notification = () => {
    return {type: REMOVE_INCOMING_NOTIFICATION}
}

export const set_open_notifications = (open=true) => {
    return {type: SET_OPEN_NOTIFICATIONS, payload: {open}};
}

export const set_notifications = (notifications=[], total) => {
    return {type: SET_NOTIFICATIONS, payload: {notifications, total: total || notifications.length}}
}

export const set_unread_notifications_count = (count) => {
    return {type: SET_UNREAD_NOTIFICATIONS_COUNT, payload: {count}}
}

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

export const set_classes_schedules = (classes_schedules=[], reschedules=[]) => {
    return {type: SET_CLASSES_SCHEDULES, payload: {classes_schedules, reschedules}};
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
                const {classes_schedules=[], reschedules=[]} = res.data;
                dispatch(set_classes_schedules(classes_schedules, reschedules))
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

export const get_notifications = (limit=20, offset=0, sort='{"createdAt": "desc"}', filters='{}') => async (dispatch) => {
    try{
        const res = await api("get", "/api/notifications", {params: {limit, offset, sort, filters}});

        if(res.data){
            const {success, msg, notifications=[], total} = res.data;

            if(success){
                dispatch(set_notifications(notifications, total));

                return res.data
            }

            console.log(msg);
        }else{
            console.log(res);
        }
    }catch(e){
        console.log(e);
    }
}

export const read_notifications = (notification_ids=[]) => async (dispatch) => {
    try{
        const res = await api("post", "/api/notifications/read", notification_ids);

        if(res.data){
            const {success, msg, count=0} = res.data;

            if(success){
                dispatch({type: READ_NOTIFICATIONS, payload: {count}});

                return res.data
            }

            console.log(msg);
        }else{
            console.log(res);
        }
    }catch(e){
        console.log(e);
    }
}

export const unread_notifications = (notification_ids=[]) => async (dispatch) => {
    try{
        const res = await api("post", "/api/notifications/unread", notification_ids);

        if(res.data){
            const {success, msg, count=0} = res.data;

            if(success){
                dispatch({type: UNREAD_NOTIFICATIONS, payload: {count}});

                return res.data
            }

            console.log(msg);
        }else{
            console.log(res);
        }
    }catch(e){
        console.log(e);
    }
}

export const get_unread_notifications_count = () => async (dispatch) => {
    try{
        const res = await api("get", "/api/notifications/unread_count");

        if(res.data){
            const {success, msg, count} = res.data;

            if(success){
                dispatch(set_unread_notifications_count(count));

                return res.data
            }

            console.log(msg);
        }else{
            console.log(res);
        }
    }catch(e){
        console.log(e);
    }
}

export const add_socket_events = (socket:Socket) => async (dispatch) => {
    if(socket){
        socket.on(SOCKET_EVENT_NOTIFICATION, (notification, additional_data={}) => {
            // console.log(SOCKET_EVENT_NOTIFICATION, notification);
            const {dispatchObj} = additional_data || {};

            dispatch(add_new_notification(notification));
            
            dispatchObj && dispatch(dispatchObj);
        })
    }
} 

export const remove_socket_events = (socket:Socket) => async (dispatch) => {
    if(socket){
        socket.removeAllListeners(SOCKET_EVENT_NOTIFICATION);
    }
} 