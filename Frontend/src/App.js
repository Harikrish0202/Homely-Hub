import "./App.css";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";
import PropertyDetails from "./Components/PropertyDetails/PropertyDetails";
import Main from "./Components/Home/Main";
import PropertyList from "./Components/Home/PropertyList";
import Accomodation from "./Components/Accomodation/Accomodation";
import Login from "./Components/User/Login";
import Signup from "./Components/User/Signup";
import Profile from "./Components/User/Profile";
import EditProfile from "./Components/User/EditProfile";
import MyBookings from "./Components/Mybookings/MyBookings";
import BookingDetails from "./Components/Mybookings/BookingDetails";
import ForgotPassword from "./Components/User/ForgotPassword";
import ResetPassword from "./Components/User/ResetPassword";
import UpdatePassword from "./Components/User/UpdatePassword";
import { Flip, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { currentUser } from "./Store/User/user-action";

import Payment from "./Components/Payment/Payment";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import AccomodationForm from "./Components/Accomodation/AccomodationForm";

function App() {
  const stripePromise = loadStripe(
    "pk_test_51Nu7qvSALNch1MIs31dRgF7ApJkXUZwhnpGe3oQOmeBdHuzk70OMnHudvbs4KW5rXMdXpSlUZUQdwsJFBJYO3KpM005OTQNsPr"
  );

  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(currentUser());
  }, [dispatch]);

  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path="*" element={<Main />} id="main" exact>
        <Route id="home" index element={<PropertyList />} />
        <Route
          element={<PropertyDetails />}
          id="PropertyDetails"
          path="propertylist/:id"
          exact
        />
        {/* Login */}
        <Route id="login" path="login" element={<Login />} />
        <Route id="signup" path="signup" element={<Signup />} />
        <Route id="profile" path="profile" element={<Profile />} />
        <Route id="editprofile" path="editprofile" element={<EditProfile />} />
        {/* accomendation */}
        <Route
          id="accomodation"
          path="accomodation"
          element={<Accomodation />}
        />

        <Route
          id="accomodationform"
          path="accomodationform"
          element={<AccomodationForm />}
        />
        <Route
          id="forgotpassword"
          path="user/forgotpassword"
          element={<ForgotPassword />}
        />
        <Route
          id="updatepassword"
          path="user/updatepassword"
          element={<UpdatePassword />}
        />
        <Route
          id="resetpassword"
          path="user/resetPassword/:token"
          element={<ResetPassword />}
        />
        <Route id="mybookings" path="user/booking" element={<MyBookings />} />
        <Route
          id="bookingdetails"
          path="user/booking/:bookingId"
          element={<BookingDetails />}
        />

        <Route
          id="payment"
          path="payment/:propertyId"
          element={
            <Elements stripe={stripePromise}>
              <Payment />
            </Elements>
          }
        />
      </Route>
    )
  );

  return (
    <div className="App">
      {/* <Home /> */}
      <RouterProvider router={router} />
      <ToastContainer
        position="bottom-center"
        autoClose={3000}
        draggable={true}
        transition={Flip}
      />
    </div>
  );
}

export default App;
