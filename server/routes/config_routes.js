
const multer = require("multer");
const get_user = require("../middleware/get_user");
const verify_user = require("../middleware/verify_user");
const verify_admin = require("../middleware/verify_admin");
const verify_teacher = require("../middleware/verify_teacher");
const verify_student = require("../middleware/verify_student");
const { update_config_handler, get_config_handler } = require("../handlers/config");
const { MB } = require("../middleware/upload_middleware");

const router = require("express").Router();

const upload = multer({storage: multer.diskStorage({}), fileFilter: (req, file, cb) => {}, limits: {fileSize: MB * 5}});

module.exports = (app) => {
    router.route("/").get(get_user, get_config_handler).put(verify_admin, update_config_handler);

    app.use("/api/config", router);
}