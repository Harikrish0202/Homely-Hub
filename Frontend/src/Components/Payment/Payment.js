// Payment.js
import React from "react";
import {
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { setPaymentDetails } from "../../Store/payment-slice";
import { selectPaymentDetails } from "../../Store/payment-slice";
import { createBooking } from "../../Store/Booking/booking-action"; // Import the createBooking action

const options = {
  style: {
    base: {
      fontSize: "16px",
    },
    invalid: {
      color: "#9e2146",
    },
  },
};
const Payment = () => {
  const stripe = useStripe();
  const elements = useElements();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { bookingId } = useParams();
  const { propertyId } = useParams();

  // useSelector to get payment details from Redux store
  const {
    checkinDate,
    checkoutDate,
    totalPrice,
    propertyName,
    address,
    maximumGuest,
    nights,
  } = useSelector(selectPaymentDetails);

  // Use selector to get user authentication status from Redux store
  const { isAuthenticated } = useSelector((state) => state.user);
  console.log(isAuthenticated);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const totalAmount = totalPrice;

    if (!stripe || !elements) {
      console.error("Stripe is not initialized.");
      return;
    }

    const cardNumberElement = elements.getElement(CardNumberElement);

    try {
      // Create a Payment Intent with Stripe
      const response = await fetch("/api/v1/rent/user/checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: totalAmount,
          currency: "inr",
          paymentMethodTypes: ["card"],
          checkinDate,
          checkoutDate,
          propertyName,
          address,
          maximumGuest,
          bookingId,
          propertyId,
          nights,
        }),
      });

      const data = await response.json();
      // Confirm the Payment Intent using card details
      await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: {
          card: cardNumberElement,
        },
      });

      console.log("Payment was successful");

      // Dispatch the createBooking action after successful payment
      dispatch(
        createBooking({
          booking: bookingId,
          property: propertyId,
          price: totalAmount,
          guests: maximumGuest,
          fromDate: checkinDate,
          toDate: checkoutDate,
          nights,
        })
      );

      // Dispatch an action to reset payment details after successful payment
      dispatch(
        setPaymentDetails({
          checkinDate,
          checkoutDate,
          totalPrice,
          propertyName,
          address,
          maximumGuest,
          nights,
        })
      );

      // Navigate to the booking details page
      navigate("/user/booking");
    } catch (error) {
      console.error("Error creating Payment Intent: ", error);
      // Handle the error
    }
  };

  return (
    <div className="row wrapper">
      <div className="col-10 col-lg-5">
        {isAuthenticated ? (
          <form className="shadow-lg" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="card_num_field">Card Number</label>
              <CardNumberElement
                type="text"
                id="card_num_field"
                className="form-control"
                options={options}
              />
            </div>

            <div className="form-group">
              <label htmlFor="card_exp_field">Card Expiry</label>
              <CardExpiryElement
                type="text"
                id="card_exp_field"
                className="form-control"
                options={options}
              />
            </div>

            <div className="form-group">
              <label htmlFor="card_cvc_field">Card CVC</label>
              <CardCvcElement
                type="text"
                id="card_cvc_field"
                className="form-control"
                options={options}
              />
            </div>

            <button type="submit" className="paymentbtn">
              Pay - {totalPrice}
            </button>
          </form>
        ) : (
          <div>{navigate("/login")}</div>
        )}
      </div>
    </div>
  );
};

export default Payment;
