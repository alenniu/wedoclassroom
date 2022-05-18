import React from 'react';
import { Outlet } from 'react-router-dom';
import "./Home.css";

const HomeLayout = () => {
    return (
        <div className='page-container home'>
            {/* <h1>Home Layout</h1> */}

            <Outlet />
        </div>
    );
}
 
export default HomeLayout;