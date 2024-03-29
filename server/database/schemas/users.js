const mongoose = require("mongoose");
const schema = mongoose.Schema;

const user_schema = new schema({
    name: {
        first:{
            type: String
        },
        last: {
            type: String
        },
        middile: {
            type: String,
            default: "",
            required: false
        }
    },
    gender: {
        type: String,
    },
    emergency_contact: {
        name: String,
        phone: String,
        email: String,
        relation: String
    },
    type: { // type of account e.g student/teacher/admin etc...
        type: String,
        default: "student",
        enum: ["admin", "teacher", "student", "sales"],
        required: true
    },
    email: { // email of user
        type: String,
        unique: true,
        required: true
    },
    phone: {
        type: String,
    },
    password: { // md5 hashed please
        type: String,
        required: true
    },
    birth: {
        type: Date
    },
    photo_url: {
        type: String,
        default: "/user.png",
    },
    description: {
        type: String,
        default: ""
    },
    // address: {
    //     type: schema.Types.ObjectId,
    //     ref: "address"
    // },
    activated: { //basically verify the email used is real and is owned by the person who signed up. this will be set to true when the activation link in the email is clicked/visited
        type: Boolean,
        default: false
    },
    credits: {
        type: Number,
        default: 0
    },
    credit_logs: [{
        previous_amount: {
            type: Number,
        },
        new_amount: {
            type: Number,
        },
        difference: { //could be calculated but i'll just store it
            type: Number
        },
        date: {
            type: Date,
        },
        note: {
            type: String
        }
    }],
    stripe_customer_id: {
        type: String,
        required: false,
        default: "",
    },
    role: { // for admin panel user this specifies their role
        type: String,
        default: ""
    },
    roles: [String],
    invoices: [{
        type: schema.Types.ObjectId,
        ref: "invoice"
    }],
    schedule: {
        type: schema.Types.ObjectId,
        ref: "schedule"
    },
    grade: {
        type: String
    },
    school: {
        type: String
    },
    date_enrolled: {
        type: Date
    },
    hourly_rate_1_3: {
        type: Number,
        default: 0
    },
    hourly_rate_4_8: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ["active", "inactive"],
        default: "active"
    },
    deleted: {
        type: Boolean,
        default: false
    },
    deleted_by: {
        type: schema.Types.ObjectId,
        ref: "user",
        default: null
    },
    created_by: {
        type: schema.Types.ObjectId,
        ref: "user"
    },
    archived: {
        type: Boolean,
        default: false
    }
}, {timestamps: true});

user_schema.post("save", function(doc, next){
    doc.password = undefined;
    delete doc.password;
    next();
});

mongoose.model("user", user_schema, "users");