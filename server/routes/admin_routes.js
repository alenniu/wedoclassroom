const router = require("express").Router();
const { admin_create_user_handler, get_students_handler, get_teachers_handler, get_admins_handler, set_class_teacher, admin_get_classes, get_accounts_handler, admin_update_user_handler, get_account_handler, admin_search_handler, admin_get_requests_handler } = require("../handlers/admin");
const verify_admin = require("../middleware/verify_admin");
const verify_user = require("../middleware/verify_user");

module.exports = (app) => {

    router.route("/create_user").post(verify_admin, admin_create_user_handler);

    router.route("/requests").get(verify_user, admin_get_requests_handler);

    router.route("/students").get(verify_admin, get_students_handler);

    router.route("/teachers").get(verify_admin, get_teachers_handler);

    router.route("/admins").get(verify_admin, get_admins_handler);

    router.route("/accounts").get(verify_user, get_accounts_handler).post(verify_user, admin_create_user_handler).put(verify_admin, admin_update_user_handler);
    
    router.route("/classes").get(verify_user, admin_get_classes)
    
    router.route("/set_class_teacher").post(verify_admin, set_class_teacher);
    router.route("/search").get(verify_user, admin_search_handler);

    router.route("/accounts/:account_id").get(verify_user, get_account_handler);
    
    app.use("/api/admin", router)
}