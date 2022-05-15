import {  } from "../Actions/types";

const INITIAL_STATE = {};

export default (state=INITIAL_STATE, action) => {
    const {type, payload} = action;
    
    const new_state = {...state};

    switch(type){

        default:
            return state;
    }

    return new_state;
}