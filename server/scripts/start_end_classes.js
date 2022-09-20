const node_cron = require("node-cron");
const mongoose = require("mongoose");
const {  } = require("../config/keys");


const db_init = require("../database/init");
db_init();

require("../database/schemas/users");
require("../database/schemas/config");
require("../database/schemas/classes");
require("../database/schemas/sessions");
require("../database/schemas/invoices");
require("../database/schemas/requests");
require("../database/schemas/attendance");
require("../database/schemas/attachments");
require("../database/schemas/assignments");
require("../database/schemas/announcements");
require("../database/schemas/notifications");

const { TemplatedMail } = require("../services/mail");

const { get_or_create_config } = require("../functions/config");
const { HOUR } = require("../values");

const Users = mongoose.model("user");
const User = Users;

const Classes = mongoose.model("class");
const Class = Classes;

const { start_class, end_class } = require("../functions/class");
const { is_same_day } = require("../functions/utils");

const is_same_lesson = (lesson1, lesson2) => {
    if(is_same_day(lesson1.date, lesson2.date)){
        const lesson1_start_time = new Date(lesson1.start_time);
        const lesson2_start_time = new Date(lesson2.start_time);

        return lesson1_start_time.getTime() === lesson2_start_time.getTime()
    }

    return false;
}

async function start_classes(page=0, limit=100, app_config={}){
    const {} = app_config

    const current_date = new Date();
    const current_day = current_date.getDay();

    const startPeriod = new Date(current_date);
    startPeriod.setHours(0, 0, 0, 0);
    const endPeriod = new Date(current_date);
    endPeriod.setHours(23, 59, 59);

    const currentTime = new Date(current_date);
    currentTime.setFullYear(1970, 0, 1);

    const current_hours_time = currentTime.getTime();

    const classes = await Classes.find({archived: {$ne: true}, current_session: null, $and: [{$or: [{end_date: {$gte: startPeriod}, start_date: {$lte: endPeriod}}, {custom_dates: {$elemMatch: {date: {$gte: startPeriod, $lte: endPeriod}}}}]}, {$or: [{schedules: {$elemMatch: {days: current_day, daily_start_time: {$lte: current_hours_time}, daily_end_time: {$gte: current_hours_time}}}}, {custom_dates: {$elemMatch: {date: {$gte: startPeriod, $lte: endPeriod}, start_time: {$lte: currentTime}, end_time: {$gte: currentTime}, cancelled: {$ne: true}}}}]}]}).populate({path: "teacher", select: "-password"}).limit(limit).skip(page * limit);
    
    // console.log({current_day, startPeriod, endPeriod, current_hours_time, currentTime});
    console.log(classes.map(({title, schedules, cancelled_dates, custom_dates}) => ({title, schedules, custom_dates, cancelled_dates})), "Classes to start!!!", classes.length);

    for(const _class of classes){
        const {title, cancelled_dates=[], custom_dates=[], schedules=[]} = _class;
        
        let cancelled = false;

        const matching_schedule = schedules.find((s) => s.days.includes(current_day) && (s.daily_start_time <= current_hours_time) && (s.daily_end_time >= current_hours_time));

        let duration_hours = 0;

        if(matching_schedule){
            cancelled = cancelled_dates.some((cd) => is_same_lesson({date: current_date, start_time: matching_schedule.daily_start_time, end_time: matching_schedule}, cd));

            if(!cancelled){
                duration_hours = (matching_schedule.daily_end_time - matching_schedule.daily_start_time)/HOUR;
            }
        }else{
            console.log(`No matching schedule found for ${title}. Checking Custom Dates!!!`);
            
            const matching_custom_date = custom_dates.find((cd) => is_same_day(cd.date, current_date) && (new Date(cd.start_time).getTime() <= current_hours_time) && (new Date(cd.end_time).getTime() >= current_hours_time) && !cd.cancelled);
            
            if(matching_custom_date){
                console.log(`Matching Custom Date Found for ${title}!!!`);

                duration = (new Date(matching_custom_date.end_time).getTime() - new Date(matching_custom_date.start_time).getTime())/HOUR;
                
                cancelled = false;
            }else{
                console.log(`No matching custom date found for ${title}. How tf did this pass the filter???`);
                continue;
            }
        }

        if(!cancelled){
            await start_class({_class, meeting_link: "", duration_hours: Number(duration_hours.toPrecision(2))}, _class.teacher);
        }else{
            console.log(`${title} was cancelled`)
        }
    }

    if(classes.length){
        await start_classes(page+1, limit, app_config);
    }

    return;
}

async function end_classes(app_config={}){
    const {} = app_config;

    const current_date = new Date();
    const current_day = current_date.getDay();

    const startPeriod = new Date(current_date);
    startPeriod.setHours(0, 0, 0, 0);
    const endPeriod = new Date(current_date);
    endPeriod.setHours(23, 59, 59);

    const currentTime = new Date(current_date);
    currentTime.setFullYear(1970, 0, 1);

    const current_hours_time = currentTime.getTime();

    const classes_to_not_end = await Classes.find({archived: {$ne: true}, $and: [{current_session: {$ne: null}}, {current_session: {$exists: true}}, {$or: [{end_date: {$gte: startPeriod}, start_date: {$lte: endPeriod}}, {custom_dates: {$elemMatch: {date: {$gte: startPeriod, $lte: endPeriod}}}}]}, {$or: [{schedules: {$elemMatch: {days: current_day, daily_start_time: {$lte: current_hours_time}, daily_end_time: {$gte: current_hours_time}}}}, {custom_dates: {$elemMatch: {date: {$gte: startPeriod, $lte: endPeriod}, start_time: {$lte: currentTime}, end_time: {$gte: currentTime}}}}]}]}).populate({path: "teacher", select: "-password"}).limit(0);

    console.log(classes_to_not_end.map(({title, schedules, custom_dates}) => ({title, schedules, custom_dates})), "Classes to not end!!!", classes_to_not_end.length);

    const classes_to_end = await Classes.find({archived: {$ne: true}, _id: {$nin: classes_to_not_end.map((cnd) => cnd._id)}, $and: [{current_session: {$ne: null}}, {current_session: {$exists: true}}]}).limit(0);

    console.log(classes_to_end.map(({title, schedules, custom_dates}) => ({title, schedules, custom_dates})), "Classes to end!!!", classes_to_end.length);

    for(const _class of classes_to_end){
        await end_class({_class}, _class.teacher);
    }

    // if(classes_to_end.length){
    //     await end_classes(page+1, limit, app_config);
    // }

    return;
}

const scheduled = typeof(process.env.SCHEDULED) !== "undefined"?process.env.SCHEDULED !== "false":true;

const task_func = async () => {
    console.log("Task started!!!");
    
    const app_config = await get_or_create_config();
    
    await start_classes(0, 100, app_config);
    await end_classes(0, 100, app_config);
    
    console.log("done");
    !scheduled && process.exit(0);
}

const task = node_cron.schedule("*/5 * * * *", task_func, {scheduled, timezone: "Europe/Copenhagen"});

if(!scheduled){
    console.log("Running Immediately", !scheduled);
    task_func();
}