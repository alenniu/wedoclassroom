import {Request, Response, NextFunction} from "express";
import { get_requests } from "../functions/user";

export const get_requests_handler = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const {user} = req;
        const {limit=20, offset=0} = req.query;

        const {requests, total} = await get_requests(user._id, limit, offset);

        return res.json({requests, total, success: true});
    }catch(e){
        return res.status(400).json({success: false, msg: e.message});
    }
}