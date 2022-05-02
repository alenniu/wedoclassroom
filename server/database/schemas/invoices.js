const mongoose = require("mongoose");
const schema = mongoose.Schema;

const invoice_schema = new schema({
    description: {
        type: String
    },
    amount: {type: Number, required: true},
    charges: [{
        amount_attempted: {
            type: Number,
            required: true
        },
        success: {
            type: Boolean,
            required: true
        },
        charge: {
            type: mongoose.SchemaTypes.Mixed,
            required: true,
        },
        created_at: {
            type: Number,
            required: true
        }
    }],
    settled: {
        type: Boolean,
        required: true,
        default: false,
    },
    customer: {
        type: new schema({
            email: {
                type: String,
                required: true,
            },
            reepay_customer_id: {
                type: String,
                required: true,
            },
            user: {
                type: mongoose.Types.ObjectId,
                required: true,
                ref: "user"
            }
        }),
        required: true
    }
}, {timestamps: true});

mongoose.model("invoice", invoice_schema, "invoices");