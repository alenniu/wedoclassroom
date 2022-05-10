const mongoose = require("mongoose");
const { delete_file } = require("./utils");

const Attachments = mongoose.model("attachment");
const Attachment = Attachments;

async function get_attachments(user, limit=20, offset=0, search){
    try{
        let total = 0;
        let attachments = [];

        console.log(user);

        total = await Attachments.count({owner: user._id});
        
        if(total){
            attachments = await Attachments.find({owner: user._id}).limit(limit).skip(offset).lean(true);
        }

        return {attachments, total};
    }catch(e){
        throw e;
    }
}

async function create_attachment({name, url, filetype, _class, is_link}, owner){
    try{
        const new_attactment = await ((new Attachment({name, url, filetype, is_link, _class: _class._id, owner: owner._id})).save());

        return new_attactment;
    }catch(e){
        throw e;
    }
}

async function remove_attachment(attachment_id){
    try{
        const removed_attachment = await Attachments.findOne({_id: attachment_id});
    
        if(removed_attachment.is_link){
            removed_attachment.deleted = true;
        }else{
            delete_file(removed_attachment.url);
            removed_attachment.deleted = true;
        }
    
        removed_attachment.save()

        return removed_attachment;
    }catch(e){
        throw e;
    }
}

module.exports.get_attachments = get_attachments;
module.exports.create_attachment = create_attachment;
module.exports.remove_attachment = remove_attachment;