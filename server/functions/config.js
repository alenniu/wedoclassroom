const mongoose = require("mongoose");

const Configs = mongoose.model("config");
const Config = Configs;

async function get_or_create_config(defaults={subjects: ["Math", "English"], tags: ["math", "english", "ap", "beginner", "advanced"], levels: ["AP", "Beginner", "Advanced"]}){
    try{
        let config = await Configs.findOne({});

        if(!config){
            config = await (new Config(defaults || {subjects: [], tags: []})).save();
        }

        return config;
    }catch(e){
        console.log(e);
        throw e;
    }
}

async function update_config(config){
    try{
        delete config._id;
    
        return await Configs.findOneAndUpdate({}, {$set: config}, {new: true, upsert: false});
    }catch(e){
        console.log(e);
        throw e;
    }
}

module.exports.update_config = update_config;
module.exports.get_or_create_config = get_or_create_config;