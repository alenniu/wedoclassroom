import {Request, Response, NextFunction} from "express";
import { get_accounts, get_admins, get_students, get_teachers } from "../functions/admin";
import { add_teacher_to_class, get_classes } from "../functions/class";

const { create_user, update_user } = require("../functions/user");

export const admin_create_user_handler = async (req: Request, res: Response, next: NextFunction) => {
    const {user} = req;
    const {email, name, phone, password, birth, type, role} = req.body;

    try{
        const new_user = await create_user({email, name, phone, password, birth, type, role}, user);

        delete new_user.password;

        return res.json({success: true, new_user});
    }catch(e){
        return res.status(400).json({success: true, msg: e.message});
    }
}

export const admin_update_user_handler = async (req: Request, res: Response, next: NextFunction) => {
    const {user} = req;
    const {account} = req.body;

    try{
        const updated_user = await update_user(account);

        delete updated_user.password;

        return res.json({success: true, updated_user});
    }catch(e){
        return res.status(400).json({success: true, msg: e.message});
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
        return res.status(400).json({success: true, msg: e.message});
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
        return res.status(400).json({success: true, msg: e.message});
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
        return res.status(400).json({success: true, msg: e.message});
    }
}

export const get_accounts_handler = async (req: Request, res: Response, next: NextFunction) => {
    try{
        let {limit=20, offset=0, search="", sort="{}", filters="{}"} = req.query;

        limit = Number(limit) || 20;
        offset = Number(offset) || 0;
        sort = JSON.parse(sort) || {};
        filters = JSON.parse(filters) || {};
    
        const {accounts, total} = await get_accounts(limit, offset, search, sort, filters);

        return res.json({accounts, total, success: true});
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

export const admin_get_classes = async (req: Request, res: Response, next: NextFunction) => {
    try{
        let {limit=20, offset=0, search=""} = req.query;
        limit = Number(limit) || 20;
        offset = Number(offset) || 0;

        const {classes, total} = await get_classes(limit, offset, search);

        res.json({classes, total, success: true});
    }catch(e){
        res.status(400).json({success: false, msg: e.message});
    }
}