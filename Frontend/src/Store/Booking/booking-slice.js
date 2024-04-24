import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  bookings: [],
  bookingDetails: {},
  loading: false, // Add a new field for booking details
};

const bookingSlice = createSlice({
  name: "booking",
  initialState,
  reducers: {
    sendBookingRequest(state) {
      state.loading = true;
    },
    setBookings: (state, action) => {
      state.bookings = action.payload;
      state.loading = false;
    },
    addBooking: (state, action) => {
      state.bookings.push(action.payload);
    },
    // Add a new reducer for booking details
    setBookingDetails: (state, action) => {
      state.bookingDetails = action.payload.bookings;
    },
  },
});

export const { setBookings, addBooking, setBookingDetails } =
  bookingSlice.actions;
export default bookingSlice.reducer;
