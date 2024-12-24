// src/pages/Banner.jsx
import React from 'react';
import './Banner.css';
import bannerImage from './Banner.png'; // Ensure the path is correct




const Banner = () => {
  return (
    
      <div className="wrapper">
        <div className="banner-navbar-container">
          <div className="banner-container">
            <img src={bannerImage} alt="ISRO Banner" className="banner-image" />
          </div>
         </div>
        
        </div>
    
   
  );
};

export default Banner;
