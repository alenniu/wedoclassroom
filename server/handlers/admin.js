import {Request, Response, NextFunction} from "express";

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