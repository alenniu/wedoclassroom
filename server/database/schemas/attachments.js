const mongoose = require("mongoose");
const schema = mongoose.Schema;

const attachment_schema = new schema({
    name: {
        type: String
    },
    url: {
        type: String
    },
    filetype: {
        type: String
    },
    is_link: {
        type: Boolean,
        default: false
    },
    owner: {
        type: schema.Types.ObjectId,
        ref: "user"
    }
}, {timestamps: true});

mongoose.model("attachment", attachment_schema, "attachments");