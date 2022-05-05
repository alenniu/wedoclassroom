const mongoose = require("mongoose");
const schema = mongoose.Schema;

const request_schema = new schema({
    _class: {
        type: schema.Types.ObjectId,
        ref: "class"
    },
    student: {
        type: schema.Types.ObjectId,
        ref: "user"
    },
    accepted: {
        type: Boolean,
        default: false
    },
    declined: {
        type: Boolean,
        default: false
    },
    handled_by: {
        type: schema.Types.ObjectId,
        ref: "user"
    }
}, {timestamps: true});

mongoose.model("request", request_schema, "requests");