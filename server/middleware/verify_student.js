const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const {SECRET} = require("../config");

const Users = mongoose.model("user");
const User = Users;

module.exports = async (req, res, next) => {
    // console.log(req.session.AUTH, req.query.token, req.cookies["AUTH"]);
    
    if(req.session.AUTH || req.query.token || req.cookies["AUTH"]){
        const data = await jwt.verify(req.session.AUTH || req.query.token || req.cookies["AUTH"], SECRET);

        if(!data._id || (data.type !== "student")){
           return res.status(401).send("invalid token or not student.");
        }

        const latest_user = await Users.findOne({_id: data._id}, {password: 0}).catch(e => {
            console.log(e);
            return null;
        })

        if(latest_user && latest_user.type === "student"){
            req.user = latest_user;
            next();
        }else{
            console.log("User Not Found");
            return res.status(401).send("User Not Found or Not Admin. You are not authorized to view this content");    
        }
    }else{
       return res.status(401).send("you are not authorized to view this content");
    }
}