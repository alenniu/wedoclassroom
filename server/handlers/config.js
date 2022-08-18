import {Request, Response, NextFunction} from "express";
import { get_or_create_config, update_config } from "../functions/config";
import { SOCKET_EVENT_APP_CONFIG } from "../socket_events";

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
        const {user, file=null, files=[], socket_io} = req;
        let {config='{}'} = req.body;

        config = JSON.parse(config);

        if(user.type === "admin"){
            const app_config = await update_config(config);

            // console.log(config, app_config);
            
            socket_io?.except(user._id.toString()).emit(SOCKET_EVENT_APP_CONFIG, app_config);

            return res.json({success: true, config: app_config});
        }

        throw new Error("Only admin can update config");
    }catch(e){
        return res.status(400).json({success: false, msg: e.message});
    }
}