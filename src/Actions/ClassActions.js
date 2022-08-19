import axios from "axios";
import { api } from "../Utils/api";
import { set_class } from "./AppActions";
import { CREATE_CLASS, EDIT_NEW_CLASS_VALUE, SET_CLASSES, SET_CREATE_CLASS_ERROR, SET_POPULAR_CLASSES, REQUEST_JOIN_CLASS, ACCEPT_JOIN_REQUEST, SET_CLASS, SET_CURRENT_CLASS, SET_CLASS_ANNOUNCEMENTS, SET_CLASS_ASSIGNMENTS, CREATE_CLASS_ANNOUNCEMENT, CREATE_CLASS_ASSIGNMENT, EDIT_CLASS_ANNOUNCEMENT, EDIT_CLASS_ASSIGNMENT, SET_CLASS_ANNOUNCEMENT_ERROR, SET_CLASS_ASSIGNMENT_ERROR, SET_SUBJECT_CLASSES, DECLINE_JOIN_REQUEST, EDIT_CLASS_VALUE, UPDATE_CLASS, SET_UPDATE_CLASS_ERROR, GET_CLASS_RESCHEDULES } from "./types";

export const set_classes = (classes = [], total = 0) => {
    return {
        type: SET_CLASSES,
        payload: { classes, total: total || classes.length },
    };
};

export const set_subject_classes = (classes = [], total = 0, subject) => {
    return {
        type: SET_SUBJECT_CLASSES,
        payload: { classes, total: total || classes.length, subject },
    };
};

export const set_popular_classes = (classes = []) => {
    return { type: SET_POPULAR_CLASSES, payload: { classes } };
};

export const set_class_announcements = (announcements=[], total=0) => {
    return {type: SET_CLASS_ANNOUNCEMENTS, payload: {announcements, total: total || announcements.length}};
}

export const set_class_assignments = (assignments=[], total=0) => {
    return {type: SET_CLASS_ASSIGNMENTS, payload: {assignments, total: total || assignments.length}};
}

export const edit_class_announcement = (keys=[], value) => {
    return  {type: EDIT_CLASS_ANNOUNCEMENT, payload: {keys, value}};
}

export const edit_class_assignment = (keys=[], value) => {
    return  {type: EDIT_CLASS_ASSIGNMENT, payload: {keys, value}};
}

export const set_class_announcement_error = (error) => {
    return {type: SET_CLASS_ANNOUNCEMENT_ERROR, payload: {error}};
}

export const set_class_assignment_error = (error) => {
    return {type: SET_CLASS_ASSIGNMENT_ERROR, payload: {error}};
}

export const get_class = (class_id, action_to_dispatch) => async (dispatch) => {
    try{
        const res = await api("get", `/api/classes/${class_id}`);

        if(res && res.data){
            if(res.data.success){
                const {_class} = res.data;

                action_to_dispatch && dispatch({type: action_to_dispatch, payload: {_class}});

                return res.data;
            }
            
            console.error(res.data);
        }else{
            console.error(res);
        }

        return res;
    }catch(e){
        console.error(e);
    }
}

export const get_classes = (limit = 20, offset = 0, search = "", sort = "{}", filters = "{}") => async (dispatch) => {
    try {
        const res = await api(
            "get",
            `/api/classes?limit=${limit}&offset=${offset}&search=${search}&sort=${sort}&filters=${filters}`
        );

        if (res.data) {
            if (res.data.success) {
                const { classes = [], total = 0 } = res.data;
                dispatch(set_classes(classes, total));
                return res.data;
            }

            console.log(res.data);
        } else {
            console.log(res);
        }
    } catch (e) {
        console.error(e);
    }
};

export const get_classes_by_subject = (limit = 20, offset = 0, search = "", sort = "{}", filters = "{}", subject) => async (dispatch) => {
    try {
        const res = await api(
            "get",
            `/api/classes/subject/${subject}?limit=${limit}&offset=${offset}&search=${search}&sort=${sort}&filters=${filters}`
        );

        if (res.data) {
            if (res.data.success) {
                const { classes = [], total = 0 } = res.data;
                total && dispatch(set_subject_classes(classes, total, subject));
                return res.data;
            }

            console.log(res.data);
        } else {
            console.log(res);
        }
    } catch (e) {
        console.error(e);
    }
};

