const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const {SECRET} = require("../config");
const { hash_password } = require("./auth");
const { validate_email, validate_password, password_requirements } = require("./utils");

const Users = mongoose.model("user");
const User = Users;

function get_user_token({name, phone, email, activated, _id, type, role, birth}){
    return jwt.sign({name, phone, email, activated, _id, type, role, birth}, SECRET);
}

async function user_exists(prop="email", value, projection={password: 0}){
    const q = {};

    q[prop] = value;
    return await Users.findOne(q, projection).catch((e) => {
        console.log(e);
        return null;
    });
}

async function create_user({name, email, phone, password, birth=Date.now(), type, role=""}, admin_user=null){
    try{
        if((type !== "student") || (admin_user && mongoose.isValidObjectId(admin_user._id))){
            if(validate_email(email) && validate_password(password) && birth && type && name.first && name.last){
                const hashed_password = hash_password(password);
        
                const new_user = await (new User({name, email, phone, password: hashed_password, birth: new Date(birth), type, activated: false, role, created_by: admin_user})).save();
    
                return new_user;
            }else{
                throw new Error("name, valid email, valid password, birth and account type must be provided. " + password_requirements);
            }
        }else{
            throw new Error("Students must be created by admins.");
        }
    }catch(e){
        console.error(e);
        throw new Error(e);
    }
}

async function update_user(user, existing_user){
    const {_id} = user;

    existing_user = existing_user || await user_exists("_id", _id);
    
    if(existing_user){
        try{
            delete user._id;
            delete user.email;
            delete user.password;
            
            return await Users.findOneAndUpdate({_id: existing_user._id}, {$set: user}, {new: true, upsert: false});
        }catch(e){
            console.error(e);
            throw new Error(e);
        }
    }else{
        throw new Error("User does not exist");
    }
}

module.exports.create_user = create_user;
module.exports.update_user = update_user;
module.exports.user_exists = user_exists;
module.exports.get_user_token = get_user_token;