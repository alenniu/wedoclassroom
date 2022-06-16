const get_user = require("../middleware/get_user");
const verify_user = require("../middleware/verify_user");
const { get_class_assignments_handler, create_assignment_handler, update_assignment_handler, delete_assignment_handler, get_assignments_handler } = require("../handlers/assignment");
const router = require("express").Router();

module.exports = (app) => {

    router.route("/class").get(verify_user, get_class_assignments_handler);
    router.route("/").get(verify_user, get_assignments_handler).post(verify_user, create_assignment_handler).put(verify_user, update_assignment_handler).delete(verify_user, delete_assignment_handler);

    app.use("/api/assignments", router);
}