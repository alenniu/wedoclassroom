
const multer = require("multer");
const get_user = require("../middleware/get_user");
const verify_user = require("../middleware/verify_user");
const verify_admin = require("../middleware/verify_admin");
const verify_teacher = require("../middleware/verify_teacher");
const verify_student = require("../middleware/verify_student");

const { get_reschedules_handler, request_class_reschedule_handler, accept_class_reschedule_handler, reject_class_reschedule_handler, get_class_reschedules_handler, get_reschedule_handler } = require("../handlers/reschedule");

const router = require("express").Router();

module.exports = (app) => {
    router.route("/").get(verify_user, get_reschedules_handler).post(verify_teacher, request_class_reschedule_handler);

    router.route("/accept/:reschedule_id").post(verify_admin, accept_class_reschedule_handler);
    router.route("/reject/:reschedule_id").post(verify_admin, reject_class_reschedule_handler);

    router.route("/class/:class_id").get(verify_user, get_class_reschedules_handler)
    
    router.route("/:reschedule_id").get(verify_user, get_reschedule_handler)

    app.use("/api/reschedules", router);
}