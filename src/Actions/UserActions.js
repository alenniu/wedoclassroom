import { api } from "../Utils/api";

const { SET_CLASS, SET_USER_CLASSES, SET_USER_REQUESTS } = require("./types");

export const set_user_classes = (classes=[], total=0) => {
    return {type: SET_USER_CLASSES, payload: {classes, total: total || classes.length}}
}

export const set_user_requests = (requests=[], total=0) => {
    return {type: SET_USER_REQUESTS, payload: {requests, total: total || requests.length}}
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