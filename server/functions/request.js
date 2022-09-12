const mongoose = require("mongoose")

const Requests = mongoose.model("request");
const Request = Requests;

async function get_request_by_id(request_id){
    try{
        return await Requests.findOne({_id: request_id}).populate({path: "student", select: "-password"});
    }catch(e){
        throw e;
    }
}

async function get_request(q){
    try{
        return await Requests.findOne(q).populate({path: "student", select: "-password"});
    }catch(e){
        throw e;
    }
}

async function get_requests(limit=20, offset=0, sort={}, filters={}, user){
    try{
        let requests = [];
        const total = await Requests.countDocuments(filters);
        if(total){
            requests = await Request.find(filters).limit(limit).skip(offset).populate({path: "student", select: "-password"}).populate({path: "_class", populate: {path: "teacher", select: "-password"}}).populate({path: "handled_by", select: "-password"});
        }

        return {requests, total}
    }catch(e){
        throw e;
    }
}

module.exports.get_request = get_request;
module.exports.get_requests = get_requests;
module.exports.get_request_by_id = get_request_by_id;