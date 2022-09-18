import {Request, Response, NextFunction} from "express";
import { get_class_sessions, get_sessions } from "../functions/session";

export const get_sessions_handler = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const {user} = req;
        let {limit=20, offset=0, sort="{}", filters="{}"} = req.query;
        
        limit = Number(limit);
        offset = Number(offset);
        sort = JSON.parse(sort);
        filters = JSON.parse(filters);

        const {total, sessions} = await get_sessions(limit, offset, sort, filters, user);

        res.json({success: true, total, sessions});
    }catch(e){
        return res.status(400).json({success: false, msg: e.message});
    }
}

export const get_class_sessions_handler = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const {user} = req;
        let {class_id, limit=20, offset=0, sort="{}", filters="{}"} = req.query;
        
        limit = Number(limit);
        offset = Number(offset);
        sort = JSON.parse(sort);
        filters = JSON.parse(filters);

        const {total, sessions} = await get_class_sessions({class_id}, limit, offset, sort, filters);
        
        res.json({success: true, total, sessions});
    }catch(e){
        return res.status(400).json({success: false, msg: e.message});
    }
}