const multer = require("multer");
const { get_requests_handler, upload_attachment_handler, get_attachments_handler } = require("../handlers/user");
const { attachment_storage, MB } = require("../middleware/upload_middleware");
const verify_user = require("../middleware/verify_user");

const router = require("express").Router();

const attachment_upload = multer({storage: attachment_storage, fileFilter: (req, file, cb) => {
    console.log(file);
    if(true || file.size <= (MB * 10)){
        cb(null, true);
    }else{
        cb(new Error("File too large. 10MB limit."), false);
    }
}, limits: {fileSize: MB * 10}});

module.exports = (app) => {

    router.route("/attachment/uploads").get(verify_user, get_attachments_handler).post(verify_user, attachment_upload.single("attachment"), upload_attachment_handler);

    router.route("/requests").get(verify_user, get_requests_handler);

    app.use("/api/user", router)
}