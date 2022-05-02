const mongoose = require("mongoose");
const schema = mongoose.Schema;

const schedule_schema = new schema({
    user: {
        type: schema.Types.ObjectId,
        ref: "user"
    },
    items: [{
        name: {
            type: String,
        },
        description: {
            type: String,
        },
        Date: {
            type: Date
        },
        class: {
            type: schema.Types.ObjectId,
            ref: "class"
        },
        created: {
            type: Number,
            default: () => Date.now()
        }
    }]
}, {timestamps: true});

mongoose.model("schedule", schedule_schema, "schedules");