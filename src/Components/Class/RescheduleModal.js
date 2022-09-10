import { Box, Modal, Slide, Switch, TextField } from '@mui/material';
import { LocalizationProvider, StaticDatePicker, StaticDateTimePicker, TimePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import React, { useEffect, useState } from 'react';
import { RiArrowLeftSLine } from 'react-icons/ri';

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: "600px",
    maxWidth: "80%",
    backgroundColor: 'background.paper',
    boxShadow: 24,
    borderRadius: "8px"
};

const RescheduleModal = ({show=false, validDays=[], newDate, onPickNewDate, onPickNewStartTime, onPickNewEndTime, newStartTime, newEndTime, onChangeReason, reason, end_date, onClose, onRequestReschedule, newTimeOnly=false, acceptRequest}) => {
    const [step, setStep] = useState(0);
    const [selectNewDate, setSelectNewDate] = useState(true);

    useEffect(() => {
        if(!selectNewDate){
            onPickNewDate(null);
            onPickNewStartTime(null);
            onPickNewEndTime(null);
        }else{
            const now = new Date();
            !newDate && onPickNewDate(now);
            !newStartTime && onPickNewStartTime(now);
            !newEndTime && onPickNewEndTime(now);
        }
    }, [selectNewDate]);

    useEffect(() => {
        if(!show){
            setStep(0);
        }
    }, [show]);

    return (
        <Modal open={show} onClose={onClose}>
            <Box sx={style}>
                <Slide in={show} direction="up">
                
                <div style={{width: "100%", display: "flex", flexWrap: "nowrap", overflow: "hidden"}}>
                    <div style={{transition: "transform .500s", width: "100%", flexShrink: 0, transform: `translateX(${-100 * step}%)`, padding: "20px"}}>
                        <span style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
                            <span style={{display: "flex", alignItems: "center"}}>
                                <label>Select New Date</label>
                            </span>
                            {!newTimeOnly && <span>
                                <Switch checked={selectNewDate} onChange={(e) => setSelectNewDate(e.target.checked)} />
                            </span>}
                        </span>

                        <div style={{display: "flex", marginBlock: "20px", gap: "20px"}}>
                            <LocalizationProvider dateAdapter={AdapterDateFns}>
                                <TimePicker disabled={!selectNewDate} value={newStartTime} renderInput={(params) => <TextField {...params} />} onChange={onPickNewStartTime} label="New Start Time"  />
                            </LocalizationProvider>

                            <LocalizationProvider dateAdapter={AdapterDateFns}>
                                <TimePicker disabled={!selectNewDate} value={newEndTime} renderInput={(params) => <TextField {...params} />} onChange={onPickNewEndTime} label="New End Time"  />
                            </LocalizationProvider>
                        </div>
                        
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                            <StaticDatePicker disabled={!selectNewDate} displayStaticWrapperAs="desktop" disablePast maxDate={new Date(end_date)} value={newDate} renderInput={(params) => <TextField {...params} />} onChange={onPickNewDate} label="Select New Date"  />
                        </LocalizationProvider>

                        {!newTimeOnly && <div style={{textAlign: "end"}}>
                            <button className="button primary" disabled={selectNewDate && (!newDate || !newStartTime || !newEndTime)} onClick={() => setStep(1)}>NEXT</button>
                        </div>}

                        {newTimeOnly && <div style={{textAlign: "end"}}>
                            <button className="button primary" disabled={(!newDate || !newStartTime || !newEndTime)} onClick={acceptRequest}>Accept Request</button>
                        </div>}
                    </div>

                    {!newTimeOnly && <div style={{transition: "transform .500s", width: "100%", flexShrink: 0, transform: `translateX(${-100 * step}%)`, padding: "20px"}}>
                        <span style={{display: "flex", alignItems: "center"}}>
                            <span className='clickable' onClick={() => setStep(0)}><RiArrowLeftSLine size={30} /></span>
                            <label>Give A Reason (Optional)</label>
                        </span>

                        <div className='input-container'>
                            <textarea style={{backgroundColor: "white", color: "black", boxShadow: "0 0 2px grey", resize: "vertical", maxHeight: "200px"}} value={reason} onChange={onChangeReason} placeholder="Reason (required) 10 character minimum" />
                        </div>
                        
                        <div style={{textAlign: "end"}}>
                            <button className="button primary" disabled={(selectNewDate && !newDate) ||(!newTimeOnly && (!reason || reason.length < 10))} onClick={onRequestReschedule}>Request Reschedule</button>
                        </div>
                    </div>}
                </div>
                </Slide>
            </Box>
        </Modal>
    );
}
 
export default RescheduleModal;