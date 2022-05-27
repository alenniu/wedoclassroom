import React, { useEffect, useState } from 'react';
import {BsCurrencyDollar} from "react-icons/bs";
import { connect } from 'react-redux';
import { get_classes, get_popular_classes, get_my_requests, set_loading } from '../Actions';
import Class from '../Components/Classes/Class';
import PopularClass from '../Components/Classes/PopularClass';
import Tabs from '../Components/Common/Tabs';

import "./Classes.css";

const Classes = ({classes=[], total=0, popular_classes=[], requests=[], total_requests=0, get_classes, get_popular_classes, get_my_requests, set_loading}) => {
    const [pageLimit, setPageLimit] = useState(20);
    const [page, setPage] = useState(0);
    const [search, setSearch] = useState("");

    const [classtype, setClasstype] = useState("")

    useEffect(() => {
        const init = async () => {
            set_loading(true);
            await get_popular_classes(10, 0);
            await get_classes(pageLimit, page);
            await get_my_requests(100, 0, "{}", `{"accepted": false, "rejected": false}`)
            set_loading(false);
        }

        init();
    }, []);

    useEffect(() => {
        const init = async () => {
            set_loading(true);
            await get_classes(pageLimit, page);
            set_loading(false);
        }

        init();
    }, [classtype]);

    const onPressTab = (e, {label, id}, index) => {
        setClasstype(id);
    }

    return (
        <div className='page classes'>
            <div className='main-col'>
                <Tabs tabs={[{label: "Popular Classes", id: ""}, {label: "Group Classes", id: "group"}, {label: "Private Classes", id: "private"}]} />
                <ul className='popular-class-list'>
                    {[...popular_classes, ...popular_classes, ...popular_classes, ...popular_classes, ...popular_classes, ...popular_classes].map((c) => {
                        return (
                            <li key={c._id}><PopularClass _class={c} /></li>
                        )
                    })}
                </ul>
            </div>

            <div className='misc-col'>
                <h3 style={{margin: "20px 0"}}>Filter Classes</h3>
                <div className='input-container class-filter'>
                    <label>Price Range</label>
                    <input placeholder='00000' style={{paddingLeft: "50px"}} />
                    <div className='input-adornment start' style={{backgroundColor: "transparent", borderRight: "2px solid rgba(0,0,0,0.1)"}}>
                        <BsCurrencyDollar color='rgba(0,0,0,0.3)' size={"20px"} />
                    </div>
                </div>

                <div className='input-container class-filter'>
                    <label>Category</label>
                    <select>
                        <option>Please Select</option>
                    </select>
                </div>

                <div className='input-container class-filter'>
                    <label>Date and Time</label>
                    <select>
                        <option>Please Select</option>
                    </select>
                </div>

                <div className='input-container class-filter'>
                    <label>Difficulty Level</label>
                    <select>
                        <option>Please Select</option>
                    </select>
                </div>

                <button className='button primary'>Filter Classes</button>
            </div>

            <div>
                <ul className='classes-list'>
                    {[...classes, ...classes, ...classes, ...classes, ...classes, ...classes].map((c) => <li key={c._id}><Class _class={c} /></li>)}
                </ul>
            </div>
        </div>
    );
}

function map_state_to_props({User, Class}){
    return {classes: Class.classes, total: Class.total, popular_classes: Class.popular_classes, requests: User.requests, total_requests: User.total_requests}
}

export default connect(map_state_to_props, {get_classes, get_popular_classes, get_my_requests, set_loading})(Classes);