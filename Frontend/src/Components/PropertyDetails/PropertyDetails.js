import React, { useEffect } from "react";
import "../../CSS/PropertyDetails.css";
import PropertyImg from "./PropertyImg";
import BookingForm from "./BookingForm";
import PropertyAmenities from "./PropertyAmenities";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { getPropertyDetails } from "../../Store/PropertyDetails/propertyDetails-action";
import MapComponent from "./MapComponent";

const PropertyDetails = () => {
  const dispatch = useDispatch();
  const { id } = useParams();
  const propertyDetails = useSelector(
    (state) => state.propertydetails.propertydetails
  );
  console.log("propertydetails", propertyDetails);

  useEffect(() => {
    dispatch(getPropertyDetails(id));
  }, [dispatch, id]);

  //console.log("propertyDetails", propertyDetails);
  const {
    propertyName,
    address,
    description,
    images,
    amenities,
    maximumGuest,
    price,
    currentBookings,
  } = propertyDetails;
  console.log("deatils", propertyDetails);

  return (
    <div className="property-container">
      {propertyName && (
        <>
          <p className="property-header">{propertyName}</p>
          <h6 className="property-location">
            <span className="material-symbols-outlined">house</span>
            <span className="location">{` ${address.area}, ${address.city}, ${address.pincode}, ${address.state}`}</span>
          </h6>
          <PropertyImg images={images} />
          <div className="middle-container row">
            <div className="des-and-amenities col-md-8 col-sm-12 col-12">
              <h2 className="property-description-header">Description</h2>
              <p className="property-description">
                {description} <br></br>
                <br></br>Max number of guests : {maximumGuest}
              </p>
              <hr></hr>
              <PropertyAmenities amenities={amenities} />
            </div>
            <div className="property-payment col-md-4 col-sm-12 col-12">
              <BookingForm
                propertyId={id}
                price={price}
                propertyName={propertyName}
                address={address}
                maximumGuest={maximumGuest}
                currentBookings={currentBookings}
              />
            </div>
          </div>
          <hr></hr>
          <div className="property-map">
            <div className="map-image-exinfo-container row">
              <div className="map-image-container col-md-6 col-sm-12 col-12">
                <h2 className="map-header">Where you'll be</h2>

                <MapComponent address={address} />
              </div>
              <div className="extra-info col-md-6 col-sm-12 col-12">
                <h2 className="extra-heading">Extra Info</h2>
                <p className="extra-description">
                  -Check-in time is 1pm & Check-out time is 10 am. Early
                  check-in or late checkout is permitted based on availability
                  and prior intimation. *Based on availability, early checkin is
                  permitted from 10am onwards. If you wish to check-in before
                  10am, an early checkin fee will be applicable. *Late checkout
                  is permitted based on availability and a fee may be applicable
                  based on checkout time. Please contact host regarding the
                  same.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PropertyDetails;
