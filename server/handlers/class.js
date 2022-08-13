import axios from "axios";
import mongoose from "mongoose";
import {Request, Response, NextFunction} from "express";
import { accept_request, cancel_class, create_attendance, create_class, decline_request, end_class, get_available_classes, get_class, get_classes, get_classes_schedules, get_class_attendance, get_class_payment_intent, get_user_classes, remove_student_from_class, request_class, set_meeting_link, start_class, uncancel_class, update_attendance, update_class } from "../functions/class";
import { get_request } from "../functions/request";
import { DAY } from "../../src/Data";

const Classes = mongoose.model("class");
const Class = Classes;

export const create_class_handler = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const {user, file} = req;
        let {_class="{}"} = req.body;

        _class = JSON.parse(_class)
        
        if((user.type === "admin") || (user.type === "teacher")){
            let {title, subject, description, cover_image="", teacher=null, class_type, max_students=1, level, price=0, tags=[], bg_color="#000000", text_color="#FFFFFF", schedules=[], start_date, end_date, billing_period, meeting_link} = _class;

            cover_image = file?`${file.destination}/${file.filename}`:cover_image;
        
            if(user.type === "teacher"){
                teacher = user._id;
            }
        
            const new_class = await create_class({title, subject, cover_image, description, teacher, class_type, max_students, level, price, tags, bg_color, text_color, schedules, start_date, end_date, billing_period, meeting_link}, user);

            return res.json({success: true, _class: new_class});
        }else{
            throw new Error("Only admins or teachers can create classes");
        }
    }catch(e){
        return res.status(400).json({success: false, msg: e.message});
    }
}

export const update_class_handler = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const {user, file} = req;
        let {_class="{}"} = req.body;

        _class = JSON.parse(_class)

        const current_class = get_class(_class._id, user);
        
        if((user.type === "admin") || (user.type === "teacher" && user._id.toString() === current_class.teacher._id.toString())){
            let {title, subject, description, cover_image="", teacher=null, class_type, max_students=1, level, price=0, tags=[], bg_color="#000000", text_color="#FFFFFF", schedules=[], start_date, end_date, billing_schedule, meeting_link, students=[]} = _class;

            cover_image = file?`${file.destination}/${file.filename}`:cover_image;
        
            if(user.type === "teacher"){
                teacher = user._id;
            }
        
            const updated_class = await update_class({_id: _class._id, title, subject, cover_image, description, teacher, class_type, max_students, level, price, tags, bg_color, text_color, schedules, start_date, end_date, billing_schedule, meeting_link, students}, user);

            return res.json({success: true, _class: updated_class});
        }else{
            throw new Error("Only admins or class' teachers can update classes");
        }
    }catch(e){
        return res.status(400).json({success: false, msg: e.message});
    }
}

export const cancel_class_handler = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const {user} = req;
        let {class_id} = req.body;

        const current_class = await get_class(class_id, user);
        
        if((user.type === "admin") || (user.type === "teacher") && current_class){

            const cancelled_class = await cancel_class(class_id, user);

            return res.json({success: true, _class: cancelled_class});
        }else{
            throw new Error("Only admins or teachers can cancel classes");
        }
    }catch(e){
        return res.status(400).json({success: false, msg: e.message});
    }
}

export const uncancel_class_handler = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const {user} = req;
        let {class_id} = req.body;

        const current_class = await get_class(class_id, user);
        
        if((user.type === "admin") || (user.type === "teacher") && current_class){

            const uncancelled_class = await uncancel_class(class_id, user);

            return res.json({success: true, _class: uncancelled_class});
        }else{
            throw new Error("Only admins or teachers can cancel classes");
        }
    }catch(e){
        return res.status(400).json({success: false, msg: e.message});
    }
}

export const start_class_handler = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const {user} = req;
        const {class_id} = req.params;
        const {meeting_link=""} = req.body;
        
        const current_class = await get_class(class_id, user);

        if(current_class){
            const {updated_class, new_session} = await start_class({_class: current_class, meeting_link}, user);

            return res.json({success: true, updated_class, new_session});
        }else{
            throw new Error("only class teachers can start class");
        }
    }catch(e){
        return res.status(400).json({success: false, msg: e.message});
    }
}

export const end_class_handler = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const {user} = req;
        const {class_id} = req.params;
        
        const current_class = await get_class(class_id, user);

        if(current_class){
            const {updated_class, updated_session} = await end_class({_class: current_class}, user);

            return res.json({success: true, updated_class, updated_session});
        }else{
            throw new Error("only class teachers can start class");
        }
    }catch(e){
        return res.status(400).json({success: false, msg: e.message});
    }
}

export const set_class_meeting_link_handler = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const {user} = req;
        const {class_id} = req.params;
        const {meeting_link=""} = req.body;
        
        const current_class = await get_class(class_id, user);

        if(current_class){
            const updated_class = await set_meeting_link({_class: current_class, meeting_link}, user);

            return res.json({success: true, updated_class});
        }else{
            throw new Error("only class teachers can start class");
        }
    }catch(e){
        return res.status(400).json({success: false, msg: e.message});
    }
}

export const request_class_handler = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const {user} = req;

        let {_class} = req.body;

        const current_class = await Classes.findOne({_id: _class._id});
    
        
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

            const _class = await get_class(request._class, user);
        
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

