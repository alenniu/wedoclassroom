const mongoose = require("mongoose");
const { escape_regex } = require("./utils");

const Users = mongoose.model("user");
const User = Users;

async function get_teachers(limit=20, offset=0, search=""){
    try{
        let teachers = [];
        if(search){
            const escaped_search = escape_regex(search);

            const search_regex = new RegExp(`${escaped_search}`, "i");

            teachers = await Users.find({$and: [{type: "teachers"}, {$or: [{"name.first": search_regex}, {"name.last": search_regex}, {email: search_regex}, {phone: search_regex}]}]}).limit(limit).skip(offset).lean(true);
        }else{
            teachers = await Users.find({type: "teachers"}).limit(limit).skip(offset).lean(true);
        }

        return teachers;
    }catch(e){
        throw e;
    }
}

async function get_students(limit=20, offset=0, search=""){
    try{
        let students = [];
        if(search){
            let escaped_search = escape_regex(search);

            const search_regex = new RegExp(`${escaped_search}`, "i");

            students = await Users.find({$and: [{type: "student"}, {$or: [{"name.first": search_regex}, {"name.last": search_regex}, {email: search_regex}, {phone: search_regex}]}]}).limit(limit).skip(offset).lean(true);
        }else{
            students = await Users.find({type: "student"}).limit(limit).skip(offset).lean(true);
        }

        return students;
    }catch(e){
        throw e;
    }
}

async function get_admins(limit=20, offset=0, search=""){
    try{
        let admins = [];
        if(search){
            const escaped_search = escape_regex(search);

            const search_regex = new RegExp(`${escaped_search}`, "i");

            admins = await Users.find({$and: [{type: "admin"}, {$or: [{"name.first": search_regex}, {"name.last": search_regex}, {email: search_regex}, {phone: search_regex}]}]}).limit(limit).skip(offset).lean(true);
        }else{
            admins = await Users.find({type: "admin"}).limit(limit).skip(offset).lean(true);
        }

        return admins;
    }catch(e){
        throw e;
    }
}

module.exports.get_admins = get_admins;
module.exports.get_teachers = get_teachers;
module.exports.get_students = get_students;