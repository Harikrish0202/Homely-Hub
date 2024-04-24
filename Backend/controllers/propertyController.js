const Property = require("../Models/propertyModel");
const APIFeatures = require("../utils/APIFeatures");
// const multer = require("multer");
// const upload = multer({ storage: multer.memoryStorage() });
// const path = require("path");
// const dotenv = require("dotenv").config({
//   path: path.join(__dirname, "../config.env"),
// });
// const cloudinary = require("../utils/Cloudinary");

exports.getProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    res.status(200).json({
      status: "success",

      data: property,
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err.message,
    });
  }
};

exports.createProperty = async (req, res) => {
  try {
    const propertyData = {
      ...req.body,
      userId: req.user.id,
    };
    const property = await Property.create(propertyData);
    res.status(200).json({
      status: "success",
      data: {
        data: property,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err.message,
    });
    // console.log(err);
  }
};

exports.getProperties = async (req, res) => {
  try {
    const features = new APIFeatures(Property.find(), req.query)
      .filter()
      .search()
      .paginate();
    const allProperties = await Property.find();
    const doc = await features.query;

    res.status(200).json({
      status: "success",
      no_of_responses: doc.length,
      all_Properties: allProperties.length,
      data: doc,
      // user: res.locals.user,
    });
  } catch (err) {
    console.error("Error searching properties:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getUsersProperties = async (req, res) => {
  try {
    const userId = req.user._id;
    const property = await Property.find({ userId });
    res.status(200).json({
      status: "success",
      data_length: property.length,
      data: property,
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err.message,
    });
    // console.log(err);
  }
};
