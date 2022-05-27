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
        enum: ["group", "private"],
        default: "group"
    },
    schedule: {
        days: [Number],
        daily_start_time: Number,
        daily_end_time: Number
    },
    popularity: {
        type: Number,
        default: 0
    },
    bgColor: {
        type: String
    },
    textColor: {
        type: String
    },
    cover_image: {
        type: String
    },
    max_students: {
        type: Number,
        default: 1
    }
}, {timestamps: true});

mongoose.model("class", class_schema, "classes");