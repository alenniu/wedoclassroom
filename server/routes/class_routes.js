const { get_classes_handler, create_class_handler, request_class_handler, accept_request_handler, decline_request_handler, update_student_attendance_handle, get_class_attendance_handler, get_class_handler } = require("../handlers/class");
const verify_admin = require("../middleware/verify_admin");
const verify_user = require("../middleware/verify_user");
const verify_student = require("../middleware/verify_student");
const verify_teacher = require("../middleware/verify_teacher");
const multer = require("multer");
const { attachment_storage, class_cover_storage, MB } = require("../middleware/upload_middleware");

const router = require("express").Router();

const class_cover_upload = multer({storage: class_cover_storage, fileFilter: (req, file, cb) => {
    // console.log(file);
    if(true || file.size <= (MB * 10)){
        cb(null, true);
    }else{
        cb(new Error("File too large. 10MB limit."), false);
    }
}, limits: {fileSize: MB * 5}});

module.exports = (app) => {

    router.route("/").get(verify_user, get_classes_handler).post(verify_user, class_cover_upload.single("cover"), create_class_handler);

    
    router.route("/attendance").get(verify_teacher, get_class_attendance_handler).post(verify_teacher, update_student_attendance_handle);
    
    router.route("/request").post(verify_student, request_class_handler);
    
    router.route("/:class_id").get(verify_user, get_class_handler);

    router.route("/request/accept").post(verify_user, accept_request_handler);
    router.route("/request/decline").post(verify_user, decline_request_handler);

    app.use("/api/classes", router);
}