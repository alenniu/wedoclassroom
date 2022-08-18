import React, { useState } from 'react';
import {RiCheckLine, RiCloseLine} from "react-icons/ri";
import { TableHead } from '../Common';

import "./Students.css";

const Students = ({_class={}, requests=[], onAcceptRequest, onDeclineRequest, onRemoveStudent, attendance=[]}) => {
    const {students=[]} = _class;

    const [order, setOrder] = useState("");
    const [orderBy, setOrderBy] = useState("");
    const [sort, setSort] = useState("{}");

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

    const onAccept = (request) => {
        typeof(onAcceptRequest) === "function" && onAcceptRequest(request);
    }
    
    const onDecline = (request) => {
        typeof(onDeclineRequest) === "function" && onDeclineRequest(request);
    }
    
    const onRemove = (student) => {
        typeof(onRemoveStudent) === "function" && onRemoveStudent(student);
    }

    return (
        <div className='students'>
            <h3>Students</h3>
            <table>
                <TableHead headers={[{label: "Name", id: "name"}, {label: "Email", id: "email"}, {label: "Phone", id: "phone"}, {label: "Actions", id: "actions", sortable: false}]} order={order} orderBy={orderBy} onSort={onSortTable} />

                <tbody>
                    {students.map((s) => {
                        const {_id, name={}, email, phone, type, createdAt} = s;

                        return (
                            <tr key={_id}>
                                <td>{name.first} {name.last}</td>
                                <td>{email}</td>
                                <td>{phone || <span style={{opacity: 0.5}}>No Phone</span>}</td>
                                <td><button className='button error' onClick={() => onRemove(s)} title='Remove'><RiCloseLine /></button></td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>

            <h3>Requests</h3>
            <table>
                <TableHead headers={[{label: "Name", id: "name"}, {label: "Email", id: "email"}, {label: "Phone", id: "phone"}, {label: "Actions", id: "actions", sortable: false}]} order={order} orderBy={orderBy} onSort={onSortTable} />

                <tbody>
                    {requests.map((r) => {
                        const {student={}, accepted, declined} = r;
                        const {_id, name={}, email, phone, type, createdAt} = student;

                        return (
                            <tr key={_id}>
                                <td>{name.first} {name.last}</td>
                                <td>{email}</td>
                                <td>{phone || <span style={{opacity: 0.5}}>No Phone</span>}</td>
                                <td><button className='button primary' onClick={() => onAccept(r)} title='Accept'><RiCheckLine /></button> <button className='button error' onClick={() => onDecline(r)} title='Decline'><RiCloseLine /></button></td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    );
}
 
export default Students;