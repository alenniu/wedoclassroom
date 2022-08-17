import {Request, Response, NextFunction} from "express";
import mongoose from "mongoose";
import { ADD_NEW_CLASS_RESCHEDULE, UPDATE_CLASS_RESCHEDULE } from "../../src/Actions/types";
import { APP_EMAIL } from "../config";
import { get_class } from "../functions/class";
import { create_notification } from "../functions/notifications";
import { accept_reschedule_request, create_reschedule_request, get_class_reschedules, get_reschedule, get_reschedules, reject_reschedule_request } from "../functions/reschedule";
import { NOTIFICATION_TYPE_CLASS_RESCHEDULE, NOTIFICATION_TYPE_CLASS_RESCHEDULE_DECLINE, NOTIFICATION_TYPE_REQUEST_CLASS_RESCHEDULE } from "../notification_types";
import { Mail, TemplatedMail } from "../services/mail";
import { SOCKET_EVENT_NOTIFICATION } from "../socket_events";
import { SOCKET_ROOM_ADMINS } from "../socket_rooms";

const Users = mongoose.model("user");

export const get_reschedule_handler = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const {user} = req;
        let {reschedule_id} = req.params;

        const reschedule = await get_reschedule(reschedule_id, user);
        if(reschedule){
            return res.json({success: true, reschedule});
        }else{
            throw new Error("Reschedule not found");
        }
    }catch(e){
        return res.status(400).json({success: false, msg: e.message});
    }
}

export const get_reschedules_handler = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const {user} = req;
        let {limit=20, offset=0, sort="{}", filters="{}"} = req.query;
        
        limit = Number(limit);
        offset = Number(offset);
        sort = JSON.parse(sort);
        filters = JSON.parse(filters);

        const {total, reschedules} = await get_reschedules(limit, offset, filters, sort, user);

        res.json({success: true, total, reschedules});
    }catch(e){
        return res.status(400).json({success: false, msg: e.message});
    }
}

export const get_class_reschedules_handler = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const {user} = req;
        const {class_id} = req.params;
        let {limit=20, offset=0, sort="{}", filters="{}"} = req.query;
        
        limit = Number(limit);
        offset = Number(offset);
        sort = JSON.parse(sort);
        filters = JSON.parse(filters);

        const current_class = await get_class(class_id, user);

        if(current_class){
            const {total, reschedules} = await get_class_reschedules(current_class, limit, offset, filters, sort, user);

            return res.json({success: true, total, reschedules});
        }else{
            throw new Error("class not found");
        }
    }catch(e){
        return res.status(400).json({success: false, msg: e.message});
    }
}

export const request_class_reschedule_handler = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const {user, socket_io} = req;
        const {_class, reason, old_date, new_date=null, new_start_time=null, new_end_time=null} = req.body;

        const current_class = await get_class(_class._id, user);

        if(current_class){
            const reschedule = await create_reschedule_request({_class, reason, old_date, new_date, new_start_time, new_end_time}, user);

            if(reschedule){
                const users = await Users.find({type: "admin"}, {email: 1});

                
                try{
                    const user_emails = users.map((u) => u.email);
                    const user_ids = users.map((u) => u._id.toString());

                    let request_notification = await create_notification({type: NOTIFICATION_TYPE_REQUEST_CLASS_RESCHEDULE, text: `Reschedule requested for ${current_class.title}.\nReason: ${reschedule.reason || "None Provided"}`, attachments: [], from: user._id, to: [], everyone: false, everyone_of_type: ["admin"], excluded_users: [], metadata: {_class: current_class, reschedule}});

                    request_notification = request_notification.toObject();
                    delete request_notification.to;
                    delete request_notification.read_by;
                    delete request_notification.excluded_users;
                    delete request_notification.everyone_of_type;
    
                    console.log(socket_io);
                    socket_io?.to(SOCKET_ROOM_ADMINS).emit(SOCKET_EVENT_NOTIFICATION, request_notification, {dispatchObj: {type: ADD_NEW_CLASS_RESCHEDULE, payload: {reschedule}}});

                    const mail = new Mail({subject: "Class Reschedule Requested", recipients: user_emails, sender: APP_EMAIL}, {html: "Class Reschedule Requested", text: "Class Reschedule Requested"});
    
                    mail.send().catch((e) => {
                        console.log(e);
                    });
                }catch(e){
                    console.log(e)
                }
            }

            return res.json({success: true, reschedule});
        }else{
            throw new Error("class not found");
        }
    }catch(e){
        return res.status(400).json({success: false, msg: e.message});
    }
}

