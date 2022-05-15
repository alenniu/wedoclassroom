const config = require("../config");
const mongoose = require("mongoose");

const init = () => {
    // if(!mongoose.connection){
        mongoose.connect(`${config.DB_HOST}/${config.DB_NAME}`, {useNewUrlParser: true, autoIndex: true, user: config.DB_USER, pass: config.DB_PASS}, (err) => {
            if(err){
                console.log("err connecting to database!!!", err);
                return
            }
            
            console.log(`successfully connected to database (${mongoose.connection.name}) attempted user: ${config.DB_USER?config.DB_USER:"Not Specified"}`);
        });
    // }
    
    const db = mongoose.connection;
    
    db.once("open", () => {
        console.log("connected to database!!!");
    });
    
    return db;
}

module.exports = init;