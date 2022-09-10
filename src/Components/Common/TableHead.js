import React from 'react';
import {BsArrowUp} from "react-icons/bs"

import "./TableHead.css";

type Header = {
    label: String,
    id: String,
    sortable?: Boolean
};

type OnSort = (event: React.MouseEvent<HTMLTableCellElement>, header: Header, index: Number) => void;

const TableHead = ({headers=[], selectable=false, allSelected=false, sticky=false, order="", orderBy="", onSort, onSelect}: {headers: [Header], selectable: Boolean, sticky: Boolean, order: String, orderBy: String, onSort: OnSort}) => {

    const onSelectAll = (e) => {
        typeof(onSelect) === "function" && onselect(e);
    }

    const onSortTable = (e, header, index) => {
        header.sortable !== false && typeof(onSort) === "function" && onSort(e, header, index);
    }
    
    return (
        <thead className={sticky?"sticky":""}>
            <tr>
                {selectable && <th><label className="checkbox-container"><input type="checkbox" onChange={onSelectAll} checked={allSelected}/><span className="checkmark"></span></label></th>}
                
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