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
    created_by: {
        type: schema.Types.ObjectId,
        ref: "user"
    }
}, {timestamps: true});

user_schema.post("save", function(doc, next){
    doc.password = undefined;
    delete doc.password;
    next();
});

mongoose.model("user", user_schema, "users");