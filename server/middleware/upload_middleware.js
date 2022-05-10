const multer = require("multer");
const config = require("../config");
const {create_directory, sanitize_file_name, sanitize_file_path_component} = require("../functions/utils");

const KB = 1024;
const MB = KB * 1024;
const GB = MB * 1024;

module.exports.KB = KB;
module.exports.MB = MB;
module.exports.GB = GB;

const filename = (req, file, cb) => {
    const now = new Date().toISOString();
    cb(null,  sanitize_file_name(now + "-" + file.originalname));
}

module.exports.attachment_storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let {user} = req;
        let {_class="{}"} = req.body;

        _class = JSON.parse(_class);

        const {subject} = _class;

        const attachment_directory = `./uploads/ATTACHMENTS/${sanitize_file_path_component(user.name.first)}-${sanitize_file_path_component(user.name.last)}/${sanitize_file_path_component(subject)}`;
        
        create_directory(attachment_directory);
        cb(null, attachment_directory)
    },
    filename
});