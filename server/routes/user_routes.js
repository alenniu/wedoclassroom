const { get_requests_handler } = require("../handlers/user");
const verify_user = require("../middleware/verify_user");

const router = require("express").Router();

module.exports = (app) => {

    router.route("/requests").get(verify_user, get_requests_handler);

    app.use("/api/user", router)
}