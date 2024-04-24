import React, { useEffect, useState } from "react";
import "../../CSS/ForgetPassword.css";
import { useDispatch, useSelector } from "react-redux";
import { forgotPassword } from "../../Store/User/user-action";
import { toast } from "react-toastify";
import { userActions } from "../../Store/User/user-slice";

const ForgotPassword = () => {
  const { errors } = useSelector((state) => state.user);
  const [email, setEmail] = useState("");
  const dispatch = useDispatch();

  const submitHandler = (e) => {
    e.preventDefault();
    dispatch(forgotPassword(email));
  };

  useEffect(() => {
    if (errors) {
      toast.error(errors);
    }
  }, [errors]);

  return (
    <>
      <div className="row wrapper">
        <div className="col-10 col-lg-5">
          <form onSubmit={submitHandler}>
            <h1 className="password_title">Forgot Password</h1>
            <div className="form-group">
              <label htmlFor="email_field">Enter Email</label>
              <input
                type="email"
                id="email_field"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <button
              id="forgot_password_button"
              type="submit"
              className="btn-block py-3 password-btn"
              //   disabled={loading ? true : false}
            >
              Send Email
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default ForgotPassword;
