import React, { useEffect } from 'react';
import { NOTIFICATION_TYPE_ASSIGNMENT_PAST_DUE, NOTIFICATION_TYPE_ASSIGNMENT_SUBMISSION, NOTIFICATION_TYPE_CLASS_ANNOUNCEMENT, NOTIFICATION_TYPE_CLASS_END, NOTIFICATION_TYPE_CLASS_REQUEST, NOTIFICATION_TYPE_CLASS_REQUEST_ACCEPTED, NOTIFICATION_TYPE_CLASS_REQUEST_REJECTED, NOTIFICATION_TYPE_CLASS_RESCHEDULE, NOTIFICATION_TYPE_CLASS_RESCHEDULE_DECLINE, NOTIFICATION_TYPE_CLASS_START, NOTIFICATION_TYPE_INFO, NOTIFICATION_TYPE_NEW_ASSIGNMENT, NOTIFICATION_TYPE_NEW_CLASS_STUDENT, NOTIFICATION_TYPE_REQUEST_CLASS_RESCHEDULE } from 'my-server/notification_types';
import {IconBaseProps, IconType} from "react-icons";
import {BsMegaphone, BsInfoCircle, BsPersonPlus} from "react-icons/bs";
import {FaRegCalendarCheck, FaRegCalendarTimes} from "react-icons/fa";
import {SiGoogleclassroom} from "react-icons/si";
import {MdOutlineEditCalendar, MdOutlineAssignment, MdOutlineAssignmentTurnedIn, MdOutlineAssignmentLate, MdOutlineDoNotTouch, MdOutlineWavingHand} from "react-icons/md";

import "./Notification.css";
import { useNavigate } from 'react-router-dom';

const get_something_based_on_type = (type) => {
    switch(type){
        case NOTIFICATION_TYPE_CLASS_START:
            return

        case NOTIFICATION_TYPE_CLASS_END:
            return

        case NOTIFICATION_TYPE_REQUEST_CLASS_RESCHEDULE:
            return
        
        case NOTIFICATION_TYPE_CLASS_RESCHEDULE:
            return

        case NOTIFICATION_TYPE_CLASS_RESCHEDULE_DECLINE:
            return

        case NOTIFICATION_TYPE_NEW_ASSIGNMENT:
            return

        case NOTIFICATION_TYPE_ASSIGNMENT_SUBMISSION:
            return

        case NOTIFICATION_TYPE_ASSIGNMENT_PAST_DUE:
            return

        case NOTIFICATION_TYPE_CLASS_ANNOUNCEMENT:
            return

        case NOTIFICATION_TYPE_NEW_CLASS_STUDENT:
            return

        case NOTIFICATION_TYPE_INFO:
            return

        case NOTIFICATION_TYPE_CLASS_REQUEST:
            return

        case NOTIFICATION_TYPE_CLASS_REQUEST_ACCEPTED:
            return

        case NOTIFICATION_TYPE_CLASS_REQUEST_REJECTED:
            return

        default:
            return "fallback"
    }
}

const red = "#ff0066";
const green = "#99C183";

const NOTIFICATION_ICONS = {
    [NOTIFICATION_TYPE_CLASS_START]: (p:IconBaseProps) => <SiGoogleclassroom color={green} {...p} />,
    [NOTIFICATION_TYPE_CLASS_END]: (p:IconBaseProps) => <SiGoogleclassroom color={red} {...p} />,
    [NOTIFICATION_TYPE_REQUEST_CLASS_RESCHEDULE]: (p:IconBaseProps) => <MdOutlineEditCalendar color={green} {...p} />,
    [NOTIFICATION_TYPE_CLASS_RESCHEDULE]: (p:IconBaseProps) => <FaRegCalendarCheck color={green} {...p} />,
    [NOTIFICATION_TYPE_CLASS_RESCHEDULE_DECLINE]: (p:IconBaseProps) => <FaRegCalendarTimes color={red} {...p} />,
    [NOTIFICATION_TYPE_NEW_ASSIGNMENT]: (p:IconBaseProps) => <MdOutlineAssignment color={green} {...p} />,
    [NOTIFICATION_TYPE_ASSIGNMENT_SUBMISSION]: (p:IconBaseProps) => <MdOutlineAssignmentTurnedIn color={green} {...p} />,
    [NOTIFICATION_TYPE_ASSIGNMENT_PAST_DUE]: (p:IconBaseProps) => <MdOutlineAssignmentLate color={red} {...p} />,
    [NOTIFICATION_TYPE_CLASS_ANNOUNCEMENT]: (p:IconBaseProps) => <BsMegaphone color={green} {...p} />,
    [NOTIFICATION_TYPE_NEW_CLASS_STUDENT]: (p:IconBaseProps) => <BsPersonPlus color={green} {...p} />,
    [NOTIFICATION_TYPE_CLASS_REQUEST]: (p:IconBaseProps) => <BsPersonPlus color={green} {...p} />,
    [NOTIFICATION_TYPE_CLASS_REQUEST_ACCEPTED]: (p:IconBaseProps) => <MdOutlineWavingHand color={green} {...p} />,
    [NOTIFICATION_TYPE_CLASS_REQUEST_REJECTED]: (p:IconBaseProps) => <MdOutlineDoNotTouch color={red} {...p} />,
    [NOTIFICATION_TYPE_INFO]: (p:IconBaseProps) => <BsInfoCircle color={green} {...p} />
}

