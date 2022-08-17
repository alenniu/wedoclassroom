const get_user = require("../middleware/get_user");
const verify_user = require("../middleware/verify_user");
const { assignment_attachment_storage, class_cover_storage, MB } = require("../middleware/upload_middleware");
const multer = require("multer");
const { get_notifications_handler, create_notification_handler, read_notification_handler, read_notifications_handler, unread_notifications_handler, unread_notification_handler, get_unread_notifications_count_handler } = require("../handlers/notification");
const verify_admin = require("../middleware/verify_admin");

const router = require("express").Router();

// const notification_attactment_upload = multer({storage: notification_attachment_storage, fileFilter: (req, file, cb) => {
//     // console.log(file);
//     if(true || file.size <= (MB * 10)){
//         cb(null, true);
//     }else{
//         cb(new Error("File too large. 10MB limit."), false);
//     }
// }, limits: {fileSize: MB * 5}});

module.exports = (app) => {
    router.route("/").get(verify_user, get_notifications_handler).post(verify_admin, /* notification_attactment_upload.array("attachments"), */ create_notification_handler);

    router.route("/unread_count").get(verify_user, get_unread_notifications_count_handler);

    router.route("/read").post(verify_user, read_notifications_handler);
    router.route("/read/:notification_id").post(verify_user, read_notification_handler);

    router.route("/unread").post(verify_user, unread_notifications_handler);
    router.route("/unread/:notification_id").post(verify_user, unread_notification_handler);
    
    app.use("/api/notifications", router);
}