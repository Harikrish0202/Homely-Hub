import { configureStore } from "@reduxjs/toolkit";
import propertySlice from "./Property/property-slice";
import propertyDetailsSlice from "./PropertyDetails/propertyDetails-slice";
import userSlice from "./User/user-slice";
import paymentReducer from "./payment-slice";
import bookingSlice from "./Booking/booking-slice";
import accomodationSlice from "./Accomodation/Accomodation-slice";

const store = configureStore({
  reducer: {
    properties: propertySlice.reducer,
    propertydetails: propertyDetailsSlice.reducer,
    user: userSlice.reducer,
    payment: paymentReducer,
    booking: bookingSlice,
    accomodation: accomodationSlice.reducer,
  },
});

export default store;
