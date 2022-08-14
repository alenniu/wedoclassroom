const mongoose = require("mongoose");
const schema = mongoose.Schema;

const reschedule_schema = new schema({
    _class: {
        type: schema.Types.ObjectId,
        ref: "class"
    },
    teacher: {
        type: schema.Types.ObjectId,
        ref: "user"
    },
    reason: {
        type: String,
    },
    accepted: {
        type: Boolean,
        default: false,
    },
    rejected: {
        type: Boolean,
        default: false
    },
    old_start_time: {
        type: Date,
    },
    old_end_time: {
        type: Date,
    },
    oldDate: {
        type: Date,
        required: true
    },
    newDate: {
        type: Date,
        default: null
    },
    new_start_time: {
        type: Date,
    },
    new_end_time: {
        type: Date,
    },
    handled_by: {
        type: schema.Types.ObjectId,
        ref: "user",
        default: null
    }
}, {timestamps: true});

mongoose.model("reschedule", reschedule_schema, "reschedules");