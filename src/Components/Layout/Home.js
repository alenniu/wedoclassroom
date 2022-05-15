import React from 'react';
import { Outlet } from 'react-router-dom';

const HomeLayout = () => {
    return (
        <div className='page-container home'>
            {/* <h1>Home Layout</h1> */}

            <Outlet />
        </div>
    );
}
 
export default HomeLayout;