export const remove_class_student_request_handler = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const {user} = req;
        const {class_id} = req.params;
        const {student_id} = req.query;

        if((user.type === "admin") || (user.type === "teacher")){
            const _class = await get_class(class_id, user);
        
            if((user.type === "admin") || (user._id.toString() === _class.teacher._id.toString())){
                const updated_class = await remove_student_from_class({class_id, student_id});

                return res.json({success: true, updated_class});
            }else{
                throw new Error("Only this class' teacher or an admin can remove a student");
            }
        }else{
            throw new Error("Only admins or teachers can remove students");
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

            const _class = await get_class(request._class, user);
        
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

export const get_class_handler = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const {user} = req;
        let {class_id} = req.params;

        if(class_id){
            const _class = await get_class(class_id, user);
            if(_class){
                return res.json({success: true, _class});
            }else{
                throw new Error("Class not found. If you are sure it exists, make sure you are a teacher/student of the class");
            }
        }else{
            throw new Error("No class id provided");
        }
    }catch(e){
        return res.status(400).json({msg: e.message, success: false});
    }
}

export const get_available_classes_handler = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const {user} = req;
        let {limit=20, offset=0, search="", sort="{}", filters="{}"} = req.query;

        limit = Number(limit) || 20;
        offset = Number(offset) || 0;
        sort = JSON.parse(sort) || {};
        filters = JSON.parse(filters) || {};
        
        const {classes, total} = await get_available_classes(limit, offset, search, sort, filters);

        return res.json({classes, total, success: true})
    }catch(e){
        return res.status(400).json({success: false, msg: e.message});
    }
}

export const get_classes_by_subject_handler = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const {user} = req;
        const {subject} = req.params;

        let {limit=20, offset=0, search="", sort="{}", filters="{}"} = req.query;

        limit = Number(limit) || 20;
        offset = Number(offset) || 0;
        sort = JSON.parse(sort) || {};
        filters = JSON.parse(filters) || {};

        filters.subject = subject
        
        const {classes, total} = await get_classes(limit, offset, search, sort, filters);

        return res.json({classes, total, subject, success: true})
    }catch(e){
        return res.status(400).json({success: false, msg: e.message});
    }
}

export const get_user_classes_handler = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const {user} = req;
        let {limit=20, offset=0, search="", sort="{}", filters="{}"} = req.query;

        limit = Number(limit) || 20;
        offset = Number(offset) || 0;
        sort = JSON.parse(sort) || {};
        filters = JSON.parse(filters) || {};
        
        const {classes, total} = await get_user_classes(user, limit, offset, search, sort, filters);

        return res.json({classes, total, success: true})
    }catch(e){
        return res.status(400).json({success: false, msg: e.message});
    }
}

export const get_class_attendance_handler = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const {user} = req;
        let {class_id, filters="{}"} = req.query;
        
        filters = JSON.parse(filters);

        const current_class = await get_class(class_id, user);

        if(current_class.teacher._id.toString() === user._id.toString()){
            const class_attendance = await get_class_attendance(current_class, filters);

            return res.json({success: true, attendance: class_attendance});
        }else{
            return res.status(400).json({success: false, msg: "Only the class teacher can get class attendance"})
        }
    }catch(e){
        console.log(e);
        return res.status(400).json({success: false, msg: e.message});
    }
}

export const create_student_attendance_handle = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const {user} = req;
        const {_class, student, remarks="", early, present} = req.body;

        const current_class = await get_class(_class._id, user);

        if(current_class.teacher._id.toString() === user._id.toString()){
            const student_attendance = await create_attendance({_class: current_class, student, remarks, early, present});

            return res.json({success: true, student_attendance});
        }else{
            return res.status(400).json({success: false, msg: "Only the class teacher can update student attendance"})
        }
    }catch(e){
        return res.status(400).json({success: false, msg: e.message});
    }
}

export const update_student_attendance_handle = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const {user} = req;
        const {_class, student, remarks="", early, present} = req.body;

        const current_class = await get_class(_class._id, user);

        if(current_class.teacher._id.toString() === user._id.toString()){
            const student_attendance = await update_attendance({_class: current_class, student, remarks, early, present});

            return res.json({success: true, student_attendance});
        }else{
            return res.status(400).json({success: false, msg: "Only the class teacher can update student attendance"})
        }
    }catch(e){
        return res.status(400).json({success: false, msg: e.message});
    }
}

export const get_class_client_secret_handler = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const {user} = req;
        const {class_id} = req.query;
        
        if(class_id){
            const payment_intent = await get_class_payment_intent(class_id, user);

            return res.json({success: true, client_secret: payment_intent.client_secret});
        }else{
            return res.status(400).json({success: false, msg: "class_id must be provided"});
        }
    }catch(e){
        console.log(e);
        return res.status(400).json({success: false, msg: e.message});
    }
}

export const get_classes_schedules_handler = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const {user} = req;
        let {filters="{}", search="", startPeriod=Date.now(), endPeriod=Date.now()+(7*DAY)} = req.query;

        filters = JSON.parse(filters);
        
        const classes_schedules = await get_classes_schedules({startPeriod, endPeriod}, filters, search, user);

        // console.log("class_schedules", class_schedules);

        return res.json({success: true, classes_schedules});
    }catch(e){
        console.log(e);
        return res.status(400).json({success: false, msg: e.message});
    }
}