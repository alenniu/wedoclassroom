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
    meeting_link: {
        type: String
    }
}, {timestamps: true});

mongoose.model("class_session", session_schema, "class_sessions");

