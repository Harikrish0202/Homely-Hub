import { addBooking, setBookings, setBookingDetails } from "./booking-slice";
import axios from "axios";

export const createBooking = (bookingData) => async (dispatch) => {
  try {
    const response = await axios.post(
      "/api/v1/rent/user/booking/new",
      bookingData
    );
    console.log("createbooking", response);
    dispatch(addBooking(response.data.data.booking));
  } catch (error) {
    console.error("Error creating booking:", error);
  }
};

export const fetchBookingDetails = (bookingId) => async (dispatch) => {
  try {
    const response = await axios.get(`/api/v1/rent/user/booking/${bookingId}`);
    console.log("Booking Details API Response:", response.data.data.bookings);
    dispatch(setBookingDetails(response.data.data));
  } catch (error) {
    console.error("Error fetching booking details:", error);
  }
};

export const fetchUserBookings = () => async (dispatch) => {
  try {
    const response = await axios.get("/api/v1/rent/user/booking");
    console.log("API Response:", response.data);
    dispatch(setBookings(response.data.data.bookings));
  } catch (error) {
    console.error("Error fetching bookings:", error);
  }
};
