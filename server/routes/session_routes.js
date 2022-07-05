const { get_sessions_handler, get_class_sessions_handler } = require("../handlers/session");
const get_user = require("../middleware/get_user");
const verify_admin = require("../middleware/verify_admin");
const verify_user = require("../middleware/verify_user");

const router = require("express").Router();

module.exports = (app) => {
    router.route("/").get(verify_admin, get_sessions_handler);
    
    router.route("/:class_id").get(verify_user, get_class_sessions_handler);
    
    app.use("/api/sessions", router);
}