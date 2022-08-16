const mongoose = require("mongoose");
const schema = mongoose.Schema;

const messages_schema = new schema({
    text: {
        type: String
    },
    from: {
        type: schema.Types.ObjectId,
        ref: "user"
    },
    to: {
        type: schema.Types.ObjectId,
        ref: "user"
    },
    attachments: [{
        type: schema.Types.ObjectId,
        ref: "attachment"
    }],
    read: {
        type: Boolean,
        default: false
    }
}, {timestamps: true});

mongoose.model("message", messages_schema, "messages");