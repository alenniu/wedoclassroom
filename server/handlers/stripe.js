import {Request, Response, NextFunction} from "express";
import { STRIPE_GROUP_CLASS_PRICE_ID, STRIPE_PRIVATE_CLASS_PRICE_ID } from "../config";
import { create_stripe_customer, create_stripe_payment_intent, create_stripe_session } from "../integrations/stripe";
import { update_user } from "../functions/user";

async function add_stripe_customer_id(user){
    const {_id, email, name, phone} = user;
    const stripe_customer = await create_stripe_customer({email, name: `${name.first} ${name.last}`, description: `MERN SCHOOL CUSTOMER: ${name.fisrt} ${name.last}`, phone});

    user = await update_user({_id, stripe_customer_id: stripe_customer.id}, user);

    return user;
}

export const create_stripe_session_handler = async (req: Request, res: Response, next: NextFunction) => {
    try{
        let {user} = req;
        const {customer_email, item="GROUP"} = req.body;
    
        if(item){
            const is_group = item === "GROUP";

            if(!user.stripe_customer_id){
                user = await add_stripe_customer_id(user); 
            }

            const line_items = [{price: is_group?STRIPE_GROUP_CLASS_PRICE_ID:STRIPE_PRIVATE_CLASS_PRICE_ID, quantity: 1, adjustable_quantity: {enabled: false}}]
    
            const stripe_session = await create_stripe_session({customer_email: customer_email || user.email, line_items, automatic_tax: {enabled: false}});

            // console.log("stripe_session", stripe_session);

            return res.json({success: true, session: stripe_session});
        }else{
            throw new Error("No item provided");
        }
    }catch(e){
        console.error(e);
        return res.status(400).json({success: false, msg: e.message});
    }
}

export const create_stripe_payment_intent_handler = async (req: Request, res: Response, next: NextFunction) => {
    try{
        let {user} = req;
        const {receipt_email, items=["GROUP"]} = req.body;
        
        if(items.length){
            const amount = 2500;
            
            if(!user.stripe_customer_id){
                user = await add_stripe_customer_id(user);
            }
            
            const payment_intent = await create_stripe_payment_intent({amount, currency: "usd", customer: user.stripe_customer_id, description: "[TEST] MERN SCHOOL", receipt_email: receipt_email || user.email});
            
            // console.log("payment_intent", payment_intent);
            
            return res.json({success: true, intent: payment_intent});
        }else{
            throw new Error("No items provided");
        }
    }catch(e){
        console.error(e);
        return res.status(400).json({success: false, msg: e.message});
    }
}