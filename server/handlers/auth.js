import {Request, Response, NextFunction} from "express";
import { create_stripe_customer } from "../integrations/stripe";
const { login, signup } = require("../functions/auth");
const { get_user_token, update_user } = require("../functions/user");

export const check_login_handler = async (req: Request, res: Response, next: NextFunction) => {
    const {user} = req;

    res.json({user: user, logged_in: !!user, success: true});
}

export const signup_handler = async (req: Request, res: Response, next: NextFunction) => {
    const {email, name, phone, password, birth, type, role} = req.body;
    
    try{
        let new_user = await signup({email, name, phone, password, birth, type, role});

        if(new_user.type === "student"){
            const stripe_customer = await create_stripe_customer({email, name: `${name.first} ${name.last}`, description: `MERN SCHOOL CUSTOMER: ${name.fisrt} ${name.last}`, phone});

            new_user = await update_user({_id: new_user._id, stripe_customer_id: stripe_customer.id}, new_user);
        }
        
        const token = get_user_token(new_user);
        
        req.session.AUTH = token;
        res.cookie("AUTH", token);
        res.json({user: new_user, logged_in: true, token, success: true});
    }catch(e){
        return res.status(400).json({success: false, msg: e.message});
    }
}

export const login_handler = async (req: Request, res: Response, next: NextFunction) => {
    const {email, password} = req.body;

    try{
        const user = await login({email, password});

        const token = get_user_token(user);

        req.session.AUTH = token;
        res.cookie("AUTH", token);
        res.json({user, logged_in: true, token, success: true});
    }catch(e){
        return res.status(400).json({success: false, msg: e.message});
    }
}

export const logout_handler = async (req: Request, res: Response, next: NextFunction) => {
    try{
        req.session.AUTH = "";
        res.cookie("AUTH", "");
        res.json({success: true});
    }catch(e){
        return res.status(400).json({success: false, msg: e.message});
    }
}