import React, { useState } from "react";
import Modal from "./Modal";

const PropertyImg = ({ images }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleShowAllPhotos = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <div className="property-img-container">
        {/* Apply different style to the first image */}
        <div className="img-item first-image">
          <img className="images" src={images[0].url} alt="property-1" />
        </div>
        {/* Render the remaining 4 images in a row */}
        {images.slice(1, 5).map((image, index) => (
          <div key={index} className="img-item">
            <img
              className="images"
              src={image.url}
              alt={`property-${index + 2}`}
            />
          </div>
        ))}
      </div>
      {/* Place the button container outside the image container */}
      <div className="similar-photos-container">
        <button className="similar-photos" onClick={handleShowAllPhotos}>
          <span className="material-symbols-outlined">photo_library</span>
        </button>
      </div>
      {isModalOpen && <Modal images={images} onClose={handleCloseModal} />}
    </>
  );
};

export default PropertyImg;
