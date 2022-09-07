import { Switch, TextField } from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import React, { useEffect, useState } from 'react';
import { BsCurrencyDollar, BsEye, BsEyeSlash } from 'react-icons/bs';
import { connect } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { update_account, edit_existing_account, init_edit_account, set_loading, cancel_account_edit, get_account } from '../../Actions';
import { INIT_EDIT_ACCOUNT } from '../../Actions/types';
import { password_requirements, validate_email, validate_name, validate_password } from '../../Utils';

import "./Account.css";
import "./EditAccount.css";

const EditAccount = ({edit_account, is_admin, get_account, update_account, edit_existing_account, set_loading}) => {

    const [password, setPassword] = useState("");
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [errors, setErrors] = useState({});
    
    const {_id, name={}, email="", phone="", type="", credits=0, gender, school, grade, date_enrolled=new Date(), emergency_contact={}, archived=false, error} = edit_account;
    const {name:emergency_name="", email:emergency_email="", phone:emergency_phone="", relation=""} = emergency_contact;
    const {first="", last=""} = name;
    const is_admin_account = type === "admin";
    const is_sales_account = type === "sales";
    const is_student_account = type === "student";
    const is_teacher_account = type === "teacher";
    
    const navigate = useNavigate()
    const {account_id} = useParams();
    
    useEffect(() => {
        const init = async () => {
            if(account_id && _id !== account_id){
                set_loading(true);
                await get_account(account_id, INIT_EDIT_ACCOUNT);
                set_loading(false);
            }
        }

        init();
    }, [account_id]);

    const validate_fields = () => {
        let is_valid = true;

        if(!type){is_valid=false; setErrors((e) => ({...e, type: "Type Must be selected"}))}
        
        if(!validate_email(email)){is_valid=false; setErrors((e) => ({...e, email: "Not a valid email"}))}
        
        if(!validate_name(name.first)){is_valid=false; setErrors((e) => ({...e, "name.first": "Not a valid name, At least 2 character"}))}
        
        if(!validate_name(name.last)){is_valid=false; setErrors((e) => ({...e, "name.last": "Not a valid name, At least 2 character"}))}
        
        if(password && !validate_password(password)){is_valid=false; setErrors((e) => ({...e, password: `Not a valid password, ${password_requirements}`}))}
        
        return is_valid;
    }

    const onChangeValueEvent = (keys=[]) => (e) =>{
        const {name, value, checked, type} = e.target;
        const is_checkbox = type === "checkbox";
        const is_number = type === "number";
        
        edit_existing_account(keys, is_checkbox?checked:is_number?(Number(value)||""):value);
        setErrors((e) => ({...e, [keys.join(".")]: ""}));
    }

    const onChangeValue = (keys=[]) => (v) =>{
        edit_existing_account(keys, v);
        setErrors((e) => ({...e, [keys.join(".")]: ""}));
    }
    
    const onChangePassword = (e) =>{
        setPassword(e.target.value);
        setErrors((e) => ({...e, password: ""}));
    }

    const onClickPasswordEye = () => {
        setPasswordVisible((v) => !v);
    }

    const onPressEditAccount = async () => {
        set_loading(true);
        if(validate_fields()){
            if(await update_account({...edit_account, archived: archived, credits: credits || 0, password: password || undefined})){
                setPassword("");
            }
        }
        set_loading(false);
    }

    return (
        <div className='page account edit-account'>
            <div className='main-col'>
                <h2>Edit Account</h2>
                <div className='input-container'>
                    <input type="text" value={first} onChange={onChangeValueEvent(["name", "first"])} placeholder='First Name' />
                    {errors["name.first"] && <p className='error'>{errors["name.first"]}</p>}
                </div>

                <div className='input-container'>
                    <input type="text" value={last} onChange={onChangeValueEvent(["name", "last"])} placeholder='Last Name' />
                    {errors["name.last"] && <p className='error'>{errors["name.last"]}</p>}
                </div>

                <div className='input-container'>
                    <input type="text" value={email} onChange={onChangeValueEvent(["email"])} placeholder='youremail@example.com' />
                    {errors["email"] && <p className='error'>{errors["email"]}</p>}
                </div>

                <div className='input-container'>
                    <input type="text" value={phone} onChange={onChangeValueEvent(["phone"])} placeholder='Phone Number' />
                    {errors["phone"] && <p className='error'>{errors["phone"]}</p>}
                </div>

                <div className='input-container'>
                    <select value={gender} onChange={onChangeValueEvent(["gender"])}>
                        <option value={""}>Gender</option>
                        <option value={"male"}>Male</option>
                        <option value="female">Female</option>   
                    </select>

                    {errors["gender"] && <p className='error'>{errors["gender"]}</p>}
                </div>

                <div className='input-container'>
                    <select value={type} onChange={onChangeValueEvent(["type"])}>
                        <option>Account Type</option>
                        
                        {is_admin && <option value="admin">Admin</option>}
                        
                        {is_admin && <option value="sales">Sales</option>}
                        
                        {is_admin && <option value="teacher">Teacher</option>}
                        
                        <option value="student">Student</option>
                    </select>
                    {errors["type"] && <p className='error'>{errors["type"]}</p>}
                </div>

                {is_student_account && (
                    <>
                    <div className='input-container'>
                        <input type="text" value={school} onChange={onChangeValueEvent(["school"])} placeholder='Current School' />
                        {errors["school"] && <p className='error'>{errors["school"]}</p>}
                    </div>

                    <div className='input-container'>
                        <input type="text" value={grade} onChange={onChangeValueEvent(["grade"])} placeholder='Current Grade' />
                        {errors["grade"] && <p className='error'>{errors["grade"]}</p>}
                    </div>

                    <div className='input-container'>
                        <label className='border'>Date Enrolled</label>
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <DatePicker
                            // label="Start Time"
                            value={date_enrolled}
                            onChange={(v) => onChangeValue(["date_enrolled"])(v || new Date())}
                            renderInput={(params) => <TextField {...params} />}
                        />
                        </LocalizationProvider>
                    </div>
                    </>
                )}

                <div className='input-container'>
                    <input type={passwordVisible?"text":"password"} value={password} onChange={onChangePassword} placeholder={"Leave blank to keep current password"} />
                    <div className='input-adornment end' style={{backgroundColor: "transparent"}}>
                        <span className='clickable' onClick={onClickPasswordEye}>{passwordVisible?<BsEye />:<BsEyeSlash />}</span>
                    </div>
                </div>
                {errors["password"] && <p className='error'>{errors["password"]}</p>}

                <div className='input-container'>
                    <input type="text" value={emergency_name} onChange={onChangeValueEvent(["emergency_contact", "name"])} placeholder='Emergency Contact Name' />
                </div>

                <div className='input-container'>
                    <input type="text" value={emergency_email} onChange={onChangeValueEvent(["emergency_contact", "email"])} placeholder='Emergency Contact email' />
                </div>

                <div className='input-container'>
                    <input type="text" value={emergency_phone} onChange={onChangeValueEvent(["emergency_contact", "phone"])} placeholder='Emergency Contact phone' />
                </div>

                <div className='input-container'>
                    <input type="text" value={relation} onChange={onChangeValueEvent(["emergency_contact", "relation"])} placeholder='Emergency Contact relation' />
                </div>

                {is_student_account && <div className='input-container'>
                    <input type="number" value={credits} onChange={onChangeValueEvent(["credits"])} placeholder='Credits' style={{paddingLeft: "50px"}} />
                    <div className='input-adornment start' style={{backgroundColor: "transparent", borderRight: "2px solid rgba(0,0,0,0.1)"}}>
                        <BsCurrencyDollar color='rgba(0,0,0,0.3)' size={"20px"} />
                    </div>
                </div>}

                <div style={{"--mr": 0}} className='input-container'>
                    <label>Archived</label>
                    {is_admin?<Switch
                        // label="Start Time"
                        checked={archived}
                        onChange={onChangeValueEvent(["archived"])}
                    />:<input type="text" value={archived?"Yes":"No"} readOnly style={{color: archived?"red":"green"}} />}
                </div>

                <button style={{marginBottom: 20}} className='button error fullwidth' onClick={() => {cancel_account_edit(); navigate("/dashboard/accounts")}}>Cancel Edit</button>
                <button className='button primary fullwidth' onClick={onPressEditAccount}>Edit Account</button>
                {error && <p className='error'>{error}</p>}
            </div>
        </div>
    );
}

function map_state_to_props({User, Admin, Auth}){
    return {edit_account: Admin.edit_account, is_admin: Auth.is_admin}
}

export default connect(map_state_to_props, {get_account, update_account, edit_existing_account, init_edit_account, cancel_account_edit, set_loading})(EditAccount);