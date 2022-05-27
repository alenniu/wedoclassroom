import { api } from "../Utils/api";
import { SET_CLASSES, SET_POPULAR_CLASSES } from "./types";

export const set_classes = (classes=[], total=0) => {
    return {type: SET_CLASSES, payload: {classes, total: total || classes.length}};
}

export const set_popular_classes = (classes=[]) => {
    return {type: SET_POPULAR_CLASSES, payload: {classes}};
}

export const get_classes = (limit=20, offset=0, search="", sort="{}", filters="{}") => async (dispatch) => {
    try{
        const res = await api("get", `/api/classes?limit=${limit}&offset=${offset}&search=${search}&sort=${sort}&filters=${filters}`)

        if(res.data){
            if(res.data.success){
                const {classes=[], total=0} = res.data;
                dispatch(set_classes(classes, total));
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

export const get_popular_classes = (limit=20, offset=0, search="", filters="{}") => async (dispatch) => {
    try{
        const res = await api("get", `/api/classes?limit=${limit}&offset=${offset}&search=${search}&sort={"popularity": "desc"}&filters=${filters}`)
        
        if(res.data){
            if(res.data.success){
                const {classes=[]} = res.data;
                dispatch(set_popular_classes(classes));
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