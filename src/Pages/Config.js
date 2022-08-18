import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { edit_config_value, edit_init_config, set_loading, update_config, get_config } from '../Actions';
import { useNavigate } from 'react-router-dom';
import { DAY, get_week_date_range, MONTHS } from '../Data';
import { debounce, get_full_image_url } from '../Utils';
import {Switch, TextField} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { ListInput } from '../Components/Common';

import "./Config.css";

const Dashboard = ({app_config, edit_config, user, is_admin, edit_init_config, edit_config_value, get_config, update_config, set_loading}) => {
    const navigate = useNavigate();
    const [errors, setErrors] = useState({});
    const {_id, subjects=[], levels=[], tags=[], day_start_time=new Date(), day_end_time=new Date(), semester_active=false, error=""} = edit_config;

    useEffect(() => {
        const init = async () => {
            if(!app_config._id){
                const res = await get_config();

                if(res){
                    const {config} = res;

                    edit_init_config(config);
                }
            }else{
                edit_init_config(app_config);
            }
        }

        init();
    }, []);

    const onClickUpdateConfig = async () => {
        if(edit_config._id){
            const formData = new FormData();
            set_loading(true);
            formData.append("config", JSON.stringify(edit_config));
            // console.log(edit_config, formData.get("config"));
            await update_config(formData); 
            set_loading(false);
        }
    }

    const onChangeValue = (keys=[]) => (value) => {
        const errKey = keys.join(".");
        edit_config_value(keys, value);

        setErrors(err => ({...err, [errKey]: ""}));
    }

    const onChangeValueEvent = (keys=[]) => (e) => {
        const {name, value, checked, type} = e.target;
        const is_checkbox = type === "checkbox";
        const is_number = type === "number";
        
        const errKey = name || keys.join(".");
        edit_config_value(keys, is_checkbox?checked:is_number?(Number(value) || ""):value);
        
        setErrors(err => ({...err, [errKey]: ""}));
    }

    const onAddSubject = (subject) => {
        subjects.push(subject);
        edit_config_value(["subjects"], subjects);
        setErrors(err => ({...err, subjects: ""}));
    }

    const onRemoveSubject = (index, subject) => {
        subjects.splice(index, 1);

        edit_config_value(["subjects"], subjects);
        setErrors(err => ({...err, subjects: ""}));
    }

    const onAddLevel = (level) => {
        levels.push(level);
        edit_config_value(["levels"], levels);
        setErrors(err => ({...err, levels: ""}));
    }

    const onRemoveLevel = (index, level) => {
        levels.splice(index, 1);

        edit_config_value(["levels"], levels);
        setErrors(err => ({...err, levels: ""}));
    }

    const onAddTag = (tag) => {
        tags.push(tag);
        edit_config_value(["tags"], tags);
        setErrors(err => ({...err, tags: ""}));
    }

    const onRemoveTag = (index, tag) => {
        tags.splice(index, 1);

        edit_config_value(["tags"], tags);
        setErrors(err => ({...err, tags: ""}));
    }

    return (
        <div className='page config'>
            <div className='main-col'>
                <h2>Edit Config</h2>

                <div className='input-container'>
                    <label>Subjects</label>
                    <ListInput always_show_matches={false} items={subjects} onAddItem={onAddSubject} onRemoveItem={onRemoveSubject} />
                </div>

                <div className='input-container'>
                    <label>Levels</label>
                    <ListInput always_show_matches={false} items={levels} onAddItem={onAddLevel} onRemoveItem={onRemoveLevel} />
                </div>

                <div className='input-container'>
                    <label>Suggested Tags</label>
                    <ListInput always_show_matches={false} items={tags} onAddItem={onAddTag} onRemoveItem={onRemoveTag} />
                </div>

                <div className='input-container'>
                    <label>Start Time</label>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <TimePicker
                        // label="Start Time"
                        value={day_start_time}
                        onChange={(v) => onChangeValue(["day_start_time"])(v || new Date())}
                        renderInput={(params) => <TextField {...params} />}
                    />
                    </LocalizationProvider>
                </div>

                <div className='input-container'>
                    <label>End Time</label>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <TimePicker
                        // label="End Time"
                        value={day_end_time}
                        onChange={(v) => onChangeValue(["day_end_time"])(v || new Date())}
                        renderInput={(params) => <TextField {...params} />}
                    />
                    </LocalizationProvider>

                </div>
                
                <div className='input-container'>
                    <label>Semester Active</label>
                    <Switch checked={semester_active} name="semester-active" onChange={onChangeValueEvent(["semester_active"])} />
                </div>
                
                <div style={{textAlign: "end"}}>
                    <button onClick={onClickUpdateConfig} className='button primary'>Update Config</button>
                    {error && <p className='error'>{error}</p>}
                </div>
            </div>

            <div className='misc-col'>
                
            </div>
        </div>
    );
}

function map_state_to_props({App, Auth, Admin}){
    return {app_config: App.config, edit_config: Admin.edit_config, user: App.user, is_admin: Auth.is_admin}
}

export default connect(map_state_to_props, {update_config, edit_init_config, edit_config_value, get_config, set_loading})(Dashboard);