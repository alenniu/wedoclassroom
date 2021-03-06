import {combineReducers, applyMiddleware, legacy_createStore} from "redux";
import ReduxThunk from "redux-thunk";
import AppReducer from "./AppReducer";
import AuthReducer from "./AuthReducer";
import UserReducer from "./UserReducer";
import AdminReducer from "./AdminReducers";
import ClassReducer from "./ClassReducer";

export const Reducers = combineReducers({
    App: AppReducer,
    Auth: AuthReducer,
    User: UserReducer,
    Admin: AdminReducer,
    Class: ClassReducer
})

export const store = legacy_createStore(Reducers, {}, applyMiddleware(ReduxThunk));