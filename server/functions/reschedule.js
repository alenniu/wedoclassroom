const mongoose = require("mongoose");

const Reschedules = mongoose.model("reschedule");
const Reschedule = Reschedules;

async function get_reschedule(reschedule_id, user){
    try{
        if(reschedule_id){
            return await Reschedules.findOne({_id: reschedule_id, $or: [{teacher: user._id}, {_id: {$exists: user.type === "admin"}}]}).populate({path: "teacher", select: "-password"})/*.populate({path: "handled_by", select: "-password"})*/.lean(true);
        }else{
            throw new Error("Reschedule ID must be provide");
        }
    }catch(e){
        throw (e);
    }
}

async function get_reschedules(limit=20, offset=0, filters={}, sort={}, user){
    filters = filters || {};

    if(!Array.isArray(filters.$or)){
        filters.$or = [];
    }

    filters.$or.push({teacher: user._id}, {_id: {$exists: user.type === "admin"}})

    try{
        const total = await Reschedules.count({filters});
        let reschedules = [];
        if(total){
            reschedules = await Reschedules.find(filters).skip(offset).limit(limit).sort(sort).populate({path: "teacher", select: "-password"})/*.populate({path: "handled_by", select: "-password"})*/.lean(true);
        }

        return {reschedules, total}; 
    }catch(e){
        throw (e);
    }
}

async function get_class_reschedules(_class, limit=20, offset=0, filters={}, sort={}, user){
    try{
        filters = filters || {};
        filters._class = _class._id;

        return await get_reschedules(limit, offset, filters, sort, user);
    }catch(e){
        throw e;
    }
}

async function create_reschedule_request({_class, reason="", old_date, old_start_time, old_end_time, new_date=null, new_start_time=null, new_end_time=null}){
    try{
        const new_reschedule = await (new Reschedule({_class: _class._id, teacher: _class.teacher._id, reason, old_date: new Date(old_date), old_start_time: new Date(old_start_time), old_end_time: new Date(old_end_time), new_date: new_date && new Date(new_date), new_start_time: new_start_time && new Date(new_start_time), new_end_time: new_end_time && new Date(new_end_time), accepted: false, rejected: false})).save();

        await new_reschedule.populate({path: "teacher", select: "-password"});
        await new_reschedule.populate({path: "_class"});
        // await new_reschedule.populate({path: "handled_by", select: "-password"});

        return new_reschedule;
    }catch(e){
        throw e;
    }
}

async function accept_reschedule_request(reschedule_id, {new_date, new_start_time, new_end_time}, user){
    try{
        return await Reschedules.findOneAndUpdate({_id: reschedule_id/*, rejected: false*/}, {$set: {accepted: true, rejected: false, handled_by: user._id, new_date: new Date(new_date), new_start_time: new Date(new_start_time), new_end_time: new Date(new_end_time)}}, {new: true, upsert: false}).populate({path: "teacher", select: "-password"})/*.populate({path: "handled_by", select: "-password"})*/.populate({path: "_class"}).lean(true);
    }catch(e){
        throw e;
    }
}

async function reject_reschedule_request(reschedule_id, user){
    try{
        return await Reschedules.findOneAndUpdate({_id: reschedule_id/*, accepted: false*/}, {$set: {rejected: true, accepted: false, handled_by: user._id}}, {new: true, upsert: false}).populate({path: "teacher", select: "-password"})/*.populate({path: "handled_by", select: "-password"})*/.populate({path: "_class"}).lean(true);
    }catch(e){
        throw e;
    }
}

module.exports.get_reschedule = get_reschedule;
module.exports.get_reschedules = get_reschedules;
module.exports.get_class_reschedules = get_class_reschedules;
module.exports.create_reschedule_request = create_reschedule_request;
module.exports.accept_reschedule_request = accept_reschedule_request;
module.exports.reject_reschedule_request = reject_reschedule_request;