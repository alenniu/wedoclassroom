const mongoose = require("mongoose");
const schema = mongoose.Schema;

const notification_schema = new schema({
    type: {
        type: String
    },
    text: {
        type: String
    },
    from: {
        type: schema.Types.ObjectId,
        ref: "user",
        default: null
    },
    to: [{
        user: {
            type: schema.Types.ObjectId,
            ref: "user"
        },
        read: {
            type: Boolean,
            default: false
        }
    }],
    attachments: [{
        type: schema.Types.ObjectId,
        ref: "attachment"
    }]
}, {timestamps: true});

mongoose.model("notification", notification_schema, "notifications");