const {  } = require("../handlers/class");
const verify_admin = require("../middleware/verify_admin");
const verify_user = require("../middleware/verify_user");
const verify_student = require("../middleware/verify_student");
const verify_teacher = require("../middleware/verify_teacher");
const { create_stripe_session_handler, create_stripe_payment_intent_handler } = require("../handlers/stripe");

const router = require("express").Router();

module.exports = (app) => {

    router.route("/session").post(verify_student, create_stripe_session_handler);
    router.route("/payment_intent").post(verify_student, create_stripe_payment_intent_handler);

    app.use("/api/stripe", router);
}