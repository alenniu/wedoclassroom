const mongoose = require("mongoose")

const Requests = mongoose.model("request");
const Request = Requests;

async function get_request_by_id(request_id){
    try{
        return await Requests.findOne({_id: request_id});
    }catch(e){
        throw e;
    }
}

async function get_request(q){
    try{
        return await Requests.findOne(q);
    }catch(e){
        throw e;
    }
}

module.exports.get_request = get_request;
module.exports.get_request_by_id = get_request_by_id;