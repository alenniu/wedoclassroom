const mongoose = require("mongoose");
const { escape_regex } = require("./utils");

const Classes = mongoose.model("class");
const Class = Classes;

const Requests = mongoose.model("request");
const Request = Requests;

async function get_class(class_id){
    try{
        return Classes.findOne({_id: class_id});
    }catch(e){
        throw e;
    }
}

async function get_classes(limit=20, offset=0, search=""){
    try{
        let classes = [];
        let total = 0;

        if(search){
            let escaped_search = escape_regex(search);

            const search_regex = new RegExp(`${escaped_search}`, "i");

            total = await Classes.count({$or: [{subject: search_regex}, {tags: search_regex}]});

            if(total){
                classes = await Classes.find({$or: [{subject: search_regex}, {tags: search_regex}]}).limit(limit).skip(offset).lean(true);
            }
        }else{
            total = await Classes.count({});
            if(total){
                classes = await Classes.find({}).limit(limit).skip(offset).lean(true);
            }
        }

        return {classes, total};
    }catch(e){
        throw e;
    }
}

async function get_user_classes(user, limit=20, offset=0, search=""){
    try{
        const {_id} = user;
        let classes = [];
        let total = 0;

        if(search){
            let escaped_search = escape_regex(search);

            const search_regex = new RegExp(`${escaped_search}`, "i");

            total = await Classes.count({$and: [{$or: [{teacher: _id}, {students: _id}, {created_by: _id}]}, {$or: [{subject: search_regex}, {tags: search_regex}]}]});

            if(total){
                classes = await Classes.find({$and: [{$or: [{teacher: _id}, {students: _id}, {created_by: _id}]}, {$or: [{subject: search_regex}, {tags: search_regex}]}]}).limit(limit).skip(offset).lean(true);
            }
        }else{
            total = await Classes.count({$or: [{teacher: _id}, {students: _id}, {created_by: _id}]});

            if(total){
                classes = await Classes.find({$or: [{teacher: _id}, {students: _id}, {created_by: _id}]}).limit(limit).skip(offset).lean(true);
            }
        }

        return {classes, total};
    }catch(e){
        console.log(e);
        throw e;
    }
}

async function create_class({subject, teacher=null, tags=[]}, creator){
    try{
        if(subject){
            const new_class = await ((new Class({subject, teacher: teacher?._id || null, tags, created_by: creator._id})).save());

            return new_class;
        }else{
            throw new Error("subject must be provided")
        }
    }catch(e){
        throw e;
    }
}

async function add_student_to_class({student_id, class_id}){
    try{
        if(student_id && class_id){
            const updated_class = await Classes.findOneAndUpdate({_id: class_id}, {$push: {students: student_id}}, {new: true, upsert: false});

            return updated_class;
        }else{
            throw new Error("student_id and class_id must be provided")
        }
    }catch(e){
        throw e;
    }
}

async function add_teacher_to_class({teacher_id, class_id}){
    try{
        if(teacher_id && class_id){
            const updated_class = await Classes.findOneAndUpdate({_id: class_id}, {$set: {teacher: teacher_id}}, {new: true, upsert: false});

            return updated_class;
        }else{
            throw new Error("teacher_id and class_id must be provided")
        }
    }catch(e){
        throw e;
    }
}

async function request_class({_class, student}){
    try{
        if(_class && student){
            const new_request = await ((new Request({_class: _class._id, student: student._id})).save());

            return new_request;
        }else{
            throw new Error("_class and student must be provide")
        }
    }catch(e){
        throw e;
    }
}

async function accept_request({request_id}, handler){ //handler is the user accepting/declining the request
    try{
        if(request_id){
            const request = await Requests.findOneAndUpdate({_id: request_id}, {$set: {accepted: true, declined: false, handled_by: handler._id}}, {new: true, upsert: false, });

            const updated_class = await add_student_to_class({student_id: request.student, class_id: request._class})

            return {request, updated_class};
        }else{
            throw new Error("no request provided");
        }
    }catch(e){
        throw e;
    }
}

async function decline_request({request_id}, handler){ //handler is the user accepting/declining the request
    try{
        if(request_id){
            const request = await Requests.findOneAndUpdate({_id: request_id}, {$set: {accepted: false, declined: true, handled_by: handler._id}}, {new: true, upsert: false, });

            return request;
        }else{
            throw new Error("no request provided");
        }
    }catch(e){
        throw e;
    }
}

async function add_attachment_to_class({attachment, class_id}){
    try{
        if(attachment && class_id){
            const updated_class = await Classes.findOneAndUpdate({_id: class_id}, {$push: attachment._id});

            return updated_class;
        }else{
            throw new Error("attachment and class_id must be provided")
        }
    }catch(e){
        throw e;
    }
}

module.exports.get_class = get_class;
module.exports.get_classes = get_classes;
module.exports.create_class = create_class;
module.exports.request_class = request_class;
module.exports.accept_request = accept_request;
module.exports.decline_request = decline_request;
module.exports.get_user_classes = get_user_classes;
module.exports.add_teacher_to_class = add_teacher_to_class;
module.exports.add_attachment_to_class = add_attachment_to_class;
