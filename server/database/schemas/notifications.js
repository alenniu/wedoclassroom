const mongoose = require("mongoose");
const { NOTIFICATION_TYPE_CLASS_START, NOTIFICATION_TYPE_ASSIGNMENT_PAST_DUE, NOTIFICATION_TYPE_ASSIGNMENT_SUBMISSION, NOTIFICATION_TYPE_CLASS_ANNOUNCEMENT, NOTIFICATION_TYPE_CLASS_RESCHEDULE, NOTIFICATION_TYPE_NEW_ASSIGNMENT, NOTIFICATION_TYPE_NEW_CLASS_STUDENT, NOTIFICATION_TYPE_INFO, NOTIFICATION_TYPE_CLASS_END, NOTIFICATION_TYPE_CLASS_RESCHEDULE_DECLINE, NOTIFICATION_TYPE_REQUEST_CLASS_RESCHEDULE } = require("../../notification_types");
const schema = mongoose.Schema;

const notification_schema = new schema({
    type: {
        type: String,
        // enum: ["", NOTIFICATION_TYPE_CLASS_START, NOTIFICATION_TYPE_CLASS_RESCHEDULE, NOTIFICATION_TYPE_CLASS_ANNOUNCEMENT, NOTIFICATION_TYPE_NEW_ASSIGNMENT, NOTIFICATION_TYPE_ASSIGNMENT_SUBMISSION, NOTIFICATION_TYPE_ASSIGNMENT_PAST_DUE, NOTIFICATION_TYPE_NEW_CLASS_STUDENT, NOTIFICATION_TYPE_INFO, NOTIFICATION_TYPE_CLASS_END, NOTIFICATION_TYPE_CLASS_RESCHEDULE_DECLINE, NOTIFICATION_TYPE_REQUEST_CLASS_RESCHEDULE]
    },
    text: {
        type: String,
        required: true
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
    }],
    everyone: {
        type: Boolean,
        default: false
    },
    everyone_of_type: [{
        type: String,
        default: "",
    }],
    excluded_users: [{
        type: schema.Types.ObjectId,
        ref: "user"
    }],
    metadata: {
        type: schema.Types.Mixed,
        default: {}
    },
    read_by: [{
        type: schema.Types.ObjectId,
        ref: "user"
    }],
}, {timestamps: true});

mongoose.model("notification", notification_schema, "notifications");