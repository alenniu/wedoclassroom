const mongoose = require("mongoose");
const schema = mongoose.Schema;

const announcement_schema = new schema({
    _class: {
        type: schema.Types.ObjectId,
        ref: "class"
    },
    user: {
        type: schema.Types.ObjectId,
        ref: "user"
    },
    assignment: {
        type: schema.Types.ObjectId,
        ref: "assignment"
    },
    title: {
        Types: String
    },
    message: {
        type: String
    },
    seen_by: [
        {
            type: schema.Types.ObjectId,
            ref: "user"
        }
    ]
}, {timestamps: true});

mongoose.model("announcement", announcement_schema, "announcements");