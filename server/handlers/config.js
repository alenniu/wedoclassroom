import {Request, Response, NextFunction} from "express";
import { get_or_create_config, update_config } from "../functions/config";

export const get_config_handler = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const {user} = req;
        const app_config = await get_or_create_config();

        res.json({success: true, config: app_config});
    }catch(e){
        return res.status(400).json({success: false, msg: e.message});
    }
}

export const update_config_handler = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const {user} = req;
        const {updated_config} = req.body;

        if(user.type === admin){
            const app_config = await update_config(updated_config);
            return res.json({success: true, config: app_config});
        }

        throw new Error("Only admin can update config");
    }catch(e){
        return res.status(400).json({success: false, msg: e.message});
    }
}