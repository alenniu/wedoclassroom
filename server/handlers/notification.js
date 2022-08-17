import {Request, Response, NextFunction} from "express";
import { create_attachment } from "../functions/attachment";
import { create_notification, get_notifications, get_unread_notification_count, read_notifications, unread_notifications } from "../functions/notifications";
import { SOCKET_EVENT_NOTIFICATION } from "../socket_events";

export const create_notification_handler = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const {user, files=[], socket_io} = req;

        let {notification} = req.body;

        notification = JSON.parse(notification);

        const {type, text, attachments=[], to=[], metadata={}, everyone=false} = notification;

        for(const file of files){
            const attachment_index = attachments.findIndex((a) => a === file.originalname);
            
            if(attachment_index !== -1){
                const url = `${file.destination}/${file.filename}`;
                const a = attachments[attachment_index];

                const attachment = await create_attachment({name: file.originalname, url, filetype: file.mimetype, _class, is_link: false}, user);
                
                attachments[attachment_index] = attachment._id;
            }
        }

        const new_notification = await create_notification({text, type, attachments, from: user._id, to, metadata, everyone}, user);

        if(everyone){
            socket_io?.broadcast.emit(SOCKET_EVENT_NOTIFICATION, new_notification);
        }else{
            socket_io?.to(to).emit(SOCKET_EVENT_NOTIFICATION, new_notification);
        }

        return res.json({success: true, notification: new_notification});
    }catch(e){
        return res.status(400).json({success: false, msg: e.message});
    }
}

export const get_notifications_handler = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const {user} = req;
        let {limit=20, offset=0, sort="{}", filters="{}"} = req.query;

        limit = Number(limit) || 20;
        offset = Number(offset) || 0;
        sort = JSON.parse(sort);
        filters = JSON.parse(filters);

        const {total, notifications} = await get_notifications(user, limit, offset, sort, filters);
        
        return res.json({success: true, notifications, total});
    }catch(e){
        return res.status(400).json({success: false, msg: e.message});
    }
}

export const read_notification_handler = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const {user} = req;
        let {notification_id} = req.params;

        const {modifiedCount=0} = await read_notifications([notification_id], user);
        
        return res.json({success: true, count: modifiedCount});
    }catch(e){
        return res.status(400).json({success: false, msg: e.message});
    }
}

export const read_notifications_handler = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const {user} = req;
        let {notification_ids=[]} = req.body;

        const {modifiedCount=0} = await read_notifications(notification_ids, user);
        
        return res.json({success: true, count: modifiedCount});
    }catch(e){
        return res.status(400).json({success: false, msg: e.message});
    }
}

export const unread_notification_handler = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const {user} = req;
        let {notification_id} = req.params;

        const {modifiedCount=0} = await unread_notifications([notification_id], user);
        
        return res.json({success: true, count: modifiedCount});
    }catch(e){
        return res.status(400).json({success: false, msg: e.message});
    }
}

export const unread_notifications_handler = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const {user} = req;
        let {notification_ids} = req.body;

        const {modifiedCount=0} = await unread_notifications(notification_ids, user);
        
        return res.json({success: true, count: modifiedCount});
    }catch(e){
        return res.status(400).json({success: false, msg: e.message});
    }
}

export const get_unread_notifications_count_handler = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const {user} = req;

        const unread_count = await get_unread_notification_count(user);
        
        return res.json({success: true, count: unread_count});
    }catch(e){
        return res.status(400).json({success: false, msg: e.message});
    }
}