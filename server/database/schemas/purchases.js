const mongoose = require("mongoose");
const schema = mongoose.Schema;

const purchase_schema = new schema({
    invoice: {
        type: schema.Types.ObjectId,
        ref: "invoice"
    },
    _class: {
        type: schema.Types.ObjectId,
        ref: "class"
    },
    user: {
        type: schema.Types.ObjectId,
        ref: "user"
    },
    teacher: {
        type: schema.Types.ObjectId,
        ref: "user"
    }
}, {timestamps: true});

mongoose.model("purchase", purchase_schema, "purchases");

