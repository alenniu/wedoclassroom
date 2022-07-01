const mongoose = require("mongoose");
const schema = mongoose.Schema;

const withdrawal_schema = new schema({
    amount: {
        type: Number,
        required: true
    },
    user: {
        type: schema.Types.ObjectId,
        ref: "user"
    }
}, {timestamps: true});

mongoose.model("withdrawal", withdrawal_schema, "withdrawals");

