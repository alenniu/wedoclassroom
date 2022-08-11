import config from "../Config";
import { DAY, HOUR, MINUTE, SECOND } from "../Data";

const email_regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

const password_regex = /^.*(?=.{5,})(?=.*[a-zA-Z])(?=.*\d)(?=.*[!#$%&? "]).*$/;

export const password_requirements = "Password must be have at least 1 uppercase, 1 lowercase, 1 special character, 1 number and must be at least 5 characters.";

const url_regex = new RegExp("((https://([a-z]+)([\.]{1,1})([a-z]+))|(http://([a-z]+)([\.]{1,1})([a-z]+))|(^([a-z]+)([\.]{1,1})([a-z]+))|(^([a-z 0-9]+)([\.]{1,1})([a-z]+)))", "i");

const phone_regex = /^[\+]{1,1}[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{2,6}$/i;

export const is_full_url = (s:String) => {
    const url_regex = /(^https?:\/\/)/i;

    return url_regex.test(s);
}

export const get_full_image_url = (u:String="") => {
    if(is_full_url(u) || !u){
        return u;
    }else{
        // console.log("u", u);
        u = u?.replace(/\\/g, "/") || u;
        if(u[0] === "/"){
            u = u.slice(1);
        }

        return `${config.backend_url}/` + u.replace(/\/\//g, "/");
    }
}

export const validate_phone = (phone="") => {
    if(phone_regex.test(phone)){
        return true;
    }else{
        return false;
    }
}

export const validate_website_url = (url="") => {
    if(url_regex.test(url)){
        return true;
    }else{
        return false;
    }
}

export const validate_password = (password="") => {
    if(!password_regex.test(password)){
        return false;
    }else{
        return true;
    }
}

export const validate_email = (email="") => {
    if(!email_regex.test(email)){
        return false;
    }else{
        return true;
    }
}

export const validate_name = (name) => {
    return name && name.length > 1;
}

export const update_object = (keys, value, obj={}) => {
    let curr = obj;

    if(keys.length){
        for(let i=0; i < keys.length; i++){
            const key = keys[i];
            const is_last = (keys.length-1) === i;

            if(is_last){
                curr[key] = value;
            }else{
                curr[key] = curr[key] || (Number.isInteger(keys[i+1])?[]:{});
                curr = curr[key];
            }
        }
    }

    return obj;
}

export function debounce(cb, delay = 1000) {
    let timeout;
  
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        cb(...args);
      }, delay);
    }
  }

export function throttle(cb, delay = 1000) {
    let shouldWait = false;
    let waitingArgs;
    const timeoutFunc = () => {
      if (waitingArgs == null) {
        shouldWait = false;
      } else {
        cb(...waitingArgs);
        waitingArgs = null;
        setTimeout(timeoutFunc, delay);
      }
    }
  
    return (...args) => {
      if (shouldWait) {
        waitingArgs = args;
        return;
      }
  
      cb(...args);
      shouldWait = true;
  
      setTimeout(timeoutFunc, delay);
    };
}

export const address_to_string = (address) => {
    if(address){
        const {address_lines=[], city, state, country, country_code, address_string, zipcode} = address;
    
        return address_string || `${address_lines.join(", ")}, ${city}, ${state}, ${country_code || country}, ${zipcode}`
    }

    return "";
}

export const print = () => {
    window.print();
}

export const onPressReturn = (func) => ({key, keyCode, which}) => {
    if(key === "Enter" || which == 13 || keyCode == 13){
        func();
    }
}

export const randomColor = () => "#" + Math.floor(Math.random()*16777215).toString(16);

export const ranges_overlaps = (r1, r2) => {
    return r1.min <= r2.max && r2.min <= r1.max;
}

export const get_time_left = (til=0, from=Date.now()) => {
    from = (new Date(from)).getTime();
    til = (new Date(til)).getTime();

    let duration = til - from;
    let timeLeft = duration;

    const days = Math.floor(timeLeft / DAY);
    timeLeft -= (DAY * days);
    const hours = Math.floor(timeLeft / HOUR);
    timeLeft -= (HOUR * hours);
    const minutes = Math.floor(timeLeft / MINUTE);
    timeLeft -= (MINUTE * minutes);
    const seconds = Math.floor(timeLeft / SECOND);
    timeLeft -= (SECOND * seconds);

    return {days, hours, minutes, seconds, milliseconds: timeLeft, duration};
}

export const toMoneyString = (amount=0, locale="en-US", currency="USD") => {
    return amount.toLocaleString(locale, {style: "currency", currency});
}

export const ordinal_suffix = (i) => {
    var j = i % 10,
        k = i % 100;
    if (j == 1 && k != 11) {
        return i + "st";
    }
    if (j == 2 && k != 12) {
        return i + "nd";
    }
    if (j == 3 && k != 13) {
        return i + "rd";
    }
    return i + "th";
}

export const isWebkit = () => 'webkitRequestAnimationFrame' in window;