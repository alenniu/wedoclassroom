const mongoose = require("mongoose");
const { escape_regex } = require("./utils");

const Users = mongoose.model("user");
const User = Users;

async function get_teachers(limit=20, offset=0, search="", sort={}, filters={}){
    try{
        let teachers = [];
        let total = 0;

        if(search){
            const escaped_search = escape_regex(search);

            const search_regex = new RegExp(`${escaped_search}`, "i");

            total = await Users.count({...filters, $and: [{type: "teacher"}, {$or: [{"name.first": search_regex}, {"name.last": search_regex}, {email: search_regex}, {phone: search_regex}]}]});

            if(total){
                teachers = await Users.find({...filters, $and: [{type: "teacher"}, {$or: [{"name.first": search_regex}, {"name.last": search_regex}, {email: search_regex}, {phone: search_regex}]}]}, {password: 0}).collation({locale: "en"}).sort(sort).limit(limit).skip(offset).lean(true);
            }
        }else{
            total = await Users.count({...filters, type: "teacher"});

            if(total){
                teachers = await Users.find({...filters, type: "teacher"}, {password: 0}).collation({locale: "en"}).sort(sort).limit(limit).skip(offset).lean(true);
            }
        }

        return {total, teachers};
    }catch(e){
        throw e;
    }
}

async function get_students(limit=20, offset=0, search="", sort={}, filters={}){
    try{
        let students = [];
        let total = 0;

        if(search){
            let escaped_search = escape_regex(search);

            const search_regex = new RegExp(`${escaped_search}`, "i");

            total = await Users.count({...filters, $and: [{type: "student"}, {$or: [{"name.first": search_regex}, {"name.last": search_regex}, {email: search_regex}, {phone: search_regex}]}]});

            if(total){
                students = await Users.find({...filters, $and: [{type: "student"}, {$or: [{"name.first": search_regex}, {"name.last": search_regex}, {email: search_regex}, {phone: search_regex}]}]}, {password: 0}).collation({locale: "en"}).sort(sort).limit(limit).skip(offset).lean(true);
            }
        }else{
            total = await Users.count({...filters, type: "student"});

            if(total){
                students = await Users.find({...filters, type: "student"}, {password: 0}).collation({locale: "en"}).sort(sort).limit(limit).skip(offset).lean(true);
            }
        }

        return {students, total};
    }catch(e){
        throw e;
    }
}

async function get_admins(limit=20, offset=0, search="", sort={}, filters={}){
    try{
        let admins = [];
        let total = 0;

        if(search){
            const escaped_search = escape_regex(search);

            const search_regex = new RegExp(`${escaped_search}`, "i");

            total = await Users.count({...filters, $and: [{type: "admin"}, {$or: [{"name.first": search_regex}, {"name.last": search_regex}, {email: search_regex}, {phone: search_regex}]}]});

            if(total){
                admins = await Users.find({...filters, $and: [{type: "admin"}, {$or: [{"name.first": search_regex}, {"name.last": search_regex}, {email: search_regex}, {phone: search_regex}]}]}, {password: 0}).collation({locale: "en"}).sort(sort).limit(limit).skip(offset).lean(true);
            }
        }else{
            total = await Users.count({...filters, type: "admin"});

            if(total){
                admins = await Users.find({...filters, type: "admin"}, {password: 0}).collation({locale: "en"}).sort(sort).limit(limit).skip(offset).lean(true);
            }
        }

        return {admins, total};
    }catch(e){
        throw e;
    }
}

async function get_accounts(limit=20, offset=0, search="", sort={}, filters={}){
    try{
        let accounts = [];
        let total = 0;

        if(search){
            const escaped_search = escape_regex(search);

            const search_regex = new RegExp(`${escaped_search}`, "i");

            total = await Users.count({...filters, $or: [{"name.first": search_regex}, {"name.last": search_regex}, {email: search_regex}, {phone: search_regex}]});

            if(total){
                accounts = await Users.find({...filters, $or: [{"name.first": search_regex}, {"name.last": search_regex}, {email: search_regex}, {phone: search_regex}]}, {password: 0}).collation({locale: "en"}).sort(sort).limit(limit).skip(offset).lean(true);
            }
        }else{
            total = await Users.count({...filters});

            if(total){
                accounts = await Users.find({...filters}, {password: 0}).collation({locale: "en"}).sort(sort).limit(limit).skip(offset).lean(true);
            }
        }

        return {accounts, total};
    }catch(e){
        throw e;
    }
}

async function get_account(account_id, user){
    try{
        const q = {$and: [{_id: account_id}]};

        if(user.type === "sales"){
            q.$and.push({type: "student"})
        }

        const account = await Users.findOne(q, {password: 0}).lean(true); 

        return account;
    }catch(e){
        throw e;
    }
}

module.exports.get_admins = get_admins;
module.exports.get_account = get_account;
module.exports.get_teachers = get_teachers;
module.exports.get_students = get_students;
module.exports.get_accounts = get_accounts;