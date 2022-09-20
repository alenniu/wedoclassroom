import { Box, Modal, Slide, Switch, TextField } from '@mui/material';
import { LocalizationProvider, StaticDatePicker, StaticDateTimePicker, TimePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import React, { useEffect, useState } from 'react';
import { RiArrowLeftSLine } from 'react-icons/ri';
import { HOUR } from '../../Data';
import { toMoneyString } from '../../Utils';
import "./CreditEditModal.css";

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: "600px",
    maxWidth: "80%",
    minHeight: "350px",
    backgroundColor: 'background.paper',
    boxShadow: 24,
    borderRadius: "8px"
};


const OPERATION_ADD = "add";
const OPERATION_SUBTRACT = "subtract";
const OPERATION_RESTORE = "restore";

const CreditEditModal = ({show=false, onClose, credits=0, credit_logs=[], onUpdateCredits}) => {
    const [step, setStep] = useState(0);
    const [note, setNote] = useState("");
    const [amount, setAmount] = useState("");
    const [operation, setOperation] = useState(null);
    const [restoreIndex, setRestoreIndex] = useState(-1);

    useEffect(() => {
        if(!show){
            setStep(0);
            setNote("");
            setAmount("");
            setOperation(null);
            setRestoreIndex(-1);
        }
    }, [show]);

    useEffect(() => {
        if(operation !== OPERATION_RESTORE){
            setRestoreIndex(-1);
            setAmount("");
            setNote("");
        }
    }, [operation]);

    const onClickOperation = (op) => (e) => {
        setOperation(op);
        setStep(1);
    }

    const onClickBack = (e) => {
        setStep((s) => s-1);
    }

    const onClickRestorePoint = (cl, index) => {
        const difference = credits - cl.new_amount;

        setRestoreIndex(index);
        setAmount(difference);
        setNote(`Restore to ${toMoneyString(cl.new_amount)}\n"${cl.note}"`);
    }

    const operation_multiplier = operation === OPERATION_SUBTRACT?-1:1;

    const difference = ((Number(amount) || 0) * operation_multiplier);
    const new_amount = credits + difference;
    
    return (
        <Modal open={show} onClose={onClose}>
            <Box sx={style}>
                <Slide in={show} direction="up">
                
                <div style={{width: "100%", display: "flex", flexWrap: "nowrap", overflow: "hidden"}}>
                    <div style={{transition: "transform .500s", width: "100%", flexShrink: 0, transform: `translateX(${-100 * step}%)`, padding: "20px"}}>
                        <span style={{display: "flex", justifyContent: "center", alignItems: "center"}}>
                            <span style={{display: "flex", justifyContent: "center", alignItems: "center"}}>
                                <label>What do you want to do?</label>
                            </span>
                        </span>

                        <div style={{marginTop: "50px"}}>
                            <button style={{marginBottom: "20px"}} className='button secondary fullwidth' onClick={onClickOperation(OPERATION_ADD)}>Add Credits</button>
                            <button style={{marginBottom: "20px"}} className='button error fullwidth' onClick={onClickOperation(OPERATION_SUBTRACT)}>Remove Credits</button>
                            <button disabled={!credit_logs.length} style={{marginBottom: "20px"}} className='button warning fullwidth' onClick={onClickOperation(OPERATION_RESTORE)}>Restore Credits</button>
                        </div>
                    </div>

                    <div style={{transition: "transform .500s", width: "100%", flexShrink: 0, transform: `translateX(${-100 * step}%)`, padding: "20px"}}>
                        <span style={{display: "flex", justifyContent: "center", alignItems: "center"}}>
                            <span style={{position: "absolute", left: 10}} className='clickable' onClick={onClickBack}><RiArrowLeftSLine size={30} /></span>
                            <label>{operation === OPERATION_RESTORE?"Choose A Restore point.":"How Much?"}</label>
                        </span>

                        {operation === OPERATION_RESTORE?(
                            <ul style={{maxHeight: "300px", overflowY: "auto"}}>
                                {credit_logs.map((cl, i) => {
                                    const selected = restoreIndex === i;
                                    const is_same_amount = cl.new_amount === credits;

                                    return (
                                        <li key={cl.date} title={is_same_amount?"No Difference":""} className={`${is_same_amount?"":"clickable"} restore-point ${selected?"selected":""}`} onClick={() => {
                                            if(!is_same_amount){
                                                onClickRestorePoint(cl, i)
                                                }
                                            }}
                                        >
                                            <p className='restore-date'>{new Date(cl.date).toLocaleDateString()}</p>
                                            <p><span className='restore-amount'>{toMoneyString(cl.new_amount)}: </span> {cl.note}</p>
                                        </li>
                                    )
                                })}
                            </ul>
                        ):(
                            <div className='input-container'>
                                <input style={{backgroundColor: "white", color: "black", boxShadow: "0 0 2px grey", resize: "vertical"}} value={amount} onChange={(e) => {setAmount(isNaN(e.target.value)?amount:e.target.value)}} placeholder="Amount" />
                            </div>
                        )}

                        <div className='input-container'>
                            <textarea style={{backgroundColor: "white", color: "black", boxShadow: "0 0 2px grey", resize: "vertical", minHeight: "120px", maxHeight: "200px"}} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add a note (required)" />
                        </div>
                        
                        <div style={{textAlign: "end"}}>
                            <button className="button primary" disabled={!amount || !note} onClick={() => {setStep(2)}}>Confirm</button>
                        </div>
                    </div>

                    <div style={{transition: "transform .500s", width: "100%", flexShrink: 0, transform: `translateX(${-100 * step}%)`, padding: "20px"}}>
                        <span style={{display: "flex", justifyContent: "center", alignItems: "center"}}>
                            <span style={{position: "absolute", left: 10}} className='clickable' onClick={onClickBack}><RiArrowLeftSLine size={30} /></span>
                            <label>Please Confirm</label>
                        </span>

                        <div style={{marginTop: "50px"}}>
                            <p style={{marginBottom: 20, paddingInline: 20}}>
                                Old Value: {toMoneyString(credits)}
                            </p>

                            <p style={{marginBottom: 20, paddingInline: 20}}>
                                Amount: {toMoneyString(amount * operation_multiplier)}
                            </p>

                            <p style={{marginBottom: 20, paddingInline: 20}}>
                                New Value: {toMoneyString(credits + (amount * operation_multiplier))}
                            </p>

                            <p style={{marginBottom: 20, paddingInline: 20}}>
                                Note: "{note}"
                            </p>
                        </div>
                        
                        <div style={{textAlign: "end"}}>
                            <button className="button primary" disabled={!amount || !note} onClick={() => {onUpdateCredits({credits: new_amount, previous_amount: credits, difference, note})}}>Update Credits</button>
                        </div>
                    </div>
                </div>
                </Slide>
            </Box>
        </Modal>
    );
}
 
export default CreditEditModal;