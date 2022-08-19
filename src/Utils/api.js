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
            const config =  {withCredentials: true, ...(arguments[2] || {})};
            additional_args.push(config);

        }else if(method === "post" || method === "put"){
            const body = arguments[2] || {};
            const config = {withCredentials: true, ...(arguments[3] || {})};
            additional_args.push(body, config)
        }else{
            console.error(`unsupported method "${method}"`)
            throw new Error(`unsupported method "${method}"`);
        }
    
        const res = await axios[method](`${backend_url}${path}`, ...additional_args).catch((e) => {
            console.error(e);

            return {data: e.response.data, message: e.message}
        });

        return res;
    }else{
        console.error("Method and path must be provided");
        throw new Error("Method and path must be provided")
    }
}