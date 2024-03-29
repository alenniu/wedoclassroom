const session = require("express-session");
const mongoose = require("mongoose");
const { create_session, end_session, update_session } = require("./session");
const { create_stripe_payment_intent, create_stripe_customer } = require("../integrations/stripe");
const { escape_regex } = require("./utils");

const Classes = mongoose.model("class");
const Class = Classes;

const Requests = mongoose.model("request");
const Request = Requests;

const Attendances = mongoose.model("attendance");
const Attendance = Attendances;

async function get_class(class_id, user){
    try{
        const {_id, type} = user;

        return await Classes.findOne({_id: class_id, $or: [{teacher: _id}, {students: _id}, {created_by: _id}, {_id: {$exists: (type === "admin") || (type === "sales")}}]}).populate({path: "teacher", select: "-password" }).populate({path: "students", select: "-password"}).populate({path: "current_session", populate: {path: "students", select: "-password"}}).populate({path: "sessions"});
    }catch(e){
        console.error(e);
        throw e;
    }
}

async function populate_common_class_feilds(_class){
    await _class.populate({path: "sessions"});
    await _class.populate({path: "teacher", select: "-password" });
    await _class.populate({path: "students", select: "-password"});
    await _class.populate({path: "current_session", populate: {path: "students", select: "-password"}});

    return _class;
}

async function get_available_classes(limit=20, offset=0, search="", sort={}, filters={}){
    try{
        let classes = [];
        let total = 0;

        if(search){
            let escaped_search = escape_regex(search);

            const search_regex = new RegExp(`${escaped_search}`, "i");

            total = await Classes.count({is_full: false, $or: [{archived: false}, {archived: {$exists: false}}], ...filters, $or: [{subject: search_regex}, {tags: search_regex}, {title: search_regex}, {description: search}]});

            if(total){
                classes = await Classes.find({is_full: false, $or: [{archived: false}, {archived: {$exists: false}}], ...filters, $or: [{subject: search_regex}, {tags: search_regex}, {title: search_regex}, {description: search}]}).sort(sort).limit(limit).skip(offset).lean(true);
            }
        }else{
            total = await Classes.count({is_full: false, ...filters});
            if(total){
                classes = await Classes.find({is_full: false, ...filters}).sort(sort).limit(limit).skip(offset).lean(true);
            }
        }

        return {classes, total};
    }catch(e){
        throw e;
    }
}

async function get_classes(limit=20, offset=0, search="", sort={}, filters={}, user){
    try{
        let classes = [];
        let total = 0;

        if(search){
            let escaped_search = escape_regex(search);

            const search_regex = new RegExp(`${escaped_search}`, "i");

            total = await Classes.count({...filters, $or: [{subject: search_regex}, {tags: search_regex}, {title: search_regex}, {description: search}]});

            if(total){
                classes = await Classes.find({...filters, $or: [{subject: search_regex}, {tags: search_regex}, {title: search_regex}, {description: search}]}, {sessions: 0}).sort(sort).limit(limit).skip(offset).lean(true);
            }
        }else{
            total = await Classes.count(filters);
            if(total){
                classes = await Classes.find(filters, {sessions: 0}).sort(sort).limit(limit).skip(offset).lean(true);
            }
        }

        return {classes, total};
    }catch(e){
        throw e;
    }
}

async function get_user_classes(user, limit=20, offset=0, search=""){
    try{
        const {_id} = user;
        let classes = [];
        let total = 0;

        if(search){
            let escaped_search = escape_regex(search);

            const search_regex = new RegExp(`${escaped_search}`, "i");

            total = await Classes.count({$and: [{$or: [{teacher: _id}, {students: _id}, {created_by: _id}]}, {$or: [{archived: false}, {archived: {$exists: false}}]}, {$or: [{subject: search_regex}, {tags: search_regex}]}]});

            if(total){
                classes = await Classes.find({archived: false, $and: [{$or: [{teacher: _id}, {students: _id}, {created_by: _id}]}, {$or: [{archived: false}, {archived: {$exists: false}}]}, {$or: [{subject: search_regex}, {tags: search_regex}, {title: search_regex}, {description: search}]}]}, {sessions: 0}).limit(limit).skip(offset).populate("sessions").lean(true);
            }
        }else{
            total = await Classes.count({$and: [{$or: [{teacher: _id}, {students: _id}, {created_by: _id}]}, {$or: [{archived: false}, {archived: {$exists: false}}]}]});

            if(total){
                classes = await Classes.find({$and: [{$or: [{teacher: _id}, {students: _id}, {created_by: _id}]}, {$or: [{archived: false}, {archived: {$exists: false}}]}]}, {sessions: 0}).limit(limit).skip(offset).populate("sessions").lean(true);
            }
        }

        return {classes, total};
    }catch(e){
        console.error(e);
        throw e;
    }
}

