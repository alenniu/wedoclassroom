const mongoose = require("mongoose");

const Sessions = mongoose.model("class_session");
const Session = Sessions;

async function get_sessions(limit=20, offset=0, sort={}, filters={}, user){
    try{
        let total = 0;
        let sessions = [];

        if((user.type !== "admin") && (user.type !== "sales")){
            filters.teacher = user._id
        }
        
        total = await Session.count({...filters});
        if(total){
            sessions = await Sessions.find({...filters}).limit(limit).skip(offset).sort(sort).populate({path: "_class"}).populate({path: "teacher", select: "-password"})
        }

        return {sessions, total};
    }catch(e){
        throw e;
    }
}

async function get_class_sessions({class_id}, limit=20, offset=0, sort={}, filters={}){
    try{
        let total = 0;
        let sessions = [];
        
        total = await Session.count({...filters, _class: class_id});
        if(total){
            sessions = await Sessions.find({...filters, _class: class_id}).limit(limit).skip(offset).sort(sort).populate({path: "teacher", select: "-password"});
        }

        return {sessions, total};
    }catch(e){
        throw e;
    }
}

async function create_session({_class, meeting_link=""}, user){
    try{
        const new_session = await (new Session({_class: _class._id, students: _class.students.map((s) => s._id), teacher: user._id, active: true, meeting_link, start_time: new Date(), end_time: null})).save();

        await new_session.populate({path: "students", select: "-password"})

        return new_session;
    }catch(e){
        throw e;
    }
}

async function update_session(session={}, user){
    try{
        delete session._class;
        delete session.teacher;
        delete session.start_time;
        delete session.end_time;
        delete session.students; // maybe allow updating of students

        const updated_session = await Sessions.findOneAndUpdate({_id: session._id}, {$set: session}, {new: true, upsert: false}).populate({path: "students", select: "-password"});

        return updated_session;
    }catch(e){
        throw e;
    }
}

async function end_session({_class}, user){
    try{
        const {active} = await Session.findOne({_id: _class.current_session, _class: _class._id, teacher: user._id}, {active: 1});

        if(active){
            const updated_session = await Sessions.findOneAndUpdate({_id: _class.current_session, _class: _class._id, teacher: user._id}, {$set: {active: false, end_time: Date.now()}}, {new: true, upsert: false}).populate({path: "students", select: "-password"});
    
            return updated_session;
        }

        throw new Error("Session has already ended");
    }catch(e){
        throw e;
    }
}

module.exports.end_session = end_session;
module.exports.get_sessions = get_sessions;
module.exports.create_session = create_session;
module.exports.update_session = update_session;
module.exports.get_class_sessions = get_class_sessions;