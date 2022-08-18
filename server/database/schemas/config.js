const mongoose = require("mongoose");
const schema = mongoose.Schema;

const config_schema = new schema({
    subjects: [String],
    tags: [String],
    levels: [String],
    day_start_time: {
        type: Date,
        default: new Date(0,0,0,8,0,0)
    },
    day_end_time: {
        type: Date,
        default: null
    },
    semester_active: {
        type: Boolean,
        default: false
    }
}, {timestamps: true});

mongoose.model("config", config_schema, "config");