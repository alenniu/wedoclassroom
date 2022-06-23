const mongoose = require("mongoose");
const { get_class } = require("./class");

const Announcements = mongoose.model("announcement");
const Announcement = Announcements;

async function create_announcement({_class, title, message, assignment=null}, user){
    try{
        if(_class && (assignment || (title && message))){
            title = title || assignment.title;
            message = message || assignment.description;

            const new_announcement = await ((new Announcement({_class: _class._id, user: user._id, assignment: assignment?._id, title, message})).save());

            await new_announcement.populate({path: "user", select: "-password"});
            await new_announcement.populate({path: "assignment"});

            return new_announcement;   
        }

        throw new Error("_class, title and message must be provided. Title and message can be omitted if assignment is provided");
    }catch(e){
        throw e;
    }
}

async function update_announcement({_id, title, message}, user){
    try{
        if(_id && title && message){
            const updated_announcement = await Announcement.updateOne({_id, user: user._id}, {$set: {title, message}}, {new: true, upsert: false});

            return updated_announcement;
        }

        throw new Error("_id, title and message must be provided.");
    }catch(e){
        throw e;
    }
}

async function get_announcement(announcement_id){
    try{
        return await Announcements.findOne({_id: announcement_id});
    }catch(e){
        throw e;
    }
}

async function get_class_announcements({class_id, user}, limit=20, offset=0, sort={}, filters={}){
    try{
        if(class_id){
            const current_class = await get_class(class_id, user);

            if(current_class){
                let announcements = [];
                let total = 0; 
                
                total = await Announcements.count({...filters});
                announcements = await Announcements.find({...filters}).populate({path: "user", select: "-password"}).populate({path: "assignment"}).limit(limit).skip(offset).sort(sort).lean(true);

                return {total, announcements};
            }

            throw new Error("Class not found");
        }

        throw new Error("_class must be provided");
    }catch(e){
        throw e;
    }
}

async function delete_announcement(announcement, user){
    try{
        if(announcement && announcement._id){
            return await Announcements.deleteOne({_id: announcement._id, user: user._id});
        }

        throw new Error("announcement must be provided");
    }catch(e){
        throw e;
    }
}

async function see_announcement(announcement, user){
    try{
        if(announcement && user){
            const current_announcement = await get_announcement(announcement._id);

            if(current_announcement){
                if(current_announcement.seen_by.findIndex((s) => s._id.toString() === user._id.toString()) === -1){
                    current_announcement.seen_by.push(user._id);
                    await current_announcement.save();
                }

                throw new Error("Already marked as seen");
            }

            throw new Error("Announcement not found");
        }

        throw new Error("Announcement and User must be provided");
    }catch(e){
        throw e;
    }
}

module.exports.see_announcement = see_announcement;
module.exports.get_announcement = get_announcement;
module.exports.create_announcement = create_announcement;
module.exports.update_announcement = update_announcement;
module.exports.delete_announcement = delete_announcement;
module.exports.get_class_announcements = get_class_announcements;