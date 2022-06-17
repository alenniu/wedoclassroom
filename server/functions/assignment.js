const mongoose = require("mongoose");
const { create_announcement } = require("./announcement");
const { escape_regex } = require("./utils");

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
            const updated_assignment = await Assignments.updateOne({_id}, {$set: {title, description, attachments, students, due_date}}, {new: true, upsert: false});
            
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

module.exports.get_assignments = get_assignments;
module.exports.create_assignment = create_assignment;
module.exports.update_assignment = update_assignment;
module.exports.delete_assignment = delete_assignment;
module.exports.get_class_assignments = get_class_assignments;