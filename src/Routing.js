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

const routes = [
    {
        path: "/dashboard",
        component: DashboardLayout,
        exact: false,
        authRequired: true, //will also effect children
        adminRequired: false, //will also effect children
        children: [
            {
                path: "/dashboard/",
                component: Dashboard,
                exact: true,
                children: null,
                isIndex: true,
                adminRequired: false
            },
            {
                path: "/dashboard/classes",
                component: Dashboard,
                exact: true,
                children: null,
                isIndex: false,
                adminRequired: false
            },
            {
                path: "/dashboard/schedule",
                component: Dashboard,
                exact: true,
                children: null,
                isIndex: false,
                adminRequired: false
            },
            {
                path: "/dashboard/payments",
                component: Dashboard,
                exact: true,
                children: null,
                isIndex: false,
                adminRequired: false
            },
            {
                path: "/dashboard/accounts",
                component: Accounts,
                exact: true,
                children: null,
                isIndex: false,
                adminRequired: false
            }
        ]
    },
    {
        path: "/",
        component: HomeLayout,
        exact: false,
        authRequired: false, //will also effect children
        adminRequired: false, //will also effect children
        children: [
            {
                path: "/",
                component: Home,
                exact: true,
                authRequired: false,
                adminRequired: false,
                children: null
            },
            {
                path: "/login",
                component: Login,
                exact: true,
                authRequired: false,
                adminRequired: false,
                children: null
            },
            {
                path: "/register",
                component: Register,
                exact: true,
                authRequired: false,
                adminRequired: false,
                children: null
            }
        ]
    }
];


const renderChildrenRoutes = ({children=[], authenticated=false, is_admin=false, authRequired, adminRequired}) => {
    return children.map(({path, component:C, exact, isIndex=false, children}) => {
        const has_children = Array.isArray(children) && children.length > 0;
        
        const allowed = !authRequired || authenticated && (!adminRequired || (adminRequired && is_admin));
        
        return (
            <Route index={isIndex} key={path} path={path} exact={exact} element={allowed?<C />:<Navigate to={`/login?from=${window.location.pathname}`} replace />}>
                {has_children && renderChildrenRoutes({children, authenticated, is_admin, authRequired, adminRequired})}
            </Route>
        )
    })
}

function map_state_to_props({Auth}){
    return {authenticated: Auth.logged_in, is_admin: Auth.is_admin};
}

export default connect(map_state_to_props, {})(({authenticated=false, is_admin=false}) => {
    useEffect(() => {
        // check_login();
    }, []);

    return (
        <Router>
            <Routes>
                {routes.map(({path, component:C, exact, authRequired, adminRequired, children}) => {
                    const has_children = Array.isArray(children) && children.length > 0;

                    const allowed = !authRequired || authenticated && (!adminRequired || (adminRequired && is_admin));

                    return (
                        <Route key={path} path={path} exact={exact} element={allowed?<C />:<Navigate to={`/login?from=${window.location.pathname}`} replace />}>
                            {has_children && renderChildrenRoutes({children, authenticated, is_admin, authRequired, adminRequired})}
                        </Route>
                    );
                })}
                <Route path="*" element={<NotFound />} />
            </Routes>
        </Router>
    )
});