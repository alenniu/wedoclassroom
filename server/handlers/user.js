import {Request, Response, NextFunction} from "express";
import { create_attachment, get_attachments } from "../functions/attachment";
import { get_class } from "../functions/class";
import { add_item_to_schedule, get_schedule, remove_item_from_schedule, update_schedule_item } from "../functions/schedule";
import { get_requests } from "../functions/user";
import { delete_file } from "../functions/utils";

export const get_requests_handler = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const {user} = req;
        let {limit=20, offset=0, sort="{}", filters="{}"} = req.query;

        limit = Number(limit) || 20;
        offset = Number(offset) || 0;
        sort = JSON.parse(sort) || {};
        filters = JSON.parse(filters) || {};

        const {requests, total} = await get_requests(user, limit, offset, sort, filters);

        return res.json({requests, total, success: true});
    }catch(e){
        return res.status(400).json({success: false, msg: e.message});
    }
}

export const get_attachments_handler = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const {user} = req;
        let {limit=20, offset=0, search="", sort="{}", filters="{}"} = req.query;

        limit = Number(limit) || 20;
        offset = Number(offset) || 0;
        sort = JSON.parse(sort) || {};
        filters = JSON.parse(filters) || {};

        const {attachments, total} = await get_attachments(user, limit, offset, search);

        return res.json({attachments, total, success: true});
    }catch(e){
        return res.status(400).json({success: false, msg: e.message});
    }
}

export const upload_attachment_handler = async (req: Request, res: Response, next: NextFunction) => {
    const {file, user} = req;
    let {is_link="", url, name, _class} = req.body;
    
    name = name || file.originalname;
    url = is_link?url:`${file.destination}/${file.filename}`;
    
    try{
        _class = JSON.parse(_class);
        
        if(file || is_link){
            
            const current_class = await get_class(_class._id, user);

            const can_add_attachment = (current_class.teacher._id.toString() === user._id.toString()) || (current_class.students.findIndex((s) => s.toString() === user._id.toString()) !== -1) || (user.type === "admin");

            if(can_add_attachment){
                const attachment = await create_attachment({name, url, is_link: !!is_link, _class, filetype: file.mimetype}, user);

                current_class.attachments.push(attachment);
                await current_class.save()

                return res.json({success: true, attachment, _class: current_class, file: req.file});
            }else{
                delete_file(url);
                return res.status(400).json({success: false, msg: "Failed to add attachment"});
            }
            
        }else{
            return res.status(400).json({success: false, msg: "No file uploaded and not a link"})
        }
    }catch(e){
        console.error(e);
        delete_file(url);
        res.status(400).json({success: false, msg: e.message})
    }
}

export const get_schedule_handler = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const {user} = req;
        const schedule = await get_schedule(user);

        return res.json({success: true, schedule});
    }catch(e){
        res.status(400).json({success: false, msg: e.message});
    }
}

export const add_item_to_schedule_handler = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const {user} = req;
        const {name, description, start_date, duration, end_date, _class} = req.body;

        const schedule = await add_item_to_schedule({name, description, start_date, duration, end_date, _class}, user);

        return res.json({success: true, schedule});
    }catch(e){
        res.status(400).json({success: false, msg: e.message});
    }
}

export const update_schedule_item_handler = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const {user} = req;
        const {item} = req.body;
        
        const schedule = await update_schedule_item(item, user);

        return res.json({success: true, schedule});
    }catch(e){
        res.status(400).json({success: false, msg: e.message});
    }
}

export const remove_item_from_schedule_handler = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const {user} = req;
        const {item_id} = req.query;
        
        const schedule = await remove_item_from_schedule(item_id, user);

        return res.json({success: true, schedule});
    }catch(e){
        res.status(400).json({success: false, msg: e.message});
    }
}