async function set_meeting_link({_class, meeting_link}, user){
    try{
        _class.meeting_link = meeting_link;
        await _class.save();

        if(_class.current_session){
            /* const updated_session = */ await update_session({_id: _class.session, meeting_link}, user); 
        }

        return _class;
    }catch(e){
        throw e;
    }
}

async function start_class({_class, duration_hours=1, meeting_link=""}, user){
    try{
        if(!_class.current_session){
            const new_session = await create_session({_class: _class, duration_hours, meeting_link}, user);

            const updated_class = await Classes.findOneAndUpdate({_id: _class._id}, {$set: {current_session: new_session._id, meeting_link}, $push: {sessions: {$each: [new_session._id], $position: 0}}}, {new: true, upsert: false}).populate({path: "teacher", select: "-password" }).populate({path: "students", select: "-password"});

            return {new_session, updated_class}
        }

        throw new Error("Class has already been started");
    }catch(e){
        throw e;
    }
}

async function end_class({_class}, user){
    try{
        if(_class.current_session){
            const updated_session = await end_session({_class: _class}, user);

            const updated_class = await Classes.findOneAndUpdate({_id: _class._id}, {$set: {current_session: null}}, {new: true, upsert: false}).populate({path: "teacher", select: "-password" }).populate({path: "students", select: "-password"});

            return {updated_class, updated_session};
        }

        throw new Error("Class has already been started");
    }catch(e){
        throw e;
    }
}

async function create_class({title, subject, cover_image="", description, teacher=null, class_type, max_students=1, level, price=0, discount=0, tags=[], bg_color="#000000", text_color="#FFFFFF", schedules=[], custom_dates=[], cancelled_dates=[], start_date, end_date, billing_schedule, archived=false, meeting_link, students=[], students_info=[]}, creator){
    try{
        if(title && subject && class_type){
            const new_class = await ((new Class({title, subject, cover_image, description, max_students, level, price, discount, bg_color, text_color, students, students_info, schedules: schedules.map((s) => ({...s, daily_start_time: (new Date(s.daily_start_time).getTime()), daily_end_time: (new Date(s.daily_end_time).getTime())})), custom_dates, cancelled_dates, start_date: new Date(start_date), end_date: new Date(end_date), billing_schedule, meeting_link, archived, is_full: students.length >= max_students, teacher: teacher || null, tags, created_by: creator._id, class_type, popularity: 0})).save());

            await fake_class_requests({student_ids: students, _class: new_class}, creator);
            
            return new_class;
        }else{
            throw new Error("subject, title and class type must be provided")
        }
    }catch(e){
        throw e;
    }
}

async function update_class({_id, title, subject, cover_image="", description, teacher=null, class_type, max_students=1, level, price=0, discount=0, tags=[], bg_color="#000000", text_color="#FFFFFF", schedules=[], custom_dates=[], cancelled_dates=[], start_date, end_date, billing_schedule, archived=false, meeting_link, students=[], students_info=[]}, user){
    try{
        if(title && subject && class_type){
            const updated_class = await Classes.findOneAndUpdate({_id}, {$set: {title, subject, cover_image, description, teacher: teacher?._id || teacher, class_type, max_students, level, price, discount, tags, bg_color, text_color, schedules, custom_dates, cancelled_dates, start_date, end_date, billing_schedule, meeting_link, students, students_info, archived, is_full: students.length >= max_students}}, {new: true, upsert: false});
            
            await fake_class_requests({student_ids: students, _class: updated_class}, user);
            
            return updated_class;
        }else{
            throw new Error("subject, title and class type must be provided")
        }
    }catch(e){
        throw e;
    }
}

async function add_student_to_class({student_id, class_id, request}){
    try{
        if(student_id && class_id){
            const students_info = {student: student_id, date_requested: new Date(request.createdAt), date_joined: new Date(), price_paid: request.class_price_at_time || request._class.price};

            const updated_class = await Classes.findOneAndUpdate({_id: class_id, students: {$ne: student_id}}, {$push: {students: student_id, students_info}}, {new: true, upsert: false}).populate({path: "teacher", select: "-password"}).populate({path: "students", select: "-password"});

            if(updated_class){
                if(updated_class.max_students <= updated_class.students.length){
                    updated_class.is_full = true;
                    await updated_class.save();
                }
    
                return updated_class;
            }else{
                throw new Error("student may already be in class");
            }
        }else{
            throw new Error("student_id and class_id must be provided")
        }
    }catch(e){
        throw e;
    }
}

