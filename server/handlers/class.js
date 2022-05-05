import {Request, Response, NextFunction} from "express";
import { electron } from "webpack";
import { accept_request, create_class, decline_request, get_class, get_user_classes, request_class } from "../functions/class";
import { get_request } from "../functions/request";


export const create_class_handler = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const {user} = req;

        if((user.type === "admin") || (user.type === "teacher")){
            let {subject, tags=[], teacher} = req.body;
        
            if(user.type === "teacher"){
                teacher = user;
            }
        
            const _class = await create_class({subject, tags, teacher}, user);

            return res.json({success: true, _class});
        }else{
            throw new Error("Only admins or teachers can create classes");
        }
    }catch(e){
        return res.status(400).json({success: false, msg: e.message});
    }
}

export const request_class_handler = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const {user} = req;

        let {_class} = req.body;

        const current_class = await get_class(_class._id);
    
        
        const existing_request = await get_request({_class: current_class._id, student: user._id, accepted: false, declined: false});
        
        if(!existing_request){
            const index = current_class.students.findIndex((s) => s._id.toString() === user._id.toString());

            if(index === -1){
                const request = await request_class({_class: current_class, student: user});

                return res.json({success: true, request});
            }else{
                throw new Error("You are already in this class.")
            }
        }else{
            throw new Error("There is already a pending request for this class.");
        }
    }catch(e){
        return res.status(400).json({success: false, msg: e.message});
    }
}

export const accept_request_handler = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const {user} = req;
        if((user.type === "admin") || (user.type === "teacher")){
            let {request} = req.body;

            const _class = await get_class(request._class);
        
            if((user.type === "admin") || (user._id.toString() === _class.teacher._id.toString())){
                const {request:updated_request, updated_class} = await accept_request({request_id: request._id}, user);

                return res.json({success: true, updated_class, updated_request});
            }else{
                throw new Error("Only this class' teacher or an admin can accept this request");
            }
        }else{
            throw new Error("Only admins or teachers can accept requests");
        }
    }catch(e){
        console.error(e);
        return res.status(400).json({success: false, msg: e.message});
    }
}

export const decline_request_handler = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const {user} = req;
        if((user.type === "admin") || (user.type === "teacher")){
            let {request} = req.body;

            const _class = await get_class(request._class);
        
            if((user.type === "admin") || (user._id.toString() === _class.teacher._id.toString())){
                const updated_request = await decline_request({request_id: request._id});

                return res.json({success: true, updated_request});
            }else{
                throw new Error("Only this class' teacher or an admin can decline this request");
            }
        }else{
            throw new Error("Only admins or teachers can decline requests");
        }
    }catch(e){
        return res.status(400).json({success: false, msg: e.message});
    }
}

export const get_classes_handler = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const {user} = req;
        let {limit=20, offset=0, search=""} = req.query;

        limit = Number(limit) || 20;
        offset = Number(offset) || 0;
        
        const {classes, total} = await get_user_classes(user, limit, offset, search);

        return res.json({classes, total, success: true})
    }catch(e){
        return res.status(400).json({success: false, msg: e.message});
    }
}