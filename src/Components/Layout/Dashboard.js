import React, { useCallback, useEffect, useRef, useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { connect } from 'react-redux';
import {RiDashboardLine, RiMessage3Line, RiCalendar2Line, RiBook2Line, RiStarLine, RiUserLine, RiVideoAddLine, RiNotification3Line, RiTimeLine, RiArrowRightSLine, RiArrowLeftSLine, RiSettings3Line, RiLogoutBoxLine} from "react-icons/ri";
import {BsCurrencyDollar} from "react-icons/bs";
import {BiSearchAlt} from "react-icons/bi";
import { add_socket_events, close_nav, get_notifications, get_unread_notifications_count, hide_incoming_notification, logout, open_nav, remove_all_incoming_notification, remove_incoming_notification, add_new_notification, remove_socket_events, set_loading, toggle_nav, toggle_notifications, open_notifications, close_notifications, admin_search } from '../../Actions';
import {CSSTransition, TransitionGroup} from "react-transition-group"
import { debounce, get_full_image_url } from '../../Utils';
import { useSocket } from '../../Context/SocketContext';
import { SOCKET_EVENT_LOGIN, SOCKET_EVENT_LOGOUT } from 'my-server/socket_events';
import Notification from '../Dashboard/Notification';
import { NOTIFICATION_TYPE_INFO } from 'my-server/notification_types';

import "./Dashboard.css";

const DashboardLayout = ({user, is_admin, is_teacher, notifications=[], notifications_open, incoming_notifications=[], unread_notifications_count=0, nav_open, toggle_nav, search_results={}, open_nav, close_nav, is_student, is_sales, get_notifications, get_unread_notifications_count, remove_incoming_notification, remove_all_incoming_notification, add_socket_events, remove_socket_events, add_new_notification, logout, toggle_notifications, open_notifications, close_notifications, admin_search, set_loading}) => {
    
    const {name={first: "Ruth", last: "Langmore"}, phone, type, photo_url="/Assets/Images/AuthBackground.png"} = user;

    const {students=[], teachers=[], classes=[]} = search_results;

    const [search, setSearch] = useState("");
    const [showSearch, setShowSearch] = useState(false);
    
    const [socket, setSocket] = useSocket();

    const navigate = useNavigate();
    
    const location = useLocation();

    const searchRef = useRef(null);
    const notificationsRef = useRef(null);

    const is_on_new_class = location.pathname === "/dashboard/class/new";

    const globalSearch = useCallback(debounce(async (search) => {
        set_loading(true);
        await admin_search(search);
        set_loading(false);
    }, 300), [])

    const onClickStudent = (student) => {
        setShowSearch(false);
        navigate(`/dashboard/accounts/edit/${student._id}`);
    }
    
    const onClickTeacher = (teacher) => {
        setShowSearch(false);
        navigate(`/dashboard/accounts/edit/${teacher._id}`);
    }
    
    const onClickClass = (_class) => {
        setShowSearch(false);
        navigate(`/dashboard/class/edit/${_class._id}`);
    }

    const toggleSearch = () => {
        if(!showSearch){
            searchRef.current?.focus();
        }
        setShowSearch(s => !s);
    }

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

    const onClickOutsiteSearch = (e:MouseEvent) => {
        if(!searchRef.current?.contains(e.target)){
            setShowSearch(false);
        }
    }

    useEffect(() => {
        if(search){
            globalSearch(search);
        }
    }, [search]);

    useEffect(() => {
        notifications_open && window.addEventListener("click", onClickOutsiteNotifications);
        showSearch && window.addEventListener("click", onClickOutsiteSearch);
        
        return () => {
            window.removeEventListener("click", onClickOutsiteNotifications);
            window.removeEventListener("click", onClickOutsiteSearch);
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
                        {/* <li title='Dashboard' className='nav-link'>
                            <NavLink to="/dashboard/" className="button"><RiDashboardLine className='link-icon' size={"20px"} /><span className='link-label'>Dashboard</span></NavLink>
                        </li> */}

                        <li title='Schedule' className='nav-link'>
                            <NavLink to="/dashboard/schedule" className="button"><RiCalendar2Line className='link-icon' size={"20px"} /><span className='link-label'>Schedule</span></NavLink>
                        </li>

                        <li title='Discover Classes' className='nav-link'>
                            <NavLink to="/dashboard/classes" className="button"><RiBook2Line className='link-icon' size={"20px"} /><span className='link-label'>Classes</span></NavLink>
                        </li>

                        {/* <li className='nav-link'>
                            <NavLink to="/dashboard/messages" className="button"><RiMessage3Line className='link-icon' size={"20px"} /><span className='link-label'>Messages</span></NavLink>
                        </li>

                        <li className='nav-link'>
                            <NavLink to="/dashboard/reviews" className="button"><RiStarLine className='link-icon' size={"20px"} /><span className='link-label'>Reviews</span></NavLink>
                        </li> */}

                        {is_teacher && <li title='Payments' className='nav-link'>
                            <NavLink to="/dashboard/payments" className="button"><BsCurrencyDollar className='link-icon' size={"20px"} /><span className='link-label'>Payments</span></NavLink>
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

                            <div>
                                {(is_admin || is_sales) && <span style={{color: "var(--text-color, black)", position: "relative", marginRight: 20}}>
                                    <BiSearchAlt onClick={(e) => {e.stopPropagation(); toggleSearch();}} className='clickable' size={"25px"} />
                                    <div onClick={(e) => {e.stopPropagation()}} style={{position: "absolute", width: "300px", top: "20px", right: 0, marginBottom: 20}} className={`input-container ${showSearch?"show":"hide"}`}>
                                        <input ref={searchRef} style={{boxShadow: "0 0 0 100vw rgba(125,125,125,0.3)"}} placeholder='search' onChange={(e) => setSearch(e.target.value)} value={search}  />

                                        {!!students.length && <ul style={{backgroundColor: "var(--bg-color, white)", width: "100%", marginTop: 20, borderRadius: 8}}>
                                            <li style={{textAlign: "center", borderBottom: "2px solid #ECECEC", padding: 10}}>Students</li>
                                            {students.map((s) => {
                                                const {_id, name, email, photo_url, phone} = s;

                                                return (
                                                    <li onClick={() => onClickStudent(s)} key={_id} style={{display: "flex", alignItems: "center", padding: 10}} className="clickable"><span style={{width: 30, height: 30, borderRadius: 30, overflow: "hidden", display: "inline-block", marginRight: 10}}><img src={get_full_image_url(photo_url)} style={{width: "100%", height: "100%", borderRadius: 30, objectFit: "cover"}} /></span> {name.first} {name.last}</li>
                                                )
                                            })}    
                                        </ul>}

                                        {!!teachers.length && <ul style={{backgroundColor: "var(--bg-color, white)", width: "100%", marginTop: 20, borderRadius: 8}}>
                                            <li style={{textAlign: "center", borderBottom: "2px solid #ECECEC", padding: 10}}>Teachers</li>
                                            {teachers.map((t) => {
                                                const {_id, name, email, photo_url, phone} = t;

                                                return (
                                                    <li onClick={() => onClickTeacher(t)} key={_id} style={{display: "flex", alignItems: "center", padding: 10}} className="clickable"><span style={{width: 30, height: 30, borderRadius: 30, overflow: "hidden", display: "inline-block", marginRight: 10}}><img src={get_full_image_url(photo_url)} style={{width: "100%", height: "100%", borderRadius: 30, objectFit: "cover"}} /></span> {name.first} {name.last}</li>
                                                )
                                            })}    
                                        </ul>}

                                        {!!classes.length && <ul style={{backgroundColor: "var(--bg-color, white)", width: "100%", marginTop: 20, borderRadius: 8}}>
                                            <li style={{textAlign: "center", borderBottom: "2px solid #ECECEC", padding: 10}}>Classes</li>
                                            {classes.map((c) => {
                                                const {_id, title, description, bg_color} = c;

                                                return (
                                                    <li onClick={() => onClickClass(c)} key={_id} style={{display: "flex", alignItems: "center", padding: 10}} className="clickable"><span style={{width: 30, height: 30, borderRadius: 30, overflow: "hidden", display: "inline-block", backgroundColor: bg_color, marginRight: 10}}/> {title}</li>
                                                )
                                            })}    
                                        </ul>}
                                    </div>
                                </span>}

                                {(is_admin || is_teacher) && <button disabled={is_on_new_class} className='button primary' onClick={onPressNewClass}><RiVideoAddLine className='icon left' size={"20px"} /> New Class</button>}
                            </div>
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
                                            {notifications.length?notifications.map((n) => <li key={n._id}><Notification notification={n} key={n._id} onClick={() => {toggle_notifications()}} /></li>):(
                                                <div style={{height: "var(--notification-height, 80px)", width: "var(--notification-width, 200px)", display: "flex", alignItems: "center", justifyContent: "center"}}>
                                                    <p>No Notifications</p>
                                                </div>
                                            )}
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
                        <CSSTransition timeout={300} classNames="incoming-notification" unmountOnExit key={n._id}>
                            <span className="incoming-notification" onClick={() => {remove_incoming_notification(n)}} style={{"--index": i}} key={n._id}><Notification notification={n} onMount={onIncomingNotificationMount} /></span>
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

function map_state_to_props({App, User, Admin, Auth}){
    return {user: App.user, is_admin: Auth.is_admin, is_teacher: Auth.is_teacher, is_student: Auth.is_student, is_sales: Auth.is_sales, nav_open: App.nav_open, notifications: User.notifications, incoming_notifications: User.incoming_notifications, unread_notifications_count: User.unread_notifications_count, notifications_open: App.open_notifications, search_results: Admin.search}
}

export default connect(map_state_to_props, {logout, toggle_nav, open_nav, close_nav, get_notifications, get_unread_notifications_count, remove_incoming_notification, remove_all_incoming_notification, add_socket_events, remove_socket_events, add_new_notification, toggle_notifications, open_notifications, close_notifications, admin_search, set_loading})(DashboardLayout);