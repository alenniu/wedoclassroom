const mongoose = require("mongoose");
const schema = mongoose.Schema;

const config_schema = new schema({
    subjects: [String],
    tags: [String],
    levels: [String],
    semester_active: {
        type: Boolean,
        default: false
    }
}, {timestamps: true});

mongoose.model("config", config_schema, "config");