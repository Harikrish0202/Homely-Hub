const path = require("path");
const dotenv = require("dotenv").config({
  path: path.join(__dirname, "../config.env"),
});
const stripe = require("stripe")(process.env.STRIPE_SECRECT_KEY); // Its an object now
const Property = require("../Models/propertyModel");
const Booking = require("../Models/bookingModel");
const moment = require("moment");

// exports.getcheckOutSession = async (req, res, next) => {
//   try {
//     //1) Get currently booked Tour
//     const property = await Property.findById(req.params.propertyId);
//     // 2) checkOut session

//     const session = await stripe.checkout.sessions.create({
//       payment_method_types: ["card"],
//       success_url: `${req.protocol}://${req.get("host")}/property`,
//       cancel_url: `${req.protocol}://${req.get("host")}/property`,
//       customer_email: req.user.email,
//       client_reference_id: req.params.propertyId,
//       mode: "payment",
//       line_items: [
//         {
//           quantity: 1,
//           price_data: {
//             unit_amount: property.price * 100,
//             currency: "inr",
//             product_data: {
//               name: `${property.name} Property`,
//               description: property.description,
//               images: [
//                 `https://fahmiadit.files.wordpress.com/2017/11/good-property-bali.jpg`,
//               ],
//             },
//           },
//         },
//       ],
//     });
//     // 3) send it to client
//     res.status(200).json({
//       status: "succes",
//       session,
//     });
//   } catch (err) {
//     res.status(200).json({
//       status: "fail",
//       message: err.message,
//     });
//   }
// };

exports.getcheckOutSession = async (req, res, next) => {
  const { amount, currency, paymentMethodTypes, propertyName } = req.body;

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Convert amount to paise(Because Stripe expects amount to be in smallest currency unit(inr->paise))
      currency: currency || "inr", // By default we setting (currency unit)
      payment_method_types: paymentMethodTypes,
      description: "Payment for testing",
      metadata: {
        propertyName: JSON.stringify(propertyName), //Fooditem Details
      },
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log(error);
  }
};

exports.createBookings = async (req, res) => {
  try {
    if (!req.user) {
      throw new Error("Please login First");
    }
    const { property, price, guests, fromDate, toDate } = req.body;

    const fromDateMoment = moment(fromDate);
    const toDateMoment = moment(toDate);

    const numberOfnights = toDateMoment.diff(fromDateMoment, "days");

    // Fetch the property from the database
    const propertyTemp = await Property.findById(property);

    // Check if the property is already booked on the requested dates
    const isBooked = propertyTemp.currentBookings.some((booking) => {
      return (
        (booking.fromDate <= new Date(fromDate) &&
          new Date(fromDate) <= booking.toDate) ||
        (booking.fromDate <= new Date(toDate) &&
          new Date(toDate) <= booking.toDate)
      );
    });

    if (isBooked) {
      return res.status(400).json({
        status: "fail",
        message: "The property is already booked for the requested dates.",
      });
    }

    // If the property is not booked, create a new booking
    const booking = await Booking.create({
      property,
      price,
      guests,
      fromDate: fromDate,
      toDate: toDate,
      numberOfnights,
      user: req.user._id,
    });

    // Update the property with the new booking
    const updatedProperty = await Property.findByIdAndUpdate(
      property,
      {
        $push: {
          currentBookings: {
            bookingId: booking.id,
            fromDate: fromDate,
            toDate: toDate,
            userId: booking.user,
          },
        },
      },
      { new: true } // Return the modified document
    );

    res.status(200).json({
      status: "success",
      data: {
        booking,
        updatedProperty,
      },
    });
  } catch (err) {
    res.status(401).json({
      status: "fail",
      message: err.message,
    });
  }
};

exports.getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id });
    // console.log(bookings);
    res.status(200).json({
      status: "success",
      data: {
        bookings,
      },
    });
  } catch (err) {
    res.status(401).json({
      status: "fail",
      message: err.message,
    });
  }
};

exports.getBookingDetails = async (req, res) => {
  try {
    const bookings = await Booking.findById(req.params.bookingId);
    // console.log(bookings);
    res.status(200).json({
      status: "success",
      data: {
        bookings,
      },
    });
  } catch (err) {
    res.status(401).json({
      status: "fail",
      message: err.message,
    });
  }
};
