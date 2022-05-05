const multer = require("multer");
const config = require("../config");
const {create_directory, sanitize_file_name} = require("../functions/utils");

const filename = (req, file, cb) => {
    const now = new Date().toISOString();
    cb(null,  sanitize_file_name(now + "-" + file.originalname));
}

module.exports.attachment_storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let {_class="{}"} = req.body;

        _class = JSON.parse(_class);

        const {teacher, subject} = _class;

        const {name} = teacher;

        const attachment_directory = `./uploads/ATTACHMENTS/${name.first}-${name.last}/${subject}`;
        
        create_directory(attachment_directory);
        cb(null, attachment_directory)
    },
    filename
});