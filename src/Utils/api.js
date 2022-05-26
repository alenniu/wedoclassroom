import axios from "axios";
import config from "../Config";

const {backend_url} = config;

export async function api(method, path){
    if(method && path){
        method = method.toLowerCase();
        
        if(path[0] !== "/"){
            path = "/" + path;
        }

        const additional_args = [];
        
        if(method === "get" || method === "delete"){
            const config = arguments[2] || {withCredentials: true};
            additional_args.push(config);

        }else if(method === "post" || method === "put"){
            const body = arguments[2] || {};
            const config = arguments[3] || {withCredentials: true};
            additional_args.push(body, config)
        }else{
            console.error(`unsupported method "${method}"`)
            throw new Error(`unsupported method "${method}"`);
        }
    
        const res = await axios[method](`${backend_url}${path}`, ...additional_args).catch((e) => {
            console.error(e);

            return e.response || e.message
        });

        return res;
    }else{
        console.error("Method and path must be provided");
        throw new Error("Method and path must be provided")
    }
}