async function remove_student_from_class({student_id, class_id}){
    try{
        if(student_id && class_id){
            const updated_class = await Classes.findOneAndUpdate({_id: class_id, students: student_id}, {$pull: {students: student_id, students_info: {student: student_id}}}, {new: true, upsert: false}).populate({path: "teacher", select: "-password"}).populate({path: "students", select: "-password"});

            if(updated_class){
                return updated_class;
            }else{
                throw new Error("student may already be removed from class");
            }
        }else{
            throw new Error("student_id and class_id must be provided")
        }
    }catch(e){
        throw e;
    }
}

async function add_teacher_to_class({teacher_id, class_id}){
    try{
        if(teacher_id && class_id){
            const updated_class = await Classes.findOneAndUpdate({_id: class_id}, {$set: {teacher: teacher_id}}, {new: true, upsert: false}).populate({path: "teacher", select: "-password"}).populate({path: "students", select: "-password"});

            return updated_class;
        }else{
            throw new Error("teacher_id and class_id must be provided")
        }
    }catch(e){
        throw e;
    }
}

async function create_and_accept_request({student_id, _class}, user){
    let new_request = await request_class({_class, student: {_id: student_id}});
    new_request = await accept_fake_request({request_id: new_request._id}, user);
    return new_request;
}

async function fake_class_requests({student_ids=[], _class}, user){
    for(const student_id of student_ids){
        let existing_request = await Request.findOne({_class: _class._id, student: student_id, rejected: false});

        if(existing_request){
            if(!existing_request.accepted){ // is unhandled
                existing_request = await accept_fake_request({request_id: existing_request._id}, user);
                continue;
            }
        }

        await create_and_accept_request({student_id, _class}, user);
    }
}

async function request_class({_class, student}){
    try{
        if(_class && student){
            const new_request = await ((new Request({_class: _class._id, teacher: _class.teacher._id, class_price_at_time: _class.price, student: student._id})).save());

            await new_request.populate({path: "student", select: "-password"});

            await Classes.updateOne({_id: _class._id}, {$inc: {popularity: 1}});

            return new_request;
        }else{
            throw new Error("_class and student must be provided")
        }
    }catch(e){
        throw e;
    }
}

async function accept_fake_request({request_id}, handler){ //handler is the user accepting/declining the request
    try{
        if(request_id){
            const request = await Requests.findOneAndUpdate({_id: request_id}, {$set: {accepted: true, declined: false, date_handled: new Date(), handled_by: handler._id}}, {new: true, upsert: false, }).populate({path: "student", select: "-password"}).populate("_class");

            return request;
        }else{
            throw new Error("no request provided");
        }
    }catch(e){
        throw e;
    }
}

async function accept_request({request_id}, handler){ //handler is the user accepting/declining the request
    try{
        if(request_id){
            const request = await Requests.findOneAndUpdate({_id: request_id}, {$set: {accepted: true, declined: false, date_handled: new Date(), handled_by: handler._id}}, {new: true, upsert: false, }).populate({path: "student", select: "-password"}).populate("_class");

            const updated_class = await add_student_to_class({student_id: request.student, class_id: request._class, request});

            return {request, updated_class};
        }else{
            throw new Error("no request provided");
        }
    }catch(e){
        throw e;
    }
}

async function decline_request({request_id}, handler){ //handler is the user accepting/declining the request
    try{
        if(request_id){
            const request = await Requests.findOneAndUpdate({_id: request_id}, {$set: {accepted: false, declined: true, date_handled: new Date(), handled_by: handler._id}}, {new: true, upsert: false, }).populate({path: "student", select: "-password"});

            return request;
        }else{
            throw new Error("no request provided");
        }
    }catch(e){
        throw e;
    }
}

async function get_class_attendance(_class, filters={}){
    try{
        return await Attendances.find({...filters, _class: _class._id}).lean(true);
    }catch(e){
        console.log(e);
        throw e;
    }
}

async function get_class_payment_intent(class_id, user){
    try{
        const _class = await Classes.findOne({_id: class_id});
        if(_class){
            if(!user.stripe_customer_id){
                const {name: {first, last}, email, phone} = user;

                const stripe_customer = await create_stripe_customer({name: `${first} ${last}`, email, phone});

                user.stripe_customer_id = stripe_customer.id;

                await user.save();
            }

            const {price=0, title, description} = _class;
            if(price){
                const payment_intent = await create_stripe_payment_intent({amount: price * 100, customer: user.stripe_customer_id, description, receipt_email: user.email, statement_descriptor: title});

                return payment_intent;
            }
            
            throw new Error(`Class price not found`);
        }

        throw new Error(`No class with id: "${class_id}" found`);
    }catch(e){
        console.log(e);
        throw e;
    }
}