export const get_popular_classes = (limit = 20, offset = 0, search = "", filters = "{}") =>
    async (dispatch) => {
        try {
            const res = await api(
                "get",
                `/api/classes?limit=${limit}&offset=${offset}&search=${search}&sort={"popularity": "desc"}&filters=${filters}`
            );

            if (res.data) {
                if (res.data.success) {
                    const { classes = [] } = res.data;
                    dispatch(set_popular_classes(classes));
                    return res.data;
                }

                console.log(res.data);
            } else {
                console.log(res);
            }
        } catch (e) {
            console.error(e);
        }
    };


export const get_class_client_secret = (class_id) => async (dispatch) => {
    try {
        const res = await api("get", "/api/classes/class/client_secret", {params: {class_id}});

        if (res.data) {
            if (res.data.success) {
                const { client_secret } = res.data;

                return res.data;
            }
            console.log(res.data);
        } else {
            console.log(res);
        }

        return res?.data;
    } catch (e) {
        console.error(e);
        return e.message;
    }
};

export const request_join_class = (_class) => async (dispatch) => {
    try {
        const res = await api("post", "/api/classes/request", { _class });

        if (res.data) {
            if (res.data.success) {
                const { request } = res.data;
                console.log(request);
                dispatch({type: REQUEST_JOIN_CLASS, payload: {request: request}});
                return res.data;
            }
            console.log(res.data);
        } else {
            console.log(res);
        }
    } catch (e) {
        console.error(e);
    }
};

export const accept_join_request = (request) => async (dispatch) => {
    try {
        const res = await api("post", "/api/classes/request/accept", { request });

        if (res.data) {
            if (res.data.success) {
                const { updated_request, updated_class } = res.data;
                // console.log(request);
                dispatch({type: ACCEPT_JOIN_REQUEST, payload: {_class: updated_class, request: updated_request}});
                dispatch(set_class(updated_class));
                return res.data;
            }
            console.log(res.data);
        } else {
            console.log(res);
        }
    } catch (e) {
        console.error(e);
    }
};

export const decline_join_request = (request) => async (dispatch) => {
    try {
        const res = await api("post", "/api/classes/request/decline", { request });

        if (res.data) {
            if (res.data.success) {
                const { updated_request } = res.data;
                // console.log(request);
                dispatch({type: DECLINE_JOIN_REQUEST, payload: {request: updated_request}});
                return res.data;
            }
            console.log(res.data);
        } else {
            console.log(res);
        }
    } catch (e) {
        console.error(e);
    }
}

export const create_new_class = (_class_formdata) => async (dispatch) => {
    try{
        const res = await api("post", `/api/classes`, _class_formdata);

        if(res.data){
            if(res.data.success){
                const {_class} = res.data;
                dispatch({type: CREATE_CLASS, payload: {_class}})
                return res.data;
            }

            dispatch(set_create_class_error(res.data.msg));
        }else{
            dispatch(set_create_class_error(res?.message || res));
        }
    }catch(e){
        dispatch(set_create_class_error(e.message));
        console.error(e);
    }
}

export const update_class = (_class_formdata) => async (dispatch) => {
    try{
        const res = await api("put", `/api/classes`, _class_formdata);

        if(res.data){
            if(res.data.success){
                const {updated_class} = res.data;
                dispatch({type: UPDATE_CLASS, payload: {_class: updated_class}})
                return res.data;
            }

            dispatch(set_update_class_error(res.data.msg));
        }else{
            dispatch(set_update_class_error(res?.message || res));
        }
    }catch(e){
        dispatch(set_update_class_error(e.message));
        console.error(e);
    }
}

export const set_create_class_error = (error) => {
    return {type: SET_CREATE_CLASS_ERROR, payload: {error}};
}

export const set_update_class_error = (error) => {
    return {type: SET_UPDATE_CLASS_ERROR, payload: {error}};
}

export const edit_class_value = (keys=[], value) => {
    return {type: EDIT_CLASS_VALUE, payload: {keys, value}};
}

export const edit_new_class_value = (keys=[], value) => {
    return {type: EDIT_NEW_CLASS_VALUE, payload: {keys, value}};
}

