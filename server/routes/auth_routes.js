const get_user = require("../middleware/get_user");
const {check_login_handler, login_handler, signup_handler, logout_handler} = require("../handlers/auth");
const router = require("express").Router();

module.exports = (app) => {
    router.route("/login/check").get(get_user, check_login_handler)

    router.route("/login").post(login_handler);

    router.route("/signup").post(signup_handler);

    router.route("/logout").get(logout_handler)

    app.use("/api/auth", router);
}