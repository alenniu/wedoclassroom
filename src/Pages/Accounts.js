import React, { useCallback, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { cancel_account_edit, create_account, edit_new_account, get_accounts, init_edit_account, set_loading, update_account } from '../Actions';
import { debounce, password_requirements, validate_email, validate_name, validate_password } from '../Utils';
import { TableHead, Tabs, TypeSelect } from '../Components/Common';

import "./Dashboard.css";
import "./Accounts.css";

const Accounts = ({accounts=[], total=0, is_admin, new_account={}, edit_account={}, editing_account, get_accounts, create_account, update_account, edit_new_account, init_edit_account, cancel_account_edit, set_loading}) => {
    const [pageLimit, setPageLimit] = useState(20);
    const [page, setPage] = useState(0);
    const [search, setSearch] = useState("");
    const [filters, setFilters] = useState({});

    const [order, setOrder] = useState("");
    const [orderBy, setOrderBy] = useState("");
    const [sort, setSort] = useState("{}");
    const [accountType, setAccountType] = useState(is_admin?"":"student")

    const navigate = useNavigate();

    const account_type_tabs = is_admin?[{label: "All", id: ""}, {label: "Teachers", id: "teacher"}, {label: "Students", id: "student"}, {label: "Sales", id: "sales"}, {label: "Admins", id: "admin"}]:[{label: "Students", id: "student"}];

    const debouncedSearch = useCallback(debounce(async (search) => {
        await get_accounts(pageLimit, 0, search, sort, JSON.stringify({...filters, type: accountType || undefined}))
    }, 300), [pageLimit, sort, accountType, filters]);

    useEffect(() => {
        const init = async () => {
            set_loading(true);
            await get_accounts(pageLimit, page * pageLimit, search, sort, JSON.stringify({...filters, type: accountType || undefined}))
            set_loading(false);
        }
        
        init();
    }, [accountType, filters, sort]);

    useEffect(() => {
        debouncedSearch(search);
    }, [search]);
    
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

    const setFilter = (name) => (value) => {
        setFilters((f) => ({...f, [name]: value || undefined}));
    }

    return (
        <div className='page accounts'>
            <div className='main-col fullwidth'>
                <Tabs onPressTab={onPressTab} tabs={account_type_tabs} />

                <div style={{marginTop: 20}}>
                    <button className='button primary' onClick={() => navigate("/dashboard/accounts/new")}>New Account</button>
                </div>

                <div className='filters-search-container'>
                    <div className='filters-container'>
                        <div className='input-container select' key={"archived"}>
                            <TypeSelect options={[{label: "All", value: ""}, {label: "Active", value: false}, {label: "Archived", value: true}]} placeholder="Archive Filter" value={filters["archived"] || ""} localSearch={true} onChange={setFilter("archived")} name="archived" />
                        </div>
                    </div>

                    <div className='search-container'>
                        <div className='input-container search'>
                            <input value={search} placeholder="Search Accounts" onChange={(e) => {setSearch(e.target.value)}} />
                        </div>
                    </div>
                </div>

                <div className='table-utils'>
                    <span>Total: {total}</span>
                </div>
                
                <div className='table-container'>
                    <table>
                        <TableHead headers={[{label: "Name", id: "name"}, {label: "Email", id: "email"}, {label: "Phone", id: "phone"}, {label: "Type", id: "type"}, {label: "Archived", id: "archived"}, {label: "$", id: "credits"}, {label: "Created", id: "createdAt"}]} order={order} orderBy={orderBy} onSort={onSortTable} />

                        <tbody>
                            {accounts.map((a) => {
                                const {_id, name={}, email, phone, type, credits=0, archived=false, createdAt} = a;

                                return (
                                    <tr key={_id}>
                                        <td><Link className='link' to={`/dashboard/accounts/edit/${_id}`}>{name.first} {name.last}</Link></td>
                                        <td>{email}</td>
                                        <td>{phone || <span style={{opacity: 0.5}}>No Phone</span>}</td>
                                        <td>{type}</td>
                                        <td>{archived?"Yes":"No"}</td>
                                        <td>{type==="student"?`$${credits}`:"N/A"}</td>
                                        <td>{(new Date(createdAt)).toLocaleDateString(undefined, {hour: "numeric", minute: "2-digit"})}</td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* <div className='misc-col'>
                <h2>{editing_account?"Edit":"New"} Account</h2>
                <div className='input-container fullwidth'>
                    <input type="text" value={first} onChange={onChangeValueEvent(["name", "first"])} placeholder='First Name' />
                    {errors["name.first"] && <p className='error'>{errors["name.first"]}</p>}
                </div>

                <div className='input-container fullwidth'>
                    <input type="text" value={last} onChange={onChangeValueEvent(["name", "last"])} placeholder='Last Name' />
                    {errors["name.last"] && <p className='error'>{errors["name.last"]}</p>}
                </div>

                <div className='input-container fullwidth'>
                    <input type="text" value={email} onChange={onChangeValueEvent(["email"])} placeholder='youremail@example.com' />
                    {errors["email"] && <p className='error'>{errors["email"]}</p>}
                </div>

                <div className='input-container fullwidth'>
                    <input type="text" value={phone} onChange={onChangeValueEvent(["phone"])} placeholder='Phone Number' />
                    {errors["phone"] && <p className='error'>{errors["phone"]}</p>}
                </div>

                <div className='input-container fullwidth'>
                    <select value={gender} onChange={onChangeValueEvent(["gender"])}>
                        <option value={""}>Gender</option>
                        <option value={"male"}>Male</option>
                        <option value="female">Female</option>   
                    </select>

                    {errors["gender"] && <p className='error'>{errors["gender"]}</p>}
                </div>

                <div className='input-container fullwidth'>
                    <select value={type} onChange={onChangeValueEvent(["type"])}>
                        <option>Account Type</option>
                        
                        {is_admin && <option value="admin">Admin</option>}
                        
                        {is_admin && <option value="sales">Sales</option>}
                        
                        {is_admin && <option value="teacher">Teacher</option>}
                        
                        <option value="student">Student</option>
                    </select>
                    {errors["type"] && <p className='error'>{errors["type"]}</p>}
                </div>

                {type === "student" && (
                    <>
                    <div className='input-container fullwidth'>
                        <input type="text" value={school} onChange={onChangeValueEvent(["school"])} placeholder='Current School' />
                        {errors["school"] && <p className='error'>{errors["school"]}</p>}
                    </div>

                    <div className='input-container fullwidth'>
                        <input type="text" value={grade} onChange={onChangeValueEvent(["grade"])} placeholder='Current Grade' />
                        {errors["grade"] && <p className='error'>{errors["grade"]}</p>}
                    </div>

                    <div className='input-container fullwidth'>
                        <label>Date Enrolled</label>
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <DatePicker
                            // label="Start Time"
                            value={date_enrolled}
                            onChange={(v) => onChangeValue(["date_enrolled"])((v || (new Date())).getTime())}
                            renderInput={(params) => <TextField {...params} />}
                        />
                        </LocalizationProvider>
                    </div>
                    </>
                )}

                <div className='input-container fullwidth'>
                    <input type={passwordVisible?"text":"password"} value={password} onChange={onChangePassword} placeholder={editing_account?"Leave blank to keep current password":'Your Password'} />
                    <div className='input-adornment end' style={{backgroundColor: "transparent"}}>
                        <span className='clickable' onClick={onClickPasswordEye}>{passwordVisible?<BsEye />:<BsEyeSlash />}</span>
                    </div>
                </div>
                {errors["password"] && <p className='error'>{errors["password"]}</p>}

                <div className='input-container fullwidth'>
                    <input type="text" value={emergency_name} onChange={onChangeValueEvent(["emergency_contact", "name"])} placeholder='Emergency Contact Name' />
                </div>

                <div className='input-container fullwidth'>
                    <input type="text" value={emergency_email} onChange={onChangeValueEvent(["emergency_contact", "email"])} placeholder='Emergency Contact email' />
                </div>

                <div className='input-container fullwidth'>
                    <input type="text" value={emergency_phone} onChange={onChangeValueEvent(["emergency_contact", "phone"])} placeholder='Emergency Contact phone' />
                </div>

                <div className='input-container fullwidth'>
                    <input type="text" value={relation} onChange={onChangeValueEvent(["emergency_contact", "relation"])} placeholder='Emergency Contact relation' />
                </div>

                {editing_account && <button style={{marginBottom: 20}} className='button error fullwidth' onClick={() => {cancel_account_edit(); setPassword("")}}>Cancel Edit</button>}
                <button className='button primary fullwidth' onClick={editing_account?onPressEditAccount:onPressCreateAccount}>{editing_account?"Edit":"Create"} Account</button>
                {error && <p className='error'>{error}</p>}
            </div> */}
        </div>
    );
}

function map_state_to_props({User, Admin, Auth}){
    return {accounts: Admin.accounts, total: Admin.total_accounts, classes: User.classes, total_classes: User.total_classes, new_account: Admin.new_account, edit_account: Admin.edit_account, editing_account: Admin.editing_account, is_admin: Auth.is_admin}
}

export default connect(map_state_to_props, {create_account, update_account, init_edit_account, cancel_account_edit, edit_new_account, get_accounts, set_loading})(Accounts);