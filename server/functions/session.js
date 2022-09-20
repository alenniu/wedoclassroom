const mongoose = require("mongoose");
const { toMoneyString } = require("../../src/Utils");

const Users = mongoose.model("user");
const User = Users;

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

async function create_session({_class, duration_hours=1, meeting_link=""}, user){
    try{
        const current_date = new Date();
        const students = await Users.find({_id: _class.students.map((s) => s._id)});

        const students_session_info = [];

        for(const student of students){
            const student_info = _class.students_info.find((si) => si.student.toString() === student._id.toString());

            const price_to_charge = (student_info?.price_paid ?? _class.price);
            const difference = (-(price_to_charge)) * duration_hours;
            const new_amount = student.credits + difference;

            const credit_log = {previous_amount: student.credits, new_amount, difference, date: current_date, note: `Charge for class "${_class.title}" at ${toMoneyString(price_to_charge, "en-US", "USD")}/hr for ${duration_hours} hr${duration_hours===1?"":"s"}`}

            student.credit_logs = student.credit_logs || [];

            student.credits = new_amount;
            student.credit_logs.unshift(credit_log);
            await student.save();

            students_session_info.push({student: student._id, credit_log});

            // console.log("student", student);
            // console.log("student info", student_info);
            // console.log("class students info", _class.students_info);
            // console.log("credit info", student.credit_logs, student.credits);
        }

        const new_session = await (new Session({_class: _class._id, students: _class.students.map((s) => s._id), students_session_info, teacher: user._id, active: true, meeting_link, scheduled_duration_hrs: duration_hours, start_time: new Date(), end_time: null})).save();

        await new_session.populate({path: "students", select: "-password"})

        return new_session;
    }catch(e){
        console.error(e);
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