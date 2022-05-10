import {Request, Response, NextFunction} from "express";
import { create_attachment, get_attachments } from "../functions/attachment";
import { get_class } from "../functions/class";
import { get_requests } from "../functions/user";
import { delete_file } from "../functions/utils";

export const get_requests_handler = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const {user} = req;
        let {limit=20, offset=0} = req.query;

        limit = Number(limit) || 20;
        offset = Number(offset) || 0;

        const {requests, total} = await get_requests(user._id, limit, offset);

        return res.json({requests, total, success: true});
    }catch(e){
        return res.status(400).json({success: false, msg: e.message});
    }
}

export const get_attachments_handler = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const {user} = req;
        let {limit=20, offset=0, search=""} = req.query;

        limit = Number(limit) || 20;
        offset = Number(offset) || 0;

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
            
            const current_class = await get_class(_class._id);

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