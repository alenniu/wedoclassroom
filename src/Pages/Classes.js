import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import {BsCurrencyDollar} from "react-icons/bs";
import { get_classes, get_popular_classes, get_my_requests, get_class_client_secret, set_loading, request_join_class, get_classes_by_subject } from '../Actions';
import { Modal, Slide, Box } from '@mui/material';
import Class from '../Components/Classes/Class';
import PopularClass from '../Components/Classes/PopularClass';
import config from "../Config";
import { get_full_image_url } from '../Utils';
import { Tabs } from '../Components/Common';

import "./Classes.css";

const stripePromise = loadStripe(config.STRIPE_PUBLIC_KEY);

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


const Checkout = ({_class, isLoading, setIsLoading, error, setError, open, onPaymentSuccess}) => {

    const {_id, price=0, subject, title, students=[], schedule, tags, max_students=1, cover_image="/Assets/Images/AuthBackground.png"} = _class;

    const stripe = useStripe();
    const elements = useElements();

    const handlePaymentSubmit = async (e) => {
        e.preventDefault();
    
        if (!stripe || !elements) {
          // Stripe.js has not yet loaded.
          // Make sure to disable form submission until Stripe.js has loaded.
          return;
        }
    
        setIsLoading(true);
    
        const { error, paymentIntent } = await stripe.confirmPayment({
          elements,
          redirect: "if_required"
        })

        if(error){
            if (error.type === "card_error" || error.type === "validation_error") {
                setError(error.message);
            } else {
                setError("An unexpected error occurred.");
            }

            setIsLoading(false);
            
            return;
        }
      
        setIsLoading(false);
        onPaymentSuccess();
        console.log("Payment finished");
    };
    
    return (
        <form id="payment-form" onSubmit={handlePaymentSubmit} className="payment-form">
            <div className='class-cover'>
                <img src={get_full_image_url(cover_image)} alt='class cover' />
            </div>

            <p className='class-title'>{title}</p>
            {open && <PaymentElement id="payment-element" />}

            {open && <button className='button fullwidth primary' disabled={isLoading || !stripe || !elements} id="submit">
                <span id="button-text">
                {isLoading ? <div className="spinner" id="spinner"></div> : "Pay now"}
                </span>
            </button>}

            {error && <p className='error'>{error}</p>}
        </form>
    );
}

const SUBJECTS = ["Math", "English"];

