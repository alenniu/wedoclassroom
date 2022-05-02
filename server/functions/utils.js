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