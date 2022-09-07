import { MenuItem, Select } from '@mui/material';
import React from 'react';
import {TbChevronLeft, TbChevronRight} from "react-icons/tb";

import "./Pagination.css";
import { TypeSelect } from './TypeSelect';

const Pagination = ({onChangePage, onChangePerPage, total=0, pages=1, page=1, add1page=true, perPageOptions=[20], perPage=20, perPageLabel}) => {
    const displayed_page = add1page?page+1:page;

    const current_start_index = perPage * (page);
    const current_end_index = Math.min(current_start_index + perPage, total);

    const can_go_forward = (page+1) < pages;
    const can_go_back = (page-1) >= 0;

    const onChangePageNumber = (e, page) => {
        typeof(onChangePage) === "function" && onChangePage(e, page)
    }

    const onChangePerPageOption = (e) => {
        typeof(onChangePerPage) === "function" && onChangePerPage(e, e.target.value)
    }

    const onClickNextPage = (e) => {
        if(can_go_forward){
            onChangePageNumber(e, Math.min(page+1, pages-1));
        }
    }

    const onClickPrevPage = (e) => {
        if(can_go_back){
            onChangePageNumber(e, Math.max(page-1, 0));
        }
    }

    return (
        <div className='pagination-container'>
            <span className={`prev clickable ${can_go_back?"":"disabled"}`} onClick={onClickPrevPage}><TbChevronLeft size={25} /></span>
            <span className={`next clickable ${can_go_forward?"":"disabled"}`} onClick={onClickNextPage}><TbChevronRight size={25} /></span>
            <span>{current_start_index} - {current_end_index} of {total}</span>
            <span className='per-page-text'>{perPageLabel || "Rows Per Page"}</span>
            <div className='input-container select pagination per-page'>
                <Select value={perPage} onChange={onChangePerPageOption}>
                    {perPageOptions.map((o) => <MenuItem key={o} value={o}>{o}</MenuItem>)}
                </Select>
                {/* <TypeSelect localSearch options={perPageOptions.map((o) => ({label: o, value: o}))} disabled={perPageOptions.length > 1} value={perPage} onChange={onChangePerPageOption} /> */}
            </div>
        </div>
    );
}
 
export default Pagination;