export const accept_class_reschedule_handler = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const {user, socket_io} = req;
        const {reschedule_id} = req.params;
        const {new_date=null, new_start_time=null, new_end_time=null} = req.body;

        const reschedule = await accept_reschedule_request(reschedule_id, {new_date, new_start_time, new_end_time}, user);

        if(reschedule){
            try{
                const current_class = await get_class(reschedule._class._id, user);
                const users = await Users.find({_id: {$in: [...current_class.students.map((s) => s._id), current_class.teacher._id]}}, {_id: 1, email: 1});

                const user_emails = users.map((u) => u.email);
                const user_ids = users.map((u) => u._id.toString());

                let reschedule_notification = await create_notification({type: NOTIFICATION_TYPE_CLASS_RESCHEDULE, text: `${current_class.title} has been rescheduled.`, attachments: [], from: user._id, to: user_ids, everyone: false, everyone_of_type: [], excluded_users: [], metadata: {_class: current_class, reschedule}});

                reschedule_notification = reschedule_notification.toObject();
                delete reschedule_notification.to;
                delete reschedule_notification.read_by;
                delete reschedule_notification.excluded_users;
                delete reschedule_notification.everyone_of_type;
                
                socket_io?.to(user_ids).emit(SOCKET_EVENT_NOTIFICATION, reschedule_notification, {dispatchObj: {type: UPDATE_CLASS_RESCHEDULE, payload: {reschedule}}});

                const mail = new Mail({subject: "Class Rescheduled", recipients: user_emails, sender: APP_EMAIL}, {html: "Class Rescheduled", text: "Class Rescheduled"});
    
                mail.send().catch((e) => {
                    console.log(e);
                });
            }catch(e){
                console.log(e)
            }

            return res.json({success: true, reschedule});
        }else{
            throw new Error("Reschedule not found");
        }

    }catch(e){
        return res.status(400).json({success: false, msg: e.message});
    }
}

export const reject_class_reschedule_handler = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const {user, socket_io} = req;
        const {reschedule_id} = req.params;

        const reschedule = await reject_reschedule_request(reschedule_id, user);

        if(reschedule){
            try{
                const current_class = await get_class(reschedule._class._id, user);

                let reschedule_notification = await create_notification({type: NOTIFICATION_TYPE_CLASS_RESCHEDULE_DECLINE, text: `Reschedule for ${current_class.title} has been declined.`, attachments: [], from: user._id, to: [reschedule.teacher._id], everyone: false, everyone_of_type: [], excluded_users: [], metadata: {_class: current_class, reschedule}});

                reschedule_notification = reschedule_notification.toObject();
                delete reschedule_notification.to;
                delete reschedule_notification.read_by;
                delete reschedule_notification.excluded_users;
                delete reschedule_notification.everyone_of_type;

                socket_io?.to(reschedule.teacher._id.toString()).emit(SOCKET_EVENT_NOTIFICATION, reschedule_notification, {dispatchObj: {type: UPDATE_CLASS_RESCHEDULE, payload: {reschedule}}});
                
                const mail = new Mail({subject: "Class Reschedule Declined", recipients: [reschedule.teacher.email], sender: APP_EMAIL}, {html: "Class Reschedule Declined", text: "Class Reschedule Declined"});
    
                mail.send().catch((e) => {
                    console.log(e);
                });
            }catch(e){
                console.log(e)
            }

            return res.json({success: true, reschedule});
        }else{
            throw new Error("Reschedule not found");
        }
    }catch(e){
        return res.status(400).json({success: false, msg: e.message});
    }
}