import { api } from "../Utils/api";

const { SET_CLASS, SET_CLASSES } = require("./types");

export const set_classes = (classes=[], total=0) => {
    return {type: SET_CLASSES, payload: {classes, total: total || classes.length}}
}

export const get_classes = (limit=20, offset=0, search="") => async (dispatch) => {
    const res = await api("get", `/api/classes?limit=${limit}&offset=${offset}&search=${search}`);

    if(res.data){
        if(res.data.success){
            const {classes, total} = res.data;

            dispatch(set_classes(classes, total));

            return res.data
        }

        console.log(res.data);
    }else{
        console.log(res);
    }
}