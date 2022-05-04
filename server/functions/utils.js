const email_regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

const password_regex = /^.*(?=.{5,})(?=.*[a-zA-Z])(?=.*\d)(?=.*[!#$%&? "]).*$/;

module.exports.password_requirements = "Password must be have at least 1 uppercase, 1 lowercase, 1 special character, 1 number and must be at least 5 characters.";

const url_regex = new RegExp("((https://([a-z]+)([\.]{1,1})([a-z]+))|(http://([a-z]+)([\.]{1,1})([a-z]+))|(^([a-z]+)([\.]{1,1})([a-z]+))|(^([a-z 0-9]+)([\.]{1,1})([a-z]+)))", "i");

const phone_regex = /^[\+]{1,1}[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/i;

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