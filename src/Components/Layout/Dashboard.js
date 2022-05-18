import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import {RiDashboardLine, RiMessage3Line, RiCalendar2Line, RiBook2Line, RiStarLine, RiUserLine, RiVideoAddLine, RiNotification3Line} from "react-icons/ri";

import "./Dashboard.css";

const DashboardLayout = () => {
    const [navOpen, setNavOpen] = useState(null);

    const openNav = () => {
        setNavOpen(true);
    }

    const closeNav = () => {
        setNavOpen(false);
    }

    const toggleNav = () => {
        setNavOpen((open) => !open);
    }

    return (
        <div className='page-container dashboard'>
            <nav className={`admin-nav ${navOpen===false?"closed":navOpen===true?"open":""}`}>
                <div className='nav-wrapper'>
                    <div className='nav-image-container'>
                        <img src="/Assets/Images/AuthBackground.png" />
                    </div>

                    <ul className='nav-links'>
                        <li className='nav-link'>
                            <NavLink to="/dashboard" className="button"><RiDashboardLine className='link-icon' size={"20px"} /><span className='link-label'>Dashboard</span></NavLink>
                        </li>

                        <li className='nav-link'>
                            <NavLink to="/schedule" className="button"><RiCalendar2Line className='link-icon' size={"20px"} /><span className='link-label'>My Schedule</span></NavLink>
                        </li>

                        <li className='nav-link'>
                            <NavLink to="/message" className="button"><RiMessage3Line className='link-icon' size={"20px"} /><span className='link-label'>Messages</span></NavLink>
                        </li>

                        <li className='nav-link'>
                            <NavLink to="/courses" className="button"><RiBook2Line className='link-icon' size={"20px"} /><span className='link-label'>My Courses</span></NavLink>
                        </li>

                        <li className='nav-link'>
                            <NavLink to="/review" className="button"><RiStarLine className='link-icon' size={"20px"} /><span className='link-label'>Reviews</span></NavLink>
                        </li>

                        <li className='nav-link'>
                            <NavLink to="/account" className="button"><RiUserLine className='link-icon' size={"20px"} /><span className='link-label'>My Account</span></NavLink>
                        </li>
                    </ul>
                </div>
            </nav>


            <div className={`admin-page-container ${navOpen===false?"nav-closed":navOpen===true?"nav-open":""}`}>
                <header className={`admin-header ${navOpen===false?"nav-closed":navOpen===true?"nav-open":""}`}>
                    <div className='main-col'>
                        <div className='dashboard-greeting-action'>
                            <p className='dashboard-greeting'>Good Morning, <span className='username'>Samantha</span></p>

                            <button className='button primary'><RiVideoAddLine className='icon left' size={"20px"} /> New Course</button>
                        </div>
                    </div>
                    <div className='misc-col'>
                        <div className='dashboard-user-actions'>
                            <div className='user-profile-container'>
                                <div className='user-image-container'>
                                    <img src={"/Assets/Images/AuthBackground.png"} />
                                </div>

                                <div className='user-info-container'>
                                    <p className='name'>Samantha</p>
                                    <p className='role'>UI / UX</p>
                                </div>
                            </div>

                            <div className='user-actions icons'>
                                <span className='action-icon-container'><RiMessage3Line size={25} className="clickable" /></span>
                                <span className='action-icon-container'><RiNotification3Line size={25} className="clickable" /></span>
                            </div>
                        </div>
                    </div>
                </header>
                <Outlet />
            </div>
        </div>
    );
}
 
export default DashboardLayout;