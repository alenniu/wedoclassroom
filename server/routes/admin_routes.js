const router = require("express").Router();
const { admin_create_user_handler, get_students_handler, get_teachers_handler, get_admins_handler, set_class_teacher, admin_get_classes, get_accounts_handler, admin_update_user_handler } = require("../handlers/admin");
const verify_admin = require("../middleware/verify_admin");

module.exports = (app) => {

    router.route("/create_user").post(verify_admin, admin_create_user_handler);

    router.route("/students").get(verify_admin, get_students_handler);

    router.route("/teachers").get(verify_admin, get_teachers_handler);

    router.route("/admins").get(verify_admin, get_admins_handler);

    router.route("/accounts").get(verify_admin, get_accounts_handler).post(verify_admin, admin_create_user_handler).put(verify_admin, admin_update_user_handler);

    router.route("/classes").get(verify_admin, admin_get_classes)

    router.route("/set_class_teacher").post(verify_admin, set_class_teacher);

    app.use("/api/admin", router)
}