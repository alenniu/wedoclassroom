const router = require("express").Router();
const { admin_create_user_handler } = require("../handlers/admin");
const verify_admin = require("../middleware/verify_admin");

module.exports = (app) => {

    router.route("/create_user").post(verify_admin, admin_create_user_handler);

    app.use("/api/admin", router)
}