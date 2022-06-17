import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {VscArrowRight} from "react-icons/vsc";
import {BsImageFill, BsEye, BsEyeSlash} from "react-icons/bs";
import "./Auth.css";
import "./Login.css";
import { connect } from 'react-redux';
import { check_login, edit_auth_value, get_user_assignments, login, set_loading } from '../Actions';
import { onPressReturn, validate_email, validate_password } from '../Utils';

const Login = ({email, error, logged_in, is_admin, user, login, check_login, get_user_assignments, set_loading, edit_auth_value}) => {
    const navigate = useNavigate()
    const [errors, setErrors] = useState({});
    
    const [password, setPassword] = useState("");
    const [passwordVisible, setPasswordVisible] = useState(false);

    const email_ref = useRef(null);
    const password_ref = useRef(null);

    const [query] = useSearchParams()

    useEffect(() => {
        async function login_check(){
            set_loading(true);
            await check_login()
            set_loading(false);
        }

        login_check();
    }, []);

    useEffect(() => {
        const from = query.get("from");
        if(logged_in && user){
            get_user_assignments()
            if(is_admin){
                navigate(from || "/dashboard/");
            }else{
                navigate(`/dashboard/`);
            }
        }
    }, [logged_in, is_admin, user]);

    const onChangeValue = (keys=[], error_prop) => (e) => {
        error_prop && (typeof(error_prop) === "string") && setErrors(e => ({...e, [error_prop]: e}));

        edit_auth_value(keys, e.target.value);
    }

    const onChangePassword = (e) => {
        setErrors(e => ({...e, password_error: ""}));
        setPassword(e.target.value);
    }

    const validate_fields = () => {
        let is_valid = true;
        
        if(!validate_email(email.trim())){is_valid=false; setErrors((e) => ({...e, email_error: "Not a valid email"}))}

        // if(!validate_password(password)){is_valid=false; setErrors((e) => ({...e, password_error: "Not a valid email"}))}

        return is_valid;
    }

    const onPressLogin = async () => {
        set_loading(true);
        if(validate_fields()){
            await login({email: email.trim(), password});
        }
        set_loading(false);
    }

    const onPressEnterEmail = onPressReturn(() => {
        password_ref.current?.focus();
    });

    const onPressEnterPassword = onPressReturn(() => {
        onPressLogin();
    });

    const onClickPasswordEye = () => {
        setPasswordVisible((v) => !v);
    }

    return (
        <div className='page login'>
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
                                <div className='input-container'>
                                    <label>Email</label>
                                    <input ref={email_ref} type="email" name='email' value={email} onChange={onChangeValue(["email"])} placeholder='youremail@example.com' onKeyDown={onPressEnterEmail} />

                                    {errors.email_error && <p className='error'>{errors.email_error}</p>}
                                </div>

                                <div className='input-container'>
                                    <label>Password</label>
                                    <input ref={password_ref} type={passwordVisible?"text":"password"} name='password' value={password} onChange={onChangePassword} placeholder='Enter Your Password' onKeyDown={onPressEnterPassword} />

                                    <div className='input-adornment end' style={{backgroundColor: "transparent"}}>
                                        <span className='clickable' onClick={onClickPasswordEye}>{passwordVisible?<BsEye />:<BsEyeSlash />}</span>
                                    </div>
                                </div>
                                
                                <button className='button primary fullwidth submit' onClick={onPressLogin}>Log In</button>

                                {error && <p className='error'>{error}</p>}
                        </div>
                        </div>
                        <div className='auth-form-misc-col'>
                            <div className='auth-button-wrapper'>
                                <div className='connect-image-container'>
                                    <img src="/Assets/Images/AuthConnect.png" />
                                </div>
                            </div>

                            <div>
                                <p style={{margin: 0}}>Don't Have</p>
                                <p style={{margin: 0}}>An Account?</p>
                                <Link to={"/register"} style={{marginTop: 10, display: "inline-block"}} className='highlight'>Sign Up</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function map_state_to_props({Auth, App}){
    return {email: Auth.email, logged_in: Auth.logged_in, is_admin: Auth.is_admin, user: App.user, error: Auth.error}
}

export default connect(map_state_to_props, {login, check_login, get_user_assignments, edit_auth_value, set_loading})(Login);