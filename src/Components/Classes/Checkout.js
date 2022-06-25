import React from 'react';

const { useStripe, useElements, PaymentElement } = require("@stripe/react-stripe-js");

export default ({isLoading, setIsLoading, error, setError, open}) => {
    const stripe = useStripe();
    const elements = useElements();

    console.log(stripe, elements);

    const handlePaymentSubmit = async (e) => {
        e.preventDefault();
    
        if (!stripe || !elements) {
          // Stripe.js has not yet loaded.
          // Make sure to disable form submission until Stripe.js has loaded.
          return;
        }
    
        setIsLoading(true);
    
        const { error } = await stripe.confirmPayment({
          elements,
          redirect: "if_required"
        })

        if (error.type === "card_error" || error.type === "validation_error") {
            setError(error.message);
          } else {
            setError("An unexpected error occurred.");
          }
      
          setIsLoading(false)
    };
    
    return (
        <form id="payment-form" onSubmit={handlePaymentSubmit} className="payment-form">
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