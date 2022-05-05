import {Request, Response, NextFunction} from "express";

const { login, signup } = require("../functions/auth");
const { get_user_token } = require("../functions/user");

export const check_login_handler = async (req: Request, res: Response, next: NextFunction) => {
    const {user} = req;

    res.json({user: user, logged_in: !!user, success: true});
}

export const signup_handler = async (req: Request, res: Response, next: NextFunction) => {
    const {email, name, phone, password, birth, type, role} = req.body;
    
    try{
        const new_user = await signup({email, name, phone, password, birth, type, role});
        
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