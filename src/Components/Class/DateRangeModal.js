import { Box, Modal, Slide, Switch, TextField } from '@mui/material';
import { LocalizationProvider, PickersDay, StaticDatePicker, StaticDateTimePicker, TimePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import React, { useCallback, useEffect, useState } from 'react';
import { RiArrowLeftSLine } from 'react-icons/ri';
import { ranges_overlaps } from '../../Utils';

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    // width: "600px",
    maxWidth: "80%",
    bgcolor: 'background.paper',
    boxShadow: 24,
    borderRadius: "8px"
};

const DateRangeModal = ({show=false, startDate, endDate, onPickStartDate, onPickEndDate, onClose, onClickDone}) => {
    const [step, setStep] = useState(0);

    useEffect(() => {
        if(!show){
            setStep(0);
        }
    }, [show]);

    const CustomPickersDay = useCallback((day, selectedDays=[], pickerProps={}) => {
        const isFirstDay = (day.getDate() === startDate.getDate()) && (day.getMonth() === startDate.getMonth()) && (day.getFullYear() === startDate.getFullYear());
        const isLastDay = (day.getDate() === endDate.getDate()) && (day.getMonth() === endDate.getMonth()) && (day.getFullYear() === endDate.getFullYear());
        const isBetween = ranges_overlaps({min: day.getTime(), max: day.getTime()}, {min: startDate.getTime(), max: endDate.getTime()});
    
        return <PickersDay disableMargin day={day} {...pickerProps} selected={isBetween || isFirstDay || isLastDay}  sx={{...(isBetween?{borderRadius: 0}:{}),  ...(isFirstDay?{
            borderTopLeftRadius: '50%',
            borderBottomLeftRadius: '50%',
          }:{}), ...(isLastDay?{
            borderTopRightRadius: '50%',
            borderBottomRightRadius: '50%',
          }:{})}} />
    }, [startDate, endDate]);

    return (
        <Modal open={show} onClose={onClose}>
            <Box sx={style}>
                <Slide in={show} direction="up">
                <div style={{width: "100%", display: "flex", flexWrap: "nowrap"}}>
                    <div style={{transition: "transform .500s", width: "100%", flexShrink: 0, transform: `translateX(${-100 * step}%)`, padding: "20px"}}>
                        <span style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
                            <span style={{display: "flex", alignItems: "center"}}>
                                <label>Select Date Range</label>
                            </span>
                        </span>
                        <div style={{display: "flex", marginTop: 20}}>
                            <div>
                                <center><label>Start Date</label></center>
                                <LocalizationProvider dateAdapter={AdapterDateFns}>
                                    <StaticDatePicker renderDay={CustomPickersDay} displayStaticWrapperAs="desktop" value={startDate} renderInput={(params) => <TextField {...params} />} onChange={onPickStartDate} label="Start Date"  />
                                </LocalizationProvider>
                            </div>
                            <div>
                                <center><label>End Date</label></center>
                                <LocalizationProvider dateAdapter={AdapterDateFns}>
                                    <StaticDatePicker renderDay={CustomPickersDay} displayStaticWrapperAs="desktop" value={endDate} minDate={startDate} renderInput={(params) => <TextField {...params} />} onChange={onPickEndDate} label="End Date"  />
                                </LocalizationProvider>
                            </div>
                        </div>

                        <div style={{textAlign: "end"}}>
                            <button className="button primary" onClick={onClickDone}>Done</button>
                        </div>
                    </div>
                </div>
                </Slide>
            </Box>
        </Modal>
    );
}
 
export default DateRangeModal;