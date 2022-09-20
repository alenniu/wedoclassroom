const mongoose = require("mongoose");
const schema = mongoose.Schema;

const session_schema = new schema({
    _class: {
        type: schema.Types.ObjectId,
        ref: "class"
    },
    start_time: {
        type: Date,
        default: () => new date()
    },
    end_time: {
        type: Date,
        default: null
    },
    scheduled_duration_hrs: {
        type: Number
    },
    active: {
        type: Boolean,
        default: true
    },
    teacher: {
        type: schema.Types.ObjectId,
        ref: "user"
    },
    students: [{
        type: schema.Types.ObjectId,
        ref: "user"
    }],
    students_session_info: [{
        student: {
            type: schema.Types.ObjectId,
            ref: "user"
        },
        credit_log: {
            previous_amount: {
                type: Number,
            },
            new_amount: {
                type: Number,
            },
            difference: { //could be calculated but i'll just store it
                type: Number
            },
            date: {
                type: Date,
            },
            note: {
                type: String
            }
        }
    }],
    meeting_link: {
        type: String
    }
}, {timestamps: true});

mongoose.model("class_session", session_schema, "class_sessions");

