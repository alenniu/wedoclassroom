const fs = require("fs");
const http = require("http");
const https = require("https");
const {exec, execSync, spawn, spawnSync} = require("child_process");
const config = require("../config");

const escapeRegex = function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

const email_regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

const password_regex = /^.*(?=.{5,})(?=.*[a-zA-Z])(?=.*\d)(?=.*[!#$%&? "]).*$/;

module.exports.password_requirements = "Password must be have at least 1 uppercase, 1 lowercase, 1 special character, 1 number and must be at least 5 characters.";

const url_regex = new RegExp("((https://([a-z]+)([\.]{1,1})([a-z]+))|(http://([a-z]+)([\.]{1,1})([a-z]+))|(^([a-z]+)([\.]{1,1})([a-z]+))|(^([a-z 0-9]+)([\.]{1,1})([a-z]+)))", "i");

const phone_regex = /^[\+]{1,1}[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/i;

module.exports.is_full_url = (s) => {
    const url_regex = /(^https?:\/\/)/i;

    return url_regex.test(s);
}

module.exports.validate_phone = (phone="") => {
    if(phone_regex.test(phone)){
        return true;
    }else{
        return false;
    }
}

module.exports.validate_website_url = (url="") => {
    if(url_regex.test(url)){
        return true;
    }else{
        return false;
    }
}

module.exports.validate_password = (password="") => {
    if(!password_regex.test(password)){
        return false;
    }else{
        return true;
    }
}

module.exports.validate_email = (email="") => {
    if(!email_regex.test(email)){
        return false;
    }else{
        return true;
    }
}
module.exports.wait = (time, resolve_with) => new Promise((resolve) => setTimeout(() => resolve(resolve_with), time));

module.exports.get_file_extension = (filename) => {
    if(typeof filename === "string" && filename.trim()){
        return filename.split(".").pop().trim();
    }

    return "";
}

module.exports.get_file_path = (filename) => {
    if(typeof filename === "string" && filename.trim()){
        return filename.split("/").slice(0, -1).join("/");
    }
}

module.exports.get_file_name = (file) => {
    if(typeof file === "string" && file.trim()){
        return file.split("/").pop();
    }
}

module.exports.get_filename_with_path_without_extension = (filename) => {
    if(typeof filename === "string" && filename.trim()){
        if(filename.split("/").pop().indexOf(".") !== -1){
            return filename.split(".").slice(0, -1).join(".");
        }else{
            return filename;
        }
    }

    return null;
}

module.exports.get_filename_without_extension = (filename) => {
    if(typeof filename === "string" && filename.trim()){
        if(filename.split("/").pop().indexOf(".") !== -1){
            return filename.split("/").pop().split(".").slice(0, -1).join(".");
        }else{
            return filename;
        }
    }

    return null;
}

module.exports.sanitize_file_path_component = (f) => {
    return f.replace(/[:()\s\/]/g, "-");
}

module.exports.sanitize_file_name = (f) => {
    return f.replace(/[:()\s\/]/g, "-");
}

module.exports.file_exists = (file) => {
    return fs.existsSync(file);
}

module.exports.create_directory = (dir) => {
    if(fs.existsSync(dir)){
        return true;
    }else{
        fs.mkdirSync(dir, {recursive: true});
        return true;
    }
}

module.exports.read_directory = (dir) => {
    return fs.readdirSync(dir, {withFileTypes: true, encoding: "utf8"}).filter((f) => f.isFile() || f.isDirectory()).map((f) => ({...f, type: f.isFile()?"file":f.isDirectory()?"folder":"unknown"}));
}

module.exports.delete_directory = (dir) => {
    fs.rmdirSync(dir, {recursive: true});
}

module.exports.delete_file = (file) => {
    fs.unlinkSync(file);
}

module.exports.remove_server_prefix_from_file = (filename) => {
    if(filename && typeof(filename) === "string"){
        if((filename.indexOf("server/") === 0) || (filename.indexOf("./server/") === 0)){
            return filename.replace("server/", "").replace(/\/\//g, "/");
        }

        return filename;
    }
}

module.exports.open_file = (file) => {
    fs.readFileSync(file);
    
    return xlsx_file;
}

module.exports.open_text_file = (file) => {
    try{
        const text = fs.readFileSync(file, "utf-8");
        
        return text;
    }catch(e){
        throw e;
    }
}

module.exports.open_json_file = (file) => {
    try{
        const raw_json = fs.readFileSync(file, "utf-8");
        
        return JSON.parse(raw_json);
    }catch(e){
        throw e;
    }
}

module.exports.get_full_image_url = (img, web_address=config.WEB_ADDRESS) => {
    return this.is_full_url(img)?img:`${web_address}/${img}`;
}

module.exports.escape_regex = (str="") => {
    try{
        return escapeRegex(str.toString());
    }catch(e){
        return "";
    }
}

module.exports.ranges_overlaps = (r1, r2) => {
    return r1.min <= r2.max && r2.min <= r1.max
}