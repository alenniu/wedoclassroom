const mongoose = require("mongoose");
const schema = mongoose.Schema;

const attendance_schema = new schema({
    _class: {
        type: schema.Types.ObjectId,
        ref: "class"
    },
    student: {
        type: schema.Types.ObjectId,
        ref: "user"
    },
    remarks: {
        type: String
    },
    early: {
        type: Boolean,
        default: false,
    },
    present: {
        type: Boolean,
        default: false
    }
}, {timestamps: true});

mongoose.model("attendance", attendance_schema, "attendance");