const mongoose = require("mongoose");
const schema = mongoose.Schema;

const assignment_schema = new schema({
    _class: {
        type: schema.Types.ObjectId,
        ref: "class"
    },
    attachments: [{
        type: schema.Types.ObjectId,
        ref: "attachment"
    }],
    students: [{
        type: schema.Types.ObjectId,
        ref: "user"
    }]
}, {timestamps: true});

mongoose.model("assignment", assignment_schema, "assignments");