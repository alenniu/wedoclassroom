import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { connect } from 'react-redux';
import {RiDashboardLine, RiMessage3Line, RiCalendar2Line, RiBook2Line, RiStarLine, RiUserLine, RiVideoAddLine, RiNotification3Line, RiTimeLine} from "react-icons/ri";
import {BsCurrencyDollar} from "react-icons/bs";
import { logout, set_loading } from '../../Actions';

import "./Dashboard.css";
import { get_full_image_url } from '../../Utils';

const DashboardLayout = ({user, is_admin, is_teacher, is_student, is_sales, logout, set_loading}) => {
    
    const {name={first: "Ruth", last: "Langmore"}, phone, type, photo_url="/Assets/Images/AuthBackground.png"} = user;
    
    const [navOpen, setNavOpen] = useState(null);
    
    const navigate = useNavigate();
    
    const location = useLocation();
    const is_on_new_class = location.pathname === "/dashboard/new-class";

    const openNav = () => {
        setNavOpen(true);
    }

    const closeNav = () => {
        setNavOpen(false);
    }

    const toggleNav = () => {
        setNavOpen((open) => !open);
    }

    const onPressMessageIcon = async () => {
        set_loading(true);
        if(await logout()){
            navigate("/login");
        }
        set_loading(false);
    }

    const onPressNewClass = async () => {
        navigate("/dashboard/new-class");
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
                            <NavLink to="/dashboard/" className="button"><RiDashboardLine className='link-icon' size={"20px"} /><span className='link-label'>Dashboard</span></NavLink>
                        </li>

                        <li className='nav-link'>
                            <NavLink to="/dashboard/classes" className="button"><RiBook2Line className='link-icon' size={"20px"} /><span className='link-label'>Classes</span></NavLink>
                        </li>

                        <li className='nav-link'>
                            <NavLink to="/dashboard/schedule" className="button"><RiCalendar2Line className='link-icon' size={"20px"} /><span className='link-label'>My Schedule</span></NavLink>
                        </li>

                        {/* <li className='nav-link'>
                            <NavLink to="/dashboard/messages" className="button"><RiMessage3Line className='link-icon' size={"20px"} /><span className='link-label'>Messages</span></NavLink>
                        </li>

                        <li className='nav-link'>
                            <NavLink to="/dashboard/reviews" className="button"><RiStarLine className='link-icon' size={"20px"} /><span className='link-label'>Reviews</span></NavLink>
                        </li> */}

                        {is_teacher && <li className='nav-link'>
                            <NavLink to="/dashboard/payments" className="button"><BsCurrencyDollar className='link-icon' size={"20px"} /><span className='link-label'>My Payments</span></NavLink>
                        </li>}

                        {(is_admin || is_sales) && <li className='nav-link'>
                            <NavLink to="/dashboard/accounts" className="button"><RiUserLine className='link-icon' size={"20px"} /><span className='link-label'>Accounts</span></NavLink>
                        </li>}

                        {is_admin && <li className='nav-link'>
                            <NavLink to="/dashboard/sessions" className="button"><RiTimeLine className='link-icon' size={"20px"} /><span className='link-label'>Session</span></NavLink>
                        </li>}
                    </ul>

                    <div className='support-container'>
                        <div className='support-image-container'>
                            <img src="/Assets/Images/support-badge.svg" />
                        </div>
                        <div className='support-text'>
                            <p>Need Help?</p>
                            <p>Contact Wedo Support</p>
                        </div>

                        <button className='button primary'>Contact Support</button>
                    </div>
                </div>
            </nav>


            <div className={`admin-page-container ${navOpen===false?"nav-closed":navOpen===true?"nav-open":""}`}>
                <header className={`admin-header ${navOpen===false?"nav-closed":navOpen===true?"nav-open":""}`}>
                    <div className='main-col'>
                        <div className='dashboard-greeting-action'>
                            <p className='dashboard-greeting'>Good Morning, <span className='username'>{name.first}</span></p>

                            {(is_admin || is_teacher) && <button disabled={is_on_new_class} className='button primary' onClick={onPressNewClass}><RiVideoAddLine className='icon left' size={"20px"} /> New Class</button>}
                        </div>
                    </div>
                    <div className='misc-col'>
                        <div className='dashboard-user-actions'>
                            <div className='user-profile-container'>
                                <div className='user-image-container'>
                                    <img src={get_full_image_url(photo_url)} />
                                </div>

                                <div className='user-info-container'>
                                    <p className='name'>{name.first}</p>
                                    <p className='role'>{type}</p>
                                </div>
                            </div>

                            <div className='user-actions icons'>
                                <span className='action-icon-container' onClick={onPressMessageIcon}><RiMessage3Line size={25} className="clickable" /></span>
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

function map_state_to_props({App, Auth}){
    return {user: App.user, is_admin: Auth.is_admin, is_teacher: Auth.is_teacher, is_student: Auth.is_student, is_sales: Auth.is_sales}
}

export default connect(map_state_to_props, {logout, set_loading})(DashboardLayout);