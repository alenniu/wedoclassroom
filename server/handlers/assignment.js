import mongoose from "mongoose";
import {Request, Response, NextFunction} from "express";
import { create_announcement } from "../functions/announcement";
import { get_class } from "../functions/class";
import { create_assignment, delete_assignment, get_assignments, get_class_assignments, update_assignment } from "../functions/assignment";

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
        const {user} = req;
        const {_class, title, description, due_date, attachments=[], students=[]} = req.body;
        const current_class = await get_class(_class._id, user);

        if((user._id.toString() === current_class.teacher._id.toString()) ||  (user.type === "admin")){
            const new_assignment = await create_assignment({_class, title, description, due_date, attachments, students}, user);

            const new_announcement = await create_announcement({_class, assignment: new_assignment});
    
            return res.json({success: true, assignment: new_assignment, announcement: new_announcement});
        }

        throw new Error("Not authorized to use resource");
    }catch(e){
        return res.status(400).json({success: false, msg: e.message});
    }
}

export const update_assignment_handler = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const {user} = req;
        const {assignment} = req.body;

        const updated_assignment = await update_assignment(assignment, user);

        if(updated_assignment){
            return res.json({success: true, announcement: updated_announcement})
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