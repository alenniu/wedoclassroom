const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const {SECRET} = require("../config");

const Users = mongoose.model("user");
const User = Users;

module.exports = async (req, res, next) => {
    // console.log(req.session.AUTH, req.query.token, req.cookies["AUTH"]);
    req.user = false;
    
    if(req.session.AUTH || req.query.token || req.cookies["AUTH"]){
        const data = jwt.verify(req.session.AUTH || req.query.token || req.cookies["AUTH"], SECRET);

        if(data._id){
            // console.log(data);
            const latest_user = await Users.findOne({_id: data._id}, {password: 0}).catch(e => {
                console.log(e);
                return null;
            });

            if(latest_user){
                req.user = latest_user;
            }
        }
    }

    next();
}