const mongoose = require("mongoose");
const schema = mongoose.Schema;

const schedule_schema = new schema({
    user: {
        type: schema.Types.ObjectId,
        ref: "user"
    },
    items: [new schema({
        name: {
            type: String,
        },
        description: {
            type: String,
        },
        start_date: {
            type: Date,
            required: true
        },
        duration: {
            type: Number,
        },
        end_date: {
            type: Date,
        },
        _class: {
            type: schema.Types.ObjectId,
            ref: "class"
        },
        created: {
            type: Date,
            default: () => new Date()
        },
        missed: {
            type: Boolean,
            default: false,
        }
    })]
}, {timestamps: true});

mongoose.model("schedule", schedule_schema, "schedules");