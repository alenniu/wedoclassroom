import {Request, Response, NextFunction} from "express";
import mongoose from "mongoose";
import { APP_EMAIL } from "../config";
import { get_class } from "../functions/class";
import { accept_reschedule_request, create_reschedule_request, get_class_reschedules, get_reschedule, get_reschedules, reject_reschedule_request } from "../functions/reschedule";
import { Mail, TemplatedMail } from "../services/mail";

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
        const {user} = req;
        const {_class, reason, old_date, new_date=null, new_start_time=null, new_end_time=null} = req.body;

        const current_class = await get_class(_class._id, user);

        if(current_class){
            const reschedule = await create_reschedule_request({_class, reason, old_date, new_date, new_start_time, new_end_time}, user);

            if(reschedule){
                const user_emails = await Users.find({type: "admin"}, {email: 1});
                
                try{
                    const mail = new Mail({subject: "Class Reschedule Requested", recipients: [user_emails.map((a) => a.email)], sender: APP_EMAIL}, {html: "Class Reschedule Requested", text: "Class Reschedule Requested"});
    
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
        const {user} = req;
        const {reschedule_id} = req.params;
        const {new_date=null, new_start_time=null, new_end_time=null} = req.body;

        const reschedule = await accept_reschedule_request(reschedule_id, {new_date, new_start_time, new_end_time}, user);

        if(reschedule){
            const current_class = await get_class(reschedule._class._id, user)
            const user_emails = await Users.find({_id: {$in: [...current_class.students.map((s) => s._id), current_class.teacher._id]}}, {email: 1});

            try{
                const mail = new Mail({subject: "Class Rescheduled", recipients: [user_emails.map((a) => a.email)], sender: APP_EMAIL}, {html: "Class Rescheduled", text: "Class Rescheduled"});
    
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
        const {user} = req;
        const {reschedule_id} = req.params;

        const reschedule = await reject_reschedule_request(reschedule_id, user);

        if(reschedule){
            try{
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