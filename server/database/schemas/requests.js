const mongoose = require("mongoose");
const schema = mongoose.Schema;

const request_schema = new schema({
    _class: {
        type: schema.Types.ObjectId,
        ref: "class"
    },
    class_price_at_time: {
        type: Number,
        default: 0
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
    date_handled: {
        type: Date
    },
    handled_by: {
        type: schema.Types.ObjectId,
        ref: "user"
    }
}, {timestamps: true});

mongoose.model("request", request_schema, "requests");