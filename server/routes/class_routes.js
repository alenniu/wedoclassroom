const { get_classes_handler, create_class_handler, request_class_handler, accept_request_handler, decline_request_handler } = require("../handlers/class");
const verify_admin = require("../middleware/verify_admin");
const verify_user = require("../middleware/verify_user");
const verify_student = require("../middleware/verify_student");

const router = require("express").Router();

module.exports = (app) => {

    router.route("/").get(verify_user, get_classes_handler).post(verify_user, create_class_handler);

    router.route("/request").post(verify_student, request_class_handler);

    router.route("/request/accept").post(verify_user, accept_request_handler);
    router.route("/request/decline").post(verify_user, decline_request_handler);

    app.use("/api/classes", router);
}