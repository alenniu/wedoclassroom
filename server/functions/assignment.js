const mongoose = require("mongoose");
const { create_announcement } = require("./announcement");
const { escape_regex } = require("./utils");

const Submissions = mongoose.model("submission");
const Submission = Submissions;

const Assignments = mongoose.model("assignment");
const Assignment = Assignments;

async function create_assignment({_class, title, description, attachments=[], students=[], due_date}, user){
    try{
        if(_class && title && description && due_date){
            const new_assignment = await ((new Assignment({_class: _class._id, title, description, attachments, teacher: user._id, students, due_date})).save())
            
            await new_assignment.populate({path: "teacher", select: "-password"})
            await new_assignment.populate({path: "attachments"});

            return new_assignment;
        }

        throw new Error("_class, title, description and due_date must be provided");
    }catch(e){
        console.error(e);
        throw e;
    }
}

async function update_assignment(assignment, user){
    try{
        const {_id} = assignment;
        if(_id, title && description && due_date){
            const updated_assignment = await Assignments.updateOne({_id}, {$set: {title, description, attachments, students, due_date}}, {new: true, upsert: false}).populate({path: "teacher", select: "-password"}).populate({path: "attachments"});
            
            return updated_assignment;
        }

        throw new Error("_id, title, description and due_date must be provided");
    }catch(e){
        throw e;
    }
}

async function get_assignments(user, limit=20, offset=0, search="", sort={}, filters={}){
    try{
        let assignments = [];
        let total = 0;
        const query = {...filters, $or: [{students: user._id}, {teacher: user._id}]};

        if(search){
            let escaped_search = escape_regex(search);
            const search_regex = new RegExp(`${escaped_search}`, "i");

            query.title = search_regex;
            // query.description = search_regex;
        }

        total = await Assignments.count(query);
        if(total){
            assignments = await Assignments.find(query).populate({path: "teacher", select: "-password"}).populate({path: "attachments"}).limit(limit).skip(offset).sort(sort).lean(true);
        }

        return {total, assignments};
    }catch(e){
        throw e;
    }
}

async function get_class_assignments({class_id, user}, limit=20, offset=0, search="", sort={}, filters={}){
    try{
        let assignments = [];
        let total = 0;
        const query = {...filters, _class: class_id, $or: [{students: user._id}, {teacher: user._id}]};

        if(search){
            let escaped_search = escape_regex(search);
            const search_regex = new RegExp(`${escaped_search}`, "i");

            query.title = search_regex;
            // query.description = search_regex;
        }


        total = await Assignments.count(query);

        if(total){
            assignments = await Assignments.find(query).populate({path: "teacher", select: "-password"}).populate({path: "attachments"}).limit(limit).skip(offset).sort(sort).lean(true);
        }

        return {total, assignments};
    }catch(e){
        throw e;
    }
}

async function delete_assignment(assignment, user){
    try{
        if(assignment && assignment._id){
            return await Assignments.deleteOne({_id: assignment._id, teacher: user._id});
        }

        throw new Error("assignment must be provided");
    }catch(e){
        throw e;
    }
}

async function submit_assignment({assignment={}, attachments=[]}, user){
    try{
        if(assignment && assignment._id && assignment._class){
            const new_submission = await ((new Submission({_class: assignment._class, assignment: assignment._id, attachments, student: user._id})).save());

            await new_submission.populate({path: "student", select: "-password"});
            await new_submission.populate({path: "attachments"});

            const updated_assignment = await Assignments.findOneAndUpdate({_id: assignment._id}, {$push: {submissions: new_submission._id}}, {new: true, upsert: false}).populate({path: "teacher", select: "-password"}).populate({path: "attachments"});

            return {new_submission, updated_assignment};
        }

        throw new Error("Assignment object with _class and _id must be provided");
    }catch(e){
        console.error(e);
        throw new Error(e);
    }
};

module.exports.get_assignments = get_assignments;
module.exports.create_assignment = create_assignment;
module.exports.update_assignment = update_assignment;
module.exports.delete_assignment = delete_assignment;
module.exports.submit_assignment = submit_assignment;
module.exports.get_class_assignments = get_class_assignments;