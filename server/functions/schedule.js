const mongoose = require("mongoose");
const { user_exists } = require("./user");
const { ranges_overlaps } = require("./utils");

const Schedules = mongoose.model("schedule");
const Schedule = Schedules;

async function create_new_schedule(user){
    try{
        return await ((new Schedule({user: user._id, items: []})).save())
    }catch(e){
        throw e;
    }
}

async function get_schedule(user){
    try{
        let current_user = await user_exists("_id", user._id);

        let user_schedule = await Schedules.findOne({user: current_user._id}) || await create_new_schedule(current_user);

        if(!current_user.schedule || (current_user.schedule.toString() !== user_schedule._id)){
            current_user.schedule = user_schedule;
            current_user = await current_user.save();

            user = current_user;
        }

        return user_schedule;
    }catch(e){
        throw e;
    }
}

async function add_item_to_schedule({name, description, start_date, duration, end_date, _class}, user){
    try{
        if(name && start_date && _class && (duration || end_date)){
            start_date = new Date(start_date);
            end_date = new Date(end_date || (start_date.getTime() + duration));
            duration = duration || (end_date.getTime() - start_date.getTime());

            let user_schedule = await get_schedule(user);
        
            const new_time_range = {min: start_date.getTime(), max: end_date.getTime()}
            
            const overlapping_item = user_schedule.items.find((item) => {
                const item_start_date = new Date(item.start_date);
                const item_end_date = new Date(item.end_date || (item_start_date.getTime() + item.duration));
        
                const time_range = {min: item_start_date.getTime(), max: item_end_date.getTime()};
        
                return ranges_overlaps(time_range, new_time_range);
            });
        
            if(!overlapping_item){
                user_schedule.items.push({name, description, start_date, duration, end_date, _class: _class._id, missed: false, created: new Date()});

                user_schedule = await user_schedule.save();

                return user_schedule;
            }else{
                console.log
                throw new Error(`This new item conflicts with an existing item in your schedule. existing Item: ${JSON.stringify(overlapping_item)}`);
            }
        }else{
            throw new Error("name, start_date, _class and either duration or end_date are required")
        }
    }catch(e){
        throw e;
    }
}

async function update_schedule_item(item, user){
    try{
        let user_schedule = await get_schedule(user);
    
        const index = user_schedule.items.findIndex(({_id}) => _id.toString() === item._id.toString());

        if(index !== -1){
            user_schedule.items[index] = {...user_schedule.items[index], ...item, _id: user_schedule.items[index]._id};
            user_schedule = await user_schedule.save()
        }else{
            throw new Error("Item not found in schedule");
        }

        return user_schedule;
    }catch(e){
        throw e;
    }
}

async function remove_item_from_schedule(item_id, user){
    try{
        let user_schedule = await get_schedule(user);
    
        const index = user_schedule.items.findIndex(({_id}) => _id.toString() === item_id.toString());
    
        if(index !== -1){
            user_schedule.items.splice(index, 1);
            user_schedule = await user_schedule.save();
        }else{
            throw new Error("Item not found in schedule");
        }
    
        return user_schedule;
    }catch(e){
        throw e;
    }
}

module.exports.get_schedule = get_schedule;
module.exports.add_item_to_schedule = add_item_to_schedule;
module.exports.update_schedule_item = update_schedule_item;
module.exports.remove_item_from_schedule = remove_item_from_schedule;