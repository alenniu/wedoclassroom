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
    console.log(classes.map(({title, schedules, custom_dates}) => ({title, schedules, custom_dates})), "Classes to start!!!", classes.length);

    for(const _class of classes){
        await start_class({_class, meeting_link: ""}, _class.teacher);
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