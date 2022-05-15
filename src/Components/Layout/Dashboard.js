import React from 'react';
import { Outlet } from 'react-router-dom';

const DashboardLayout = () => {
    return (
        <div className='page-container dashboard'>
            <h1>Dashboard Layout</h1>

            <Outlet />
        </div>
    );
}
 
export default DashboardLayout;