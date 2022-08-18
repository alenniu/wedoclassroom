import {Request, Response, NextFunction} from "express";
import { get_account, get_accounts, get_admins, get_students, get_teachers } from "../functions/admin";
import { add_teacher_to_class, get_classes } from "../functions/class";

const { create_user, update_user } = require("../functions/user");

export const admin_create_user_handler = async (req: Request, res: Response, next: NextFunction) => {
    const {user} = req;
    const {email, name, phone, password, gender, school, grade, date_enrolled, birth, type, role, emergency_contact, credits=0} = req.body;

    try{
        if(user.type === "admin" || (user.type === "sales" && type === "student")){
            const new_user = await create_user({email, name, phone, password, gender, school, grade, date_enrolled, birth, type, role, emergency_contact, credits}, user);
    
            delete new_user.password;
    
            return res.json({success: true, new_user});
        }

        throw new Error("Only admins or sales can create accounts. Sales can only create student accounts");
    }catch(e){
        return res.status(400).json({success: false, msg: e.message});
    }
}

export const admin_update_user_handler = async (req: Request, res: Response, next: NextFunction) => {
    const {user} = req;
    const {account} = req.body;
    
    try{
    //     if(user.type === "admin" || (user.type === "sales" && type === "student")){
            const updated_user = await update_user(account);
            
            delete updated_user.password;
            
            return res.json({success: true, updated_user});
        // }
        
        // throw new Error("Only admins or sales can edit accounts. Sales can only edit student accounts");
    }catch(e){
        return res.status(400).json({success: false, msg: e.message});
    }
}

export const get_students_handler = async (req: Request, res: Response, next: NextFunction) => {
    try{
        let {limit=20, offset=0, search="", sort="{}", filters="{}"} = req.query;

        limit = Number(limit) || 20;
        offset = Number(offset) || 0;
        sort = JSON.parse(sort) || {};
        filters = JSON.parse(filters) || {};
    
        const {students, total} = await get_students(limit, offset, search, sort, filters);

        return res.json({students, total, success: true});
    }catch(e){
        return res.status(400).json({success: false, msg: e.message});
    }
}

export const get_teachers_handler = async (req: Request, res: Response, next: NextFunction) => {
    try{
        let {limit=20, offset=0, search="", sort="{}", filters="{}"} = req.query;

        limit = Number(limit) || 20;
        offset = Number(offset) || 0;
        sort = JSON.parse(sort) || {};
        filters = JSON.parse(filters) || {};
    
        const {teachers, total} = await get_teachers(limit, offset, search, sort, filters);

        return res.json({teachers, total, success: true});
    }catch(e){
        return res.status(400).json({success: false, msg: e.message});
    }
}

export const get_admins_handler = async (req: Request, res: Response, next: NextFunction) => {
    try{
        let {limit=20, offset=0, search="", sort="{}", filters="{}"} = req.query;

        limit = Number(limit) || 20;
        offset = Number(offset) || 0;
        sort = JSON.parse(sort) || {};
        filters = JSON.parse(filters) || {};
    
        const {admins, total} = await get_admins(limit, offset, search, sort, filters);

        return res.json({admins, total, success: true});
    }catch(e){
        return res.status(400).json({success: false, msg: e.message});
    }
}

export const get_accounts_handler = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const {user} = req;
        let {limit=20, offset=0, search="", sort="{}", filters="{}"} = req.query;

        limit = Number(limit) || 20;
        offset = Number(offset) || 0;
        sort = JSON.parse(sort) || {};
        filters = JSON.parse(filters) || {};
        
        if(user.type === "admin" || (user.type === "sales" && filters.type === "student")){
            const {accounts, total} = await get_accounts(limit, offset, search, sort, filters);
            return res.json({accounts, total, success: true});
        }else{
            throw new Error("Only admin or sales can search accounts. Sales can only search student accounts");
        }

    }catch(e){
        return res.status(400).json({success: false, msg: e.message});
    }
}

export const get_account_handler = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const {user} = req;
        const {account_id} = req.params;
        
        if(user.type === "admin" || user.type === "sales"){
            const account = await get_account(account_id, user);

            if(account){
                return res.json({account, success: true});
            }

            return res.status(404).json({success: false, msg: "User not found."});
        }else{
            throw new Error("Only admin or sales can search accounts. Sales can only search student accounts");
        }

    }catch(e){
        return res.status(400).json({success: false, msg: e.message});
    }
}

export const set_class_teacher = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const {teacher, _class} = req.body;

        const updated_class = await add_teacher_to_class({teacher_id: teacher._id, class_id: _class._id});

        res.json({updated_class, success: true});
    }catch(e){
        return res.status(400).json({success: false, msg: e.message});
    }
}

export const admin_get_classes = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const {user} = req;
        let {limit=20, offset=0, search=""} = req.query;
        limit = Number(limit) || 20;
        offset = Number(offset) || 0;

        if((user.type === "admin") || (user.type === "sales")){
            const {classes, total} = await get_classes(limit, offset, search);
    
            res.json({classes, total, success: true});
        }else{
            return res.status(401).json({success: false, msg: "Only admins or sales can get all classes"});
        }
    }catch(e){
        res.status(400).json({success: false, msg: e.message});
    }
}