const { get_classes_handler, create_class_handler, request_class_handler, accept_request_handler, decline_request_handler, update_student_attendance_handle, get_class_attendance_handler, get_class_handler, get_class_client_secret_handler, create_student_attendance_handle, get_classes_by_subject_handler, start_class_handler, end_class_handler, set_class_meeting_link_handler, cancel_class_handler, uncancel_class_handler, get_classes_schedules_handler, update_class_handler, get_available_classes_handler, remove_class_student_handler } = require("../handlers/class");
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

    router.route("/").get(verify_user, get_available_classes_handler).post(verify_user, class_cover_upload.single("cover"), create_class_handler).put(verify_user, class_cover_upload.single("cover"), update_class_handler);

    
    router.route("/attendance").get(verify_teacher, get_class_attendance_handler).post(verify_teacher, create_student_attendance_handle).put(verify_teacher, update_student_attendance_handle);
    
    router.route("/request").post(verify_student, request_class_handler);

    router.route("/schedules").get(verify_user, get_classes_schedules_handler);
    
    router.route("/set_meeting_link").post(verify_teacher, set_class_meeting_link_handler);
    
    router.route("/class/client_secret").get(verify_student, get_class_client_secret_handler);
    
    router.route("/request/accept").post(verify_user, accept_request_handler);
    router.route("/request/decline").post(verify_user, decline_request_handler);

    
    router.route("/set_meeting_link/class_id").post(verify_teacher, set_class_meeting_link_handler);

    router.route("/student/:class_id").delete(verify_user, remove_class_student_handler);
    
    router.route("/start/:class_id").post(verify_teacher, start_class_handler);
    router.route("/end/:class_id").post(verify_teacher, end_class_handler);
    router.route("/cancel/:class_id").post(verify_user, cancel_class_handler);
    router.route("/uncancel/:class_id").post(verify_user, uncancel_class_handler);
    
    router.route("/subject/:subject").get(verify_user, get_classes_by_subject_handler);
    
    router.route("/:class_id").get(verify_user, get_class_handler);


    app.use("/api/classes", router);
}