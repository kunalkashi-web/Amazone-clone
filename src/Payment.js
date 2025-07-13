import React, { useState, useEffect } from 'react';
import './Payment.css';
import { useStateValue } from "./StateProvider";
import CheckoutProduct from "./CheckoutProduct";
import { Link, useNavigate } from "react-router-dom";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import CurrencyFormat from "react-currency-format";
import { getBasketTotal } from "./reducer";
import axios from './axios';
import { doc, setDoc } from "firebase/firestore";
import { db } from "./firebase";



function Payment() {
    const [{ basket, user }, dispatch] = useStateValue();
    const history = useNavigate();

    const stripe = useStripe();
    const elements = useElements();

    const [succeeded, setSucceeded] = useState(false);
    const [processing, setProcessing] = useState("");
    const [error, setError] = useState(null);
    const [disabled, setDisabled] = useState(true);
    const [clientSecret, setClientSecret] = useState(true);
  
   useEffect(() => {
    const getClientSecret = async () => {
        const basketTotal = Number(getBasketTotal(basket));
        const totalInCents = Math.round(basketTotal * 100);

        

        if (totalInCents <= 0 || isNaN(totalInCents)) {
            
            return;
        }

        try {
            const response = await axios({
                method: 'post',
                url: `/payments/create?total=${totalInCents}`
            });

            setClientSecret(response.data.clientSecret);
        } catch (error) {
            console.error("Failed to create payment intent:", error);
        }
    };

    getClientSecret();
}, [basket]);


  

    const handleSubmit = async (event) => {
  event.preventDefault();
  setProcessing(true);

  const payload = await stripe.confirmCardPayment(clientSecret, {
    payment_method: {
      card: elements.getElement(CardElement),
    },
  });

  const paymentIntent = payload.paymentIntent;

  // ✅ Safety check for logged-in user
  if (!user?.uid) {
    console.error("User is not logged in.");
    setError("You must be logged in to complete the payment.");
    setProcessing(false);
    return;
  }

  try {
    await setDoc(doc(db, "users", user.uid, "orders", paymentIntent.id), {
      basket: basket,
      amount: paymentIntent.amount,
      created: paymentIntent.created,
    });

    setSucceeded(true);
    setError(null);
    setProcessing(false);

    dispatch({
      type: "EMPTY_BASKET",
    });

    history("/orders");
  } catch (err) {
    console.error("Firestore write failed:", err);
    setError("Could not save order. Please try again.");
    setProcessing(false);
  }
};


    const handleChange = event => {
        // Listen for changes in the CardElement
        // and display any errors as the customer types their card details
        setDisabled(event.empty);
        setError(event.error ? event.error.message : "");
    }

    return (
        <div className='payment'>
            <div className='payment__container'>
                <h1>
                    Checkout (
                        <Link to="/checkout">{basket?.length} items</Link>
                        )
                </h1>


                {/* Payment section - delivery address */}
                <div className='payment__section'>
                    <div className='payment__title'>
                        <h3>Delivery Address</h3>
                    </div>
                    <div className='payment__address'>
                        <p>{user?.email}</p>
                        <p>123 React Lane</p>
                        <p>Los Angeles, CA</p>
                    </div>
                </div>

                {/* Payment section - Review Items */}
                <div className='payment__section'>
                    <div className='payment__title'>
                        <h3>Review items and delivery</h3>
                    </div>
                    <div className='payment__items'>
                            {basket.map((item,) => (
                            <CheckoutProduct
                                key={item.uid}// ensures uniqueness
                                id={item.id}
                                title={item.title}
                                image={item.image}
                                price={item.price}
                                rating={item.rating}
                            />
                        ))}
                    </div>
                </div>
            

                {/* Payment section - Payment method */}
                <div className='payment__section'>
                    <div className="payment__title">
                        <h3>Payment Method</h3>
                    </div>
                    <div className="payment__details">
                            {/* Stripe magic will go */}

                            <form onSubmit={handleSubmit}>
                                <CardElement onChange={handleChange}/>

                                <div className='payment__priceContainer'>
                                    <CurrencyFormat
                                        renderText={(value) => (
                                            <h3>Order Total: {value}</h3>
                                        )}
                                        decimalScale={2}
                                        value={getBasketTotal(basket)}
                                        displayType={"text"}
                                        thousandSeparator={true}
                                        prefix={"$"}
                                    />
                                    <button disabled={processing || disabled || succeeded}>
                                        <span>{processing ? <p>Processing</p> : "Buy Now"}</span>
                                    </button>
                                </div>

                                  {/* Errors */}
                                {error && <div>{error}</div>}
                            </form>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Payment

