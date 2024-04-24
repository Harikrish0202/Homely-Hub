import React, { Fragment, useEffect, useState } from "react";
import "../../CSS/Profile.css";
import { useDispatch, useSelector } from "react-redux";
import { updateUser } from "../../Store/User/user-action";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
const EditProfile = () => {
  const { user, errors } = useSelector((state) => state.user);
  const [name, setName] = useState();
  const [phoneNumber, setPhoneNumber] = useState();
  const [avatarPreview, setAvatarPreview] = useState();
  const [avatar, setAvatar] = useState("");
  const dispatch = useDispatch();
  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setPhoneNumber(user.phoneNumber || "");
      setAvatarPreview(user.avatar.url || "/assets/avatar.png");
      setAvatar(user.avatar.url);
    }
  }, [user]);

  const navigate = useNavigate();

  const submitHandler = (e) => {
    e.preventDefault();
    dispatch(
      updateUser({
        name,
        phoneNumber,
        avatar,
      })
    );
    navigate("/profile");
    toast.success("Profile has updated suceessfully");
  };

  const onChange = (e) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (reader.readyState === 2) {
        setAvatarPreview(reader.result);
        setAvatar(reader.result);
      }
    };

    reader.readAsDataURL(e.target.files[0]);
  };
  return (
    <Fragment>
      <div className="row wrapper ">
        {user && (
          <div className="col-10 col-lg-5 updateprofile">
            <form onSubmit={submitHandler} encType="multipart/form-data">
              <h1 className="mt-2 mb-5">Update Profile</h1>

              <div className="form-group">
                <label htmlFor="email_field">Name</label>
                <input
                  type="name"
                  id="name_field"
                  className="form-control"
                  name="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="phonenumber_field">Phone Number</label>
                <input
                  type="number"
                  id="phonenumber_field"
                  className="form-control"
                  name="phonenumber"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="avatar_upload">
                  Avatar
                  <span style={{ color: "red" }}>*</span>
                </label>
                <div className="d-flex align-items-center">
                  <div>
                    <div className="avatar mr-3 item-rtl">
                      <img
                        src={avatarPreview}
                        className="rounded-circle"
                        alt="Avatar Preview"
                      />
                    </div>
                  </div>
                  <div className="custom-file">
                    <input
                      type="file"
                      name="avatar"
                      className="custom-file-input"
                      id="avatarupdate"
                      accept="image/*"
                      onChange={onChange}
                    />
                    <label className="custom-file-label" htmlFor="customFile">
                      Choose Avatar
                    </label>
                    <p className="notes">
                      (Image size should be less than 20 kb)
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className=" update-btn btn-block "
                // disabled={loading ? true : false}
              >
                Update
              </button>
            </form>
          </div>
        )}
      </div>
    </Fragment>
  );
};

export default EditProfile;