const Classes = ({classes=[], total=0, popular_classes=[], requests=[], user={}, total_requests=0, app_config, get_classes, get_classes_by_subject, get_popular_classes, request_join_class, get_my_requests, get_class_client_secret, set_loading, is_student}) => {

    // const stripe = useStripe();
    // const elements = useElements();

    const [pageLimit, setPageLimit] = useState(20);
    const [page, setPage] = useState(0);
    const [search, setSearch] = useState("");
    const [clientSecret, setClientSecret] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [joiningClass, setJoiningClass] = useState(null);
    const [error, setError] = useState("");

    const [classtype, setClasstype] = useState("")

    useEffect(() => {
        if(app_config){
            const init = async () => {
                set_loading(true);
                
                await get_popular_classes(10, 0);
                await get_my_requests(100, 0, "{}", `{"accepted": false, "rejected": false}`)
                SUBJECTS.map((subject) => {get_classes_by_subject(pageLimit, page * pageLimit, search, "{}", "{}", subject)});
                
                set_loading(false);
            }
    
            init();
        }
    }, [app_config]);

    useEffect(() => {
        const init = async () => {
            set_loading(true);
            await get_classes(pageLimit, page * pageLimit);
            set_loading(false);
        }

        init();
    }, [classtype]);

    const onPressTab = (e, {label, id}, index) => {
        setClasstype(id);
    }

    const onPressJoinClass = async (_class) => {
        set_loading(true);
        const res = await get_class_client_secret(_class._id);
        
        // console.log(res);
        if(res.success){
            setJoiningClass(_class);
            setClientSecret(res.client_secret);
        }else{
            setError(res.msg || res);
        }

        set_loading(false);
    }

    const closePaymentModal = () => {
        setClientSecret(null);
        setError("");
    }

    const joinClass = async (_class) => {
        set_loading(true);
        await request_join_class(_class);
        set_loading(false);
    }

    const onPaymentSuccess = async () => {
        set_loading(true);
        
        await joinClass(joiningClass);
        setJoiningClass(null);
        setClientSecret(null);
        setError(null);

        set_loading(false);
    }

    const appearance = {
        theme: 'stripe',
      };
      const options = {
        clientSecret,
        appearance,
      };

    return (
        <>
        <div className='page classes'>
            <div className='main-col'>
                <Tabs tabs={[{label: "Popular Classes", id: ""}, {label: "Group Classes", id: "group"}, {label: "Private Classes", id: "private"}]} />
                <ul className='popular-class-list'>
                    {popular_classes.map((c, i) => {
                        const already_requested = requests.some((r) => (r._class === c._id) && !r.declined);
                        const already_joined = c.students.some((s) => s === user._id);

                        return (
                            <li key={c._id+i}><PopularClass _class={c} onPressJoin={onPressJoinClass} can_join={!already_joined && is_student && !already_requested} /></li>
                        )
                    })}
                </ul>
            </div>

            <div className='misc-col'>
                <h3 style={{margin: "20px 0"}}>Filter Classes</h3>
                <div className='input-container class-filter'>
                    <label>Price Range</label>
                    <input placeholder='00000' style={{paddingLeft: "50px"}} />
                    <div className='input-adornment start' style={{backgroundColor: "transparent", borderRight: "2px solid rgba(0,0,0,0.1)"}}>
                        <BsCurrencyDollar color='rgba(0,0,0,0.3)' size={"20px"} />
                    </div>
                </div>

                <div className='input-container class-filter'>
                    <label>Category</label>
                    <select>
                        <option>Please Select</option>
                    </select>
                </div>

                <div className='input-container class-filter'>
                    <label>Date and Time</label>
                    <select>
                        <option>Please Select</option>
                    </select>
                </div>

                <div className='input-container class-filter'>
                    <label>Difficulty Level</label>
                    <select>
                        <option>Please Select</option>
                    </select>
                </div>

                <button className='button primary'>Filter Classes</button>
            </div>

            {
                Object.entries(classes).map(([subject, {classes=[], total=0}], i) => {
                    return (
                    <div>
                        <h3 className='list-subject'>{subject}</h3>    
                        <ul className='classes-list' key={subject}>
                            {classes.map((c, i) => {
                                const already_requested = requests.some((r) => (r._class === c._id) && !r.declined);
                                const already_joined = c.students.some((s) => s === user._id);

                                return <li key={c._id+i}><Class _class={c} can_join={!already_joined && is_student && !already_requested} onPressJoin={onPressJoinClass} /></li>
                            })}
                        </ul>
                    </div>
                    )
                })
            }
        </div>
        <Modal open={!!(clientSecret || error)} onClose={closePaymentModal}>
            <Box sx={style}>
                <Slide in={!!(clientSecret || error)} direction="up">
                <div>
                    {clientSecret && joiningClass && (
                        <Elements options={options} stripe={stripePromise}>
                            <Checkout _class={joiningClass} onPaymentSuccess={onPaymentSuccess} error={error} setError={setError} isLoading={isLoading} setIsLoading={setIsLoading} open={!!(clientSecret || error)} />
                        </Elements>
                    )}
                </div>
                </Slide>
            </Box>
        </Modal>
        </>
    );
}

function map_state_to_props({App, Auth, User, Class}){
    return {app_config: App.config, classes: Class.subject_classes, total: Class.total, popular_classes: Class.popular_classes, requests: User.requests, total_requests: User.total_requests, is_student: Auth.is_student, user: App.user}
}

export default connect(map_state_to_props, {get_classes, get_classes_by_subject, request_join_class, get_popular_classes, get_my_requests, get_class_client_secret, set_loading})(Classes);