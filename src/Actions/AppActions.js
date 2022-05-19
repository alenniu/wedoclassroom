import { SET_LOADING, SET_USER } from "./types";

export const set_user = (user) => {
    return {type: SET_USER, payload: {user}};
}

export const set_loading = (loading) => {
    return {type: SET_LOADING, payload: {loading}};
}