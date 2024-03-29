import React, { useEffect } from 'react';
import {BrowserRouter as Router, Routes, Route, Navigate} from "react-router-dom";
import {connect} from "react-redux";
import DashboardLayout from './Components/Layout/Dashboard';
import HomeLayout from './Components/Layout/Home';
import Dashboard from './Pages/Dashboard';
import Login from './Pages/Login';
import Register from './Pages/Register';
import NotFound from './Pages/404';
import Home from './Pages/Home';
import Accounts from './Pages/Accounts';
import Classes from './Pages/Classes';
import NewClass from './Pages/Class/NewClass';
import EditClass from './Pages/Class/EditClass';
import Class from './Pages/Class';
import { get_config } from './Actions';
import Payments from './Pages/Payments';
import Sessions from './Pages/Sessions';
import EditAccount from './Pages/Account/EditAccount';
import NewAccount from './Pages/Account/NewAccount';
import Schedule from './Pages/Schedule';
import Config from './Pages/Config';

const routes = [
    {
        path: "/dashboard",
        component: DashboardLayout,
        exact: false,
        authRequired: true, //will also effect children
        teacherRequired: false, //will also effect children
        adminRequired: false, //will also effect children
        salesRequired: false,
        authRedirect: "/login",
        children: [
            {
                path: "/dashboard",
                component: Dashboard,
                exact: true,
                children: null,
                isIndex: true,
                teacherRequired: false,
                adminRequired: false
            },
            {
                path: "/dashboard/classes",
                component: Classes,
                exact: true,
                children: null,
                isIndex: false,
                teacherRequired: false,
                adminRequired: false
            },
            {
                path: "/dashboard/my-class/:id",
                component: Class,
                exact: true,
                children: null,
                isIndex: false,
                teacherRequired: false,
                adminRequired: false
            },
            {
                path: "/dashboard/schedule",
                component: Schedule,
                exact: true,
                children: null,
                isIndex: false,
                teacherRequired: false,
                adminRequired: false
            },
            {
                path: "/dashboard/payments",
                component: Payments,
                exact: true,
                children: null,
                isIndex: false,
                teacherRequired: true,
                adminRequired: false
            },
            {
                path: "/dashboard/accounts",
                component: Accounts,
                exact: true,
                children: null,
                isIndex: false,
                teacherRequired: false,
                adminRequired: true,
                salesRequired: true,
            },
            {
                path: "/dashboard/accounts/new",
                component: NewAccount,
                exact: true,
                children: null,
                isIndex: false,
                teacherRequired: false,
                adminRequired: true,
                salesRequired: true,
            },
            {
                path: "/dashboard/accounts/edit/:account_id",
                component: EditAccount,
                exact: true,
                children: null,
                isIndex: false,
                teacherRequired: false,
                adminRequired: true,
                salesRequired: true,
            },
            {
                path: "/dashboard/sessions",
                component: Sessions,
                exact: true,
                children: null,
                isIndex: false,
                teacherRequired: false,
                adminRequired: true
            },
            {
                path: "/dashboard/config",
                component: Config,
                exact: true,
                children: null,
                isIndex: false,
                teacherRequired: false,
                adminRequired: true,
                salesRequired: false,
            },
            {
                path: "/dashboard/class/new",
                component: NewClass,
                exact: true,
                children: null,
                isIndex: false,
                teacherRequired: true,
                adminRequired: false
            },
            {
                path: "/dashboard/class/edit/:class_id",
                component: EditClass,
                exact: true,
                children: null,
                isIndex: false,
                teacherRequired: true,
                adminRequired: true,
                salesRequired: true
            }
        ]
    },
    {
        path: "/",
        component: HomeLayout,
        exact: false,
        authRequired: false, //will also effect children
        salesRequired: false,
        adminRequired: false, //will also effect children
        children: [
            {
                path: "/",
                component: Home,
                exact: true,
                authRequired: false,
                teacherRequired: true,
                adminRequired: false,
                children: null
            },
            {
                path: "/login",
                component: Login,
                exact: true,
                authRequired: false,
                teacherRequired: true,
                adminRequired: false,
                children: null
            },
            {
                path: "/register",
                component: Register,
                exact: true,
                authRequired: false,
                teacherRequired: true,
                adminRequired: false,
                children: null
            }
        ]
    }
];


const renderChildrenRoutes = ({children=[], authenticated=false, is_admin=false, is_teacher=false, is_student=false.valueOf, is_sales=false, authRequired, teacherRequired, salesRequired, adminRequired}) => {
    return children.map(({path, component:C, exact, authRedirect="/dashboard", isIndex=false, children}) => {
        const has_children = Array.isArray(children) && children.length > 0;
        
        const allowed = !authRequired || authenticated && (!teacherRequired || is_teacher || is_sales || is_admin) && (!salesRequired || is_sales || is_admin) && (!adminRequired ||  is_admin);
        
        return (
            <Route index={isIndex} key={path} path={path} exact={exact} element={allowed?<C />:<Navigate to={`${authRedirect || "/login"}?from=${window.location.pathname}`} replace />}>
                {has_children && renderChildrenRoutes({children, authenticated, is_admin, is_teacher, is_student, authRequired, teacherRequired, salesRequired, adminRequired})}
            </Route>
        )
    })
}

function map_state_to_props({Auth}){
    return {authenticated: Auth.logged_in, is_admin: Auth.is_admin, is_teacher: Auth.is_teacher, is_student: Auth.is_student, is_sales: Auth.is_sales};
}

export default connect(map_state_to_props, {get_config})(({authenticated=false, is_admin=false, is_teacher=false, is_student=false, is_sales=false, get_config}) => {
    useEffect(() => {
        get_config();
    }, []);

    return (
        <Router>
            <Routes>
                {routes.map(({path, component:C, exact, authRedirect="/dashboard", authRequired, teacherRequired, salesRequired, adminRequired, children}) => {
                    const has_children = Array.isArray(children) && children.length > 0;

                    const allowed = !authRequired || authenticated && (!teacherRequired || is_teacher || is_sales || is_admin) && (!salesRequired || is_sales || is_admin) && (!adminRequired ||  is_admin);

                    return (
                        <Route key={path} path={path} exact={exact} element={allowed?<C />:<Navigate to={`${authRedirect || "/login"}?from=${window.location.pathname}`} replace />}>
                            {has_children && renderChildrenRoutes({children, authenticated, is_admin, is_teacher, is_student, authRequired, teacherRequired, salesRequired, adminRequired})}
                        </Route>
                    );
                })}
                <Route path="*" element={<NotFound />} />
            </Routes>
        </Router>
    )
});