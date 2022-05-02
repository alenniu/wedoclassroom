const mongoose = require("mongoose");
const schema = mongoose.Schema;

const class_schema = new schema({
    subject: {
        type: String,
        required: true,
    },
    teacher: {
        type: schema.Types.ObjectId,
        ref: "user",
    },
    created_by: {
        type: schema.Types.ObjectId,
        ref: "user",
    },
    students: [{
        type: schema.Types.ObjectId,
        ref: "user"
    }],
    tags: [String],
    attachments: [{
        type: schema.Types.ObjectId,
        ref: "attachment"
    }]
}, {timestamps: true});

mongoose.model("class", class_schema, "classes");