const Notification = ({notification={}, onClick, onMount}) => {
    const {_id, type, text, from, metadata={}} = notification;

    const navigate = useNavigate();

    useEffect(() => {
        typeof(onMount) === "function" && onMount(notification);
    }, []);

    const onClickNotification = () => {
        switch(type){
            case NOTIFICATION_TYPE_CLASS_START:{
                const {_class} = metadata

                navigate(`/dashboard/my-class/${_class._id}`);
            }
            break;
    
            case NOTIFICATION_TYPE_CLASS_END:{
                const {_class} = metadata

                navigate(`/dashboard/my-class/${_class._id}`);
            }
            break;
            
            case NOTIFICATION_TYPE_REQUEST_CLASS_RESCHEDULE:{
                const {_class} = metadata
                
                navigate(`/dashboard/class/edit/${_class._id}`);
            }
            break;
            
            case NOTIFICATION_TYPE_CLASS_RESCHEDULE:{
                const {} = metadata
                
                navigate(`/dashboard/`);
            }
            break;
            
            case NOTIFICATION_TYPE_CLASS_RESCHEDULE_DECLINE:{
                const {_class} = metadata
                
                navigate(`/dashboard/class/edit/${_class._id}`);
            }
            break;
            
            case NOTIFICATION_TYPE_NEW_ASSIGNMENT:{
                const {_class, assignment} = metadata
                
                navigate(`/dashboard/my-class/${_class._id}`);
            }
            break;
            
            case NOTIFICATION_TYPE_ASSIGNMENT_SUBMISSION:{
                const {_class, assignment} = metadata
                
                navigate(`/dashboard/my-class/${_class._id}`);
            }
            break;
            
            case NOTIFICATION_TYPE_ASSIGNMENT_PAST_DUE:{
                const {_class, assignment} = metadata
                
                navigate(`/dashboard/my-class/${_class._id}`);
            }
            break;
    
            case NOTIFICATION_TYPE_CLASS_ANNOUNCEMENT:{
                const {_class, announcement} = metadata

                navigate(`/dashboard/my-class/${_class._id}`);
            }
            break;
            
            case NOTIFICATION_TYPE_NEW_CLASS_STUDENT:{
                const {} = metadata
                
                // navigate(`/dashboard/my-class/${_class._id}`);
            }
            break;
            
            case NOTIFICATION_TYPE_CLASS_REQUEST:{
                const {request, _class} = metadata
                
                navigate(`/dashboard/my-class/${_class._id}`);
            }
            
            case NOTIFICATION_TYPE_CLASS_REQUEST_ACCEPTED:{
                const {reqeust, _class} = metadata
                
                navigate(`/dashboard/my-class/${_class._id}`);
            }

            case NOTIFICATION_TYPE_CLASS_REQUEST_REJECTED:{
                const {request, _class} = metadata
                
            }
    
            case NOTIFICATION_TYPE_INFO:{
                const {} = metadata

            }
            break;
    
            default:
                
        }

        (typeof(onClick) === "function") && (type !== NOTIFICATION_TYPE_INFO) && onClick(notification);
    }

    const Icon:IconType = NOTIFICATION_ICONS[type] || NOTIFICATION_ICONS[NOTIFICATION_TYPE_INFO];

    return (
        <div onClick={onClickNotification} className='notification-container clickable'>
            <Icon className='notification-icon' size={20} />
            <p>{text}</p>
        </div>
    );
}
 
export default Notification;