import React, { useEffect, useRef, useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { connect } from 'react-redux';
import {RiDashboardLine, RiMessage3Line, RiCalendar2Line, RiBook2Line, RiStarLine, RiUserLine, RiVideoAddLine, RiNotification3Line, RiTimeLine, RiArrowRightSLine, RiArrowLeftSLine, RiSettings3Line, RiLogoutBoxLine} from "react-icons/ri";
import {BsCurrencyDollar} from "react-icons/bs";
import { add_socket_events, close_nav, get_notifications, get_unread_notifications_count, hide_incoming_notification, logout, open_nav, remove_all_incoming_notification, remove_incoming_notification, add_new_notification, remove_socket_events, set_loading, toggle_nav, toggle_notifications, open_notifications, close_notifications } from '../../Actions';
import {CSSTransition, TransitionGroup} from "react-transition-group"

import "./Dashboard.css";
import { get_full_image_url } from '../../Utils';
import { useSocket } from '../../Context/SocketContext';
import { SOCKET_EVENT_LOGIN, SOCKET_EVENT_LOGOUT } from 'my-server/socket_events';
import Notification from '../Dashboard/Notification';
import { NOTIFICATION_TYPE_INFO } from 'my-server/notification_types';

const DashboardLayout = ({user, is_admin, is_teacher, notifications=[], notifications_open, incoming_notifications=[], unread_notifications_count=0, nav_open, toggle_nav, open_nav, close_nav, is_student, is_sales, get_notifications, get_unread_notifications_count, remove_incoming_notification, remove_all_incoming_notification, add_socket_events, remove_socket_events, add_new_notification, logout, toggle_notifications, open_notifications, close_notifications, set_loading}) => {
    
    const {name={first: "Ruth", last: "Langmore"}, phone, type, photo_url="/Assets/Images/AuthBackground.png"} = user;

    const [showIncoming, setShowIncoming] = useState(false);
    
    const [socket, setSocket] = useSocket();

    const navigate = useNavigate();
    
    const location = useLocation();

    const notificationsRef = useRef(null);

    const is_on_new_class = location.pathname === "/dashboard/class/new";

    const onNotificationExit = (n) => {
        remove_incoming_notification(n)
    };

    const onClickNotifications = (e) => {
        e.stopPropagation();
        remove_all_incoming_notification();
        toggle_notifications();
    }

    const onClickLogout = async () => {
        set_loading(true);
        if(await logout()){
            socket?.emit(SOCKET_EVENT_LOGOUT);
            navigate("/login");
        }
        set_loading(false);
    }

    const onPressNewClass = async () => {
        navigate("/dashboard/class/new");
    }

    const onClickOutsiteNotifications = (e:MouseEvent) => {
        if(!notificationsRef.current?.contains(e.target)){
            close_notifications()
        }
    }

    useEffect(() => {
        notifications_open && window.addEventListener("click", onClickOutsiteNotifications);
        
        return () => {
            window.removeEventListener("click", onClickOutsiteNotifications);
        }
    }, [notifications_open]);

    useEffect(() => {
        let timeout;
        if(user){
            socket?.emit(SOCKET_EVENT_LOGIN, user);
            // TESTING
            timeout = setTimeout(() => {
                add_new_notification({_id: "12345", text: "Hello. This is a test notification\nShould be on new line.", type: NOTIFICATION_TYPE_INFO});
                // add_new_notification({_id: "123456", text: "Hello. This is a test notification\nShould be on new line.", type: "TEST_NOTIFICATION"});
            }, 500);
            // TESTING
            add_socket_events(socket);
            get_notifications(20, 0);
            get_unread_notifications_count();
        }

        return () => {
            clearTimeout(timeout);
            remove_socket_events(socket);
        }
    }, [user]);

    const onIncomingNotificationMount = (n) => {
        setTimeout(() => {
            remove_incoming_notification(n);
        }, [5000]);
    }

    return (
        <div className='page-container dashboard'>
            <nav className={`admin-nav ${nav_open===false?"closed":nav_open===true?"open":""}`}>
                <div className='nav-wrapper'>
                    <div className='nav-image-container'>
                        <img src="/Assets/Images/AuthBackground.png" />
                    </div>

                    <ul className='nav-links'>
                        <li title='Dashboard' className='nav-link'>
                            <NavLink to="/dashboard/" className="button"><RiDashboardLine className='link-icon' size={"20px"} /><span className='link-label'>Dashboard</span></NavLink>
                        </li>

                        <li title='Discover Classes' className='nav-link'>
                            <NavLink to="/dashboard/classes" className="button"><RiBook2Line className='link-icon' size={"20px"} /><span className='link-label'>Classes</span></NavLink>
                        </li>

                        <li title='Schedule' className='nav-link'>
                            <NavLink to="/dashboard/schedule" className="button"><RiCalendar2Line className='link-icon' size={"20px"} /><span className='link-label'>My Schedule</span></NavLink>
                        </li>

                        {/* <li className='nav-link'>
                            <NavLink to="/dashboard/messages" className="button"><RiMessage3Line className='link-icon' size={"20px"} /><span className='link-label'>Messages</span></NavLink>
                        </li>

                        <li className='nav-link'>
                            <NavLink to="/dashboard/reviews" className="button"><RiStarLine className='link-icon' size={"20px"} /><span className='link-label'>Reviews</span></NavLink>
                        </li> */}

                        {is_teacher && <li title='Payments' className='nav-link'>
                            <NavLink to="/dashboard/payments" className="button"><BsCurrencyDollar className='link-icon' size={"20px"} /><span className='link-label'>My Payments</span></NavLink>
                        </li>}

                        {(is_admin || is_sales) && <li title='Accounts' className='nav-link'>
                            <NavLink to="/dashboard/accounts" className="button"><RiUserLine className='link-icon' size={"20px"} /><span className='link-label'>Accounts</span></NavLink>
                        </li>}

                        {is_admin && <li title='Sessions' className='nav-link'>
                            <NavLink to="/dashboard/sessions" className="button"><RiTimeLine className='link-icon' size={"20px"} /><span className='link-label'>Sessions</span></NavLink>
                        </li>}

                        {is_admin && <li title='Sessions' className='nav-link'>
                            <NavLink to="/dashboard/config" className="button"><RiSettings3Line className='link-icon' size={"20px"} /><span className='link-label'>Config</span></NavLink>
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

            <div className={`admin-page-container ${nav_open===false?"nav-closed":nav_open===true?"nav-open":""}`}>
                <header className={`admin-header ${nav_open===false?"nav-closed":nav_open===true?"nav-open":""}`}>
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
                                <span title='Notifications' className='action-icon-container notifications'>
                                    <span onClick={onClickNotifications} className='badge notification-count clickable'>{unread_notifications_count>99?"99+":unread_notifications_count}</span>

                                    <RiNotification3Line onClick={onClickNotifications} size={25} className="clickable" />

                                    {notifications_open && (
                                        <ul ref={notificationsRef} className={`notifications-container ${notifications_open?"open":"closed"}`}>
                                            {notifications.map((n) => <li key={n._id}><Notification notification={n} key={n._id} onClick={() => {toggle_notifications()}} /></li>)}
                                        </ul>
                                    )}
                                </span>

                                <span title='Logout' className='action-icon-container logout'><RiLogoutBoxLine onClick={onClickLogout} size={25} className="clickable" /></span>
                            </div>
                        </div>
                    </div>
                </header>
                <Outlet />
            </div>
            <TransitionGroup>
                {incoming_notifications.map((n, i) => {
                    return (
                        <CSSTransition timeout={300} classNames="incoming-notification" unmountOnExit onExited={() => {
                            onNotificationExit(n);
                        }} key={n._id}>
                            <span className="incoming-notification" style={{"--index": i}} key={n._id}><Notification notification={n} onMount={onIncomingNotificationMount} /></span>
                        </CSSTransition>
                    )
                })}
            </TransitionGroup>
            
            <span title='toggle nav ([)' className={`nav-toggle clickable ${nav_open===true?"open":nav_open===false?"closed":""}`} onClick={toggle_nav}>
                <RiArrowLeftSLine className='nav-toogle-icon' />
            </span>
        </div>
    );
}

function map_state_to_props({App, User, Auth}){
    return {user: App.user, is_admin: Auth.is_admin, is_teacher: Auth.is_teacher, is_student: Auth.is_student, is_sales: Auth.is_sales, nav_open: App.nav_open, notifications: User.notifications, incoming_notifications: User.incoming_notifications, unread_notifications_count: User.unread_notifications_count, notifications_open: App.open_notifications}
}

export default connect(map_state_to_props, {logout, toggle_nav, open_nav, close_nav, get_notifications, get_unread_notifications_count, remove_incoming_notification, remove_all_incoming_notification, add_socket_events, remove_socket_events, add_new_notification, toggle_notifications, open_notifications, close_notifications, set_loading})(DashboardLayout);