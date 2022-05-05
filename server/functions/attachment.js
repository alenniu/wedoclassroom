const mongoose = require("mongoose");

const Attachments = mongoose.model("attachment");
const Attachment = Attachments;

async function create_attachment({name, url, filetype, is_link}, owner){

}

async function remove_attachment(attachment_id){
    
}