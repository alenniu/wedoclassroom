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
    meeting_link: { //this maybe could've been an attachment
        type: String,
    },
    attachments: [{
        type: schema.Types.ObjectId,
        ref: "attachment"
    }],
    class_type: {
        type: String,
        enum: ["group", "individual"],
        default: "group"
    }
}, {timestamps: true});

mongoose.model("class", class_schema, "classes");