import mongoose from "mongoose";
import {Request, Response, NextFunction} from "express";
import { create_announcement } from "../functions/announcement";
import { get_class } from "../functions/class";
import { create_assignment, delete_assignment, get_assignments, get_class_assignments, update_assignment } from "../functions/assignment";
import { create_attachment } from "../functions/attachment";
import { NOTIFICATION_TYPE_NEW_ASSIGNMENT } from "../notification_types";
import { Mail } from "@sendgrid/helpers/classes";
import { create_notification } from "../functions/notifications";
import { SOCKET_EVENT_NOTIFICATION } from "../socket_events";
import { ADD_NEW_CLASS_ASSIGNMENT } from "../../src/Actions/types";
import { APP_EMAIL } from "../config";

export const get_assignments_handler = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const {user} = req;
        let {limit=20, offset=0, search="", sort="{}", filters="{}"} = req.query;

        limit = Number(limit) || 20;
        offset = Number(offset) || 0;
        sort = JSON.parse(sort) || {};
        filters = JSON.parse(filters) || {};
        
        const {assignments, total} = await get_assignments(user, limit, offset, search, sort, filters);
        
        return res.json({success: true, assignments, total});
    }catch(e){
        return res.status(400).json({success: false, msg: e.message});
    }
}

export const get_class_assignments_handler = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const {user} = req;
        let {class_id, limit=20, offset=0, search="", sort="{}", filters="{}"} = req.query;

        limit = Number(limit) || 20;
        offset = Number(offset) || 0;
        sort = JSON.parse(sort) || {};
        filters = JSON.parse(filters) || {};
        
        const {assignments, total} = await get_class_assignments({class_id, user}, limit, offset, search, sort, filters);
        
        return res.json({success: true, assignments, total});
    }catch(e){
        return res.status(400).json({success: false, msg: e.message});
    }
}

export const create_assignment_handler = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const {user, socket_io, files=[]} = req;
        let {_class="{}", assignment="{}"} = req.body;

        _class = JSON.parse(_class);
        assignment = JSON.parse(assignment);

        const {title, description, due_date, attachments=[], students=[]} = assignment;

        for(const file of files){
            const attachment_index = attachments.findIndex((a) => a === file.originalname);
            
            if(attachment_index !== -1){
                const url = `${file.destination}/${file.filename}`;
                const a = attachments[attachment_index];

                const attachment = await create_attachment({name: file.originalname, url, filetype: file.mimetype, _class, is_link: false}, user);
                
                attachments[attachment_index] = attachment._id;
            }
        }

        const current_class = await get_class(_class._id, user);

        if((user._id.toString() === current_class.teacher._id.toString()) ||  (user.type === "admin")){
            const new_assignment = await create_assignment({_class, title, description, due_date, attachments, students}, user);

            const new_announcement = await create_announcement({_class, assignment: new_assignment}, user);

            try{
                const user_emails = current_class.students.map((s) => s.email);
                const user_ids = current_class.students.map((s) => s._id.toString());

                let assignment_notification = await create_notification({type: NOTIFICATION_TYPE_NEW_ASSIGNMENT, text: `New assignment for ${current_class.title}.\n${title}`, attachments: attachments, from: user._id, to: user_ids, everyone: false, everyone_of_type: [], excluded_users: [], metadata: {_class: current_class, assignment: new_assignment}});

                assignment_notification = assignment_notification.toObject();
                delete assignment_notification.to;
                delete assignment_notification.read_by;
                delete assignment_notification.excluded_users;
                delete assignment_notification.everyone_of_type;
                
                socket_io?.to(user_ids).emit(SOCKET_EVENT_NOTIFICATION, assignment_notification, {dispatchObj: {type: ADD_NEW_CLASS_ASSIGNMENT, payload: {assignment: new_assignment}}});

                const mail = new Mail({subject: "New Assignment", recipients: user_emails, sender: APP_EMAIL}, {html: `New Assignment for ${current_class.title}: ${title}`, text: `New Assignment for ${current_class.title}: ${title}`});
    
                mail.send().catch((e) => {
                    console.log(e);
                });
            }catch(e){
                console.log(e)
            }

            return res.json({success: true, assignment: new_assignment, announcement: new_announcement});
        }

        throw new Error("Not authorized to use resource");
    }catch(e){
        console.error(e);
        return res.status(400).json({success: false, msg: e.message});
    }
}

export const update_assignment_handler = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const {user} = req;
        const {assignment} = req.body;

        const updated_assignment = await update_assignment(assignment, user);

        if(updated_assignment){
            return res.json({success: true, announcement: updated_assignment})
        }

        throw new Error("Assignment not found");
    }catch(e){

        return res.status(400).json({success: false, msg: e.message});
    }
}

export const delete_assignment_handler = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const {user} = req;
        const {assignment} = req.body;

        await delete_assignment(assignment, user);

        if(updated_announcement){
            return res.json({success: true, assignment})
        }

        throw new Error("Assignment not found");
    }catch(e){

        return res.status(400).json({success: false, msg: e.message});
    }
}