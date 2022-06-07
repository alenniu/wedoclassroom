import { api } from "../Utils/api";
import { CREATE_CLASS, EDIT_CLASS_VALUE, SET_CLASSES, SET_CREATE_CLASS_ERROR, SET_POPULAR_CLASSES, REQUEST_JOIN_CLASS, ACCEPT_JOIN_REQUEST } from "./types";

export const set_classes = (classes = [], total = 0) => {
    return {
        type: SET_CLASSES,
        payload: { classes, total: total || classes.length },
    };
};

export const set_popular_classes = (classes = []) => {
    return { type: SET_POPULAR_CLASSES, payload: { classes } };
};

export const get_classes =
    (limit = 20, offset = 0, search = "", sort = "{}", filters = "{}") =>
    async (dispatch) => {
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

export const get_popular_classes =
    (limit = 20, offset = 0, search = "", filters = "{}") =>
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
                dispatch({type: ACCEPT_JOIN_REQUEST, payload: {class: updated_class}});
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
                // dispatch({type: REQUEST_JOIN_CLASS, payload: {request: request}});
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
            dispatch(set_create_class_error(res));
        }
    }catch(e){
        dispatch(set_create_class_error(e.message));
        console.error(e);
    }
}

export const set_create_class_error = (error) => {
    return {type: SET_CREATE_CLASS_ERROR, payload: {error}};
}

export const edit_class_value = (keys=[], value) => {
    return {type: EDIT_CLASS_VALUE, payload: {keys, value}};
}