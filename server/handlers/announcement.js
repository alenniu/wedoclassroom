import mongoose from "mongoose";
import {Request, Response, NextFunction} from "express";
import { create_announcement, delete_announcement, get_class_announcements, update_announcement } from "../functions/announcement";
import { get_class } from "../functions/class";
import { NOTIFICATION_TYPE_CLASS_ANNOUNCEMENT } from "../notification_types";
import { Mail } from "../services/mail";
import { create_notification } from "../functions/notifications";
import { SOCKET_EVENT_NOTIFICATION } from "../socket_events";

export const get_class_announcements_handler = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const {user} = req;
        let {class_id, limit=20, offset=0, sort="{}", filters="{}"} = req.query;

        limit = Number(limit) || 20;
        offset = Number(offset) || 0;
        sort = JSON.parse(sort) || {};
        filters = JSON.parse(filters) || {};
        
        const {announcements, total} = await get_class_announcements({class_id, user}, limit, offset, sort, filters);
        
        return res.json({success: true, announcements, total});
    }catch(e){
        return res.status(400).json({success: false, msg: e.message});
    }
}

export const create_announcement_handler = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const {user, socket_io} = req;
        const {_class, title, message, assignment=null} = req.body;

        const current_class = await get_class(_class._id, user);

        if((user._id.toString() === current_class.teacher._id.toString()) ||  (user.type === "admin")){
            const new_announcement = await create_announcement({_class, title, message, assignment}, user);

            try{
                const user_emails = current_class.students.map((s) => s.email);
                const user_ids = current_class.students.map((s) => s._id.toString());

                const announcement_notification = await create_notification({type: NOTIFICATION_TYPE_CLASS_ANNOUNCEMENT, text: `New announcement for ${current_class.title}.\n${message}`, attachments: [], from: user._id, to: user_ids, everyone: false, everyone_of_type: [], excluded_users: [], metadata: {_class: current_class, announcement: new_announcement}});

                announcement_notification = announcement_notification.toObject();
                delete announcement_notification.to;
                delete announcement_notification.read_by;
                delete announcement_notification.excluded_users;
                delete announcement_notification.everyone_of_type;
                
                socket_io?.to(user_ids).emit(SOCKET_EVENT_NOTIFICATION, announcement_notification);

                const mail = new Mail({subject: "New Announcement", recipients: user_emails, sender: APP_EMAIL}, {html: `<h1>New Announcement for ${current_class.title}<h1><p>${message}</p>`, text: `New Announcement for ${current_class.title}.\n${message}`});
    
                mail.send().catch((e) => {
                    console.log(e);
                });
            }catch(e){
                console.log(e)
            }
    
            return res.json({success: true, announcement: new_announcement});
        }

        throw new Error("Not authorized to use resource");
    }catch(e){
        return res.status(400).json({success: false, msg: e.message});
    }
}

export const update_announcement_handler = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const {user} = req;
        const {announcement} = req.body;

        const updated_announcement = await update_announcement(announcement, user);

        if(updated_announcement){
            return res.json({success: true, announcement: updated_announcement})
        }

        throw new Error("Announcement not found");
    }catch(e){

        return res.status(400).json({success: false, msg: e.message});
    }
}

export const delete_announcement_handler = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const {user} = req;
        const {announcement} = req.body;

        await delete_announcement(announcement, user);

        return res.json({success: true, announcement})
    }catch(e){

        return res.status(400).json({success: false, msg: e.message});
    }
}