async function create_attendance({_class, student, remarks="", early, present}){
    try{
        const student_attendance = await ((new Attendances({_class: _class._id, student: student, remarks, early, present})).save());

        return student_attendance;
    }catch(e){
        throw e;
    }
}

async function update_attendance({_class, student, remarks="", early, present}){
    try{
        const student_attendance = await Attendances.findOneAndUpdate({_class: _class._id, student: student}, {$set: {remarks, early, present}}, {upsert: true, new: true});

        return student_attendance;
    }catch(e){
        throw e;
    }
}

async function add_attachment_to_class({attachment, class_id}){
    try{
        if(attachment && class_id){
            const updated_class = await Classes.findOneAndUpdate({_id: class_id}, {$push: attachment._id}).populate({path: "teacher", select: "-password"}).populate({path: "students", select: "-password"});

            return updated_class;
        }else{
            throw new Error("attachment and class_id must be provided")
        }
    }catch(e){
        throw e;
    }
}

async function cancel_class(class_id, user){
    try{
        if(user && user._id){
            return await Classes.findOneAndUpdate({_id: class_id}, {$set: {cancelled: true, cancelled_by: user._id}}, {new: true, upsert: false}); 
        }
    
        throw new Error("User not defined");
    }catch(e){
        throw e;
    }
}

async function uncancel_class(class_id, user){
    try{
        if(user && user._id){
            return await Classes.findOneAndUpdate({_id: class_id}, {$set: {cancelled: false, cancelled_by: null}}, {new: true, upsert: false}); 
        }
    
        throw new Error("User not defined");
    }catch(e){
        throw e;
    }
}

async function get_classes_schedules({startPeriod, endPeriod}, filters={}, search="", user){
    try{
        const is_admin_or_sales = (user.type === "admin") || (user.type === "sales");

        Object.keys(filters).forEach((key) => {
            if(mongoose.isValidObjectId(filters[key])){
                filters[key] = new mongoose.Types.ObjectId(filters[key]);
            };
        });

        startPeriod = new Date(startPeriod);
        endPeriod = new Date(endPeriod);
    
        const match = {$and: [{$or: [{end_date: {$gte: startPeriod}, start_date: {$lte: endPeriod}}, {custom_dates: {$elemMatch: {date: {$gte: startPeriod, $lte: endPeriod}}}}]}, {archived: {$ne: true}}, {...filters}]};
    
        if(!is_admin_or_sales){
            match.$or = match.$or || [];
            match.$or.push({students: user._id}, {teacher: user._id});
        }

        if(search){
            let escaped_search = escape_regex(search);
            const search_regex = new RegExp(`${escaped_search}`, "i");

            match.$and.push({$or: [{tags: search_regex}, {subject: search_regex}, {title: search_regex}, {description: search}]})
        }

        // console.log(JSON.stringify(match));
    
        const schedules = await Classes.find(match, {_id: 1, title: 1, subject: 1, description: 1, tags: 1, bg_color: 1, text_color: 1, current_session: 1, cover_image: 1, students: 1, schedules: 1, custom_dates: 1, cancelled_dates: 1, start_date: 1, end_date: 1});
    
        return schedules;
    }catch(e){
        throw e;
    }
}



module.exports.get_class = get_class;
module.exports.end_class = end_class;
module.exports.get_classes = get_classes;
module.exports.start_class = start_class;
module.exports.create_class = create_class;
module.exports.update_class = update_class;
module.exports.cancel_class = cancel_class;
module.exports.request_class = request_class;
module.exports.accept_request = accept_request;
module.exports.uncancel_class = uncancel_class;
module.exports.decline_request = decline_request;
module.exports.get_user_classes = get_user_classes;
module.exports.set_meeting_link = set_meeting_link;
module.exports.update_attendance = update_attendance;
module.exports.create_attendance = create_attendance;
module.exports.add_teacher_to_class = add_teacher_to_class;
module.exports.get_class_attendance = get_class_attendance;
module.exports.get_classes_schedules = get_classes_schedules;
module.exports.get_available_classes = get_available_classes;
module.exports.add_attachment_to_class = add_attachment_to_class;
module.exports.get_class_payment_intent = get_class_payment_intent;
module.exports.remove_student_from_class = remove_student_from_class;
module.exports.populate_common_class_feilds = populate_common_class_feilds;