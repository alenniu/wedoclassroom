import React from 'react';
import {BsArrowUp} from "react-icons/bs"

import "./TableHead.css";

const TableHead = ({headers=[], sticky=false, order="", orderBy="", onSort}) => {

    
    const onSortTable = (e, {label, id, sortable}, index) => {
        sortable !== false && typeof(onSort) === "function" && onSort(e, {label, id}, index);
    }
    
    return (
        <thead className={sticky?"sticky":""}>
            <tr>
                {headers.map(({label, id, sortable}, i) => {
                    const is_sorted = id === orderBy;
                    const isAsc = (orderBy === id) && (order === "asc");

                    return (
                        <th key={id} className={sortable !== false?"clickable":""} onClick={(e) => onSortTable(e, {label, id, sortable}, i)}>{label} <span className={`sort-icon-container ${is_sorted?"visible":"not-visible"} ${!isAsc &&is_sorted && "rotate-180"} ${sortable === false && "no-sort"}`}><BsArrowUp className='table-sort-icon'/></span></th>
                    )
                })}
            </tr>
        </thead>
    );
}
 
export {TableHead};