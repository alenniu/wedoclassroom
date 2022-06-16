const get_user = require("../middleware/get_user");
const verify_user = require("../middleware/verify_user");
const { get_class_announcements_handler, create_announcement_handler, update_announcement_handler, delete_announcement_handler } = require("../handlers/announcement");
const router = require("express").Router();

module.exports = (app) => {
    router.route("/class").get(verify_user, get_class_announcements_handler);
    router.route("/").post(verify_user, create_announcement_handler).put(verify_user, update_announcement_handler).delete(verify_user, delete_announcement_handler);

    app.use("/api/announcements", router);
}