export const get_class_announcements = (class_id, limit=20, offset=0, sort="{}", filters="{}") => async (dispatch) => {
    try{
        const res = await api("get", `/api/announcements/class`, {params: { class_id, limit, offset, sort, filters}});
        
        if(res.data){
            if(res.data.success){
                const {announcements=[], total=0} = res.data;

                dispatch(set_class_announcements(announcements, total));

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

export const get_class_assignments = (class_id, limit=20, offset=0, search="", sort="{}", filters="{}") => async (dispatch) => {
    try{
        const res = await api("get", `/api/assignments/class`, {params: { class_id, limit, offset, search, sort, filters}});
        if(res.data){
            if(res.data.success){
                const {assignments=[], total=0} = res.data;

                dispatch(set_class_assignments(assignments, total));

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

export const create_assignment = (assignment_formData) => async (dispatch) => {
    try{
        const res = await api("post", "/api/assignments", assignment_formData);

        if(res.data){
            if(res.data.success){
                const {assignment, announcement} = res.data;
                
                dispatch({type: CREATE_CLASS_ASSIGNMENT, payload: {assignment, announcement}});
                dispatch({type: CREATE_CLASS_ANNOUNCEMENT, payload: {announcement}});

                return res.data;
            }

            console.error(res.data);
            dispatch(set_class_assignment_error(res.data.msg));
        }else{
            console.error(res);
            dispatch(set_class_assignment_error(res?.message || res));
        }
    }catch(e){
        console.error(e);
        dispatch(set_class_assignment_error(e.message));
    }
}

export const create_announcement = ({_class, title, message, assignment=null}) => async (dispatch) => {
    try{
        const res = await api("post", "/api/announcements", {_class, title, message, assignment});

        if(res.data){
            if(res.data.success){
                const {announcement} = res.data;
                
                dispatch({type: CREATE_CLASS_ANNOUNCEMENT, payload: {announcement}});

                return res.data;
            }

            console.error(res.data);
            dispatch(set_class_announcement_error(res.data.msg));
        }else{
            console.error(res);
            dispatch(set_class_announcement_error(res?.message || res));
        }
    }catch(e){
        console.error(e);
        dispatch(set_class_announcement_error(e.message));
    }
}

export const start_class = ({_class, meeting_link=""}) => async (dispatch) => {
    try{
        const res = await api("post", `/api/classes/start/${_class._id}`, {meeting_link});

        if(res && res.data){
            if(res.data.success){
                const {updated_class, new_session} = res.data;

                dispatch(set_class(updated_class));
                
                return res.data;
            }
        }else{
            console.log(res);
        }
    }catch(e){
        console.error(e);
    }
}

export const end_class = ({_class}) => async (dispatch) => {
    try{
        const res = await api("post", `/api/classes/end/${_class._id}`);
        
        if(res && res.data){
            if(res.data.success){
                const {updated_class} = res.data;
                
                dispatch(set_class(updated_class));
                
                return res.data;
            }
        }else{
            console.log(res);
        }
    }catch(e){
        console.error(e);
    }
}

export const set_meeting_link = ({_class, meeting_link}) => async (dispatch) => {
    try{
        const res = await api("post", `/api/classes/set_meeting_link/${_class._id}`, {meeting_link});
        
        if(res && res.data){
            if(res.data.success){
                const {updated_class} = res.data;
                
                dispatch(set_class(updated_class));
                
                return res.data;
            }
        }else{
            console.log(res);
        }
    }catch(e){
        console.error(e);
    }
}

export const remove_student_from_class = ({student_id, _class}) => async (dispatch) => {
    try{
        const res = await api("delete", `/api/classes/student/${_class._id}`, {params: {student_id}});
        
        if(res && res.data){
            if(res.data.success){
                const {updated_class} = res.data;
                
                dispatch(set_class(updated_class));
                
                return res.data;
            }
        }else{
            console.log(res);
        }
    }catch(e){
        console.log(e);
    }
}

export const get_class_reschedules = (class_id, limit=20, offset=0, sort='{}', filters='{}', action_to_dispatch=GET_CLASS_RESCHEDULES) => async (dispatch) => {
    try{
        const res = await api("get", `/api/reschedules/class/${class_id}`, {params: {limit, offset, sort, filters}});

        if(res.data){
            const {success, msg, reschedules=[], total=0} = res.data
            if(success){
                action_to_dispatch && dispatch({type: action_to_dispatch, payload: {reschedules, total}})
                return res.data;
            }

            console.log(msg)
        }else{
            console.log(res);
        }
    }catch(e){
        console.log(e);
    }
}

export const request_class_reschedule = ({_class, old_date, new_date=null, new_start_time=null, new_end_time=null, reason=""}) => async (dispatch) => {
    try{
        const res = await api("post", `/api/reschedules/`, {_class, old_date, new_date, new_start_time, new_end_time, reason});
        
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