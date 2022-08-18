import React from 'react';
import {RiImageAddLine} from "react-icons/ri";

const FileUploadDropArea = ({title="Upload File", text="Drop your file here or browse"}) => {
    return (
        <div className='upload-content-container'>
            <span className='add-icon-container'><RiImageAddLine size={"24px"} /></span>

            <div>
                <p className='upload-cover-text'>{title}</p>
                <p className='upload-drop-text'>{text}</p>
            </div>
        </div>
    );
}
 
export {FileUploadDropArea};