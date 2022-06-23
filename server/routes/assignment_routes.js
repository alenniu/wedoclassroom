const get_user = require("../middleware/get_user");
const verify_user = require("../middleware/verify_user");
const { get_class_assignments_handler, create_assignment_handler, update_assignment_handler, delete_assignment_handler, get_assignments_handler } = require("../handlers/assignment");
const { assignment_attachment_storage, class_cover_storage, MB } = require("../middleware/upload_middleware");
const multer = require("multer");

const router = require("express").Router();

const assignment_attactment_upload = multer({storage: assignment_attachment_storage, fileFilter: (req, file, cb) => {
    // console.log(file);
    if(true || file.size <= (MB * 10)){
        cb(null, true);
    }else{
        cb(new Error("File too large. 10MB limit."), false);
    }
}, limits: {fileSize: MB * 5}});

module.exports = (app) => {

    router.route("/class").get(verify_user, get_class_assignments_handler);
    
    router.route("/").get(verify_user, get_assignments_handler).post(verify_user, assignment_attactment_upload.array("attachments"), create_assignment_handler).put(verify_user, update_assignment_handler).delete(verify_user, delete_assignment_handler);

    app.use("/api/assignments", router);
}