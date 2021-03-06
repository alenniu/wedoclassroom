const mongoose = require("mongoose");
const schema = mongoose.Schema;

const assignment_schema = new schema({
    _class: {
        type: schema.Types.ObjectId,
        ref: "class"
    },
    teacher: {
        type: schema.Types.ObjectId,
        ref: "user"
    },
    title: {
        type: String
    },
    description: {
        type: String,
    },
    attachments: [{
        type: schema.Types.ObjectId,
        ref: "attachment"
    }],
    students: [{
        type: schema.Types.ObjectId,
        ref: "user"
    }],
    due_date: {
        type: Date
    },
    submissions: [{
        type: schema.Types.ObjectId,
        ref: "submission"
    }]
}, {timestamps: true});

mongoose.model("assignment", assignment_schema, "assignments");