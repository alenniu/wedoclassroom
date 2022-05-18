import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {VscArrowRight} from "react-icons/vsc";
import {BsImageFill} from "react-icons/bs";
import "./Auth.css";
import "./Register.css";

const Register = () => {
    const navigate = useNavigate();

    return (
        <div className='page register'>
            <div className='auth-left'>
                <div className='auth-image-container'>
                    <img src="/Assets/Images/AuthBackground.png" className='absolute-fill' />

                    <div className='image-button-container'>
                        <button className='button'><BsImageFill /></button>
                    </div>

                    <div className='foreground-text'>
                        <p className='large-text'>Get started on your academic journey!</p>
                        <p className='small-text'>Project provides top tier education</p>
                        <p className='small-text'>management systems for all students</p>
                    </div>

                    <div className='arrow-button-container'>
                        <span className='arrow-button circle behind'></span>
                        <button className='arrow-button circle'><VscArrowRight /></button>
                    </div>
                </div>
            </div>

            <div className='auth-right'>
                <div className='auth-form'>
                    <div className='auth-form-main-col'>
                        <div>
                            <div className='promo-text-container'>
                                <p className='promo-text'>Let's Join <b>10,000+</b></p>
                                <p className='promo-text'>Other <span className='highlight'>Students</span></p>
                            </div>

                            <div className="auth-form-inputs">
                                <div className='input-container name'>
                                    <label>First Name</label>
                                    <input type="text" name='firstname' placeholder='First Name' />
                                </div>

                                <div className='input-container name last'>
                                    <label>Last Name</label>
                                    <input type="text" name='lastname' placeholder='Last Name' />
                                </div>

                                <div className='input-container'>
                                    <label>Email</label>
                                    <input type="email" name='email' placeholder='youremail@example.com' />
                                </div>

                                <div className='input-container'>
                                    <label>Password</label>
                                    <input type="password" name='password' placeholder='Enter Your Password' />
                                </div>
                                
                                <button className='button primary fullwidth submit' onClick={() => {}}>Sign Up</button>
                        </div>
                        </div>
                        <div className='auth-form-misc-col'>
                            <div className='auth-button-wrapper'>
                                <button className='button primary login' onClick={() => {navigate("/login")}}>Login</button>

                                <div className='connect-image-container'>
                                    <img src="/Assets/Images/AuthConnect.png" />
                                </div>
                            </div>

                            <div>
                                <p style={{margin: 0}}>Already Have</p>
                                <p style={{margin: 0}}>An Account?</p>
                                <Link to={"/login"} style={{marginTop: 10, display: "inline-block"}} className='highlight'>Login</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
 
export default Register;