import {Request, Response, NextFunction} from "express";
import { get_admins, get_students, get_teachers } from "../functions/admin";
import { add_teacher_to_class } from "../functions/class";

const { create_user } = require("../functions/user");

export const admin_create_user_handler = async (req: Request, res: Response, next: NextFunction) => {
    const {user} = req;
    const {email, name, phone, password, birth, type, role} = req.body;

    try{
        const new_user = await create_user({email, name, phone, password, birth, type, role}, user);

        return res.json({success: true, new_user});
    }catch(e){
        return res.status(400).json({success: true, msg: e.message});
    }
}

export const get_students_handler = async (req: Request, res: Response, next: NextFunction) => {
    try{
        let {limit=20, offset=0, search=""} = req.query;

        limit = Number(limit) || 20;
        limit = Number(offset) || 0;
    
        const students = await get_students(limit, offset, search);

        return res.json({students, success: true});
    }catch(e){
        return res.status(400).json({success: true, msg: e.message});
    }
}

export const get_teachers_handler = async (req: Request, res: Response, next: NextFunction) => {
    try{
        let {limit=20, offset=0, search=""} = req.query;

        limit = Number(limit) || 20;
        limit = Number(offset) || 0;
    
        const teachers = await get_teachers(limit, offset, search);

        return res.json({teachers, success: true});
    }catch(e){
        return res.status(400).json({success: true, msg: e.message});
    }
}

export const get_admin_handler = async (req: Request, res: Response, next: NextFunction) => {
    try{
        let {limit=20, offset=0, search=""} = req.query;

        limit = Number(limit) || 20;
        limit = Number(offset) || 0;
    
        const admins = await get_admins(limit, offset, search);

        return res.json({admins, success: true});
    }catch(e){
        return res.status(400).json({success: true, msg: e.message});
    }
}

export const set_class_teacher = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const {teacher, _class} = req.body;

        const updated_class = await add_teacher_to_class({teacher_id: teacher._id, class_id: _class._id});

        res.json({updated_class, success: true});
    }catch(e){
        return res.status(400).json({success: true, msg: e.message});
    }
}

