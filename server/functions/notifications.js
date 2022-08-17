const mongoose = require("mongoose");

const Notifications = mongoose.model("notification");
const Notification = Notifications;

async function create_notification({type="", text, from=null, attachments=[], to=[], metadata={}, everyone_of_type=[], everyone=false, excluded_users=[]}, user){
    try{
        if(text && ((to.length > 0) || (everyone_of_type.some(t => t)) || (everyone && user.type==="admin"))){
            const new_notification = await (new Notification({type, text, attachments, from, to: to.map((_id) => ({user: _id, read: false})), metadata, everyone_of_type, everyone, excluded_users, read_by: []})).save();

            await new_notification.populate("attachments");
            await new_notification.populate({path: "from", select: "-password"});

            return new_notification;
        }else{
            throw new Error("Notification `text` and must be sent to at least on person must be provided");
        }
    }catch(e){
        throw e;
    }
}

async function get_notifications(user, limit=20, offset=0, sort={}, filters={}){
    try{
        filters = filters ||  {};
        if(!Array.isArray(filters.$and)){
            filters.$and = [];
        }

        filters.$and.push({$or: [{everyone: true}, {everyone_of_type: user.type}, {"to.user": user._id}]}, {excluded_users: {$ne: user._id}});

        let notifications = [];
        const total = await Notifications.countDocuments(filters);
        
        if(total){
            notifications = await Notifications.find(filters, {to: 0, read_by: 0, excluded_users: 0, everyone_of_type: 0}).limit(limit).skip(offset).sort(sort).populate({path: "from", select: "-password"}).populate("attachments").lean(true);
        }

        return {total, notifications};
    }catch(e){
        throw e;
    }
}

async function read_notifications(notification_ids=[], user){
    try{
        if(notification_ids.length && Array.isArray(notification_ids)){
            return await Notifications.updateMany({_id: notification_ids, $or: [{"to.user": user._id}, {read_by: {$ne: user._id}}]}, {$set: {"to.$.read": true}, $push: {read_by: user._id}}, {new: true, upsert: false});
        }else{
            throw new Error("notification_ids must be an array of at least one id")
        }
    }catch(e){
        throw e;
    }
}

async function unread_notifications(notification_ids=[], user){
    try{
        if(notification_ids.length && Array.isArray(notification_ids)){
            return await Notifications.updateMany({_id: notification_ids, $or: [{"to.user": user._id}, {read_by: user._id}]}, {$set: {"to.$.read": false}, $pull: {read_by: user._id}}, {new: true, upsert: false});
        }else{
            throw new Error("notification_ids must be an array of at least one id")
        }
    }catch(e){
        throw e;
    }
}

async function get_unread_notification_count(user){
    try{
        return await Notifications.countDocuments({$and: [{$or: [{to: {$elemMatch: {user: user._id, read: false}}}, {everyone: true}, {everyone_of_type: user.type}]}, {excluded_users: {$ne: user._id}}], read_by: {$ne: user._id}});
    }catch(e){
        throw e;
    }
}

module.exports.get_notifications = get_notifications;
module.exports.read_notifications = read_notifications;
module.exports.create_notification = create_notification;
module.exports.unread_notifications = unread_notifications;
module.exports.get_unread_notification_count = get_unread_notification_count;