const md5 = require("blueimp-md5");
const {KEY} = require("../config");
const { create_user, user_exists } = require("./user");
const { validate_email } = require("./utils");

function hash_password(password){
    if(password){
        return md5(password, KEY)
    }

    throw new Error("no password provided");
}

async function signup({email, name, phone, password, birth, type, role}){
    try{
        const admin_user = (type === "admin") && await user_exists("type", "admin");

        if(admin_user){
            throw new Error("Admin account already exists");
        }

        const user = await create_user({email, name, phone, password, birth, type, role});

        return user;
    }catch(e){
        console.error(e);
        throw e;
    }
}

async function login({email, password}){
    if(validate_email(email) && password){ // not validating password here
        try{
            let requested_user = await user_exists("email", email, {_id: 1, password: 1});

            if(requested_user){
                const hashed_password = hash_password(password);

                if(hashed_password === requested_user.password){
                    return await user_exists("_id", requested_user._id);
                }else{
                    throw new Error("Incorrect email or password used.")
                }
            }else{
                throw new Error(`User with email "${email}" not found.`);
            }
        }catch(e){
            console.error(e);
            throw e;
        }
    }else{
        throw new Error("valid email and password must be provided");
    }
}

export {login};
export {signup};
export {hash_password};