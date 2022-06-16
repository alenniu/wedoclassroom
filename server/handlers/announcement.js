import mongoose from "mongoose";
import {Request, Response, NextFunction} from "express";
import { create_announcement, delete_announcement, get_class_announcements, update_announcement } from "../functions/announcement";
import { get_class } from "../functions/class";

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
        const {user} = req;
        const {_class, title, message, assignment=null} = req.body;
        const current_class = await get_class(_class._id, user);

        if((user._id.toString() === current_class.teacher._id.toString()) ||  (user.type === "admin")){
            const new_announcement = await create_announcement({_class, title, message, assignment}, user);
    
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