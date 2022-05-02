const mongoose = require("mongoose");
const schema = mongoose.Schema;

const score_schema = new schema({
    assignment: {
        type: schema.Types.ObjectId,
        ref: "assignment"
    },
    student: {
        type: schema.Types.ObjectId,
        ref: "user"
    },
    mark: {
        type: Number,
        required: true
    },
    total: {
        type: Number,
        required: true
    }
}, {timestamps: true});

mongoose.model("score", score_schema, "scores");