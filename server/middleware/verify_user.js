const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const {SECRET} = require("../config");

const Users = mongoose.model("user");
const User = Users;

module.exports = async (req, res, next) => {
    // console.log(req.session.AUTH, req.query.token, req.cookies["AUTH"]);
    
    if(req.session.AUTH || req.query.token || req.cookies["AUTH"]){
        const data = await jwt.verify(req.session.AUTH || req.query.token || req.cookies["AUTH"], SECRET);

        if(!data._id){
            console.log(data);
           return res.status(401).send("Invalid Token");
        }

        const latest_user = await Users.findOne({_id: data._id}, {password: 0}).catch(e => {
            console.log(e);
            return null;
        })

        if(latest_user){
            req.user = latest_user;
            next();
        }else{
            console.log("User Not Found");
            return res.status(401).send("User Not Found. You are not authorized to view this content");    
        }

    }else{
        console.log("no cookie");
        return res.status(401).send("you are not authorized to view this content");
    }
}