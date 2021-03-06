import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { cancel_account_edit, create_account, edit_new_account, get_accounts, init_edit_account, set_loading, update_account } from '../Actions';
import Tabs from '../Components/Common/Tabs';
import Class from '../Components/Dashboard/Class';
import {BsEye, BsEyeSlash} from "react-icons/bs";

import "./Dashboard.css";
import "./Accounts.css";
import TableHead from '../Components/Common/TableHead';
import { password_requirements, validate_email, validate_name, validate_password } from '../Utils';

const Accounts = ({accounts=[], total=0, new_account={}, edit_account={}, editing_account, get_accounts, create_account, update_account, edit_new_account, init_edit_account, cancel_account_edit, set_loading}) => {
    const [pageLimit, setPageLimit] = useState(20);
    const [page, setPage] = useState(0);
    const [search, setSearch] = useState("");

    const [order, setOrder] = useState("");
    const [orderBy, setOrderBy] = useState("");
    const [sort, setSort] = useState("{}");
    const [accountType, setAccountType] = useState("")

    const [password, setPassword] = useState("");
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [errors, setErrors] = useState({});
    const {name={}, email="", phone="", type="", error} = editing_account?edit_account:new_account
    const {first="", last=""} = name;

    useEffect(() => {
        const init = async () => {
            set_loading(true);
            await get_accounts(pageLimit, page);
            set_loading(false);
        }

        init();
    }, []);

    useEffect(() => {
        const init = async () => {
            set_loading(true);
            await get_accounts(pageLimit, page, search, sort, accountType?JSON.stringify({type: accountType}):undefined)
            set_loading(false);
        }
        
        init();
    }, [accountType, sort]);
    
    const onPressTab = (e, {label, id}, index) => {
        setAccountType(id);
    }
    
    const onSortTable = (e, {label, id}, index) => {
        
        const isAsc = orderBy === id && order === "asc";
        const new_order = isAsc?"desc":"asc";
        
        setOrder(new_order);
        setOrderBy(id);
        
        if(id === "name"){
            setSort(JSON.stringify({"name.first": new_order, "name.last": new_order}))
        }else{
            setSort(JSON.stringify({[id]: new_order}))
        }
    }
    
    const onChangeValue = (keys=[]) => (e) =>{
        edit_new_account(keys, e.target.value);
        setErrors((e) => ({...e, [keys.join(".")]: ""}));
    }
    
    const onChangePassword = (e) =>{
        setPassword(e.target.value);
        setErrors((e) => ({...e, password: ""}));
    }

    const onClickPasswordEye = () => {
        setPasswordVisible((v) => !v);
    }
    
    const validate_fields = () => {
        let is_valid = true;

        if(!type){is_valid=false; setErrors((e) => ({...e, type: "Type Must be selected"}))}
        
        if(!validate_email(email)){is_valid=false; setErrors((e) => ({...e, email: "Not a valid email"}))}
        
        if(!validate_name(name.first)){is_valid=false; setErrors((e) => ({...e, "name.first": "Not a valid name, At least 2 character"}))}
        
        if(!validate_name(name.last)){is_valid=false; setErrors((e) => ({...e, "name.last": "Not a valid name, At least 2 character"}))}
        
        if((!editing_account || password) && !validate_password(password)){is_valid=false; setErrors((e) => ({...e, password: `Not a valid password, ${password_requirements}`}))}
        
        return is_valid;
    }
    
    const onPressCreateAccount = async () => {
        set_loading(true);
        if(validate_fields()){
            if(await create_account({name, email, phone, type, password})){
                setPassword("");
                await get_accounts(pageLimit, page, search, sort, accountType?JSON.stringify({type: accountType}):undefined);
            }
        }
        set_loading(false);
    }

    const onPressEditAccount = async () => {
        set_loading(true);
        if(validate_fields()){
            if(await update_account({...edit_account, password: password || undefined})){
                setPassword("");
                await get_accounts(pageLimit, page, search, sort, accountType?JSON.stringify({type: accountType}):undefined);
            }
        }
        set_loading(false);
    }

    return (
        <div className='page accounts'>
            <div className='main-col'>
                <Tabs onPressTab={onPressTab} tabs={[{label: "All", id: ""}, {label: "Teachers", id: "teacher"}, {label: "Students", id: "student"}, {label: "Admins", id: "admin"}]} />

                <table>
                    <TableHead headers={[{label: "Name", id: "name"}, {label: "Email", id: "email"}, {label: "Phone", id: "phone"}, {label: "Type", id: "type"}, {label: "Created", id: "createdAt"}]} order={order} orderBy={orderBy} onSort={onSortTable} />

                    <tbody>
                        {accounts.map((a) => {
                            const {_id, name={}, email, phone, type, createdAt} = a;

                            return (
                                <tr key={_id} onClick={() => {init_edit_account(a); setPassword("")}}>
                                    <td>{name.first} {name.last}</td>
                                    <td>{email}</td>
                                    <td>{phone || <span style={{opacity: 0.5}}>No Phone</span>}</td>
                                    <td>{type}</td>
                                    <td>{(new Date(createdAt)).toLocaleDateString(undefined, {hour: "2-digit", minute: "2-digit"})}</td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>

            <div className='misc-col'>
                <h2>{editing_account?"Edit":"New"} Account</h2>
                <div className='input-container fullwidth'>
                    <input type="text" value={first} onChange={onChangeValue(["name", "first"])} placeholder='First Name' />
                    {errors["name.first"] && <p className='error'>{errors["name.first"]}</p>}
                </div>

                <div className='input-container fullwidth'>
                    <input type="text" value={last} onChange={onChangeValue(["name", "last"])} placeholder='Last Name' />
                    {errors["name.last"] && <p className='error'>{errors["name.last"]}</p>}
                </div>

                <div className='input-container fullwidth'>
                    <input type="text" value={email} onChange={onChangeValue(["email"])} placeholder='youremail@example.com' />
                    {errors["email"] && <p className='error'>{errors["email"]}</p>}
                </div>

                <div className='input-container fullwidth'>
                    <input type="text" value={phone} onChange={onChangeValue(["phone"])} placeholder='Phone Number' />
                    {errors["phone"] && <p className='error'>{errors["phone"]}</p>}
                </div>

                <div className='input-container fullwidth'>
                    <select value={type} onChange={onChangeValue(["type"])}>
                        <option>Account Type</option>
                        <option value="admin">Admin</option>
                        <option value="teacher">Teacher</option>
                        <option value="student">Student</option>
                    </select>
                    {errors["type"] && <p className='error'>{errors["type"]}</p>}
                </div>

                <div className='input-container fullwidth'>
                    <input type={passwordVisible?"text":"password"} value={password} onChange={onChangePassword} placeholder={editing_account?"Leave blank to keep current password":'Your Password'} />
                    <div className='input-adornment end' style={{backgroundColor: "transparent"}}>
                        <span className='clickable' onClick={onClickPasswordEye}>{passwordVisible?<BsEye />:<BsEyeSlash />}</span>
                    </div>
                </div>
                {errors["password"] && <p className='error'>{errors["password"]}</p>}

                {editing_account && <button style={{marginBottom: 20}} className='button error fullwidth' onClick={() => {cancel_account_edit(); setPassword("")}}>Cancel Edit</button>}
                <button className='button primary fullwidth' onClick={editing_account?onPressEditAccount:onPressCreateAccount}>{editing_account?"Edit":"Create"} Account</button>
                {error && <p className='error'>{error}</p>}
            </div>
        </div>
    );
}

function map_state_to_props({User, Admin}){
    return {accounts: Admin.accounts, total: Admin.total_accounts, classes: User.classes, total_classes: User.total_classes, new_account: Admin.new_account, edit_account: Admin.edit_account, editing_account: Admin.editing_account}
}

export default connect(map_state_to_props, {create_account, update_account, init_edit_account, cancel_account_edit, edit_new_account, get_accounts, set_loading})(Accounts);