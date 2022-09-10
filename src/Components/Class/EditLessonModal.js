import { Box, Modal, Slide, Switch, TextField } from '@mui/material';
import { LocalizationProvider, StaticDatePicker, StaticDateTimePicker, TimePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import React, { useEffect, useState } from 'react';
import { RiArrowLeftSLine } from 'react-icons/ri';
import { HOUR } from '../../Data';

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: "600px",
    maxWidth: "80%",
    bgcolor: 'background.paper',
    boxShadow: 24,
    borderRadius: "8px"
};

const EditLessonModal = ({show=false, newDate, onPickNewDate, onPickNewStartTime, onPickNewEndTime, newStartTime, newEndTime, onClose, onClickDone}) => {
    const [step, setStep] = useState(0);

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
                        </span>

                        <div style={{display: "flex", marginBlock: "20px", gap: "20px"}}>
                            <LocalizationProvider dateAdapter={AdapterDateFns}>
                                <TimePicker  value={newStartTime} renderInput={(params) => <TextField {...params} />} onChange={(v) => {
                                    const date = new Date((v || (new Date())));
                                    date.setFullYear(1970, 0, 1);

                                    onPickNewStartTime(date);
                                }} label="New Start Time"  />
                            </LocalizationProvider>

                            <LocalizationProvider dateAdapter={AdapterDateFns}>
                                <TimePicker value={newEndTime} renderInput={(params) => <TextField {...params} />} onChange={(v) => {
                                    const date = new Date((v || (new Date())));
                                    date.setFullYear(1970, 0, 1);

                                    onPickNewEndTime(date);
                                }} label="New End Time"  />
                            </LocalizationProvider>
                        </div>
                        
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                            <StaticDatePicker displayStaticWrapperAs="desktop" disablePast value={newDate} renderInput={(params) => <TextField {...params} />} onChange={onPickNewDate} label="Select New Date"  />
                        </LocalizationProvider>

                        <div style={{textAlign: "end"}}>
                            <button className="button primary" disabled={(!newDate || !newStartTime || !newEndTime)} onClick={onClickDone}>Done</button>
                        </div>
                    </div>
                </div>
                </Slide>
            </Box>
        </Modal>
    );
}
 
export default EditLessonModal;