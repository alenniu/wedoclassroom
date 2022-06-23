const mongoose = require("mongoose");
const schema = mongoose.Schema;

const submission_schema = new schema({
    _class: {
        type: schema.Types.ObjectId,
        ref: "class"
    },
    assignment: {
        type: schema.Types.ObjectId,
        ref: "assignment"
    },
    attachments: [{
        type: schema.Types.ObjectId,
        ref: "attachment"
    }],
    student: {
        type: schema.Types.ObjectId,
        ref: "user"
    },
    score: {
        type: schema.Types.ObjectId,
        ref: "score"
    }
}, {timestamps: true});

mongoose.model("submission", submission_schema, "submissions");