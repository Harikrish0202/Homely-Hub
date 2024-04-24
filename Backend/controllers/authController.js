const User = require("../Models/userModel");
const jwt = require("jsonwebtoken");
const path = require("path");
const dotenv = require("dotenv").config({
  path: path.join(__dirname, "../config.env"),
});
const { promisify } = require("util");
const sendEmail = require("../utils/Email");
const crypto = require("crypto");
const cloudinary = require("../utils/Cloudinary");

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  res.cookie("jwt", token, cookieOptions);
  // Remove the Password
  user.password = undefined;

  res.status(statusCode).json({
    status: "success",
    token,
    user,
  });
};

const filterObj = (obj, ...allowedFields) => {
  let newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

// const storage = multer.memoryStorage(); // Use memory storage for Cloudinary
// const upload = multer({ storage });

const defaultAvatarUrl =
  "https://t3.ftcdn.net/jpg/01/18/01/98/360_F_118019822_6CKXP6rXmVhDOzbXZlLqEM2ya4HhYzSV.jpg";

exports.signup = async (req, res) => {
  try {
    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      phoneNumber: req.body.phoneNumber,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
      avatar: { url: req.body.avatar || defaultAvatarUrl },
    });
    createSendToken(newUser, 201, res);
  } catch (err) {
    res.status(400).json({
      message: err.message,
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      throw new Error("Please provide email and password");
    }
    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.correctPassword(password, user.password))) {
      throw new Error("Incorect email or password");
    }
    createSendToken(user, 200, res);
  } catch (err) {
    res.status(400).json({
      message: "Login in unsuccessfull",
    });
  }
};

exports.logout = (req, res) => {
  res.cookie("jwt", "loggedout", {
    expires: new Date(Date.now() + 10 * 100),
    httpOnly: true,
  });
  res.status(200).json({ status: "success" });
};

exports.protect = async (req, res, next) => {
  try {
    // 1) Getting the Token and check if it there
    let token;
    // console.log(req.cookies);
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies.jwt && req.cookies.jwt !== "loggedout") {
      token = req.cookies.jwt;
    }

    if (!token) {
      throw new Error("You are not Logged!! Please log in to get access");
    }

    //2) Verification Token

    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // 3) Check if users still exsits

    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      throw new Error("the user belonging to the token doesn't exsists");
    }

    // 4) Check If user change Password after the token is issued

    if (currentUser.changedPasswordAfter(decoded.iat)) {
      throw new Error("User recently cahnged the password, Please login again");
    }
    // Grant Access to protected route.
    req.user = currentUser;
    // res.locals.user = currentUser;
    next();
  } catch (err) {
    res.status(401).json({
      status: "fail",
      message: err.message,
    });
  }
};

exports.isLoggedIn = async (req, res, next) => {
  // 1) Getting the Token and check if it there
  try {
    if (req.cookies.jwt) {
      // Verfy the token
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );

      // 2) Check if users still exsits

      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        return next();
      }

      // 3) Check If user change Password after the token is issued

      if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next();
      }
      // There is a looged in user
      res.status(200).json({
        status: "success",
        user: currentUser,
      });
      return next();
    }
  } catch (err) {
    return next();
  }
  next();
};
exports.updateMe = async (req, res, next) => {
  try {
    // console.log(req.file);
    // console.log(req.body);
    const filteredBody = filterObj(req.body, "name", "phoneNumber", "avatar");
    // if (req.file) filteredBody.photo = req.file.filename;
    // 3) Update the user Document
    console.log(filteredBody);
    console.log(req.body.avatar);

    if (req.body.avatar !== undefined) {
      const result = await cloudinary.uploader.upload(req.body.avatar, {
        folder: "avatars",
        width: 150,
        height: 150,
        crop: "scale",
        responsive_breakpoints: {
          create_derived: true,
          bytes_step: 20000,
          min_width: 200,
          max_width: 200,
        },
      });
      filteredBody.avatar = {
        public_id: result.public_id,
        url: result.secure_url,
      };
    }
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      filteredBody,
      {
        new: true,
        runValidators: true,
        useFindAndModify: false,
      }
    );

    res.status(200).json({
      status: "Succes",
      data: {
        user: updatedUser,
      },
    });
  } catch (err) {
    res.status(401).json({
      status: "Fail",
      message: err.message,
    });
  }
};

exports.updatePassword = async (req, res, next) => {
  try {
    // 1) Get User from collection
    const user = await User.findById(req.user.id).select("+password");

    // 2) Check if POSTed current password is correct
    if (
      !(await user.correctPassword(req.body.passwordCurrent, user.password))
    ) {
      //req.user.id is assumed to be the ID of the currently authenticated user(authController.protection). This information is typically added to the request object during the authentication process.
      throw new Error("Your current password is wrong");
    }

    //3) If so, update password
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();
    // user.findByIdUpdate will not work as intended
    //4) Log user in. send JWT
    createSendToken(user, 200, res);
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err.message,
    });
  }
};

exports.forgotPassword = async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    res.status(400).json({
      error: "There is no user with this email",
    });
  }
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetURL = `http://localhost:3000/users/resetPassword/${resetToken}`;

  const message = `<p>Forgot your password? Submit a PATCH request with your new password and passwordConfirm. Click the button to resetpassword page.: <a href="${resetURL}" style=" display: inline-block; margin:10px; padding:10px; background-color: rgb(65, 60, 60, 0.5); border-radius:5px; text-decoration:none; color:white; font-size:20px">Reset Password.</a><p>`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Your password reset token valid for 10 mins",
      message,
    });

    res.status(200).json({
      status: "success",
      message: "Token send to email",
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    res.status(400).json({
      error: err.message,
    });
    return next();
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    // 1) Get user based on Token

    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });
    // 2) If Token has not expired, and there is user, set the new Password
    if (!user) {
      throw new Error("Token is invalid or Expired!!");
    }
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    // 3) Update changedPasswordAt property for the user
    // 4) Log the user in, send JWT
    createSendToken(user, 200, res);
  } catch (err) {
    res.status(400).json({
      status: "fail",
      error: err.message,
    });
    return next();
  }
};

// exports.getUserLogins = async (req, res, next) => {
//   const currentUser = await User.findById(req.user);
//   res.status(200).json({
//     status: "success",
//     user: currentUser,
//   });
// };
