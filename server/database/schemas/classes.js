const mongoose = require("mongoose");
const schema = mongoose.Schema;

const class_schema = new schema({
    title: {
        type: String
    },
    subject: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    teacher: {
        type: schema.Types.ObjectId,
        ref: "user",
    },
    created_by: {
        type: schema.Types.ObjectId,
        ref: "user",
    },
    students: [{
        type: schema.Types.ObjectId,
        ref: "user"
    }],
    students_info: [{
        student: {
            type: schema.Types.ObjectId,
            ref: "user"
        },
        date_requested: {
            type: Date
        },
        date_joined: {
            type: Date
        },
        price_paid: {
            type: Number,
        }
    }],
    tags: [String],
    meeting_link: { //this maybe could've been an attachment
        type: String,
    },
    attachments: [{
        type: schema.Types.ObjectId,
        ref: "attachment"
    }],
    class_type: {
        type: String,
        enum: ["group", "private"],
        default: "group"
    },
    start_date: {
        type: Date
    },
    end_date: {
        type: Date
    },
    schedules: [{ // If the different days start at different times, They must be put in a seperate schedule
        days: [Number],
        timezone: String,
        daily_start_time: Number,
        daily_end_time: Number
    }],
    popularity: {
        type: Number,
        default: 0
    },
    bg_color: {
        type: String
    },
    text_color: {
        type: String
    },
    cover_image: {
        type: String
    },
    max_students: {
        type: Number,
        default: 1
    },
    is_full: {
        type: Boolean,
        default: false
    },
    level: {
        type: String
    },
    price: {
        type: Number,
        default: 0,
        required: true
    },
    billing_schedule: {
        type: String,
        enum: ["hourly", "session"/*basically daily*/, "weekly", "monthly", "semester"],
        default: "semester"
    },
    cancelled: {
        type: Boolean,
        default: false
    },
    cencelled_by: {
        type: schema.Types.ObjectId,
        ref: "user"
    },
    stripe_product_price_id: {
        type: String
    },
    sessions: [{
        type: schema.Types.ObjectId,
        ref: "class_session"
    }],
    current_session: {
        type: schema.Types.ObjectId,
        ref: "class_session",
        default: null
    }
}, {timestamps: true});

mongoose.model("class", class_schema, "classes");